"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { AnalyticsDashboard } from "@/lib/v2/types";
import { fetchDashboardWithTouchpoints } from "@/lib/v2/touchpoint-fetch";

type AnalyticsContextValue = {
  analytics: AnalyticsDashboard | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
};

const AnalyticsContext = createContext<AnalyticsContextValue | null>(null);

export function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  const [analytics, setAnalytics] = useState<AnalyticsDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    const result = await fetchDashboardWithTouchpoints();
    setAnalytics(result.analytics);
    setError(result.error);
    setLoading(false);
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  useEffect(() => {
    const onRefresh = () => void refresh();
    window.addEventListener("fiscmak:touchpoint-complete", onRefresh);
    window.addEventListener("fiscmak:activity-logged", onRefresh);
    window.addEventListener("fiscmak:goals-updated", onRefresh);
    return () => {
      window.removeEventListener("fiscmak:touchpoint-complete", onRefresh);
      window.removeEventListener("fiscmak:activity-logged", onRefresh);
      window.removeEventListener("fiscmak:goals-updated", onRefresh);
    };
  }, [refresh]);

  const value = useMemo(
    () => ({ analytics, loading, error, refresh }),
    [analytics, loading, error, refresh],
  );

  return (
    <AnalyticsContext.Provider value={value}>{children}</AnalyticsContext.Provider>
  );
}

export function useAnalytics(): AnalyticsContextValue {
  const ctx = useContext(AnalyticsContext);
  if (!ctx) {
    throw new Error("useAnalytics must be used within AnalyticsProvider");
  }
  return ctx;
}

/** Optional hook for panels that mount outside the provider during tests. */
export function useAnalyticsOptional(): AnalyticsContextValue | null {
  return useContext(AnalyticsContext);
}
