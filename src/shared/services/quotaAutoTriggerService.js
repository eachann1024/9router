import {
  getApiKeys,
  getProviderConnections,
  getSettings,
  updateProviderConnection,
  updateSettings,
} from "@/lib/localDb";
import { USAGE_SUPPORTED_PROVIDERS } from "@/shared/constants/providers";
import {
  getMsUntilNextWindow,
  normalizeQuotaAutoTriggerStartHour,
} from "@/shared/services/quotaAutoTriggerSchedule";
import {
  PROVIDER_ID_TO_ALIAS,
  getModelsByProviderId,
} from "open-sse/config/providerModels.js";
import { getUsageForProvider } from "open-sse/services/usage.js";
import { buildClearModelLocksUpdate } from "open-sse/services/accountFallback.js";

export const QUOTA_TARGET_CONNECTION_HEADER = "x-9router-target-connection-id";

const INTERNAL_BASE_URL =
  process.env.BASE_URL ||
  process.env.NEXT_PUBLIC_BASE_URL ||
  `http://127.0.0.1:${process.env.PORT || "20128"}`;


// Count-based quota providers - warmup ping wastes quota
const WARMUP_EXCLUDED_PROVIDERS = new Set(["github"]);
const ANTIGRAVITY_WARMUP_MODEL_IDS = new Set([
  "gemini-3-flash",
  "gemini-3.1-pro-low",
  "claude-sonnet-4-6",
]);

function getProviderPriority(provider) {
  if (provider === "antigravity") return 1;
  if (provider === "kiro") return 2;
  return 3;
}

function sortQuotaConnections(connections) {
  return [...connections].sort((a, b) => {
    const priorityDiff = getProviderPriority(a.provider) - getProviderPriority(b.provider);
    if (priorityDiff !== 0) return priorityDiff;

    const providerDiff = a.provider.localeCompare(b.provider);
    if (providerDiff !== 0) return providerDiff;

    return (a.priority || 999) - (b.priority || 999);
  });
}

function trimErrorMessage(error) {
  if (!error) return "Unknown error";

  const raw = typeof error === "string"
    ? error
    : error?.message || error?.error || "Unknown error";

  return raw.replace(/\s+/g, " ").trim().slice(0, 180) || "Unknown error";
}

function mergeWarmupModels(previousModels = {}, nextModels = {}) {
  return {
    ...previousModels,
    ...nextModels,
  };
}

async function persistWarmupState(connectionId, previousState, patch) {
  const nextState = {
    ...previousState,
    ...patch,
    models: mergeWarmupModels(previousState?.models, patch?.models),
  };

  await updateProviderConnection(connectionId, {
    quotaWarmupState: nextState,
  });

  return nextState;
}

async function getInternalApiKey() {
  const keys = await getApiKeys();
  return keys.find((key) => key.isActive !== false)?.key || null;
}

export function getTargetModelsForConnection(connection) {
  const providerId = connection?.provider;
  if (!providerId) return [];

  const models = getModelsByProviderId(providerId);

  if (providerId === "antigravity") {
    return models
      .filter((model) => ANTIGRAVITY_WARMUP_MODEL_IDS.has(model.id))
      .map((model) => ({
        id: model.id,
        name: model.name || model.id,
        fullModel: `${PROVIDER_ID_TO_ALIAS[providerId] || providerId}/${model.id}`,
      }));
  }

  const firstModel = models[0];
  if (!firstModel) return [];

  return [{
    id: firstModel.id,
    name: firstModel.name || firstModel.id,
    fullModel: `${PROVIDER_ID_TO_ALIAS[providerId] || providerId}/${firstModel.id}`,
  }];
}

function getConnectionLabel(connection) {
  return connection.name || connection.email || connection.provider || connection.id;
}

function getQuotaRemaining(quota) {
  if (!quota || quota.unlimited) return Infinity;
  if (typeof quota.remaining === "number") return quota.remaining;
  if (typeof quota.total === "number" && typeof quota.used === "number") {
    return quota.total - quota.used;
  }
  return null;
}

