import { ThemedText } from "@/components/ThemedText";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import {
  formatValue,
  getStatusColor,
  useVehicleData,
} from "@/hooks/useVehicleData";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import {
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";

export default function HomeScreen() {
  const colorScheme = useColorScheme();
  const accent = Colors.light.tint;
  const { data, loading, refresh } = useVehicleData();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  };

  // Helper to format values with fallback
  const fmt = (val: number | null | undefined, decimals: number = 1) =>
    formatValue(val, decimals, "N/A");

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing || loading}
          onRefresh={onRefresh}
          tintColor={accent}
          colors={[accent]}
        />
      }
    >
      <View style={styles.headerRow}>
        <View style={styles.brandRow}>
          <Ionicons name="car-sport" size={22} color={accent} />
          <ThemedText style={styles.brand}>AutoPulse</ThemedText>
        </View>
        <Pressable
          accessibilityRole="button"
          onPress={() => router.push("/settings" as any)}
          hitSlop={8}
        >
          <Ionicons name="settings-outline" size={26} color="#2c3e50" />
        </Pressable>
      </View>

      <View style={styles.header}>
        <ThemedText type="title" style={styles.headerTitle}>
          Dashboard
        </ThemedText>
        <ThemedText style={styles.headerSubtitle}>
          Monitor your vehicle&apos;s performance
        </ThemedText>
      </View>

      <View style={styles.panelContainer}>
        <ThemedText type="subtitle" style={styles.panelTitle}>
          Random Forest ML Prediction
        </ThemedText>

        <View style={styles.panelCard}>
          <View style={styles.panelRow}>
            <View style={styles.panelRowLeft}>
              <IconSymbol name="speedometer" size={24} color="#0a7ea4" />
              <ThemedText style={styles.panelRowLabel}>
                ML Health Score
              </ThemedText>
            </View>
            <ThemedText style={styles.healthScore}>
              {data?.ml_health_score
                ? `${fmt(data.ml_health_score, 0)}%`
                : "N/A"}
            </ThemedText>
          </View>

          <View style={styles.panelDivider} />

          <View style={styles.panelRow}>
            <View style={styles.panelRowLeft}>
              <IconSymbol
                name="shield.checkerboard"
                size={24}
                color="#0a7ea4"
              />
              <ThemedText style={styles.panelRowLabel}>
                System Status
              </ThemedText>
            </View>
            {data?.ml_status ? (
              <View
                style={[
                  styles.badge,
                  {
                    backgroundColor: `${getStatusColor(data.ml_status)}22`,
                    borderColor: getStatusColor(data.ml_status),
                  },
                ]}
              >
                <ThemedText
                  style={[
                    styles.badgeText,
                    {
                      color: getStatusColor(data.ml_status),
                    },
                  ]}
                >
                  {data.ml_status}
                </ThemedText>
              </View>
            ) : (
              <ThemedText style={styles.pendingText}>N/A</ThemedText>
            )}
          </View>

          <View style={styles.panelDivider} />

          <View style={styles.troubleCodesSection}>
            <View style={styles.troubleCodesHeader}>
              <IconSymbol
                name="exclamationmark.triangle"
                size={22}
                color="#d35400"
              />
              <ThemedText style={styles.troubleCodesTitle}>
                ML Alerts
              </ThemedText>
            </View>
            {!data?.ml_alerts || data.ml_alerts.length === 0 ? (
              <ThemedText style={styles.troubleCodesEmpty}>
                {data
                  ? "✅ All systems operating normally"
                  : "Waiting for data from Raspberry Pi"}
              </ThemedText>
            ) : (
              <View style={styles.troubleCodesList}>
                {data.ml_alerts.map((alert: string, idx: number) => (
                  <ThemedText key={idx} style={styles.alertText}>
                    • {alert}
                  </ThemedText>
                ))}
              </View>
            )}
          </View>
        </View>
      </View>

      <View style={styles.panelContainer}>
        <ThemedText type="subtitle" style={styles.panelTitle}>
          ML Model Input Features
        </ThemedText>

        <View style={styles.panelCard}>
          <View style={styles.panelRow}>
            <View style={styles.panelRowLeft}>
              <IconSymbol name="gauge" size={24} color="#0a7ea4" />
              <ThemedText style={styles.panelRowLabel}>Engine RPM</ThemedText>
            </View>
            <ThemedText style={styles.healthScore}>
              {fmt(data?.rpm, 0)} rpm
            </ThemedText>
          </View>

          <View style={styles.panelDivider} />

          <View style={styles.panelRow}>
            <View style={styles.panelRowLeft}>
              <IconSymbol name="thermometer" size={24} color="#0a7ea4" />
              <ThemedText style={styles.panelRowLabel}>Coolant Temp</ThemedText>
            </View>
            <ThemedText style={styles.healthScore}>
              {fmt(data?.coolant_temp, 1)}°C
            </ThemedText>
          </View>

          <View style={styles.panelDivider} />

          <View style={styles.panelRow}>
            <View style={styles.panelRowLeft}>
              <IconSymbol name="speedometer" size={24} color="#0a7ea4" />
              <ThemedText style={styles.panelRowLabel}>Engine Load</ThemedText>
            </View>
            <ThemedText style={styles.healthScore}>
              {fmt(data?.engine_load, 1)}%
            </ThemedText>
          </View>

          <View style={styles.panelDivider} />

          <View style={styles.panelRow}>
            <View style={styles.panelRowLeft}>
              <IconSymbol name="stats-chart" size={24} color="#0a7ea4" />
              <ThemedText style={styles.panelRowLabel}>
                Throttle Position
              </ThemedText>
            </View>
            <ThemedText style={styles.healthScore}>
              {fmt(data?.throttle_pos, 1)}%
            </ThemedText>
          </View>
        </View>
      </View>

      <View style={styles.panelContainer}>
        <ThemedText type="subtitle" style={styles.panelTitle}>
          Calculated Performance Metrics
        </ThemedText>
        <View style={styles.panelCard}>
          <View style={styles.panelRow}>
            <View style={styles.panelRowLeft}>
              <Ionicons name="swap-vertical" size={24} color="#0a7ea4" />
              <ThemedText style={styles.panelRowLabel}>
                Load/RPM Ratio
              </ThemedText>
            </View>
            <ThemedText style={styles.healthScore}>
              {fmt(data?.load_rpm_ratio, 2)}
            </ThemedText>
          </View>

          <View style={styles.panelDivider} />

          <View style={styles.panelRow}>
            <View style={styles.panelRowLeft}>
              <Ionicons name="thermometer-outline" size={24} color="#0a7ea4" />
              <ThemedText style={styles.panelRowLabel}>
                Temp Gradient
              </ThemedText>
            </View>
            <ThemedText style={styles.healthScore}>
              {fmt(data?.temp_gradient, 2)}
            </ThemedText>
          </View>

          <View style={styles.panelDivider} />

          <View style={styles.panelRow}>
            <View style={styles.panelRowLeft}>
              <Ionicons name="flash-outline" size={24} color="#0a7ea4" />
              <ThemedText style={styles.panelRowLabel}>
                Throttle Response
              </ThemedText>
            </View>
            <ThemedText style={styles.healthScore}>
              {fmt(data?.throttle_response, 2)}
            </ThemedText>
          </View>

          <View style={styles.panelDivider} />

          <View style={styles.panelRow}>
            <View style={styles.panelRowLeft}>
              <Ionicons name="alert-circle-outline" size={24} color="#0a7ea4" />
              <ThemedText style={styles.panelRowLabel}>
                Engine Stress
              </ThemedText>
            </View>
            <ThemedText style={styles.healthScore}>
              {fmt(data?.engine_stress_score, 2)}
            </ThemedText>
          </View>
        </View>
      </View>

      <View style={styles.panelContainer}>
        <ThemedText type="subtitle" style={styles.panelTitle}>
          Essential Sensor Readings
        </ThemedText>
        <View style={styles.panelCard}>
          <View style={styles.panelRow}>
            <View style={styles.panelRowLeft}>
              <Ionicons name="speedometer-outline" size={24} color="#0a7ea4" />
              <ThemedText style={styles.panelRowLabel}>
                Vehicle Speed
              </ThemedText>
            </View>
            <ThemedText style={styles.healthScore}>
              {fmt(data?.vehicle_speed, 1)} km/h
            </ThemedText>
          </View>

          <View style={styles.panelDivider} />

          <View style={styles.panelRow}>
            <View style={styles.panelRowLeft}>
              <Ionicons name="thermometer-outline" size={24} color="#0a7ea4" />
              <ThemedText style={styles.panelRowLabel}>Intake Temp</ThemedText>
            </View>
            <ThemedText style={styles.healthScore}>
              {fmt(data?.intake_temp, 1)}°C
            </ThemedText>
          </View>

          <View style={styles.panelDivider} />

          <View style={styles.panelRow}>
            <View style={styles.panelRowLeft}>
              <Ionicons name="trending-up-outline" size={24} color="#0a7ea4" />
              <ThemedText style={styles.panelRowLabel}>
                Timing Advance
              </ThemedText>
            </View>
            <ThemedText style={styles.healthScore}>
              {fmt(data?.timing_advance, 1)}°
            </ThemedText>
          </View>

          <View style={styles.panelDivider} />

          <View style={styles.panelRow}>
            <View style={styles.panelRowLeft}>
              <Ionicons name="flame-outline" size={24} color="#0a7ea4" />
              <ThemedText style={styles.panelRowLabel}>
                Catalyst Temp
              </ThemedText>
            </View>
            <ThemedText style={styles.healthScore}>
              {fmt(data?.catalyst_temp, 1)}°C
            </ThemedText>
          </View>

          <View style={styles.panelDivider} />

          <View style={styles.panelRow}>
            <View style={styles.panelRowLeft}>
              <Ionicons name="cloud-outline" size={24} color="#0a7ea4" />
              <ThemedText style={styles.panelRowLabel}>
                Baro Pressure
              </ThemedText>
            </View>
            <ThemedText style={styles.healthScore}>
              {fmt(data?.barometric_pressure, 1)} kPa
            </ThemedText>
          </View>

          <View style={styles.panelDivider} />

          <View style={styles.panelRow}>
            <View style={styles.panelRowLeft}>
              <Ionicons name="analytics-outline" size={24} color="#0a7ea4" />
              <ThemedText style={styles.panelRowLabel}>
                MAF (Mass Air Flow)
              </ThemedText>
            </View>
            <ThemedText style={styles.healthScore}>
              {fmt(data?.maf, 2)} g/s
            </ThemedText>
          </View>

          <View style={styles.panelDivider} />

          <View style={styles.panelRow}>
            <View style={styles.panelRowLeft}>
              <Ionicons name="stats-chart-outline" size={24} color="#0a7ea4" />
              <ThemedText style={styles.panelRowLabel}>
                MAP (Manifold Pressure)
              </ThemedText>
            </View>
            <ThemedText style={styles.healthScore}>
              {fmt(data?.map, 1)} kPa
            </ThemedText>
          </View>

          <View style={styles.panelDivider} />

          <View style={styles.panelRow}>
            <View style={styles.panelRowLeft}>
              <Ionicons name="water-outline" size={24} color="#0a7ea4" />
              <ThemedText style={styles.panelRowLabel}>O₂ Sensor 1</ThemedText>
            </View>
            <ThemedText style={styles.healthScore}>
              {fmt(data?.o2_sensor_1, 2)}V
            </ThemedText>
          </View>

          <View style={styles.panelDivider} />

          <View style={styles.panelRow}>
            <View style={styles.panelRowLeft}>
              <Ionicons name="water" size={24} color="#0a7ea4" />
              <ThemedText style={styles.panelRowLabel}>Fuel Level</ThemedText>
            </View>
            <ThemedText style={styles.healthScore}>
              {fmt(data?.fuel_level, 1)}%
            </ThemedText>
          </View>
        </View>
      </View>

      <View style={styles.panelContainer}>
        <ThemedText type="subtitle" style={styles.panelTitle}>
          Fuel System
        </ThemedText>
        <View style={styles.panelCard}>
          <View style={styles.panelRow}>
            <View style={styles.panelRowLeft}>
              <Ionicons
                name="information-circle-outline"
                size={24}
                color="#0a7ea4"
              />
              <ThemedText style={styles.panelRowLabel}>
                Fuel System Status
              </ThemedText>
            </View>
            <ThemedText style={styles.healthScore}>
              {data?.fuel_system_status || "N/A"}
            </ThemedText>
          </View>

          <View style={styles.panelDivider} />

          <View style={styles.panelRow}>
            <View style={styles.panelRowLeft}>
              <Ionicons name="water" size={24} color="#0a7ea4" />
              <ThemedText style={styles.panelRowLabel}>
                Fuel Pressure
              </ThemedText>
            </View>
            <ThemedText style={styles.healthScore}>
              {fmt(data?.fuel_pressure, 1)} kPa
            </ThemedText>
          </View>

          <View style={styles.panelDivider} />

          <View style={styles.panelRow}>
            <View style={styles.panelRowLeft}>
              <Ionicons name="speedometer-outline" size={24} color="#0a7ea4" />
              <ThemedText style={styles.panelRowLabel}>
                Fuel Efficiency
              </ThemedText>
            </View>
            <ThemedText style={styles.healthScore}>
              {fmt(data?.fuel_efficiency, 2)}
            </ThemedText>
          </View>

          <View style={styles.panelDivider} />

          <View style={styles.panelRow}>
            <View style={styles.panelRowLeft}>
              <Ionicons name="trending-up-outline" size={24} color="#0a7ea4" />
              <ThemedText style={styles.panelRowLabel}>
                Short Fuel Trim
              </ThemedText>
            </View>
            <ThemedText style={styles.healthScore}>
              {fmt(data?.fuel_trim_short, 2)}%
            </ThemedText>
          </View>

          <View style={styles.panelDivider} />

          <View style={styles.panelRow}>
            <View style={styles.panelRowLeft}>
              <Ionicons
                name="trending-down-outline"
                size={24}
                color="#0a7ea4"
              />
              <ThemedText style={styles.panelRowLabel}>
                Long Fuel Trim
              </ThemedText>
            </View>
            <ThemedText style={styles.healthScore}>
              {fmt(data?.fuel_trim_long, 2)}%
            </ThemedText>
          </View>
        </View>
      </View>

      <View style={styles.panelContainer}>
        <ThemedText type="subtitle" style={styles.panelTitle}>
          System Information
        </ThemedText>
        <View style={styles.panelCard}>
          <View style={styles.panelRow}>
            <View style={styles.panelRowLeft}>
              <Ionicons
                name="battery-charging-outline"
                size={24}
                color="#0a7ea4"
              />
              <ThemedText style={styles.panelRowLabel}>
                Control Module Voltage
              </ThemedText>
            </View>
            <ThemedText style={styles.healthScore}>
              {fmt(data?.control_module_voltage, 2)}V
            </ThemedText>
          </View>

          <View style={styles.panelDivider} />

          <View style={styles.panelRow}>
            <View style={styles.panelRowLeft}>
              <Ionicons name="time-outline" size={24} color="#0a7ea4" />
              <ThemedText style={styles.panelRowLabel}>
                Engine Runtime
              </ThemedText>
            </View>
            <ThemedText style={styles.healthScore}>
              {fmt(data?.engine_runtime, 0)} min
            </ThemedText>
          </View>

          <View style={styles.panelDivider} />

          <View style={styles.panelRow}>
            <View style={styles.panelRowLeft}>
              <Ionicons name="bug-outline" size={24} color="#0a7ea4" />
              <ThemedText style={styles.panelRowLabel}>EGR Error</ThemedText>
            </View>
            <ThemedText style={styles.healthScore}>
              {fmt(data?.egr_error, 2)}%
            </ThemedText>
          </View>

          <View style={styles.panelDivider} />

          <View style={styles.panelRow}>
            <View style={styles.panelRowLeft}>
              <Ionicons name="alert-circle-outline" size={24} color="#0a7ea4" />
              <ThemedText style={styles.panelRowLabel}>DTC Count</ThemedText>
            </View>
            <ThemedText style={styles.healthScore}>
              {data?.dtc_count || 0}
            </ThemedText>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#E9F1F6",
  },
  header: {
    padding: 20,
    paddingTop: 20,
    alignItems: "center",
    backgroundColor: "#E9F1F6",
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 10,
    backgroundColor: "#E9F1F6",
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
  headerTitle: {
    fontSize: 28,
    fontWeight: "800",
    marginBottom: 8,
    color: "#16445A",
  },
  headerSubtitle: {
    fontSize: 16,
    color: "#6b7d86",
  },
  panelContainer: {
    padding: 20,
    backgroundColor: "#E9F1F6",
  },
  panelTitle: {
    fontSize: 20,
    fontWeight: "800",
    marginBottom: 12,
    color: "#123B4A",
  },
  panelCard: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: "#ffffff",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
    borderWidth: 1,
    borderColor: "#E6E9ED",
  },
  panelRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 8,
  },
  panelRowLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  panelRowLabel: {
    fontSize: 16,
    color: "#123B4A",
    fontWeight: "600",
  },
  panelDivider: {
    height: 1,
    backgroundColor: "#E6E9ED",
    marginVertical: 8,
  },
  healthScore: {
    fontSize: 22,
    fontWeight: "800",
    color: "#123B4A",
  },
  pendingText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6b7d86",
    fontStyle: "italic",
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "700",
    textTransform: "capitalize",
  },
  troubleCodesSection: {
    paddingTop: 4,
  },
  troubleCodesHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  troubleCodesTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#123B4A",
  },
  troubleCodesEmpty: {
    fontSize: 14,
    color: "#6b7d86",
  },
  troubleCodesList: {
    gap: 8,
  },
  alertText: {
    fontSize: 13,
    color: "#123B4A",
    lineHeight: 20,
  },
});
