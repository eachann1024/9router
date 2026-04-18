const ROLLING_WINDOW_HOURS = 5;

export function normalizeQuotaAutoTriggerStartHour(value) {
  const numeric = Number(value);
  if (!Number.isInteger(numeric)) return 0;
  return ((numeric % 24) + 24) % 24;
}

export function getWindowStartHours(startHour = 0) {
  const normalizedStartHour = normalizeQuotaAutoTriggerStartHour(startHour);
  return Array.from({ length: 5 }, (_, index) => (normalizedStartHour + index * ROLLING_WINDOW_HOURS) % 24);
}

export function getCurrentRollingWindow(now = new Date(), startHour = 0) {
  const windowStartHours = getWindowStartHours(startHour);
  const candidates = windowStartHours.map((hour) => {
    const start = new Date(now);
    start.setSeconds(0, 0);
    start.setMinutes(0);
    start.setHours(hour);

    if (start > now) {
      start.setDate(start.getDate() - 1);
    }

    const end = new Date(start);
    end.setHours(start.getHours() + ROLLING_WINDOW_HOURS);

    return { start, end };
  });

  return candidates.reduce((latest, current) => (
    !latest || current.start > latest.start ? current : latest
  ), null);
}

export function getNextWindowBoundary(now = new Date(), startHour = 0) {
  return getCurrentRollingWindow(now, startHour).end;
}

export function getWindowTimeline(now = new Date(), startHour = 0, count = 5) {
  const currentWindow = getCurrentRollingWindow(now, startHour);
  const previousStart = new Date(currentWindow.start);
  previousStart.setHours(previousStart.getHours() - ROLLING_WINDOW_HOURS);

  return Array.from({ length: count }, (_, index) => {
    const start = new Date(previousStart);
    start.setHours(previousStart.getHours() + index * ROLLING_WINDOW_HOURS);
    const end = new Date(start);
    end.setHours(start.getHours() + ROLLING_WINDOW_HOURS);

    return {
      key: `${start.toISOString()}-${end.toISOString()}`,
      start,
      end,
      label: null,
      isCurrent: now >= start && now < end,
      isPast: now >= end,
      isFuture: now < start,
    };
  });
}

export function getMsUntilNextWindow(now = new Date(), startHour = 0) {
  return Math.max(0, getNextWindowBoundary(now, startHour) - now);
}

export { ROLLING_WINDOW_HOURS };