function analyzeQuotaRefreshability(usage) {
  const quotas = usage?.quotas;
  if (!quotas || typeof quotas !== "object") {
    return {
      shouldWarmup: true,
      skipReason: null,
      exhaustedQuotas: [],
    };
  }

  const entries = Object.entries(quotas);
  const exhaustedQuotas = entries
    .filter(([, quota]) => {
      const remaining = getQuotaRemaining(quota);
      return remaining !== null && remaining <= 0;
    })
    .map(([name]) => name);

  const sessionEntry = entries.find(([name]) => /^session(\s|\(|$)/i.test(name));
  const weeklyEntries = entries.filter(([name]) => /^weekly(\s|\(|$)/i.test(name));

  const sessionRemaining = sessionEntry ? getQuotaRemaining(sessionEntry[1]) : null;
  const hasSessionWindow = sessionRemaining !== null;
  const weeklyRemainingValues = weeklyEntries
    .map(([, quota]) => getQuotaRemaining(quota))
    .filter((value) => value !== null);
  const hasWeeklyWindow = weeklyRemainingValues.length > 0;
  const weeklyRecoverable = weeklyRemainingValues.some((value) => value > 0);

  if (hasWeeklyWindow && !weeklyRecoverable) {
    return {
      shouldWarmup: false,
      skipReason: "quota_exhausted_weekly",
      exhaustedQuotas,
    };
  }

  if (hasSessionWindow && sessionRemaining <= 0) {
    return {
      shouldWarmup: false,
      skipReason: hasWeeklyWindow ? "quota_exhausted_session" : "quota_exhausted_session_only",
      exhaustedQuotas,
    };
  }

  return {
    shouldWarmup: true,
    skipReason: null,
    exhaustedQuotas,
  };
}

export async function getQuotaAutoTriggerConnections({ enabledOnly = true, includeWarmupExcluded = false } = {}) {
  const connections = await getProviderConnections();
  const supportedConnections = connections.filter((connection) =>
    connection.authType === "oauth"
    && connection.isActive !== false
    && USAGE_SUPPORTED_PROVIDERS.includes(connection.provider)
    && (includeWarmupExcluded || !WARMUP_EXCLUDED_PROVIDERS.has(connection.provider))
    && (!enabledOnly || connection.quotaAutoTriggerEnabled !== false)
  );

  return sortQuotaConnections(supportedConnections);
}

export async function getQuotaAutoTriggerSnapshot() {
  const settings = await getSettings();
  // Show all eligible connections (regardless of per-connection enabled) for UI display
  const connections = await getQuotaAutoTriggerConnections({ enabledOnly: false, includeWarmupExcluded: true });

  return {
    enabled: settings.quotaAutoTriggerEnabled === true,
    startHour: normalizeQuotaAutoTriggerStartHour(settings.quotaAutoTriggerStartHour),
    running: false,
    lastRunAt: settings.quotaAutoTriggerLastRunAt || null,
    connections: connections.map((connection) => ({
      id: connection.id,
      provider: connection.provider,
      name: getConnectionLabel(connection),
      enabled: connection.quotaAutoTriggerEnabled !== false,
      warmupState: connection.quotaWarmupState || null,
      targetModels: getTargetModelsForConnection(connection),
    })),
  };
}

async function pingModel({ baseUrl, apiKey, fullModel, connectionId }) {
  const headers = {
    "Content-Type": "application/json",
    [QUOTA_TARGET_CONNECTION_HEADER]: connectionId,
  };

  if (apiKey) {
    headers.Authorization = `Bearer ${apiKey}`;
  }

  const response = await fetch(`${baseUrl}/api/v1/chat/completions`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      model: fullModel,
      stream: false,
      max_tokens: 1,
      messages: [{ role: "user", content: "ping" }],
    }),
    signal: AbortSignal.timeout(20000),
  });

  if (!response.ok) {
    const data = await response.json().catch(async () => {
      const text = await response.text().catch(() => "");
      return { error: text || `HTTP ${response.status}` };
    });

    throw new Error(trimErrorMessage(data?.error || `HTTP ${response.status}`));
  }

  await response.json().catch(() => null);
}

