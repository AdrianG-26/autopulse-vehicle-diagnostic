import { Redirect, Tabs } from 'expo-router';
import { Platform } from 'react-native';

import { HapticTab } from '@/components/HapticTab';
import { IconSymbol } from '@/components/ui/IconSymbol';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { Colors } from '@/constants/Colors';
import { useAuth } from '@/hooks/useAuth';
import { useColorScheme } from '@/hooks/useColorScheme';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Redirect href="/(auth)/login" />;
  }

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarBackground: TabBarBackground,
        tabBarStyle: Platform.select({
          ios: { position: 'absolute' },
          default: {},
        }),
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Home', tabBarIcon: ({ color }) => <IconSymbol name="house" color={color} /> }} />
      <Tabs.Screen name="engine" options={{ title: 'Engine', tabBarIcon: ({ color }) => <IconSymbol name="gear" color={color} /> }} />
      <Tabs.Screen name="fuel" options={{ title: 'Fuel', tabBarIcon: ({ color }) => <IconSymbol name="fuelpump" color={color} /> }} />
      <Tabs.Screen name="emissions" options={{ title: 'Emissions', tabBarIcon: ({ color }) => <IconSymbol name="leaf" color={color} /> }} />
      <Tabs.Screen name="log" options={{ title: 'Logs', tabBarIcon: ({ color }) => <IconSymbol name="clipboard" color={color} /> }} />
    </Tabs>
  );
}