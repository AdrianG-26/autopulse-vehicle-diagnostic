import { rpiApi, VehicleData } from "@/lib/rpiApi";
import { useCallback, useEffect, useState } from "react";

/**
 * Custom hook for accessing vehicle data from Supabase with auto-refresh every 5 seconds
 */
export function useVehicleData() {
  const [data, setData] = useState<VehicleData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  /**
   * Fetch data from Supabase (wrapped in useCallback for stable reference)
   */
  const fetchData = useCallback(async (showLoading: boolean = true) => {
    if (showLoading) {
      setLoading(true);
    }
    
    try {
      const response = await rpiApi.fetchLatest();
      
      // Always update state to trigger re-render
      setData(response.data);
      setLastUpdate(new Date());

      if (!response.success) {
        setError(response.error || "Failed to fetch data");
      } else {
        setError(null);
      }
    } catch (err: any) {
      setError(err.message || "Failed to fetch data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    console.log('🚀 Auto-refresh initialized - fetching every 5 seconds');
    
    // Initial data fetch
    fetchData();

    // Set up auto-refresh every 5 seconds
    const intervalId = setInterval(() => {
      console.log('⏰ Auto-refresh triggered');
      fetchData(false); // Don't show loading on auto-refresh to avoid UI flicker
    }, 5000);

    // Cleanup interval on unmount
    return () => {
      console.log('🛑 Auto-refresh stopped');
      clearInterval(intervalId);
    };
  }, [fetchData]);

  /**
   * Manually refresh data (for pull-to-refresh)
   */
  const refresh = useCallback(async () => {
    await fetchData();
  }, [fetchData]);

  return {
    data,
    loading,
    error,
    lastUpdate,
    refresh,
  };
}

/**
 * Format helper for displaying sensor values
 */
export function formatValue(
  value: number | null | undefined,
  decimals: number = 1,
  fallback: string = "N/A"
): string {
  if (value === null || value === undefined || isNaN(value)) {
    return fallback;
  }
  return value.toFixed(decimals);
}

/**
 * Get status color based on ML status
 */
export function getStatusColor(status: string): string {
  switch (status?.toUpperCase()) {
    case "EXCELLENT":
    case "NORMAL":
      return "#2ecc71";
    case "ADVISORY":
      return "#f1c40f";
    case "WARNING":
      return "#e67e22";
    case "CRITICAL":
      return "#e74c3c";
    default:
      return "#95a5a6";
  }
}

/**
 * Get status badge style
 */
export function getStatusBadgeStyle(status: string): {
  backgroundColor: string;
  borderColor: string;
} {
  const color = getStatusColor(status);
  return {
    backgroundColor: `${color}22`,
    borderColor: color,
  };
}
