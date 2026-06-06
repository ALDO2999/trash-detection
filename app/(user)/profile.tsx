import { useCallback, useRef, useState } from 'react';
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
import { router, useFocusEffect } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { useAuth } from '../../context/AuthContext';
import UserService, { DashboardData } from '../../services/user.service';
import { mediaUrl } from '../../services/api';

function getInitials(name: string) {
  return name.split(' ').slice(0, 2).map((w) => w[0]).join('').toUpperCase();
}

function MenuItem({
  icon, label, subtitle, onPress, danger, rightElement,
}: {
  icon: any; label: string; subtitle?: string;
  onPress?: () => void; danger?: boolean; rightElement?: React.ReactNode;
}) {
  return (
    <Pressable
      style={({ pressed }) => [styles.menuItem, pressed && styles.pressed]}
      onPress={onPress}
    >
      <View style={[styles.menuIcon, danger && styles.menuIconDanger]}>
        <MaterialIcons name={icon} size={20} color={danger ? Colors.error : Colors.primary} />
      </View>
      <View style={styles.menuInfo}>
        <Text style={[styles.menuLabel, danger && styles.menuLabelDanger]}>{label}</Text>
        {subtitle && <Text style={styles.menuSubtitle}>{subtitle}</Text>}
      </View>
      {rightElement ?? (
        <MaterialIcons name="chevron-right" size={20} color={Colors.outline} />
      )}
    </Pressable>
  );
}

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const hasLoaded = useRef(false);

  const loadDashboard = useCallback(async () => {
    if (!hasLoaded.current) setLoading(true);
    try {
      const data = await UserService.getDashboard();
      setDashboard(data);
      hasLoaded.current = true;
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
          <View style={styles.avatarLarge}>
            {avatarUri ? (
              <Image source={{ uri: avatarUri }} style={styles.avatarImage} />
            ) : (
              <Text style={styles.avatarText}>{initials}</Text>
            )}
          </View>
          <View style={styles.profileInfo}>
            <View style={styles.levelPill}>
              <MaterialIcons name="eco" size={12} color={Colors.primary} />
              <Text style={styles.levelPillText}>
                {(dashboard?.totalPointsEarned ?? 0) >= 3000 ? 'Master Recycler'
                 : (dashboard?.totalPointsEarned ?? 0) >= 1500 ? 'Green Champion'
                 : (dashboard?.totalPointsEarned ?? 0) >= 500 ? 'Eco Warrior'
                 : (dashboard?.totalPointsEarned ?? 0) >= 100 ? 'Pejuang Hijau'
                 : 'Pemula'}
              </Text>
            </View>
            <Text style={styles.profileName} numberOfLines={1} adjustsFontSizeToFit>{user?.name ?? '—'}</Text>
            <Text style={styles.profileEmail} numberOfLines={1}>{user?.email ?? '—'}</Text>
          </View>
        </View>

        {/* Stats */}
        <View style={styles.statsCard}>
          {loading ? (
            <ActivityIndicator color={Colors.primary} style={{ flex: 1, paddingVertical: 8 }} />
          ) : (
            [
              { label: 'Total Pts', value: (dashboard?.totalPointsEarned ?? 0).toLocaleString(), icon: 'stars' as const, color: Colors.tertiaryFixedDim },
              { label: 'Pengajuan', value: String(dashboard?.totalSubmissions ?? 0), icon: 'assignment' as const, color: Colors.primary },
              { label: 'Total Berat', value: `${dashboard?.totalWeightKg ?? 0} kg`, icon: 'scale' as const, color: Colors.secondary },
            ].map((s) => (
              <View key={s.label} style={styles.statItem}>
                <MaterialIcons name={s.icon} size={20} color={s.color} />
                <Text style={styles.statValue}>{s.value}</Text>
                <Text style={styles.statLabel}>{s.label}</Text>
              </View>
            ))
          )}
        </View>

        {/* Menu: Akun */}
        <Text style={styles.sectionLabel}>Akun</Text>
        <View style={styles.menuGroup}>
          <MenuItem
            icon="edit"
            label="Edit Profil"
            subtitle="Ubah nama dan informasi akun"
            onPress={() => router.push('/(settings)/edit-profile')}
          />
          <MenuItem
            icon="lock-outline"
            label="Ubah Password"
            subtitle="Ganti kata sandi akun Anda"
            onPress={() => router.push('/(settings)/change-password')}
          />
        </View>

        {/* Menu: Lainnya */}
        <Text style={styles.sectionLabel}>Lainnya</Text>
        <View style={styles.menuGroup}>
          <MenuItem icon="privacy-tip" label="Privasi & Data" onPress={() => router.push('/(settings)/privacy')} />
          <MenuItem icon="help-outline" label="Bantuan & FAQ" onPress={() => router.push('/(settings)/faq')} />
          <MenuItem icon="info-outline" label="Tentang Aplikasi" subtitle="Versi 1.0.0" onPress={() => router.push('/(settings)/about')} />
        </View>

        {/* Danger Zone */}
        <View style={styles.menuGroup}>
          <MenuItem icon="logout" label="Logout" danger onPress={logout} />
        </View>

        <View style={{ height: 20 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scroll: { paddingBottom: 24 },

  profileCard: {
    margin: 20, backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: 20, padding: 20,
    flexDirection: 'row', alignItems: 'center', gap: 16,
    borderWidth: 1, borderColor: Colors.surfaceContainerHigh,
  },
  avatarLarge: {
    width: 60, height: 60, borderRadius: 30, overflow: 'hidden',
    backgroundColor: Colors.primaryContainer,
    alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
  },
  avatarImage: { width: '100%', height: '100%' },
  avatarText: { fontFamily: 'PlusJakartaSans_700Bold', fontSize: 20, color: Colors.onPrimaryContainer },
  profileInfo: { flex: 1, gap: 4, minWidth: 0 },
  profileName: { fontFamily: 'PlusJakartaSans_700Bold', fontSize: 17, color: Colors.onSurface },
  profileEmail: { fontFamily: 'Inter_400Regular', fontSize: 12, color: Colors.onSurfaceVariant },
  levelPill: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: `${Colors.primary}15`, borderRadius: 999,
    paddingHorizontal: 8, paddingVertical: 3, alignSelf: 'flex-start',
  },
  levelPillText: { fontFamily: 'Inter_600SemiBold', fontSize: 11, color: Colors.primary },

  statsCard: {
    marginHorizontal: 20, marginBottom: 24,
    flexDirection: 'row', minHeight: 72,
    backgroundColor: Colors.surfaceContainerLow,
    borderRadius: 16, padding: 16,
  },
  statItem: { flex: 1, alignItems: 'center', gap: 4 },
  statValue: { fontFamily: 'PlusJakartaSans_700Bold', fontSize: 16, color: Colors.onSurface },
  statLabel: { fontFamily: 'Inter_400Regular', fontSize: 11, color: Colors.onSurfaceVariant },

  sectionLabel: {
    fontFamily: 'Inter_600SemiBold', fontSize: 12, color: Colors.outline,
    letterSpacing: 0.8, textTransform: 'uppercase',
    paddingHorizontal: 20, marginBottom: 8, marginTop: 8,
  },

  menuGroup: {
    marginHorizontal: 20, marginBottom: 8,
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: 16, borderWidth: 1, borderColor: Colors.surfaceContainerHigh,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    paddingHorizontal: 16, paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: Colors.surfaceContainerLow,
  },
  menuIcon: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: `${Colors.primary}15`,
    alignItems: 'center', justifyContent: 'center',
  },
  menuIconDanger: { backgroundColor: Colors.errorContainer },
  menuInfo: { flex: 1 },
  menuLabel: { fontFamily: 'Inter_500Medium', fontSize: 15, color: Colors.onSurface },
  menuLabelDanger: { color: Colors.error },
  menuSubtitle: { fontFamily: 'Inter_400Regular', fontSize: 12, color: Colors.onSurfaceVariant, marginTop: 1 },
  pressed: { backgroundColor: Colors.surfaceContainerLow },
});
