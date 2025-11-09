import { rpiApi, VehicleData } from "@/lib/rpiApi";
import { useEffect, useState } from "react";

/**
 * Custom hook for accessing vehicle data from Raspberry Pi via REST API
 */
export function useVehicleData() {
  const [data, setData] = useState<VehicleData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  useEffect(() => {
    // Initial data fetch
    fetchData();
  }, []);

  /**
   * Fetch data from REST API
   */
  const fetchData = async () => {
    setLoading(true);
    const response = await rpiApi.fetchLatest();
    setData(response.data);
    setLoading(false);
    setLastUpdate(new Date());

    if (!response.success) {
      setError(response.error || "Failed to fetch data");
    } else {
      setError(null);
    }
  };

  /**
   * Manually refresh data (for pull-to-refresh)
   */
  const refresh = async () => {
    await fetchData();
  };

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
