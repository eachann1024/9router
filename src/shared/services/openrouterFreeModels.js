import { getProviderConnections } from "@/lib/localDb";

const OPENROUTER_MODELS_URL = "https://openrouter.ai/api/v1/models";
const MIN_CONTEXT_LENGTH = 200000;

function toCreatedAt(model) {
  return typeof model?.created === "number" ? model.created : 0;
}

export async function fetchOpenRouterFreeModels() {
  const connections = await getProviderConnections();
  const connection = connections.find((item) => item.provider === "openrouter" && item.apiKey);

  const headers = { "Content-Type": "application/json" };
  if (connection?.apiKey) {
    headers.Authorization = `Bearer ${connection.apiKey}`;
  }

  const response = await fetch(OPENROUTER_MODELS_URL, {
    cache: "no-store",
    headers,
    signal: AbortSignal.timeout(10000),
  });

  if (!response.ok) {
    throw new Error(`OpenRouter API returned ${response.status}`);
  }

  const payload = await response.json();
  const allModels = Array.isArray(payload.data) ? payload.data : [];

  return allModels
    .filter(
      (model) =>
        model?.pricing?.prompt === "0"
        && model?.pricing?.completion === "0"
        && (model?.context_length ?? 0) >= MIN_CONTEXT_LENGTH
    )
    .map((model) => ({
      id: model.id,
      name: model.name || model.id,
      contextLength: model.context_length,
      createdAt: toCreatedAt(model),
    }))
    .sort((left, right) => {
      const createdDiff = (right.createdAt ?? 0) - (left.createdAt ?? 0);
      if (createdDiff !== 0) return createdDiff;
      return (right.contextLength ?? 0) - (left.contextLength ?? 0);
    });
}
