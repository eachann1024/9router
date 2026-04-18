import { describe, it, expect, vi, afterEach } from "vitest";
import { getKimiUsage } from "../../src/lib/usage/kimiUsage.js";

afterEach(() => {
  vi.restoreAllMocks();
});

describe("Kimi usage", () => {
  it("returns accurate message for Kimi Code keys without querying Moonshot", async () => {
    const result = await getKimiUsage({
      apiKey: "sk-abc123",
      providerSpecificData: {},
    });

    expect(result.message).toContain("connected and usable");
    expect(result.message).toContain("separate systems");
    expect(result.message).toContain("kimi.com/code/console");
  });

  it("tries custom quotaUrl if explicitly configured", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        code: 0,
        data: {
          limits: [
            { type: "TOKENS_LIMIT", usage: 10000000, currentValue: 500000, percentage: 5 },
          ],
        },
      }),
    });

    const result = await getKimiUsage({
      apiKey: "sk-test",
      providerSpecificData: { quotaUrl: "https://custom.example.com/quota" },
    });

    expect(fetch).toHaveBeenCalledWith(
      "https://custom.example.com/quota",
      expect.objectContaining({
        headers: expect.objectContaining({ Authorization: "Bearer sk-test" }),
      })
    );
  });

  it("returns error message when custom quotaUrl fails", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 403,
    });

    const result = await getKimiUsage({
      apiKey: "sk-test",
      providerSpecificData: { quotaUrl: "https://custom.example.com/quota" },
    });

    expect(result.message).toContain("HTTP 403");
  });
});
