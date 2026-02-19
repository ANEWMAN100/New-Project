import React from 'react';
import { Tabs } from 'expo-router';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { colors, typography, spacing } from '../../src/theme';

function TabIcon({ label, icon, focused }: { label: string; icon: string; focused: boolean }) {
  return (
    <View style={styles.tabItem}>
      <Text style={[styles.tabIcon, focused && styles.tabIconFocused]}>{icon}</Text>
      <Text style={[styles.tabLabel, focused && styles.tabLabelFocused]}>{label}</Text>
    </View>
  );
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarShowLabel: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textTertiary,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon label="Trips" icon="✈" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="board"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon label="Board" icon="📋" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="itinerary"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon label="Itinerary" icon="📅" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="chat"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon label="Chat" icon="💬" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon label="Profile" icon="👤" focused={focused} />,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: colors.bgCardSolid,
    borderTopColor: colors.glassBorder,
    borderTopWidth: 1,
    height: Platform.OS === 'ios' ? 88 : 64,
    paddingTop: spacing.sm,
    ...(Platform.OS === 'web' ? { backdropFilter: 'blur(20px)' } as any : {}),
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 2,
  },
  tabIcon: {
    fontSize: 20,
    marginBottom: 2,
  },
  tabIconFocused: {
    transform: [{ scale: 1.1 }],
  },
  tabLabel: {
    ...typography.tabLabel,
    color: colors.textTertiary,
  },
  tabLabelFocused: {
    color: colors.primary,
  },
});
