import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

interface VehicleHealth {
  engineHealth: number;
  fuelSystemHealth: number;
  emissionHealth: number;
  overallHealth: number;
  status: 'Excellent' | 'Good' | 'Fair' | 'Poor' | 'Critical';
  recommendations: string[];
  lastUpdated: string;
}

export default function PredictHealthScreen() {
  const { currentVehicle } = useAuth();
  const [loading, setLoading] = useState(false);
  const [healthData, setHealthData] = useState<VehicleHealth | null>(null);
  const [analyzing, setAnalyzing] = useState(false);

  const getHealthStatus = (score: number): string => {
    if (score >= 85) return 'Excellent';
    if (score >= 70) return 'Good';
    if (score >= 55) return 'Fair';
    if (score >= 40) return 'Poor';
    return 'Critical';
  };

  const getHealthColor = (score: number): string => {
    if (score >= 85) return '#27ae60';
    if (score >= 70) return '#3498db';
    if (score >= 55) return '#f39c12';
    if (score >= 40) return '#e67e22';
    return '#e74c3c';
  };

  const fetchLatestTelemetry = async () => {
    if (!currentVehicle?.id) {
      Alert.alert('No Vehicle', 'Please select a vehicle first.');
      return null;
    }

    try {
      const { data, error } = await supabase
        .from('telemetry_data')
        .select('*')
        .eq('vehicle_id', currentVehicle.id)
        .order('timestamp', { ascending: false })
        .limit(10);

      if (error) throw error;
      return data || [];
    } catch (error: any) {
      console.error('Error fetching telemetry:', error);
      Alert.alert('Error', 'Failed to fetch vehicle data.');
      return null;
    }
  };

  const analyzeVehicleHealth = async () => {
    setAnalyzing(true);
    setLoading(true);

    try {
      const telemetryData = await fetchLatestTelemetry();

      if (!telemetryData || telemetryData.length === 0) {
        Alert.alert(
          'No Data',
          'No telemetry data found for this vehicle. Please ensure data is being collected.'
        );
        setAnalyzing(false);
        setLoading(false);
        return;
      }

      // Simulate AI-powered analysis
      // In production, this would call an ML model API
      const analysis = await analyzeData(telemetryData);
      setHealthData(analysis);
    } catch (error: any) {
      Alert.alert('Analysis Failed', error.message || 'Unable to analyze vehicle health.');
    } finally {
      setAnalyzing(false);
      setLoading(false);
    }
  };

  const analyzeData = async (data: any[]): Promise<VehicleHealth> => {
    // Simulate analysis delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Calculate health scores based on telemetry data
    const avgRpm = data.reduce((sum, d) => sum + (d.rpm || 0), 0) / data.length;
    const avgCoolant = data.reduce((sum, d) => sum + (d.coolant_temp || 0), 0) / data.length;
    const avgBattery = data.reduce((sum, d) => sum + (d.battery || 0), 0) / data.length;
    const avgMap = data.reduce((sum, d) => sum + (d.map_kpa || 0), 0) / data.length;
    const avgEngineLoad = data.reduce((sum, d) => sum + (d.engine_load_pct || 0), 0) / data.length;

    // Engine health calculation
    let engineScore = 100;
    if (avgCoolant > 95 || avgCoolant < 80) engineScore -= 15;
    if (avgBattery < 11 || avgBattery > 15) engineScore -= 10;
    if (avgEngineLoad > 90) engineScore -= 10;
    engineScore = Math.max(0, engineScore);

    // Fuel system health calculation
    const avgStft = data.reduce((sum, d) => sum + Math.abs(d.stft_b1_pct || 0), 0) / data.length;
    let fuelScore = 100;
    if (Math.abs(avgStft) > 10) fuelScore -= 15;
    fuelScore = Math.max(0, fuelScore);

    // Emission health calculation
    const hasFaultCodes = data.some(d => d.fault_codes && d.fault_codes.length > 0);
    let emissionScore = 100;
    if (hasFaultCodes) emissionScore -= 25;
    if (avgEngineLoad > 80) emissionScore -= 10;
    emissionScore = Math.max(0, emissionScore);

    // Overall health
    const overallHealth = Math.round((engineScore + fuelScore + emissionScore) / 3);
    const status = getHealthStatus(overallHealth);

    // Generate recommendations
    const recommendations: string[] = [];
    if (avgCoolant > 95) recommendations.push('Engine coolant temperature is high. Check cooling system.');
    if (avgBattery < 12) recommendations.push('Battery voltage is low. Consider battery inspection.');
    if (avgEngineLoad > 85) recommendations.push('High engine load detected. Avoid aggressive driving.');
    if (avgFuelPressure < 200) recommendations.push('Low fuel pressure detected. Inspect fuel system.');
    if (Math.abs(avgStft) > 8) recommendations.push('Fuel trim adjustment needed. Check for air leaks or fuel delivery issues.');
    if (hasFaultCodes) recommendations.push('Diagnostic trouble codes detected. Professional inspection recommended.');
    if (overallHealth < 70) recommendations.push('Overall vehicle health is below optimal. Schedule maintenance soon.');

    return {
      engineHealth: Math.round(engineScore),
      fuelSystemHealth: Math.round(fuelScore),
      emissionHealth: Math.round(emissionScore),
      overallHealth,
      status,
      recommendations,
      lastUpdated: new Date().toLocaleString(),
    };
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#123B4A" />
        </Pressable>
        <Text style={styles.headerTitle}>Predict Health</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.content}>
        {currentVehicle ? (
          <>
            <View style={styles.infoCard}>
              <Ionicons name="car" size={24} color="#0A7EA4" />
              <Text style={styles.infoText}>Analyzing: {currentVehicle.name}</Text>
            </View>

            {!healthData && (
              <View style={styles.introCard}>
                <Ionicons name="pulse" size={48} color="#e74c3c" />
                <Text style={styles.introTitle}>AI-Powered Health Prediction</Text>
                <Text style={styles.introDescription}>
                  Analyze your vehicle's telemetry data to predict overall health status, identify potential issues, and receive personalized recommendations.
                </Text>
              </View>
            )}

            {loading && (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#0A7EA4" />
                <Text style={styles.loadingText}>Analyzing vehicle data...</Text>
              </View>
            )}

            {healthData && !loading && (
              <View style={styles.results}>
                <View style={styles.overallCard}>
                  <View style={[styles.statusBadge, { backgroundColor: getHealthColor(healthData.overallHealth) }]}>
                    <Text style={styles.statusText}>{healthData.status}</Text>
                    <Text style={styles.healthScore}>{healthData.overallHealth}%</Text>
                  </View>
                </View>

                <View style={styles.metricsGrid}>
                  <View style={styles.metricCard}>
                    <Ionicons name="build" size={32} color="#3498db" />
                    <Text style={styles.metricValue}>{healthData.engineHealth}%</Text>
                    <Text style={styles.metricLabel}>Engine Health</Text>
                  </View>
                  <View style={styles.metricCard}>
                    <Ionicons name="fuel-tank" size={32} color="#27ae60" />
                    <Text style={styles.metricValue}>{healthData.fuelSystemHealth}%</Text>
                    <Text style={styles.metricLabel}>Fuel System</Text>
                  </View>
                  <View style={styles.metricCard}>
                    <Ionicons name="leaf" size={32} color="#f39c12" />
                    <Text style={styles.metricValue}>{healthData.emissionHealth}%</Text>
                    <Text style={styles.metricLabel}>Emissions</Text>
                  </View>
                </View>

                {healthData.recommendations.length > 0 && (
                  <View style={styles.recommendationsCard}>
                    <Text style={styles.recommendationsTitle}>Recommendations</Text>
                    {healthData.recommendations.map((rec, index) => (
                      <View key={index} style={styles.recommendationItem}>
                        <Ionicons name="information-circle" size={20} color="#0A7EA4" />
                        <Text style={styles.recommendationText}>{rec}</Text>
                      </View>
                    ))}
                  </View>
                )}

                <Text style={styles.updateText}>Last Updated: {healthData.lastUpdated}</Text>
              </View>
            )}

            {!loading && (
              <Pressable
                onPress={analyzeVehicleHealth}
                disabled={analyzing}
                style={({ pressed }) => [
                  styles.analyzeButton,
                  pressed && styles.buttonPressed,
                  analyzing && styles.buttonDisabled
                ]}
              >
                {analyzing ? (
                  <ActivityIndicator size="small" color="#ffffff" />
                ) : (
                  <>
                    <Ionicons name="analytics" size={24} color="#ffffff" />
                    <Text style={styles.analyzeButtonText}>Analyze Vehicle Health</Text>
                  </>
                )}
              </Pressable>
            )}
          </>
        ) : (
          <View style={styles.noVehicleCard}>
            <Ionicons name="car-outline" size={48} color="#bdc3c7" />
            <Text style={styles.noVehicleText}>No Vehicle Selected</Text>
            <Text style={styles.noVehicleDescription}>
              Please select a vehicle from your profile to analyze its health.
            </Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const BG = '#E9F1F6';
const CARD = '#ffffff';

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20, paddingTop: 60 },
  backButton: { padding: 8 },
  headerTitle: { fontSize: 24, fontWeight: '800', color: '#123B4A' },
  content: { padding: 20 },
  infoCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: CARD, padding: 16, borderRadius: 12, marginBottom: 20, borderWidth: 1, borderColor: '#E6E9ED' },
  infoText: { marginLeft: 12, fontSize: 16, fontWeight: '600', color: '#123B4A' },
  introCard: { backgroundColor: CARD, padding: 24, borderRadius: 16, alignItems: 'center', marginBottom: 20, borderWidth: 1, borderColor: '#E6E9ED' },
  introTitle: { fontSize: 22, fontWeight: '800', color: '#123B4A', marginTop: 16, marginBottom: 8, textAlign: 'center' },
  introDescription: { fontSize: 14, color: '#6b7d86', textAlign: 'center', lineHeight: 20 },
  loadingContainer: { alignItems: 'center', justifyContent: 'center', padding: 40 },
  loadingText: { marginTop: 16, fontSize: 16, color: '#6b7d86', fontWeight: '600' },
  results: { marginBottom: 20 },
  overallCard: { backgroundColor: CARD, borderRadius: 16, padding: 24, alignItems: 'center', marginBottom: 20, borderWidth: 1, borderColor: '#E6E9ED' },
  statusBadge: { padding: 20, borderRadius: 12, minWidth: 200, alignItems: 'center' },
  statusText: { fontSize: 18, fontWeight: '700', color: '#ffffff', marginBottom: 8 },
  healthScore: { fontSize: 36, fontWeight: '800', color: '#ffffff' },
  metricsGrid: { flexDirection: 'row', gap: 12, marginBottom: 20 },
  metricCard: { flex: 1, backgroundColor: CARD, padding: 16, borderRadius: 12, alignItems: 'center', borderWidth: 1, borderColor: '#E6E9ED' },
  metricValue: { fontSize: 24, fontWeight: '800', color: '#123B4A', marginTop: 8, marginBottom: 4 },
  metricLabel: { fontSize: 12, color: '#6b7d86', textAlign: 'center' },
  recommendationsCard: { backgroundColor: CARD, padding: 20, borderRadius: 16, marginBottom: 16, borderWidth: 1, borderColor: '#E6E9ED' },
  recommendationsTitle: { fontSize: 18, fontWeight: '800', color: '#123B4A', marginBottom: 16 },
  recommendationItem: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 12 },
  recommendationText: { flex: 1, marginLeft: 12, fontSize: 14, color: '#6b7d86', lineHeight: 20 },
  updateText: { textAlign: 'center', fontSize: 12, color: '#9ba1a6', marginTop: 8 },
  analyzeButton: { backgroundColor: '#e74c3c', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 16, borderRadius: 12, gap: 8 },
  buttonPressed: { opacity: 0.9 },
  buttonDisabled: { opacity: 0.6 },
  analyzeButtonText: { color: '#ffffff', fontSize: 16, fontWeight: '700' },
  noVehicleCard: { backgroundColor: CARD, padding: 40, borderRadius: 16, alignItems: 'center', borderWidth: 1, borderColor: '#E6E9ED' },
  noVehicleText: { fontSize: 20, fontWeight: '800', color: '#123B4A', marginTop: 16, marginBottom: 8 },
  noVehicleDescription: { fontSize: 14, color: '#6b7d86', textAlign: 'center', lineHeight: 20 },
});

