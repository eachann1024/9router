"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import ProviderIcon from "@/shared/components/ProviderIcon";
import QuotaTable from "./QuotaTable";
import { parseQuotaData } from "./utils";
import Card from "@/shared/components/Card";
import Button from "@/shared/components/Button";
import { USAGE_SUPPORTED_PROVIDERS, APIKEY_USAGE_PROVIDERS } from "@/shared/constants/providers";
import {
  getCurrentRollingWindow,
  getNextWindowBoundary,
  getWindowTimeline,
  getWindowStartHours,
  normalizeQuotaAutoTriggerStartHour,
  ROLLING_WINDOW_HOURS,
} from "@/shared/services/quotaAutoTriggerSchedule";
import { translate } from "@/i18n/runtime";

const REFRESH_INTERVAL_MS = 60000; // 60 seconds

function formatShortTime(date) {
  return date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

function formatWindowLabel(start, end) {
  return `${formatShortTime(start)}–${formatShortTime(end)}`;
}


export default function ProviderLimits() {
  const [connections, setConnections] = useState([]);
  const [quotaData, setQuotaData] = useState({});
  const [loading, setLoading] = useState({});
  const [errors, setErrors] = useState({});
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [refreshingAll, setRefreshingAll] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [connectionsLoading, setConnectionsLoading] = useState(true);
  const [quotaAutoTriggerEnabled, setQuotaAutoTriggerEnabled] = useState(false);
  const [quotaAutoTriggerStartHour, setQuotaAutoTriggerStartHour] = useState(0);
  const [quotaAutoTriggerSaving, setQuotaAutoTriggerSaving] = useState(false);
  const [quotaAutoTriggerRunning, setQuotaAutoTriggerRunning] = useState(false);
  const [hasActiveWarmups, setHasActiveWarmups] = useState(false);
  const [warmupStateByConnection, setWarmupStateByConnection] = useState({});
  const [connectionEnabledState, setConnectionEnabledState] = useState({});
  const [connectionManualRunning, setConnectionManualRunning] = useState({});

  const intervalRef = useRef(null);
  const countdownRef = useRef(null);
  const warmupStateRef = useRef({});
  const connectionToggleRequestRef = useRef({});
  const connectionTogglePendingRef = useRef(new Set());

  const getSupportedConnections = useCallback(
    (connectionList) => connectionList.filter(
      (conn) => USAGE_SUPPORTED_PROVIDERS.includes(conn.provider) && (
        conn.authType === "oauth" || APIKEY_USAGE_PROVIDERS.includes(conn.provider)
      )
    ),
    []
  );

  // Fetch all provider connections
  const fetchConnections = useCallback(async () => {
    try {
      const response = await fetch("/api/providers/client");
      if (!response.ok) throw new Error("Failed to fetch connections");

      const data = await response.json();
      const connectionList = data.connections || [];
      setConnections(connectionList);
      return connectionList;
    } catch (error) {
      console.error("Error fetching connections:", error);
      setConnections([]);
      return [];
    }
  }, []);

  // Fetch quota for a specific connection
  const fetchQuota = useCallback(async (connectionId, provider) => {
    setLoading((prev) => ({ ...prev, [connectionId]: true }));
    setErrors((prev) => ({ ...prev, [connectionId]: null }));

    try {
      console.log(
        `[ProviderLimits] Fetching quota for ${provider} (${connectionId})`,
      );
      const response = await fetch(`/api/usage/${connectionId}`);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMsg = errorData.error || response.statusText;

        // Handle different error types gracefully
        if (response.status === 404) {
          // Connection not found - skip silently
          console.warn(
            `[ProviderLimits] Connection not found for ${provider}, skipping`,
          );
          return;
        }

        if (response.status === 401) {
          // Auth error - show message instead of throwing
          console.warn(
            `[ProviderLimits] Auth error for ${provider}:`,
            errorMsg,
          );
          setQuotaData((prev) => ({
            ...prev,
            [connectionId]: {
              quotas: [],
              message: errorMsg,
            },
          }));
          return;
        }

        throw new Error(`HTTP ${response.status}: ${errorMsg}`);
      }

      const data = await response.json();
      console.log(`[ProviderLimits] Got quota for ${provider}:`, data);

      // Parse quota data using provider-specific parser
      const parsedQuotas = parseQuotaData(provider, data);

      setQuotaData((prev) => ({
        ...prev,
        [connectionId]: {
          quotas: parsedQuotas,
          plan: data.plan || null,
          message: data.message || null,
          raw: data,
        },
      }));
    } catch (error) {
      console.error(
        `[ProviderLimits] Error fetching quota for ${provider} (${connectionId}):`,
        error,
      );
      setErrors((prev) => ({
        ...prev,
        [connectionId]: error.message || "Failed to fetch quota",
      }));
    } finally {
      setLoading((prev) => ({ ...prev, [connectionId]: false }));
    }
  }, []);

  const applyQuotaAutoTriggerPayload = useCallback((data) => {
    setQuotaAutoTriggerEnabled(data?.enabled === true);
    setQuotaAutoTriggerStartHour(normalizeQuotaAutoTriggerStartHour(data?.startHour));
    setQuotaAutoTriggerRunning(data?.running === true);

    const nextWarmupState = {};
    const nextEnabledState = {};
    const completedConnections = [];

    for (const connection of data?.connections || []) {
      const isConnectionEnabled = connection.enabled !== false;
      const nextState = connection.warmupState || null;
      const normalizedState = !isConnectionEnabled && nextState
        ? {
            ...nextState,
            running: false,
            phase: nextState.running ? "idle" : nextState.phase,
            currentModelId: null,
            currentModelName: null,
          }
        : nextState;
      const previousState = warmupStateRef.current[connection.id] || null;

      nextWarmupState[connection.id] = normalizedState;
      nextEnabledState[connection.id] = isConnectionEnabled;

      if (
        isConnectionEnabled
        && previousState?.running === true
        && normalizedState?.running !== true
      ) {
        completedConnections.push({
          id: connection.id,
          provider: connection.provider,
        });
      }
    }

    const nextHasActiveWarmups = data?.hasActiveRuns === true
      || Object.values(nextWarmupState).some((state) => state?.running === true);

    warmupStateRef.current = nextWarmupState;
    setWarmupStateByConnection(nextWarmupState);
    setConnectionEnabledState((prev) => {
      const result = { ...nextEnabledState };
      for (const id of connectionTogglePendingRef.current) {
        if (id in prev) result[id] = prev[id];
      }
      return result;
    });
    setHasActiveWarmups(nextHasActiveWarmups);

    return completedConnections;
  }, []);

  const fetchQuotaAutoTriggerSettings = useCallback(async () => {
    try {
      const response = await fetch("/api/quota/auto-trigger");
      if (!response.ok) throw new Error("Failed to fetch auto trigger settings");
      const data = await response.json();

      const completedConnections = applyQuotaAutoTriggerPayload(data);
      if (completedConnections.length > 0) {
        await Promise.allSettled(
          completedConnections.map((connection) =>
            fetchQuota(connection.id, connection.provider)
          )
        );
        setLastUpdated(new Date());
      }
    } catch (error) {
      console.error("Error fetching quota auto trigger settings:", error);
    }
  }, [applyQuotaAutoTriggerPayload, fetchQuota]);

  // Refresh quota for a specific provider
  const refreshProvider = useCallback(
    async (connectionId, provider) => {
      await fetchQuota(connectionId, provider);
      setLastUpdated(new Date());
    },
    [fetchQuota],
  );

  // Refresh all providers
  const refreshAll = useCallback(async () => {
    if (refreshingAll) return;

    setRefreshingAll(true);
    setCountdown(60);

    try {
      const conns = await fetchConnections();
      await fetchQuotaAutoTriggerSettings();
      const oauthConnections = getSupportedConnections(conns);
      // Fetch quota for supported OAuth connections only
      await Promise.all(
        oauthConnections.map((conn) => fetchQuota(conn.id, conn.provider)),
      );

      setLastUpdated(new Date());
    } catch (error) {
      console.error("Error refreshing all providers:", error);
    } finally {
      setRefreshingAll(false);
    }
  }, [refreshingAll, fetchConnections, fetchQuota, fetchQuotaAutoTriggerSettings, getSupportedConnections]);

  const updateQuotaAutoTrigger = useCallback(async (enabled, startHour = quotaAutoTriggerStartHour) => {
    const normalizedStartHour = normalizeQuotaAutoTriggerStartHour(startHour);
    setQuotaAutoTriggerSaving(true);
    if (enabled) {
      setQuotaAutoTriggerRunning(true);
    }
    try {
      const response = await fetch("/api/quota/auto-trigger", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enabled, startHour: normalizedStartHour }),
      });
      if (!response.ok) throw new Error("Failed to update auto trigger");
      const data = await response.json();
      applyQuotaAutoTriggerPayload(data);

      if (enabled) {
        refreshAll();
      }
    } catch (error) {
      console.error("Error updating quota auto trigger:", error);
      setQuotaAutoTriggerRunning(false);
    } finally {
      setQuotaAutoTriggerSaving(false);
    }
  }, [applyQuotaAutoTriggerPayload, quotaAutoTriggerStartHour, refreshAll]);

  const updateConnectionAutoTrigger = useCallback(async (connectionId, enabled) => {
    const nextRequestId = (connectionToggleRequestRef.current[connectionId] || 0) + 1;
    connectionToggleRequestRef.current[connectionId] = nextRequestId;
    connectionTogglePendingRef.current.add(connectionId);
    setConnectionEnabledState((prev) => ({ ...prev, [connectionId]: enabled }));
    try {
      const response = await fetch(`/api/quota/auto-trigger/connection/${connectionId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enabled }),
      });
      if (!response.ok) throw new Error("Failed to update connection auto trigger");
      const data = await response.json();
      if (connectionToggleRequestRef.current[connectionId] !== nextRequestId) return;
      connectionTogglePendingRef.current.delete(connectionId);
      applyQuotaAutoTriggerPayload(data);
    } catch (error) {
      if (connectionToggleRequestRef.current[connectionId] !== nextRequestId) return;
      connectionTogglePendingRef.current.delete(connectionId);
      console.error("Error updating connection auto trigger:", error);
      // Revert optimistic update
      setConnectionEnabledState((prev) => ({ ...prev, [connectionId]: !enabled }));
    }
  }, [applyQuotaAutoTriggerPayload]);

  const triggerConnectionManually = useCallback(async (connectionId, provider) => {
    setConnectionManualRunning((prev) => ({ ...prev, [connectionId]: true }));
    try {
      const response = await fetch(`/api/quota/auto-trigger/connection/${connectionId}`, {
        method: "POST",
      });
      if (!response.ok) throw new Error("Failed to trigger connection warmup");
      const data = await response.json();
      applyQuotaAutoTriggerPayload(data);
    } catch (error) {
      console.error(`Error triggering warmup for ${provider}:`, error);
    } finally {
      setConnectionManualRunning((prev) => ({ ...prev, [connectionId]: false }));
    }
  }, [applyQuotaAutoTriggerPayload]);

  // Initial load: fetch connections first so cards render immediately, then fetch quotas
  useEffect(() => {
    const initializeData = async () => {
      setConnectionsLoading(true);
      const [conns] = await Promise.all([
        fetchConnections(),
        fetchQuotaAutoTriggerSettings(),
      ]);
      setConnectionsLoading(false);

      const oauthConnections = getSupportedConnections(conns);

      // Mark all as loading before fetching
      const loadingState = {};
      oauthConnections.forEach((conn) => {
        loadingState[conn.id] = true;
      });
      setLoading(loadingState);

      await Promise.all(
        oauthConnections.map((conn) => fetchQuota(conn.id, conn.provider)),
      );
      setLastUpdated(new Date());
    };

    initializeData();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!hasActiveWarmups) return undefined;

    fetchQuotaAutoTriggerSettings();
    const timer = setInterval(() => {
      fetchQuotaAutoTriggerSettings();
    }, 1000);

    return () => clearInterval(timer);
  }, [hasActiveWarmups, fetchQuotaAutoTriggerSettings]);

  // Auto-refresh interval
  useEffect(() => {
    if (!autoRefresh) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      if (countdownRef.current) {
        clearInterval(countdownRef.current);
        countdownRef.current = null;
      }
      return;
    }

    // Main refresh interval
    intervalRef.current = setInterval(() => {
      refreshAll();
    }, REFRESH_INTERVAL_MS);

    // Countdown interval
    countdownRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) return 60;
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, [autoRefresh, refreshAll]);

  // Pause auto-refresh when tab is hidden (Page Visibility API)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
        if (countdownRef.current) {
          clearInterval(countdownRef.current);
          countdownRef.current = null;
        }
      } else if (autoRefresh) {
        // Resume auto-refresh when tab becomes visible
        intervalRef.current = setInterval(refreshAll, REFRESH_INTERVAL_MS);
        countdownRef.current = setInterval(() => {
          setCountdown((prev) => (prev <= 1 ? 60 : prev - 1));
        }, 1000);
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [autoRefresh, refreshAll]);

  // Format last updated time
  const formatLastUpdated = useCallback(() => {
    if (!lastUpdated) return "Never";

    const now = new Date();
    const diffMs = now - lastUpdated;
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) return `${diffDays}d ago`;
    if (diffHours > 0) return `${diffHours}h ago`;
    if (diffMinutes > 0) return `${diffMinutes}m ago`;
    return "Just now";
  }, [lastUpdated]);

  // Filter only supported providers
  const filteredConnections = getSupportedConnections(connections);

  // Sort providers by USAGE_SUPPORTED_PROVIDERS order, then alphabetically
  const sortedConnections = [...filteredConnections].sort((a, b) => {
    const orderA = USAGE_SUPPORTED_PROVIDERS.indexOf(a.provider);
    const orderB = USAGE_SUPPORTED_PROVIDERS.indexOf(b.provider);
    if (orderA !== orderB) return orderA - orderB;
    return a.provider.localeCompare(b.provider);
  });

  const autoTriggerButtonBusy = quotaAutoTriggerSaving || quotaAutoTriggerRunning;
  const rollingStartOptions = useMemo(
    () => Array.from({ length: 24 }, (_, hour) => ({
      value: hour,
      label: `${String(hour).padStart(2, "0")}:00`,
    })),
    [],
  );
  const rollingWindowMeta = useMemo(() => {
    const now = new Date();
    const currentWindow = getCurrentRollingWindow(now, quotaAutoTriggerStartHour);
    const nextBoundary = getNextWindowBoundary(now, quotaAutoTriggerStartHour);
    const timeline = getWindowTimeline(now, quotaAutoTriggerStartHour, 5).map((window) => ({
      ...window,
      label: formatWindowLabel(window.start, window.end),
    }));
    const msUntilNext = nextBoundary - now;
    const totalMinutes = Math.max(0, Math.ceil(msUntilNext / (1000 * 60)));
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    return {
      currentWindow,
      nextBoundary,
      timeline,
      startHours: getWindowStartHours(quotaAutoTriggerStartHour),
      nextCountdown: hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`,
      currentLabel: formatWindowLabel(currentWindow.start, currentWindow.end),
      nextBoundaryLabel: formatShortTime(nextBoundary),
    };
  }, [lastUpdated, quotaAutoTriggerEnabled, quotaAutoTriggerRunning, hasActiveWarmups, quotaAutoTriggerStartHour]);
  const rollingStartLabel = rollingStartOptions.find(
    (option) => option.value === quotaAutoTriggerStartHour,
  )?.label || "00:00";
  const rollingBoundarySummary = rollingWindowMeta.startHours
    .map((hour) => `${String(hour).padStart(2, "0")}:00`)
    .join(", ");

  const handleRollingStartHourChange = useCallback(async (event) => {
    const nextStartHour = normalizeQuotaAutoTriggerStartHour(event.target.value);
    setQuotaAutoTriggerStartHour(nextStartHour);
    await updateQuotaAutoTrigger(quotaAutoTriggerEnabled, nextStartHour);
  }, [quotaAutoTriggerEnabled, updateQuotaAutoTrigger]);

  const rollingWindowDescription = `${translate("Boundaries")}: ${rollingBoundarySummary}`;
  const rollingTooltipDescription = `${translate("When enabled, it runs once immediately, then automatically triggers every 5 hours from the selected start time (local time).")} ${rollingWindowDescription}`;
  const rollingCadenceLabel = `${translate("5-hour rolling cadence")} · ${translate("Start at")} ${rollingStartLabel}`;
  const rollingLengthDescription = `${translate("Every slot is fixed")} · ${translate("Start at")} ${rollingStartLabel}`;

  // Empty state
  if (!connectionsLoading && sortedConnections.length === 0) {
    return (
      <Card padding="lg">
        <div className="text-center py-12">
          <span className="material-symbols-outlined text-[64px] text-text-muted opacity-20">
            cloud_off
          </span>
          <h3 className="mt-4 text-lg font-semibold text-text-primary">
            No Providers Connected
          </h3>
          <p className="mt-2 text-sm text-text-muted max-w-md mx-auto">
            Connect to providers with OAuth to track your API quota limits and
            usage.
          </p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-semibold text-text-primary">
            {translate("Provider Limits")}
          </h2>
          <span className="text-sm text-text-muted">
            {translate("Last updated:")} {formatLastUpdated()}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <div className="group relative">
            <button
              type="button"
              role="switch"
              aria-checked={quotaAutoTriggerEnabled}
              onClick={() => updateQuotaAutoTrigger(!quotaAutoTriggerEnabled)}
              disabled={quotaAutoTriggerSaving}
              className="flex items-center gap-2 px-3 py-2 rounded-lg border border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5 transition-colors disabled:opacity-50"
            >
              <span
                className={`material-symbols-outlined text-[18px] ${
                  quotaAutoTriggerEnabled ? "text-primary" : "text-text-muted"
                }`}
              >
                {quotaAutoTriggerEnabled ? "toggle_on" : "toggle_off"}
              </span>
              <span className="text-sm text-text-primary">{translate("Auto Window Rolling")}</span>
              {autoTriggerButtonBusy && (
                <span className="material-symbols-outlined text-[16px] text-primary animate-spin">
                  progress_activity
                </span>
              )}
            </button>
            <div className="pointer-events-none absolute right-0 top-full z-20 mt-2 w-[min(20rem,calc(100vw-2rem))] rounded-lg bg-black px-3 py-2 text-xs leading-5 text-white opacity-0 shadow-lg transition-opacity duration-150 group-hover:opacity-100 dark:bg-neutral-900 md:left-0 md:right-auto md:w-80">
              <p>{rollingTooltipDescription}</p>
              <p className="mt-2 text-white/80">
                {translate("These internal refresh requests are real upstream requests, so they consume provider quota and appear in usage history/logs. Request-count quota is mainly consumed by each trigger itself, not because the message content is long.")}
              </p>
            </div>
          </div>

          <label className="flex items-center gap-2 px-3 py-2 rounded-lg border border-black/10 dark:border-white/10 bg-white/70 dark:bg-white/[0.03]">
            <span className="text-sm text-text-muted">{translate("Start at")}</span>
            <select
              value={quotaAutoTriggerStartHour}
              onChange={handleRollingStartHourChange}
              disabled={quotaAutoTriggerSaving}
              className="bg-transparent text-sm text-text-primary outline-none"
            >
              {rollingStartOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          {/* Auto-refresh toggle */}
          <button
            onClick={() => setAutoRefresh((prev) => !prev)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg border border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
            title={autoRefresh ? "Disable auto-refresh" : "Enable auto-refresh"}
          >
            <span
              className={`material-symbols-outlined text-[18px] ${
                autoRefresh ? "text-primary" : "text-text-muted"
              }`}
            >
              {autoRefresh ? "toggle_on" : "toggle_off"}
            </span>
            <span className="text-sm text-text-primary">{translate("Auto-refresh")}</span>
            {autoRefresh && (
              <span className="text-xs text-text-muted">({countdown}s)</span>
            )}
          </button>

          {/* Refresh all button */}
          <Button
            variant="secondary"
            size="md"
            icon="refresh"
            onClick={refreshAll}
            disabled={refreshingAll}
            loading={refreshingAll}
          >
            {translate("Refresh All")}
          </Button>
        </div>
      </div>

      <Card padding="md" className="overflow-hidden border-primary/10 bg-gradient-to-br from-primary/[0.06] via-transparent to-transparent dark:from-primary/[0.12]">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/15 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
              <span className="material-symbols-outlined text-[14px]">schedule</span>
              <span>{rollingCadenceLabel}</span>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-text-primary">
                {translate("Current available window")}
              </h3>
              <p className="mt-1 text-sm text-text-muted">
                {translate("Now in")}
                {" "}
                <span className="font-medium text-text-primary">{rollingWindowMeta.currentLabel}</span>
                {" · "}
                {translate("Next trigger at")}
                {" "}
                <span className="font-medium text-text-primary">{rollingWindowMeta.nextBoundaryLabel}</span>
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:min-w-[22rem]">
            <div className="rounded-2xl border border-black/5 bg-white/80 p-4 shadow-sm backdrop-blur dark:border-white/10 dark:bg-white/5">
              <div className="text-xs uppercase tracking-[0.16em] text-text-muted">
                {translate("Window length")}
              </div>
              <div className="mt-2 text-2xl font-semibold text-text-primary">{ROLLING_WINDOW_HOURS}h</div>
              <div className="mt-1 text-xs text-text-muted">{rollingLengthDescription}</div>
            </div>
            <div className="rounded-2xl border border-black/5 bg-white/80 p-4 shadow-sm backdrop-blur dark:border-white/10 dark:bg-white/5">
              <div className="text-xs uppercase tracking-[0.16em] text-text-muted">
                {translate("Next refresh")}
              </div>
              <div className="mt-2 text-2xl font-semibold text-text-primary">{rollingWindowMeta.nextCountdown}</div>
              <div className="mt-1 text-xs text-text-muted">{translate("Until next boundary")}</div>
            </div>
          </div>
        </div>

        <div className="mt-5 rounded-2xl border border-black/5 bg-white/70 p-4 dark:border-white/10 dark:bg-black/10">
          <div className="mb-3 flex items-center justify-between gap-3">
            <div className="text-sm font-medium text-text-primary">{translate("Rolling timeline")}</div>
            <div className="text-xs text-text-muted">{translate("Past → current → upcoming")}</div>
          </div>
          <div className="grid gap-3 md:grid-cols-5">
            {rollingWindowMeta.timeline.map((window) => {
              const stateClass = window.isCurrent
                ? "border-primary/30 bg-primary/10 shadow-sm"
                : window.isPast
                  ? "border-black/5 bg-black/[0.03] dark:border-white/10 dark:bg-white/[0.03]"
                  : "border-black/5 bg-white dark:border-white/10 dark:bg-white/[0.02]";
              const dotClass = window.isCurrent
                ? "bg-primary"
                : window.isPast
                  ? "bg-text-muted/40"
                  : "bg-emerald-500/80";
              const badge = window.isCurrent
                ? translate("Now")
                : window.isPast
                  ? translate("Done")
                  : translate("Next");

              return (
                <div
                  key={window.key}
                  className={`rounded-xl border p-3 transition-all ${stateClass}`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className={`h-2.5 w-2.5 rounded-full ${dotClass}`} />
                    <span className="text-[11px] font-medium uppercase tracking-[0.12em] text-text-muted">{badge}</span>
                  </div>
                  <div className="mt-3 text-sm font-semibold text-text-primary">{window.label}</div>
                  <div className="mt-1 text-xs text-text-muted">
                    {window.isCurrent
                      ? translate("Available right now")
                      : window.isPast
                        ? translate("Already passed")
                        : translate("Scheduled automatically")}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </Card>

      {/* Provider Cards Grid */}
      <div className="flex flex-col gap-4">
        {sortedConnections.map((conn) => {
          const quota = quotaData[conn.id];
          const isLoading = loading[conn.id];
          const warmupState = warmupStateByConnection[conn.id];
          const isWarmupRunning = warmupState?.running === true;
          const isBusy = isLoading || isWarmupRunning;
          const error = errors[conn.id];
          const showSkeleton = isLoading && !quota && !error;
          const isConnectionEnabled = connectionEnabledState[conn.id] !== false;
          const isManualRunning = connectionManualRunning[conn.id] === true;

          // Use table layout for all providers
          return (
            <Card
              key={conn.id}
              padding="none"
              className={isWarmupRunning ? "ring-1 ring-primary/20 border-primary/20" : ""}
            >
              <div className="p-6 border-b border-black/10 dark:border-white/10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center overflow-hidden">
                      <ProviderIcon
                        src={`/providers/${conn.provider}.png`}
                        alt={conn.provider}
                        size={40}
                        className="object-contain"
                        fallbackText={
                          conn.provider?.slice(0, 2).toUpperCase() || "PR"
                        }
                      />
                    </div>
                    <div>
                      <h3 className="text-base font-semibold text-text-primary capitalize">
                        {conn.provider}
                      </h3>
                      {conn.name && (
                        <p className="text-sm text-text-muted">{conn.name}</p>
                      )}
                      {isWarmupRunning && (
                        <div className="mt-1 inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary">
                          <span className="material-symbols-outlined text-[12px] animate-spin">
                            progress_activity
                          </span>
                          <span>
                            {warmupState?.currentModelName
                              ? `${translate("Refreshing")} · ${warmupState.currentModelName}`
                              : translate("Refreshing")}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    {/* Per-connection auto-rolling checkbox */}
                    {quotaAutoTriggerEnabled && (
                      <label
                        className="flex items-center gap-1.5 px-2 py-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer select-none"
                        title={isConnectionEnabled ? translate("Disable auto-rolling for this provider") : translate("Enable auto-rolling for this provider")}
                      >
                        <input
                          type="checkbox"
                          checked={isConnectionEnabled}
                          onChange={(e) => updateConnectionAutoTrigger(conn.id, e.target.checked)}
                          className="w-3.5 h-3.5 accent-primary cursor-pointer"
                        />
                        <span className="text-xs text-text-muted">{translate("Rolling")}</span>
                      </label>
                    )}

                    <button
                      onClick={() => triggerConnectionManually(conn.id, conn.provider)}
                      disabled={isBusy || isManualRunning}
                      className="p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors disabled:opacity-50"
                      title={
                        isConnectionEnabled
                          ? translate("Manually trigger window rolling once")
                          : translate("Auto rolling is disabled for this provider, but you can still manually trigger it once")
                      }
                    >
                      <span className={`material-symbols-outlined text-[20px] text-primary ${isManualRunning ? "animate-spin" : ""}`}>
                        {isManualRunning ? "progress_activity" : "play_circle"}
                      </span>
                    </button>

                    {/* Refresh quota button */}
                    <button
                      onClick={() => refreshProvider(conn.id, conn.provider)}
                      disabled={isBusy}
                      className="p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors disabled:opacity-50"
                      title="Refresh quota"
                    >
                      <span className={`material-symbols-outlined text-[20px] text-text-muted ${isBusy ? "animate-spin" : ""}`}>
                        refresh
                      </span>
                    </button>
                  </div>
                </div>
              </div>

              <div className="p-6">
                {showSkeleton ? (
                  <div className="text-center py-8 text-text-muted">
                    <span className="material-symbols-outlined text-[32px] animate-spin">
                      progress_activity
                    </span>
                  </div>
                ) : error ? (
                  <div className="text-center py-8">
                    <span className="material-symbols-outlined text-[32px] text-red-500">
                      error
                    </span>
                    <p className="mt-2 text-sm text-text-muted">{error}</p>
                  </div>
                ) : quota?.message ? (
                  <div className="text-center py-8">
                    <p className="text-sm text-text-muted">{quota.message}</p>
                  </div>
                ) : (
                  <QuotaTable
                    quotas={quota?.quotas}
                    warmupState={warmupState}
                    showWarmupState={quotaAutoTriggerEnabled}
                  />
                )}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