async function updateConnectionWarmupState(connection, modelResults, startedAt) {
  const previousState = connection.quotaWarmupState || {};
  const previousModels = previousState.models || {};
  const nextModels = { ...previousModels };
  const nextLastSuccessAt = modelResults.every((result) => result.status === "success")
    ? startedAt
    : previousState.lastSuccessAt || null;
  const nextPhase = modelResults.every((result) => result.status === "success")
    ? "success"
    : "error";

  for (const result of modelResults) {
    const previousModelState = previousModels[result.id] || {};
    nextModels[result.id] = {
      ...previousModelState,
      status: result.status,
      lastRunAt: startedAt,
      lastSuccessAt: result.status === "success"
        ? startedAt
        : previousModelState.lastSuccessAt || null,
      lastError: result.status === "error" ? result.error : null,
      lastStatusCode: result.statusCode || null,
      modelName: result.name,
    };
  }

  await updateProviderConnection(connection.id, {
    quotaWarmupState: {
      ...previousState,
      running: false,
      phase: nextPhase,
      currentModelId: null,
      currentModelName: null,
      lastRunAt: startedAt,
      lastSuccessAt: nextLastSuccessAt,
      lastError: nextPhase === "error"
        ? modelResults.find((result) => result.status === "error")?.error || null
        : null,
      models: nextModels,
    },
  });

  // Clear locks when all models succeed — account is confirmed working
  if (nextPhase === "success") {
    await clearAccountLocksOnSuccess(connection);
  }
}

async function runConnectionWarmup({ connection, baseUrl, apiKey }) {
  // Count-based quota providers (e.g. github) don't need warmup pings - skip silently
  if (WARMUP_EXCLUDED_PROVIDERS.has(connection.provider)) {
    return;
  }
  const startedAt = new Date().toISOString();
  const models = getTargetModelsForConnection(connection);
  let currentState = await persistWarmupState(connection.id, connection.quotaWarmupState || {}, {
    running: true,
    phase: "running",
    currentModelId: null,
    currentModelName: null,
    lastRunAt: startedAt,
    lastError: null,
    skipped: false,
    skipReason: null,
    exhaustedQuotas: [],
  });

  if (models.length === 0) {
    await updateProviderConnection(connection.id, {
      ...buildClearModelLocksUpdate(connection),
      testStatus: "active",
      lastError: null,
      lastErrorAt: null,
      backoffLevel: 0,
      quotaWarmupState: {
        ...currentState,
        running: false,
        phase: "success",
        currentModelId: null,
        currentModelName: null,
        lastRunAt: startedAt,
        lastSuccessAt: startedAt,
      },
    });
    return;
  }

  const usage = await getUsageForProvider(connection).catch((error) => ({
    message: trimErrorMessage(error),
  }));
  const quotaDecision = analyzeQuotaRefreshability(usage);
  if (!quotaDecision.shouldWarmup) {
    await updateProviderConnection(connection.id, {
      quotaWarmupState: {
        ...currentState,
        running: false,
        phase: "success",
        currentModelId: null,
        currentModelName: null,
        lastRunAt: startedAt,
        skipped: true,
        skipReason: quotaDecision.skipReason || "quota_exhausted",
        exhaustedQuotas: quotaDecision.exhaustedQuotas,
      },
    });
    return;
  }

  currentState = await persistWarmupState(connection.id, currentState, {
    skipped: false,
    skipReason: null,
    exhaustedQuotas: quotaDecision.exhaustedQuotas,
  });

  const results = [];
  for (const model of models) {
    const previousModelState = currentState.models?.[model.id] || {};
    currentState = await persistWarmupState(connection.id, currentState, {
      running: true,
      phase: "running",
      currentModelId: model.id,
      currentModelName: model.name,
      models: {
        [model.id]: {
          ...previousModelState,
          status: "running",
          lastRunAt: startedAt,
          lastError: null,
          modelName: model.name,
        },
      },
    });

    try {
      await pingModel({
        baseUrl,
        apiKey,
        fullModel: model.fullModel,
        connectionId: connection.id,
      });
      results.push({ id: model.id, name: model.name, status: "success", error: null });
    } catch (error) {
      results.push({
        id: model.id,
        name: model.name,
        status: "error",
        error: trimErrorMessage(error),
      });
    }
  }

  await updateConnectionWarmupState({
    ...connection,
    quotaWarmupState: currentState,
  }, results, startedAt);
}

/** Clear account locks and restore active status when warmup succeeds */
async function clearAccountLocksOnSuccess(connection) {
  await updateProviderConnection(connection.id, {
    ...buildClearModelLocksUpdate(connection),
    testStatus: "active",
    lastError: null,
    lastErrorAt: null,
    backoffLevel: 0,
  });
}

export class QuotaAutoTriggerService {
  constructor() {
    this.timeoutId = null;
    this.runningPromise = null;
    this.started = false;
  }

  async start() {
    if (this.started) return;
    this.started = true;

    // Clean up stale running states from previous server process
    await this.#cleanupStaleWarmupStates();

    await this.#scheduleNextWindow();

    this.run({ reason: "startup" }).catch((error) => {
      console.error("[QuotaAutoTrigger] Startup run failed:", error);
    });
  }

