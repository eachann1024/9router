const DEFAULT_KIMI_BALANCE_URL = "https://api.moonshot.cn/v1/users/me/balance";

function parseResetTime(resetValue) {
  if (!resetValue) return null;

  try {
    if (resetValue instanceof Date) return resetValue.toISOString();
    if (typeof resetValue === "number") return new Date(resetValue).toISOString();
    if (typeof resetValue === "string") return new Date(resetValue).toISOString();
    return null;
  } catch {
    return null;
  }
}

function hasUtilization(window) {
  return window && typeof window === "object" && typeof window.utilization === "number";
}

function createWindowQuota(window) {
  const used = window.utilization;
  const remaining = Math.max(0, 100 - used);
  return {
    used,
    total: 100,
    remaining,
    remainingPercentage: remaining,
    resetAt: parseResetTime(window.resets_at || window.resetAt),
    unlimited: false,
  };
}

function normalizeQuotaEntry(quota) {
  if (!quota || typeof quota !== "object") {
    return {
      used: 0,
      total: 0,
      remaining: 0,
      resetAt: null,
      unlimited: false,
    };
  }

  const used = quota.used ?? quota.currentValue ?? quota.utilization ?? 0;
  const total = quota.total ?? quota.limit ?? quota.usage ?? 0;
  const remaining = quota.remaining ?? (typeof total === "number" ? Math.max(0, total - used) : 0);

  return {
    used,
    total,
    remaining,
    remainingPercentage: quota.remainingPercentage,
    resetAt: parseResetTime(quota.resetAt || quota.nextResetTime || quota.resets_at),
    unlimited: quota.unlimited === true,
  };
}

function parseKimiResponse(data) {
  if (!data || typeof data !== "object") {
    return { quotas: {} };
  }

  const payload = data.data && typeof data.data === "object" ? data.data : data;
  const quotas = {};

  if (hasUtilization(payload.five_hour)) {
    quotas["session (5h)"] = createWindowQuota(payload.five_hour);
  }

  if (hasUtilization(payload.seven_day)) {
    quotas["weekly (7d)"] = createWindowQuota(payload.seven_day);
  }

  for (const [key, value] of Object.entries(payload)) {
    if (key.startsWith("seven_day_") && key !== "seven_day" && hasUtilization(value)) {
      const modelName = key.replace("seven_day_", "");
      quotas[`weekly ${modelName} (7d)`] = createWindowQuota(value);
    }
  }

  if (Object.keys(quotas).length === 0 && payload.quotas && typeof payload.quotas === "object") {
    for (const [name, quota] of Object.entries(payload.quotas)) {
      quotas[name] = normalizeQuotaEntry(quota);
    }
  }

  if (Object.keys(quotas).length === 0 && Array.isArray(payload.limits)) {
    for (const limit of payload.limits) {
      const name = limit.name || limit.type || "quota";
      quotas[name] = normalizeQuotaEntry(limit);
    }
  }

  return {
    plan: payload.plan || payload.level || payload.tier || null,
    message: Object.keys(quotas).length === 0 ? (payload.message || "Kimi connected. No quota data returned.") : null,
    quotas,
  };
}

export async function getKimiUsage(connection) {
  const apiKey = connection?.apiKey;
  const quotaUrl = connection?.providerSpecificData?.quotaUrl;

  if (!apiKey) {
    return { message: "Kimi API key is missing." };
  }

  // If a custom quotaUrl is explicitly configured, try it
  if (quotaUrl) {
    const response = await fetch(quotaUrl, {
      method: "GET",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) {
      return { message: `Kimi quota endpoint (${quotaUrl}) returned HTTP ${response.status}.` };
    }

    const data = await response.json();
    return parseKimiResponse(data);
  }

  // The "kimi" provider in 9router uses api.kimi.com/coding (Kimi Code system),
  // which is separate from Moonshot Open Platform (api.moonshot.cn/.ai).
  // Kimi Code currently has no public quota/balance API documented.
  // Do NOT attempt to query Moonshot balance with a Kimi Code key — they are incompatible.
  return {
    message: "Kimi is connected and usable. The Kimi Code platform (api.kimi.com/coding) and Moonshot Open Platform (api.moonshot.cn) are separate systems with independent keys and endpoints. Kimi Code does not currently expose a public quota API. To view usage, check the Kimi Code console at kimi.com/code/console.",
  };
}
