import { ThemedText } from '@/components/ThemedText';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

export default function SettingsIndexScreen() {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.tabsContainer}>
        <Pressable style={styles.tab} onPress={() => router.push('/settings/raspberry' as any)}>
          <IconSymbol name="antenna.radiowaves.left.and.right" size={20} color="#0a7ea4" />
          <ThemedText style={styles.tabText}>Raspberry Pi</ThemedText>
        </Pressable>

        <Pressable style={styles.tab} onPress={() => router.push('/settings/profile' as any)}>
          <IconSymbol name="person" size={20} color="#0a7ea4" />
          <ThemedText style={styles.tabText}>Profile</ThemedText>
        </Pressable>

        <Pressable
          style={({ pressed }) => [styles.panelCard, pressed && { opacity: 0.84 }]}
          onPress={() => router.push('/settings/customer-service')}
        >
          <View style={styles.panelRow}>
            <IconSymbol name="chatbox-ellipses-outline" size={24} color="#0a7ea4" style={styles.panelIcon} />
            <ThemedText style={styles.panelTitle}>Customer Service</ThemedText>
          </View>
          <ThemedText style={styles.subtitle}>Message admin for inquiries and support</ThemedText>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E9F1F6',
  },
  tabsContainer: {
    paddingHorizontal: 20,
    paddingTop: 10,
    gap: 12,
    backgroundColor: '#E9F1F6',
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 10,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#E6E9ED',
  },
  tabText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#123B4A',
  },
  panelCard: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#ffffff',
    elevation: 2,
    flexDirection: 'column',
    marginBottom: 8,
    shadowColor: '#000',
    shadowOpacity: 0.07,
    shadowRadius: 6,
    borderWidth: 1,
    borderColor: '#E6E9ED',
  },
  panelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 2,
  },
  panelIcon: {
    marginRight: 8,
  },
  panelTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#0a7ea4',
  },
  subtitle: {
    color: '#657889',
    fontSize: 13,
    marginTop: 6,
    marginLeft: 40
  },
});


