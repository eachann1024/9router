import { NextResponse } from "next/server";
import { getComboById, getComboByName } from "@/lib/localDb";
import {
  getOpenRouterFreeComboSyncService,
  setOpenRouterFreeSyncEnabled,
  syncOpenRouterFreeCombo,
} from "@/shared/services/openrouterFreeComboSync";

export const dynamic = "force-dynamic";

export async function POST(request) {
  try {
    const body = await request.json().catch(() => ({}));
    const comboId = typeof body.comboId === "string" && body.comboId.trim()
      ? body.comboId.trim()
      : null;
    const comboName = typeof body.comboName === "string" && body.comboName.trim()
      ? body.comboName.trim()
      : "free";
    const combo = comboId
      ? await getComboById(comboId)
      : await getComboByName(comboName);

    if (!combo) {
      return NextResponse.json({ error: `Combo "${comboName}" not found` }, { status: 404 });
    }

    if (body.enabled === false) {
      const comboStrategies = await setOpenRouterFreeSyncEnabled({ comboId: combo.id, comboName: combo.name }, false);
      getOpenRouterFreeComboSyncService().scheduleNextRun();
      return NextResponse.json({
        ok: true,
        combo,
        comboStrategies,
      });
    }

    const result = await syncOpenRouterFreeCombo({ comboId: combo.id, comboName: combo.name }, {
      enableSync: body.enabled === true,
      reason: body.reason || (body.enabled === true ? "toggle-enable" : "manual"),
    });

    getOpenRouterFreeComboSyncService().scheduleNextRun();

    return NextResponse.json({
      ok: true,
      combo: result.combo,
      comboStrategies: result.comboStrategies,
      models: result.models,
      syncedAt: result.syncedAt,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error.message || "Failed to sync OpenRouter free combo" },
      { status: 500 }
    );
  }
}
