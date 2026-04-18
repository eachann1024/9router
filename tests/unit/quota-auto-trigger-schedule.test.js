import { describe, it } from "node:test";
import assert from "node:assert/strict";

import {
  getCurrentRollingWindow,
  getMsUntilNextWindow,
  getWindowStartHours,
  normalizeQuotaAutoTriggerStartHour,
} from "@/shared/services/quotaAutoTriggerSchedule";

describe("quotaAutoTriggerSchedule", () => {
  it("normalizes invalid start hour to zero", () => {
    assert.equal(normalizeQuotaAutoTriggerStartHour(undefined), 0);
    assert.equal(normalizeQuotaAutoTriggerStartHour("foo"), 0);
    assert.equal(normalizeQuotaAutoTriggerStartHour(25), 1);
    assert.equal(normalizeQuotaAutoTriggerStartHour(-1), 23);
  });

  it("builds 5-hour boundaries from configured start hour", () => {
    assert.deepEqual(getWindowStartHours(2), [2, 7, 12, 17, 22]);
  });

  it("finds current rolling window from configured start hour", () => {
    const now = new Date("2026-04-18T08:30:00");
    const window = getCurrentRollingWindow(now, 2);

    assert.equal(window.start.getHours(), 7);
    assert.equal(window.end.getHours(), 12);
  });

  it("computes time until next boundary from configured start hour", () => {
    const now = new Date("2026-04-18T08:30:00");
    assert.equal(getMsUntilNextWindow(now, 2), 3.5 * 60 * 60 * 1000);
  });
});
