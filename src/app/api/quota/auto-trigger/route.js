import { NextResponse } from "next/server";
import { updateSettings } from "@/lib/localDb";
import { normalizeQuotaAutoTriggerStartHour } from "@/shared/services/quotaAutoTriggerSchedule";
import {
  getQuotaAutoTriggerService,
  getQuotaAutoTriggerSnapshot,
} from "@/shared/services/quotaAutoTriggerService";

export async function GET() {
  try {
    const service = getQuotaAutoTriggerService();
    const snapshot = await getQuotaAutoTriggerSnapshot();
    const isRunning = service.isRunning();
    const hasActiveRuns = service.hasActiveRuns();
    const runningConnectionIds = service.getRunningConnectionIds();

    for (const conn of snapshot.connections) {
      if (runningConnectionIds.has(conn.id)) {
        conn.warmupState = {
          ...(conn.warmupState || {}),
          running: true,
          phase: "running",
        };
      }
    }

    // Sanitize stale warmup states when service is not running
    if (!hasActiveRuns) {
      for (const conn of snapshot.connections) {
        if (conn.warmupState?.running) {
          conn.warmupState = {
            ...conn.warmupState,
            running: false,
            phase: "idle",
            currentModelId: null,
            currentModelName: null,
          };
        }
      }
    }

    return NextResponse.json({
      ...snapshot,
      running: isRunning,
      hasActiveRuns,
    });
  } catch (error) {
    console.error("[QuotaAutoTrigger] GET failed:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch quota auto-trigger settings" },
      { status: 500 }
    );
  }
}

export async function PATCH(request) {
  try {
    const body = await request.json();
    const enabled = body?.enabled === true;
    const startHour = normalizeQuotaAutoTriggerStartHour(body?.startHour);

    await updateSettings({
      quotaAutoTriggerEnabled: enabled,
      quotaAutoTriggerStartHour: startHour,
    });

    const service = getQuotaAutoTriggerService();
    await service.reschedule();
    if (enabled) {
      service.run({ reason: "manual-enable", force: true }).catch((error) => {
        console.error("[QuotaAutoTrigger] Enable run failed:", error);
      });
    }

    const snapshot = await getQuotaAutoTriggerSnapshot();
    return NextResponse.json({
      ...snapshot,
      running: service.isRunning(),
      hasActiveRuns: service.hasActiveRuns(),
    });
  } catch (error) {
    console.error("[QuotaAutoTrigger] PATCH failed:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update quota auto-trigger settings" },
      { status: 500 }
    );
  }
}
