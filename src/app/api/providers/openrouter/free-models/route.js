import { NextResponse } from "next/server";
import { getProviderConnections } from "@/models";

const OPENROUTER_MODELS_URL = "https://openrouter.ai/api/v1/models";

// Minimum context length for suggested free models
const MIN_CONTEXT_LENGTH = 200000;

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const connections = await getProviderConnections();
    const connection = connections.find((c) => c.provider === "openrouter" && c.apiKey);

    const headers = { "Content-Type": "application/json" };
    if (connection?.apiKey) {
      headers["Authorization"] = `Bearer ${connection.apiKey}`;
    }

    const res = await fetch(OPENROUTER_MODELS_URL, {
      headers,
      signal: AbortSignal.timeout(10000),
    });

    if (!res.ok) {
      throw new Error(`OpenRouter API returned ${res.status}`);
    }

    const json = await res.json();
    const allModels = Array.isArray(json.data) ? json.data : [];

    const freeModels = allModels
      .filter(
        (m) =>
          m.pricing?.prompt === "0" &&
          m.pricing?.completion === "0" &&
          (m.context_length ?? 0) >= MIN_CONTEXT_LENGTH
      )
      .map((m) => ({
        id: m.id,
        name: m.name || m.id,
        contextLength: m.context_length,
      }))
      .sort((a, b) => (b.contextLength ?? 0) - (a.contextLength ?? 0));

    return NextResponse.json({ models: freeModels });
  } catch (error) {
    return NextResponse.json(
      { models: [], error: `Failed to fetch OpenRouter models: ${error.message}` },
      { status: 502 }
    );
  }
}
