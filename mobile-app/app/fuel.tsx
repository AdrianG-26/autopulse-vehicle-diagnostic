import { Colors } from "@/constants/Colors";
import { formatValue, useVehicleData } from "@/hooks/useVehicleData";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Pressable,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

export default function FuelScreen() {
  const { data, loading, refresh } = useVehicleData();
  const accent = Colors.light.tint;
  const [refreshing, setRefreshing] = useState(false);

  async function onRefresh() {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  }

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
            tintColor={accent}
            colors={[accent]}
          />
        }
      >
        <View style={styles.headerRow}>
          <View style={styles.brandRow}>
            <Ionicons name="car-sport" size={22} color={accent} />
            <Text style={styles.brand}>AutoPulse</Text>
          </View>
        </View>

        <View style={styles.titleRow}>
          <Ionicons name="water" size={18} color={accent} />
          <Text style={styles.title}>Fuel System</Text>
        </View>
        <Text style={styles.subtitle}>
          Monitor your vehicle&apos;s fuel system
        </Text>

        <View style={styles.card}>
          <View style={styles.metricRow}>
            <MetricTile
              iconName="information-circle-outline"
              iconBg="#EAF6EC"
              iconColor="#2ecc71"
              label="Fuel System Status"
              value={data?.fuel_system_status || "N/A"}
            />
            <MetricTile
              iconName="water-outline"
              iconBg="#E9F5FF"
              iconColor={accent}
              label="Fuel Pressure"
              value={`${fmt(data?.fuel_pressure, 1)} kPa`}
            />
          </View>
          <View style={styles.metricRow}>
            <MetricTile
              iconName="beaker-outline"
              iconBg="#FFF4DD"
              iconColor="#f1c40f"
              label="Fuel Level"
              value={`${fmt(data?.fuel_level, 1)}%`}
            />
            <MetricTile
              iconName="speedometer-outline"
              iconBg="#E9F5FF"
              iconColor={accent}
              label="Fuel Efficiency"
              value={`${fmt(data?.fuel_efficiency, 2)}`}
            />
          </View>
          <View style={styles.metricRow}>
            <MetricTile
              iconName="trending-up"
              iconBg="#EAF6EC"
              iconColor="#2ecc71"
              label="Short Fuel Trim"
              value={`${fmt(data?.fuel_trim_short, 2)}%`}
            />
            <MetricTile
              iconName="trending-down"
              iconBg="#FFF4DD"
              iconColor="#f1c40f"
              label="Long Fuel Trim"
              value={`${fmt(data?.fuel_trim_long, 2)}%`}
            />
          </View>
        </View>

        <Pressable
          style={({ pressed }: { pressed: boolean }) => [
            styles.secondaryButton,
            pressed && { opacity: 0.9 },
          ]}
          onPress={() => router.replace("/(tabs)")}
        >
          <Ionicons name="arrow-back" size={18} color={accent} />
          <Text style={styles.secondaryButtonText}>Back to Dashboard</Text>
        </Pressable>

        <Text style={styles.footer}>AutoPulse: Vehicle Diagnostic System</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

function MetricTile({
  iconName,
  iconBg,
  iconColor,
  label,
  value,
}: {
  iconName: any;
  iconBg: string;
  iconColor: string;
  label: string;
  value: string;
}) {
  return (
    <View style={styles.tile}>
      <View style={[styles.tileIcon, { backgroundColor: iconBg }]}>
        <Ionicons name={iconName} size={16} color={iconColor} />
      </View>
      <View style={styles.tileText}>
        <Text style={styles.tileLabel}>{label}</Text>
        <Text style={styles.tileValue}>{value}</Text>
      </View>
    </View>
  );
}

const BG = "#fafafa"; // Material background
const CARD = "#ffffff";

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: BG },
  content: { padding: 16, gap: 12 },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 24,
  },
  brandRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  brand: {
    fontSize: 20,
    fontWeight: "500",
    color: "#1c1b1f",
    letterSpacing: 0.15,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 6,
  },
  title: {
    fontSize: 22,
    fontWeight: "500",
    color: "#1c1b1f",
    letterSpacing: 0,
  },
  subtitle: {
    color: "#49454f",
    fontSize: 14,
    fontWeight: "400",
    letterSpacing: 0.25,
  },
  card: {
    backgroundColor: CARD,
    borderRadius: 12,
    padding: 12,
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.18,
    shadowRadius: 1.0,
    gap: 12,
  },
  metricRow: { flexDirection: "row", gap: 12 },
  tile: {
    flex: 1,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  tileIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  tileText: { gap: 2, flex: 1, minWidth: 0 },
  tileLabel: {
    color: "#49454f",
    fontSize: 12,
    fontWeight: "500",
    flexWrap: "wrap",
    letterSpacing: 0.5,
  },
  tileValue: {
    color: "#1c1b1f",
    fontSize: 16,
    fontWeight: "400",
    flexWrap: "wrap",
  },
  secondaryButton: {
    marginTop: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "transparent",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    alignSelf: "stretch",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#e0e0e0",
    minHeight: 48,
  },
  secondaryButtonText: {
    color: "#1c1b1f",
    fontWeight: "500",
    fontSize: 14,
    letterSpacing: 0.1,
  },
  footer: {
    textAlign: "center",
    color: "#49454f",
    marginTop: 16,
    fontSize: 12,
    fontWeight: "400",
    letterSpacing: 0.4,
  },
});
