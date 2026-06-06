import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { router, useFocusEffect } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import OfficerService, { OfficerDashboard } from '../../services/officer.service';
import { mediaUrl } from '../../services/api';

function getInitials(name: string) {
  return name.split(' ').slice(0, 2).map((w) => w[0]).join('').toUpperCase();
}

export default function OfficerProfileScreen() {
  const { user, logout } = useAuth();
  const [dashboard, setDashboard] = useState<OfficerDashboard | null>(null);
  const [loading, setLoading] = useState(true);

  const loadDashboard = useCallback(async () => {
    try {
      const data = await OfficerService.getDashboard();
      setDashboard(data);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { loadDashboard(); }, [loadDashboard]));

  const initials = user ? getInitials(user.name) : '?';
  const avatarUri = mediaUrl(user?.avatarUrl);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            {avatarUri ? (
              <Image source={{ uri: avatarUri }} style={styles.avatarImage} />
            ) : (
              <Text style={styles.avatarText}>{initials}</Text>
            )}
          </View>
          <Text style={styles.name}>{user?.name ?? '—'}</Text>
          <Text style={styles.role}>Petugas Verifikasi</Text>
          <View style={styles.stationBadge}>
            <MaterialIcons name="verified-user" size={13} color={Colors.secondary} />
            <Text style={styles.stationText}>{user?.email ?? '—'}</Text>
          </View>
        </View>

        {/* Stats */}
        <View style={styles.statsCard}>
          {loading ? (
            <ActivityIndicator color={Colors.primary} style={{ flex: 1, paddingVertical: 8 }} />
          ) : (
            [
              { label: 'Disetujui', value: String(dashboard?.totalApproved ?? 0), icon: 'check-circle' as const, color: Colors.primary },
              { label: 'Total Kg', value: `${dashboard?.totalWeightKg ?? 0}`, icon: 'scale' as const, color: Colors.secondary },
              { label: 'Poin Diberikan', value: (dashboard?.totalPointsGiven ?? 0).toLocaleString(), icon: 'stars' as const, color: Colors.tertiaryFixedDim },
            ].map((s) => (
              <View key={s.label} style={styles.statItem}>
                <MaterialIcons name={s.icon} size={20} color={s.color} />
                <Text style={styles.statValue}>{s.value}</Text>
                <Text style={styles.statLabel}>{s.label}</Text>
              </View>
            ))
          )}
        </View>

        <Text style={styles.sectionLabel}>Lainnya</Text>
        <View style={styles.menuGroup}>
          <Pressable
            style={({ pressed }) => [styles.menuItem, pressed && styles.pressed]}
            onPress={() => router.push('/(settings)/about')}
          >
            <View style={styles.menuIcon}>
              <MaterialIcons name="info-outline" size={18} color={Colors.primary} />
            </View>
            <Text style={styles.menuLabel}>Tentang Aplikasi</Text>
            <Text style={styles.menuMeta}>Versi 1.0.0</Text>
            <MaterialIcons name="chevron-right" size={20} color={Colors.outline} />
          </Pressable>
        </View>

        <View style={styles.menuGroup}>
          <Pressable
            style={({ pressed }) => [styles.menuItem, pressed && styles.pressed]}
            onPress={logout}
          >
            <View style={[styles.menuIcon, styles.menuIconDanger]}>
              <MaterialIcons name="logout" size={18} color={Colors.error} />
            </View>
            <Text style={[styles.menuLabel, styles.menuLabelDanger]}>Logout</Text>
          </Pressable>
        </View>

        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scroll: { paddingBottom: 24 },
  pressed: { opacity: 0.7 },

  profileCard: {
    margin: 20, backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: 20, padding: 24, alignItems: 'center', gap: 6,
    borderWidth: 1, borderColor: Colors.surfaceContainerHigh,
  },
  avatar: {
    width: 72, height: 72, borderRadius: 36, overflow: 'hidden',
    backgroundColor: Colors.secondary, alignItems: 'center', justifyContent: 'center', marginBottom: 4,
  },
  avatarImage: { width: '100%', height: '100%' },
  avatarText: { fontFamily: 'PlusJakartaSans_700Bold', fontSize: 24, color: Colors.onSecondary },
  name: { fontFamily: 'PlusJakartaSans_700Bold', fontSize: 20, color: Colors.onSurface },
  role: { fontFamily: 'Inter_400Regular', fontSize: 14, color: Colors.onSurfaceVariant },
  stationBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: `${Colors.secondary}15`, borderRadius: 999,
    paddingHorizontal: 12, paddingVertical: 4, marginTop: 4,
  },
  stationText: { fontFamily: 'Inter_500Medium', fontSize: 12, color: Colors.secondary },

  statsCard: {
    marginHorizontal: 20, marginBottom: 24,
    flexDirection: 'row', minHeight: 72,
    backgroundColor: Colors.surfaceContainerLow,
    borderRadius: 16, padding: 16,
  },
  statItem: { flex: 1, alignItems: 'center', gap: 4 },
  statValue: { fontFamily: 'PlusJakartaSans_700Bold', fontSize: 16, color: Colors.onSurface },
  statLabel: { fontFamily: 'Inter_400Regular', fontSize: 10, color: Colors.onSurfaceVariant, textAlign: 'center' },

  sectionLabel: {
    fontFamily: 'Inter_600SemiBold', fontSize: 12,
    color: Colors.outline, letterSpacing: 0.8, textTransform: 'uppercase',
    paddingHorizontal: 20, marginBottom: 8, marginTop: 8,
  },
  menuGroup: {
    marginHorizontal: 20, marginBottom: 8,
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: 16, borderWidth: 1, borderColor: Colors.surfaceContainerHigh, overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    paddingHorizontal: 16, paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: Colors.surfaceContainerLow,
  },
  menuIcon: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: `${Colors.primary}15`, alignItems: 'center', justifyContent: 'center',
  },
  menuIconDanger: { backgroundColor: Colors.errorContainer },
  menuLabel: { flex: 1, fontFamily: 'Inter_500Medium', fontSize: 15, color: Colors.onSurface },
  menuLabelDanger: { color: Colors.error },
  menuMeta: { fontFamily: 'Inter_400Regular', fontSize: 13, color: Colors.onSurfaceVariant },
});