  async #scheduleNextWindow() {
    const settings = await getSettings();
    const startHour = normalizeQuotaAutoTriggerStartHour(settings.quotaAutoTriggerStartHour);
    const msUntilNext = getMsUntilNextWindow(new Date(), startHour);
    const nextHour = new Date(Date.now() + msUntilNext);
    console.log(`[QuotaAutoTrigger] Next window trigger scheduled at ${nextHour.toLocaleTimeString()} (in ${Math.round(msUntilNext / 60000)}m)`);

    this.timeoutId = setTimeout(() => {
      this.run({ reason: "window" }).catch((error) => {
        console.error("[QuotaAutoTrigger] Window run failed:", error);
      });
      this.#scheduleNextWindow().catch((error) => {
        console.error("[QuotaAutoTrigger] Reschedule failed:", error);
      });
    }, msUntilNext);

    if (this.timeoutId?.unref) {
      this.timeoutId.unref();
    }
  }

  stop() {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
    this.started = false;
  }

  async reschedule() {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }

    if (!this.started) return;
    await this.#scheduleNextWindow();
  }

  isRunning() {
    return this.runningPromise !== null;
  }

  hasActiveRuns() {
    return this.isRunning() || (this.connectionRunningSet?.size ?? 0) > 0;
  }

  getRunningConnectionIds() {
    return new Set(this.connectionRunningSet || []);
  }

  isConnectionRunning(connectionId) {
    return this.connectionRunningSet?.has(connectionId) ?? false;
  }

  async runForConnection(connectionId) {
    if (!this.connectionRunningSet) this.connectionRunningSet = new Set();
    if (this.connectionRunningSet.has(connectionId)) {
      return { skipped: true, reason: "already-running" };
    }

    this.connectionRunningSet.add(connectionId);
    const connections = await getProviderConnections();
    const connection = connections.find((c) => c.id === connectionId);
    if (!connection) {
      this.connectionRunningSet.delete(connectionId);
      throw new Error(`Connection not found: ${connectionId}`);
    }

    try {
      const apiKey = await getInternalApiKey();
      const baseUrl = INTERNAL_BASE_URL;
      await runConnectionWarmup({ connection, baseUrl, apiKey });
      return { ok: true };
    } finally {
      this.connectionRunningSet.delete(connectionId);
    }
  }

  async run({ reason = "manual", force = false } = {}) {
    if (this.runningPromise) {
      return this.runningPromise;
    }

    this.runningPromise = this.#runInternal({ reason, force })
      .finally(() => {
        this.runningPromise = null;
      });

    return this.runningPromise;
  }

  async #runInternal({ reason, force }) {
    const settings = await getSettings();
    if (!force && settings.quotaAutoTriggerEnabled !== true) {
      return { skipped: true, reason: "disabled" };
    }

    const connections = await getQuotaAutoTriggerConnections();
    if (connections.length === 0) {
      await updateSettings({ quotaAutoTriggerLastRunAt: new Date().toISOString() });
      return { skipped: true, reason: "no-connections" };
    }

    const apiKey = await getInternalApiKey();
    const baseUrl = INTERNAL_BASE_URL;

    for (const connection of connections) {
      try {
        await runConnectionWarmup({ connection, baseUrl, apiKey });
      } catch (error) {
        console.error(
          `[QuotaAutoTrigger] ${reason} failed for ${connection.provider}/${connection.id}:`,
          error
        );
      }
    }

    const lastRunAt = new Date().toISOString();
    await updateSettings({ quotaAutoTriggerLastRunAt: lastRunAt });
    return { ok: true, lastRunAt };
  }

  async #cleanupStaleWarmupStates() {
    try {
      const connections = await getProviderConnections();
      for (const conn of connections) {
        if (conn.quotaWarmupState?.running) {
          await updateProviderConnection(conn.id, {
            quotaWarmupState: {
              ...conn.quotaWarmupState,
              running: false,
              phase: "idle",
              currentModelId: null,
              currentModelName: null,
            },
          });
        }
      }
    } catch (error) {
      console.error("[QuotaAutoTrigger] Stale cleanup failed:", error);
    }
  }
}

let quotaAutoTriggerService = null;

export function getQuotaAutoTriggerService() {
  if (!quotaAutoTriggerService) {
    quotaAutoTriggerService = new QuotaAutoTriggerService();
  }
  return quotaAutoTriggerService;
}
