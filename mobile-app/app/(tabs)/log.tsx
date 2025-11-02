import { Colors } from "@/constants/Colors";
import {
  formatValue,
  getStatusColor,
  useVehicleData,
} from "@/hooks/useVehicleData";
import { VehicleData } from "@/lib/rpiApi";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import {
  Pressable,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

const ACCENT = Colors.light.tint;

interface LogEntry extends VehicleData {
  localTimestamp: string;
}

const LOG_TABS = [
  { key: "ALL", label: "All" },
  { key: "EXCELLENT", label: "Excellent" },
  { key: "NORMAL", label: "Normal" },
  { key: "ADVISORY", label: "Advisory" },
  { key: "WARNING", label: "Warning" },
  { key: "CRITICAL", label: "Critical" },
];

export default function LogsScreen() {
  const [activeTab, setActiveTab] = useState("ALL");
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const { data, loading, refresh } = useVehicleData();
  const [refreshing, setRefreshing] = useState(false);

  // Collect logs every time data updates (keep last 100 entries)
  useEffect(() => {
    if (data) {
      const logEntry: LogEntry = {
        ...data,
        localTimestamp: new Date().toISOString(),
      };
      setLogs((prev: LogEntry[]) => [logEntry, ...prev].slice(0, 100));
    }
  }, [data]);

  const onRefresh = async () => {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  };

  // Filter logs by ML status
  const filteredLogs = logs.filter((log: LogEntry) => {
    if (activeTab === "ALL") return true;
    return log.ml_status === activeTab;
  });

  const fmt = (val: number | null | undefined, decimals: number = 1) =>
    formatValue(val, decimals, "N/A");

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing || loading}
            onRefresh={onRefresh}
            tintColor={ACCENT}
            colors={[ACCENT]}
          />
        }
      >
        <View style={styles.headerRow}>
          <View style={styles.brandRow}>
            <Ionicons name="car-sport" size={22} color={ACCENT} />
            <Text style={styles.brand}>AutoPulse</Text>
          </View>
        </View>

        <View style={styles.titleRow}>
          <Ionicons name="clipboard-outline" size={18} color={ACCENT} />
          <Text style={styles.title}>Logs</Text>
        </View>
        <Text style={styles.subtitle}>Vehicle Data Logs</Text>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabRow}
        >
          {LOG_TABS.map((tab) => (
            <Pressable
              key={tab.key}
              style={[styles.tab, activeTab === tab.key && styles.tabActive]}
              onPress={() => setActiveTab(tab.key)}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === tab.key && styles.tabTextActive,
                ]}
              >
                {tab.label}
                {tab.key === "ALL" && (
                  <Text style={styles.tabCount}> ({logs.length})</Text>
                )}
              </Text>
            </Pressable>
          ))}
        </ScrollView>

        {filteredLogs.length === 0 ? (
          <View style={styles.card}>
            <View style={styles.emptyState}>
              <Ionicons name="clipboard-outline" size={48} color="#94a3b8" />
              <Text style={styles.emptyText}>
                {logs.length === 0
                  ? "No logs available yet. Data will appear as it comes from Raspberry Pi."
                  : "No logs match the selected filter."}
              </Text>
            </View>
          </View>
        ) : (
          <View style={styles.card}>
            <View style={styles.logHeader}>
              <Text style={styles.logHeaderText}>Time</Text>
              <Text style={styles.logHeaderText}>RPM</Text>
              <Text style={styles.logHeaderText}>Speed</Text>
              <Text style={styles.logHeaderText}>Health</Text>
              <Text style={styles.logHeaderText}>Status</Text>
            </View>
            {filteredLogs.map((log: LogEntry, idx: number) => (
              <View
                key={idx}
                style={[styles.logRow, idx % 2 === 1 && styles.logRowAlt]}
              >
                <Text style={styles.logCell}>
                  {new Date(log.localTimestamp).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </Text>
                <Text style={styles.logCell}>{fmt(log.rpm, 0)}</Text>
                <Text style={styles.logCell}>{fmt(log.vehicle_speed, 0)}</Text>
                <Text
                  style={[
                    styles.logCell,
                    {
                      color:
                        log.ml_health_score >= 90
                          ? "#2ecc71"
                          : log.ml_health_score >= 70
                          ? "#f1c40f"
                          : "#e74c3c",
                      fontWeight: "700",
                    },
                  ]}
                >
                  {fmt(log.ml_health_score, 0)}
                </Text>
                <View
                  style={[
                    styles.statusBadge,
                    {
                      backgroundColor: `${getStatusColor(log.ml_status)}22`,
                      borderColor: getStatusColor(log.ml_status),
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.statusText,
                      {
                        color: getStatusColor(log.ml_status),
                      },
                    ]}
                  >
                    {log.ml_status || "N/A"}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const BG = "#E9F1F6";
const CARD = "#ffffff";

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: BG,
  },
  content: {
    padding: 16,
    gap: 12,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  brandRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  brand: {
    fontSize: 20,
    fontWeight: "800",
    color: "#16445A",
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 6,
  },
  title: {
    fontSize: 18,
    fontWeight: "800",
    color: "#123B4A",
  },
  subtitle: {
    color: "#6b7d86",
    marginBottom: 8,
  },
  tabRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 12,
    marginTop: 2,
  },
  tab: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 6,
    backgroundColor: "#f3f6f9",
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#d2dae2",
  },
  tabActive: {
    backgroundColor: CARD,
    borderColor: ACCENT,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 5,
    elevation: 1,
  },
  tabText: {
    fontSize: 14,
    color: "#607080",
    fontWeight: "700",
  },
  tabTextActive: {
    color: ACCENT,
  },
  tabCount: {
    fontSize: 13,
    color: "#888",
    fontWeight: "500",
  },
  card: {
    backgroundColor: CARD,
    borderRadius: 14,
    padding: 12,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
    gap: 8,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
    gap: 16,
  },
  emptyText: {
    color: "#6b7d86",
    fontSize: 14,
    textAlign: "center",
  },
  logHeader: {
    flexDirection: "row",
    paddingVertical: 8,
    paddingHorizontal: 4,
    backgroundColor: "#f3f6f9",
    borderRadius: 8,
    gap: 8,
  },
  logHeaderText: {
    flex: 1,
    fontSize: 12,
    fontWeight: "700",
    color: "#123B4A",
    textAlign: "center",
  },
  logRow: {
    flexDirection: "row",
    paddingVertical: 10,
    paddingHorizontal: 4,
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#e6e9ed",
  },
  logRowAlt: {
    backgroundColor: "#f9fafb",
  },
  logCell: {
    flex: 1,
    fontSize: 12,
    color: "#123B4A",
    textAlign: "center",
  },
  statusBadge: {
    flex: 1,
    paddingHorizontal: 6,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  statusText: {
    fontSize: 10,
    fontWeight: "700",
  },
  metricRow: {
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
  },
});
