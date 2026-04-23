import { getComboById, getComboByName, getSettings, updateCombo, updateSettings } from "@/lib/localDb";
import { fetchOpenRouterFreeModels } from "@/shared/services/openrouterFreeModels";

const DEFAULT_COMBO_NAME = "free";
const SYNC_HOUR = 6;

function normalizeComboName(comboName) {
  return typeof comboName === "string" && comboName.trim() ? comboName.trim() : DEFAULT_COMBO_NAME;
}

function getEnabledComboTargets(settings) {
  const comboStrategies = settings?.comboStrategies || {};
  return Object.entries(comboStrategies)
    .filter(([, strategy]) => strategy?.openrouterFreeSyncEnabled === true)
    .map(([strategyKey, strategy]) => ({
      strategyKey,
      comboId: strategy?.openrouterFreeSyncComboId || null,
    }));
}

function getWindowStart(now = new Date()) {
  const start = new Date(now);
  start.setHours(SYNC_HOUR, 0, 0, 0);
  return start;
}

function shouldCatchUp(lastRunAt, now = new Date()) {
  const windowStart = getWindowStart(now);
  if (now < windowStart) return false;
  if (!lastRunAt) return true;

  const lastRun = new Date(lastRunAt);
  if (Number.isNaN(lastRun.getTime())) return true;
  return lastRun < windowStart;
}

async function updateComboSyncStrategy(comboName, patch) {
  const settings = await getSettings();
  const comboStrategies = { ...(settings.comboStrategies || {}) };
  const current = comboStrategies[comboName] || {};
  const next = {
    ...current,
    ...patch,
  };

  if (Object.keys(next).length === 0) {
    delete comboStrategies[comboName];
  } else {
    comboStrategies[comboName] = next;
  }

  const updatedSettings = await updateSettings({ comboStrategies });
  return updatedSettings.comboStrategies || {};
}

async function resolveCombo(comboRef = {}) {
  if (typeof comboRef === "string") {
    return getComboByName(normalizeComboName(comboRef));
  }

  if (comboRef?.comboId) {
    const comboById = await getComboById(comboRef.comboId);
    if (comboById) return comboById;
  }

  return getComboByName(normalizeComboName(comboRef?.comboName));
}

export async function setOpenRouterFreeSyncEnabled(comboRef, enabled) {
  const combo = await resolveCombo(comboRef);
  if (!combo) {
    throw new Error("Target combo not found");
  }

  const normalizedComboName = normalizeComboName(combo.name);
  const settings = await getSettings();
  const comboStrategies = { ...(settings.comboStrategies || {}) };
  const current = comboStrategies[normalizedComboName] || {};
  const next = { ...current };

  if (enabled) {
    next.openrouterFreeSyncEnabled = true;
    next.openrouterFreeSyncComboId = combo.id;
  } else {
    delete next.openrouterFreeSyncEnabled;
    delete next.openrouterFreeSyncComboId;
    delete next.openrouterFreeSyncLastError;
    delete next.openrouterFreeSyncLastRunAt;
    delete next.openrouterFreeSyncLastCount;
    delete next.openrouterFreeSyncLastReason;
  }

  if (Object.keys(next).length === 0) {
    delete comboStrategies[normalizedComboName];
  } else {
    comboStrategies[normalizedComboName] = next;
  }

  const updatedSettings = await updateSettings({ comboStrategies });
  return updatedSettings.comboStrategies || {};
}

export async function syncOpenRouterFreeCombo(comboRef = DEFAULT_COMBO_NAME, options = {}) {
  const combo = await resolveCombo(comboRef);
  if (!combo) {
    throw new Error("Target combo not found");
  }

  const freeModels = await fetchOpenRouterFreeModels();
  const comboModels = freeModels.map((model) => `openrouter/${model.id}`);
  const updatedCombo = await updateCombo(combo.id, { models: comboModels });
  const nowIso = new Date().toISOString();

  const comboStrategies = await updateComboSyncStrategy(combo.name, {
    ...(options.enableSync === true ? { openrouterFreeSyncEnabled: true } : {}),
    openrouterFreeSyncComboId: combo.id,
    openrouterFreeSyncLastRunAt: nowIso,
    openrouterFreeSyncLastCount: comboModels.length,
    openrouterFreeSyncLastError: "",
    openrouterFreeSyncLastReason: options.reason || "manual",
  });

  return {
    combo: updatedCombo,
    comboStrategies,
    models: freeModels,
    syncedAt: nowIso,
  };
}

