import { rpiApi, VehicleData } from "@/lib/rpiApi";
import { useCallback, useEffect, useRef, useState } from "react";
import { notificationService } from "@/lib/notificationService";

/**
 * Custom hook for accessing vehicle data from Supabase with auto-refresh every 5 seconds
 * Includes push notification support for warning and critical health status
 */
export function useVehicleData() {
  const [data, setData] = useState<VehicleData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  
  // Track previous health status to avoid duplicate notifications
  const previousHealthStatus = useRef<number | null>(null);
  const notificationInitialized = useRef<boolean>(false);

  /**
   * Get health status text from numeric value
   */
  const getHealthStatusText = (status: number): string => {
    switch (status) {
      case 0: return "Normal";
      case 1: return "Advisory";
      case 2: return "Warning";
      case 3: return "Critical";
      default: return "Unknown";
    }
  };

  /**
   * Check health status and send notification if warning or critical
   */
  const checkHealthStatusAndNotify = useCallback((healthStatus: number | undefined) => {
    if (healthStatus === undefined || healthStatus === null) return;

    const statusText = getHealthStatusText(healthStatus);

    // Only send notification if:
    // 1. Status is Warning (2) or Critical (3)
    // 2. Status has changed from previous check
    // 3. It's not the first initialization
    if (
      (healthStatus === 2 || healthStatus === 3) &&
      previousHealthStatus.current !== healthStatus &&
      notificationInitialized.current
    ) {
      console.log(`🚨 Health status changed to ${statusText} (${healthStatus}) - sending notification`);
      notificationService.sendHealthStatusNotification(healthStatus, statusText);
    }

    // Update previous status
    previousHealthStatus.current = healthStatus;
  }, []);

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
        
        // Check health status and send notification if needed
        if (response.data?.health_status !== undefined) {
          checkHealthStatusAndNotify(response.data.health_status);
        }
      }
    } catch (err: any) {
      setError(err.message || "Failed to fetch data");
    } finally {
      setLoading(false);
    }
  }, [checkHealthStatusAndNotify]);

  useEffect(() => {
    console.log('🚀 Auto-refresh initialized - fetching every 5 seconds');
    
    // Request notification permissions
    notificationService.requestPermissions().then((granted) => {
      if (granted) {
        console.log('✅ Notification permissions granted');
      } else {
        console.log('⚠️ Notification permissions not granted - notifications will be disabled');
      }
      notificationInitialized.current = true;
    });
    
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
