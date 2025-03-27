import { Tabs } from 'expo-router';
import { useColorScheme } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { Colors } from '@/constants/Colors';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        tabBarStyle: { paddingBottom: 5 },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Detector',
          tabBarIcon: ({ color }) => <Ionicons name="camera" size={24} color={color} />,
          tabBarLabel: 'Detector',
          headerTitle: 'DeepShield - Image Detector',
        }}
      />
      <Tabs.Screen
        name="info"
        options={{
          title: 'Info',
          tabBarIcon: ({ color }) => <Ionicons name="information-circle" size={24} color={color} />,
          tabBarLabel: 'About',
        }}
      />
    </Tabs>
  );
}