class OpenRouterFreeComboSyncService {
  constructor() {
    this.started = false;
    this.timeoutId = null;
    this.inFlight = new Map();
  }

  async start() {
    if (this.started) return;
    this.started = true;
    this.scheduleNextRun();
    await this.catchUpMissedRun();
  }

  stop() {
    this.started = false;
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
  }

  async catchUpMissedRun() {
    const settings = await getSettings();
    const comboStrategies = settings.comboStrategies || {};
    const now = new Date();
    const results = [];

    for (const target of getEnabledComboTargets(settings)) {
      const strategy = comboStrategies[target.strategyKey] || {};
      if (!shouldCatchUp(strategy.openrouterFreeSyncLastRunAt, now)) continue;
      try {
        results.push(await this.syncCombo(target, { reason: "startup-catchup" }));
      } catch (error) {
        console.error(`[OpenRouterFreeComboSync] Startup catch-up failed for "${target.strategyKey}":`, error);
      }
    }
    return results;
  }

  scheduleNextRun() {
    if (!this.started) return;

    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }

    const now = new Date();
    const nextRun = getWindowStart(now);
    if (nextRun <= now) {
      nextRun.setDate(nextRun.getDate() + 1);
    }

    const delay = nextRun.getTime() - now.getTime();
    this.timeoutId = setTimeout(async () => {
      try {
        await this.syncEnabledCombos({ reason: "scheduled-6am" });
      } catch (error) {
        console.error("[OpenRouterFreeComboSync] Scheduled sync failed:", error);
      } finally {
        this.scheduleNextRun();
      }
    }, delay);

    if (this.timeoutId.unref) {
      this.timeoutId.unref();
    }
  }

  async syncEnabledCombos(options = {}) {
    const settings = await getSettings();
    const enabledComboTargets = getEnabledComboTargets(settings);
    const results = [];

    for (const target of enabledComboTargets) {
      try {
        results.push(await this.syncCombo(target, options));
      } catch (error) {
        console.error(`[OpenRouterFreeComboSync] Scheduled sync failed for "${target.strategyKey}":`, error);
      }
    }

    return results;
  }

  async syncCombo(comboRef = DEFAULT_COMBO_NAME, options = {}) {
    const targetKey = typeof comboRef === "string"
      ? comboRef
      : comboRef?.comboId || comboRef?.strategyKey || comboRef?.comboName || DEFAULT_COMBO_NAME;

    if (!this.inFlight.has(targetKey)) {
      this.inFlight.set(
        targetKey,
        this.runSync(comboRef, options).finally(() => {
          this.inFlight.delete(targetKey);
        })
      );
    }

    return this.inFlight.get(targetKey);
  }

  async runSync(comboRef, options) {
    const strategyKey = typeof comboRef === "string"
      ? normalizeComboName(comboRef)
      : comboRef?.strategyKey || comboRef?.comboName || DEFAULT_COMBO_NAME;

    try {
      return await syncOpenRouterFreeCombo(comboRef, options);
    } catch (error) {
      await updateComboSyncStrategy(strategyKey, {
        openrouterFreeSyncLastError: error.message || "Unknown error",
      });
      throw error;
    }
  }
}

const globalState = globalThis.__openrouterFreeComboSyncState ??= {};

export function getOpenRouterFreeComboSyncService() {
  if (!globalState.instance) {
    globalState.instance = new OpenRouterFreeComboSyncService();
  }
  return globalState.instance;
}
