import { NextResponse } from "next/server";
import { updateProviderConnection } from "@/lib/localDb";
import {
  getQuotaAutoTriggerService,
  getQuotaAutoTriggerSnapshot,
} from "@/shared/services/quotaAutoTriggerService";

// PATCH { enabled: boolean } — toggle per-connection auto-rolling
export async function PATCH(request, { params }) {
  try {
    const { connectionId } = await params;
    const body = await request.json();
    const enabled = body?.enabled !== false;
    const service = getQuotaAutoTriggerService();
    const snapshot = await getQuotaAutoTriggerSnapshot();
    const connection = snapshot.connections.find((item) => item.id === connectionId);

    const updatePayload = {
      quotaAutoTriggerEnabled: enabled,
    };

    if (!enabled && connection?.warmupState) {
      updatePayload.quotaWarmupState = {
        ...connection.warmupState,
        running: false,
        phase: "idle",
        currentModelId: null,
        currentModelName: null,
      };
    }

    await updateProviderConnection(connectionId, updatePayload);

    const nextSnapshot = await getQuotaAutoTriggerSnapshot();
    return NextResponse.json({
      ...nextSnapshot,
      running: service.isRunning(),
      hasActiveRuns: service.hasActiveRuns(),
    });
  } catch (error) {
    console.error("[QuotaAutoTrigger] Connection PATCH failed:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update connection auto-trigger" },
      { status: 500 }
    );
  }
}

// POST — manually trigger rolling for a specific connection
export async function POST(request, { params }) {
  try {
    const { connectionId } = await params;
    const service = getQuotaAutoTriggerService();

    service.runForConnection(connectionId).catch((error) => {
      console.error(`[QuotaAutoTrigger] Manual run failed for ${connectionId}:`, error);
    });

    const snapshot = await getQuotaAutoTriggerSnapshot();
    const runningConnectionIds = service.getRunningConnectionIds();
    for (const connection of snapshot.connections) {
      if (runningConnectionIds.has(connection.id)) {
        connection.warmupState = {
          ...(connection.warmupState || {}),
          running: true,
          phase: "running",
        };
      }
    }

    return NextResponse.json({
      ...snapshot,
      running: service.isRunning(),
      hasActiveRuns: service.hasActiveRuns(),
    });
  } catch (error) {
    console.error("[QuotaAutoTrigger] Connection POST failed:", error);
    return NextResponse.json(
      { error: error.message || "Failed to trigger connection warmup" },
      { status: 500 }
    );
  }
}
