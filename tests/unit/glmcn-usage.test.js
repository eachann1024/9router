import { describe, it, expect, vi, afterEach } from "vitest";
import { getGlmCnUsage } from "../../src/lib/usage/glmCnUsage.js";

afterEach(() => {
  vi.restoreAllMocks();
});

describe("GLM-CN usage", () => {
  it("queries official quota endpoint with API key by default", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        success: true,
        code: 200,
        data: {
          level: "Pro",
          limits: [
            {
              type: "TIME_LIMIT",
              usage: 100,
              currentValue: 25,
              remaining: 75,
              nextResetTime: 1760000000000,
            },
            {
              type: "TOKENS_LIMIT",
              percentage: 5,
              nextResetTime: 1760000000000,
            },
          ],
        },
      }),
    });

    const result = await getGlmCnUsage({
      apiKey: "test-api-key",
      providerSpecificData: {},
    });

    expect(fetch).toHaveBeenCalledWith(
      "https://bigmodel.cn/api/monitor/usage/quota/limit",
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: "test-api-key",
        }),
      })
    );

    expect(result.plan).toBe("Pro");
    expect(result.quotas["Rate Limit"]).toMatchObject({
      used: 25,
      total: 100,
      remaining: 75,
    });
    expect(result.quotas["Token Quota"]).toMatchObject({
      used: 5,
      total: 100,
      remaining: 95,
    });
  });

  it("returns a readable message when official quota endpoint rejects the key", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 403,
    });

    const result = await getGlmCnUsage({
      apiKey: "bad-key",
      providerSpecificData: {},
    });

    expect(result.message).toContain("official quota endpoint");
  });
});
