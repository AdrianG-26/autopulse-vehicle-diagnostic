import { ThemedText } from "@/components/ThemedText";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { rpiApi } from "@/lib/rpiApi";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

// NOTE: API endpoint is now configurable and persisted. Use the input below to change it.

type ConnectionStatus =
  | "idle"
  | "checking"
  | "connected"
  | "error"
  | "cancelled";

export default function RaspberrySettingsScreen() {
  const [status, setStatus] = useState<ConnectionStatus>("idle");
  const [lastSync, setLastSync] = useState<string | null>(null);
  const [endpoint] = useState<string>("Supabase (Direct Connection)");
  const abortControllerRef = useRef<AbortController | null>(null);

  const checkConnection = async () => {
    if (status === "checking") return;

    abortControllerRef.current = new AbortController();
    const { signal } = abortControllerRef.current;

    setStatus("checking");
    setLastSync(null);

    try {
      // Use the rpiApi testConnection which respects the currently-configured API URL
      const ok = await rpiApi.testConnection();
      if (ok) {
        setStatus("connected");
        // Try to fetch latest timestamp for display
        try {
          const res = await rpiApi.fetchLatest();
          if (res && res.data && res.data.timestamp) {
            setLastSync(new Date(res.data.timestamp).toLocaleString());
          }
        } catch (e) {
          // ignore
        }
      } else {
        throw new Error("Server responded with an error");
      }
    } catch (error: any) {
      if (error.name === "AbortError") {
        setStatus("cancelled");
      } else {
        setStatus("error");
        Alert.alert(
          "Connection Failed",
          "Could not connect to Supabase. Please check your internet connection and ensure the database is accessible."
        );
      }
    } finally {
      abortControllerRef.current = null;
    }
  };

  const stopConnection = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  };

  const getStatusText = () => {
    switch (status) {
      case "connected":
        return "Connected";
      case "checking":
        return "Checking...";
      case "error":
        return "Connection Failed";
      case "cancelled":
        return "Cancelled";
      default:
        return "Idle";
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case "connected":
        return "#2ecc71";
      case "error":
        return "#e74c3c";
      case "cancelled":
        return "#f39c12";
      default:
        return "#6b7d86";
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.panelContainer}>
        <ThemedText type="subtitle" style={styles.panelTitle}>
          Database Connection
        </ThemedText>
        <View style={styles.panelCard}>
          <View style={styles.panelRow}>
            <View style={styles.panelRowLeft}>
              <IconSymbol
                name="antenna.radiowaves.left.and.right"
                size={24}
                color="#0a7ea4"
              />
              <ThemedText style={styles.panelRowLabel}>
                Supabase Status
              </ThemedText>
            </View>
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 6 }}
            >
              <Ionicons name="ellipse" size={8} color={getStatusColor()} />
              <ThemedText
                style={[styles.statusText, { color: getStatusColor() }]}
              >
                {getStatusText()}
              </ThemedText>
            </View>
          </View>

          <View style={styles.panelDivider} />

          <View style={styles.panelRow}>
            <View style={styles.panelRowLeft}>
              <IconSymbol name="link" size={24} color="#0a7ea4" />
              <ThemedText style={styles.panelRowLabel}>Data Source</ThemedText>
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <TextInput
                value={endpoint}
                style={[styles.endpointInput, styles.endpointReadOnly]}
                editable={false}
                selectTextOnFocus={false}
              />
            </View>
          </View>

          <View style={styles.panelDivider} />

          <View style={styles.panelRow}>
            <View style={styles.panelRowLeft}>
              <IconSymbol name="clock" size={24} color="#0a7ea4" />
              <ThemedText style={styles.panelRowLabel}>Last Sync</ThemedText>
            </View>
            <ThemedText style={styles.statusText}>
              {lastSync || "Never"}
            </ThemedText>
          </View>
        </View>

        {status === "checking" ? (
          <View style={styles.buttonGroup}>
            <View style={styles.checkingContainer}>
              <ActivityIndicator color="#0a7ea4" />
              <Text style={styles.checkingText}>Testing...</Text>
            </View>
            <Pressable
              style={({ pressed }) => [
                styles.stopButton,
                pressed && styles.buttonPressed,
              ]}
              onPress={stopConnection}
            >
              <Ionicons name="stop-circle-outline" size={20} color="#ffffff" />
              <Text style={styles.buttonText}>Stop</Text>
            </Pressable>
          </View>
        ) : (
          <View style={{ flexDirection: "row", gap: 12 }}>
            <Pressable
              style={({ pressed }) => [
                styles.button,
                pressed && styles.buttonPressed,
                { flex: 1 },
              ]}
              onPress={async () => {
                // Test Supabase connection
                Alert.alert(
                  "Testing",
                  "Testing Supabase connection..."
                );
                checkConnection();
              }}
            >
              <Ionicons name="cloud-done-outline" size={20} color="#ffffff" />
              <Text style={styles.buttonText}>Test Connection</Text>
            </Pressable>

            <Pressable
              style={({ pressed }) => [
                styles.buttonOutline,
                pressed && styles.buttonPressed,
              ]}
              onPress={async () => {
                // Refresh data
                try {
                  const result = await rpiApi.fetchLatest();
                  if (result.success) {
                    Alert.alert("Success", "Data refreshed successfully!");
                  } else {
                    Alert.alert("Error", result.error || "Failed to refresh data");
                  }
                } catch (error: any) {
                  Alert.alert("Error", error.message || "Failed to refresh data");
                }
              }}
            >
              <Ionicons
                name="refresh-outline"
                size={20}
                color="#0a7ea4"
              />
              <Text style={[styles.buttonTextOutline]}>Refresh Data</Text>
            </Pressable>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fafafa",
  },
  panelContainer: {
    padding: 16,
    backgroundColor: "#fafafa",
    gap: 16,
  },
  panelTitle: {
    fontSize: 22,
    fontWeight: "500",
    marginBottom: 4,
    color: "#1c1b1f",
    letterSpacing: 0,
  },
  panelCard: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: "#ffffff",
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.18,
    shadowRadius: 1.0,
  },
  panelRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    minHeight: 48,
  },
  panelRowLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  panelRowLabel: {
    fontSize: 16,
    color: "#1c1b1f",
    fontWeight: "500",
    letterSpacing: 0.15,
  },
  panelDivider: {
    height: 1,
    backgroundColor: "#e0e0e0",
    marginVertical: 4,
  },
  statusText: {
    fontSize: 14,
    fontWeight: "500",
    letterSpacing: 0.1,
  },
  endpointText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#49454f",
    flexShrink: 1,
    textAlign: "right",
    letterSpacing: 0.25,
  },
  endpointInput: {
    fontSize: 14,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    backgroundColor: "#ffffff",
    color: "#1c1b1f",
    letterSpacing: 0.25,
  },
  endpointReadOnly: {
    backgroundColor: "#f5f5f5",
    color: "#0a7ea4",
    fontWeight: "600",
  },
  buttonOutline: {
    borderColor: "#0a7ea4",
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    marginTop: 8,
    minHeight: 48,
  },
  buttonTextOutline: {
    color: "#0a7ea4",
    fontSize: 14,
    fontWeight: "500",
    letterSpacing: 0.1,
  },
  button: {
    backgroundColor: "#0a7ea4",
    borderRadius: 12,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    marginTop: 8,
    minHeight: 48,
    elevation: 0,
  },
  buttonPressed: {
    opacity: 0.85,
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "500",
    letterSpacing: 0.1,
  },
  buttonGroup: {
    flexDirection: "row",
    marginTop: 8,
    gap: 12,
  },
  checkingContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    backgroundColor: "#ffffff",
    borderRadius: 12,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    minHeight: 48,
  },
  checkingText: {
    color: "#0a7ea4",
    fontSize: 14,
    fontWeight: "500",
    letterSpacing: 0.1,
  },
  stopButton: {
    backgroundColor: "#e74c3c",
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 24,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    minHeight: 48,
    elevation: 0,
  },
});
