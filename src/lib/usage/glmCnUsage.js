/**
 * GLM-CN (ZhipuAI China) Quota Fetcher
 *
 * Required providerSpecificData fields:
 *   quotaAuth    - bigmodel.cn platform Authorization token (JWT)
 *   quotaOrg     - Bigmodel-Organization header value
 *   quotaProject - Bigmodel-Project header value
 */

const GLM_CN_QUOTA_URL = "https://bigmodel.cn/api/monitor/usage/quota/limit";

/**
 * Fetch GLM-CN quota data
 */
export async function getGlmCnUsage(connection) {
  const psd = connection.providerSpecificData;
  const auth = psd?.quotaAuth;
  const org = psd?.quotaOrg;
  const project = psd?.quotaProject;

  if (!auth || !org || !project) {
    return {
      message:
        "GLM-CN quota not configured. Set quotaAuth, quotaOrg, quotaProject in providerSpecificData.",
    };
  }

  const response = await fetch(GLM_CN_QUOTA_URL, {
    headers: {
      Authorization: auth,
      "Bigmodel-Organization": org,
      "Bigmodel-Project": project,
      Accept: "application/json",
      "Set-Language": "zh",
      "Accept-Language": "zh",
    },
    signal: AbortSignal.timeout(10000),
  });

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
