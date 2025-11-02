import { ThemedText } from '@/components/ThemedText';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Ionicons } from '@expo/vector-icons';
import { useRef, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

// --- Configuration ---
// Replace this with the actual local network IP of your Raspberry Pi
const API_BASE_URL = 'http://192.168.1.100:3000';
// -------------------

type ConnectionStatus = 'idle' | 'checking' | 'connected' | 'error' | 'cancelled';

export default function RaspberrySettingsScreen() {
  const [status, setStatus] = useState<ConnectionStatus>('idle');
  const [lastSync, setLastSync] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const checkConnection = async () => {
    if (status === 'checking') return;

    abortControllerRef.current = new AbortController();
    const { signal } = abortControllerRef.current;

    setStatus('checking');
    setLastSync(null);

    try {
      const response = await fetch(API_BASE_URL, { signal });
      if (response.ok) {
        const dataResponse = await fetch(`${API_BASE_URL}/data/latest`, { signal });
        if (dataResponse.ok) {
          const data = await dataResponse.json();
          setStatus('connected');
          if (data.timestamp) {
            setLastSync(new Date(data.timestamp).toLocaleString());
          }
        } else {
          throw new Error('Server responded with an error');
        }
      } else {
        throw new Error('Server responded with an error');
      }
    } catch (error: any) {
      if (error.name === 'AbortError') {
        setStatus('cancelled');
      } else {
        setStatus('error');
        Alert.alert(
          'Connection Failed',
          'Could not connect to the Raspberry Pi API. Make sure the server is running and the IP address is correct.'
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
      case 'connected': return 'Connected';
      case 'checking': return 'Checking...';
      case 'error': return 'Connection Failed';
      case 'cancelled': return 'Cancelled';
      default: return 'Idle';
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'connected': return '#2ecc71';
      case 'error': return '#e74c3c';
      case 'cancelled': return '#f39c12';
      default: return '#6b7d86';
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.panelContainer}>
        <ThemedText type="subtitle" style={styles.panelTitle}>Raspberry Pi Connection</ThemedText>
        <View style={styles.panelCard}>
          <View style={styles.panelRow}>
            <View style={styles.panelRowLeft}>
              <IconSymbol name="antenna.radiowaves.left.and.right" size={24} color="#0a7ea4" />
              <ThemedText style={styles.panelRowLabel}>Connection Status</ThemedText>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Ionicons name="ellipse" size={8} color={getStatusColor()} />
              <ThemedText style={[styles.statusText, { color: getStatusColor() }]}>
                {getStatusText()}
              </ThemedText>
            </View>
          </View>

          <View style={styles.panelDivider} />

          <View style={styles.panelRow}>
            <View style={styles.panelRowLeft}>
              <IconSymbol name="link" size={24} color="#0a7ea4" />
              <ThemedText style={styles.panelRowLabel}>API Endpoint</ThemedText>
            </View>
            <ThemedText style={styles.endpointText}>{API_BASE_URL}</ThemedText>
          </View>

          <View style={styles.panelDivider} />

          <View style={styles.panelRow}>
            <View style={styles.panelRowLeft}>
              <IconSymbol name="clock" size={24} color="#0a7ea4" />
              <ThemedText style={styles.panelRowLabel}>Last Sync</ThemedText>
            </View>
            <ThemedText style={styles.statusText}>
              {lastSync || 'Never'}
            </ThemedText>
          </View>
        </View>

        {status === 'checking' ? (
          <View style={styles.buttonGroup}>
            <View style={styles.checkingContainer}>
              <ActivityIndicator color="#0a7ea4" />
              <Text style={styles.checkingText}>Testing...</Text>
            </View>
            <Pressable
              style={({ pressed }) => [styles.stopButton, pressed && styles.buttonPressed]}
              onPress={stopConnection}
            >
              <Ionicons name="stop-circle-outline" size={20} color="#ffffff" />
              <Text style={styles.buttonText}>Stop</Text>
            </Pressable>
          </View>
        ) : (
          <Pressable
            style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
            onPress={checkConnection}
          >
            <Ionicons name="refresh-outline" size={20} color="#ffffff" />
            <Text style={styles.buttonText}>Test Connection</Text>
          </Pressable>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E9F1F6',
  },
  panelContainer: {
    padding: 20,
    backgroundColor: '#E9F1F6',
    gap: 16,
  },
  panelTitle: {
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 4,
    color: '#123B4A',
  },
  panelCard: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#E6E9ED',
  },
  panelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  panelRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  panelRowLabel: {
    fontSize: 16,
    color: '#123B4A',
    fontWeight: '600',
  },
  panelDivider: {
    height: 1,
    backgroundColor: '#E6E9ED',
    marginVertical: 6,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
  },
  endpointText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#34495e',
    flexShrink: 1,
    textAlign: 'right',
  },
  button: {
    backgroundColor: '#0a7ea4',
    borderRadius: 12,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginTop: 8,
  },
  buttonPressed: {
    opacity: 0.85,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  buttonGroup: {
    flexDirection: 'row',
    marginTop: 8,
    gap: 12,
  },
  checkingContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: '#E6E9ED',
  },
  checkingText: {
    color: '#0a7ea4',
    fontSize: 16,
    fontWeight: '700',
  },
  stopButton: {
    backgroundColor: '#e74c3c',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
});


