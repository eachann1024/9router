/**
 * GLM-CN (ZhipuAI China) Quota Fetcher
 *
 * The BigModel quota endpoint can be queried directly with the provider API key.
 * Legacy quotaAuth/quotaOrg/quotaProject fields are still accepted if present.
 */

const GLM_CN_QUOTA_URL = "https://bigmodel.cn/api/monitor/usage/quota/limit";

/**
 * Fetch GLM-CN quota data
 */
export async function getGlmCnUsage(connection) {
  const psd = connection.providerSpecificData || {};
  const apiKey = connection.apiKey;
  const auth = psd.quotaAuth || apiKey;
  const org = psd.quotaOrg;
  const project = psd.quotaProject;

  if (!auth) {
    return {
      message: "GLM-CN quota reading requires an API key.",
    };
  }

  const headers = {
    Authorization: auth,
    Accept: "application/json",
    "Content-Type": "application/json",
    "Set-Language": "zh",
    "Accept-Language": "zh",
    "User-Agent": "9Router/QuotaDashboard",
  };

  if (org) {
    headers["Bigmodel-Organization"] = org;
  }

  if (project) {
    headers["Bigmodel-Project"] = project;
  }

  const response = await fetch(GLM_CN_QUOTA_URL, {
    headers,
    signal: AbortSignal.timeout(10000),
  });

  if (response.status === 401 || response.status === 403) {
    return {
      message: "GLM-CN quota query was rejected by the official quota endpoint. Please verify the API key or account quota access.",
    };
  }

  if (response.status === 404) {
    return {
      message: "GLM-CN quota endpoint is unavailable right now.",
    };
  }

  if (response.status === 429) {
    return {
      message: "GLM-CN quota endpoint is rate limited. Please retry shortly.",
    };
  }

  if (!response.ok) {
    throw new Error(`GLM-CN API error: HTTP ${response.status}`);
  }

  const data = await response.json();
  if (!data.success || data.code !== 200) {
    throw new Error(data.msg || "GLM-CN API returned error");
  }

  return parseGlmCnResponse(data.data);
}

function parseGlmCnResponse(data) {
  const limits = data?.limits || [];
  const quotas = {};

  for (const limit of limits) {
    if (limit.type === "TIME_LIMIT") {
      const total = limit.usage ?? 0;
      const used = limit.currentValue ?? 0;
      quotas["Rate Limit"] = {
        used,
        total,
        remaining: limit.remaining ?? total - used,
        resetAt: limit.nextResetTime
          ? new Date(limit.nextResetTime).toISOString()
          : null,
      };
    } else if (limit.type === "TOKENS_LIMIT") {
      const pct = limit.percentage ?? 0;
      quotas["Token Quota"] = {
        used: pct,
        total: 100,
        remaining: 100 - pct,
        resetAt: limit.nextResetTime
          ? new Date(limit.nextResetTime).toISOString()
          : null,
      };
    }
  }

  return {
    plan: data.level || null,
    quotas,
  };
}
