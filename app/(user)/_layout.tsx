import { Tabs } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '../../constants/colors';
import { StyleSheet, View } from 'react-native';

function TabIcon({ name, color, focused }: { name: any; color: string; focused: boolean }) {
  return (
    <View style={[styles.iconWrapper, focused && styles.iconWrapperActive]}>
      <MaterialIcons name={name} size={22} color={focused ? Colors.primary : color} />
    </View>
  );
}

export default function UserLayout() {
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.outline,
        tabBarStyle: [styles.tabBar, { height: 64 + insets.bottom, paddingBottom: 8 + insets.bottom }],
        tabBarLabelStyle: styles.tabLabel,
        tabBarShowLabel: true,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Beranda',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="home" color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="scan"
        options={{
          title: 'Scan',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="document-scanner" color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="leaderboard"
        options={{
          title: 'Peringkat',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="leaderboard" color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="claims"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="rewards"
        options={{
          title: 'Reward',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="card-giftcard" color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profil',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="person" color={color} focused={focused} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: Colors.surfaceContainerLowest,
    borderTopColor: Colors.surfaceContainerHigh,
    borderTopWidth: 1,
    height: 64,
    paddingBottom: 8,
    paddingTop: 4,
  },
  tabLabel: {
    fontFamily: 'Inter_500Medium',
    fontSize: 11,
  },
  iconWrapper: {
    width: 40,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
  },
  iconWrapperActive: {
    backgroundColor: `${Colors.primary}15`,
  },
});
