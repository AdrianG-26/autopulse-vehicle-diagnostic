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
});


