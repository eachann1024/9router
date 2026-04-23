import { NextResponse } from "next/server";
import { fetchOpenRouterFreeModels } from "@/shared/services/openrouterFreeModels";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const freeModels = await fetchOpenRouterFreeModels();
    return NextResponse.json({ models: freeModels });
  } catch (error) {
    return NextResponse.json(
      { models: [], error: `Failed to fetch OpenRouter models: ${error.message}` },
      { status: 502 }
    );
  }
}
