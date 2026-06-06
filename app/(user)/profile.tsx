import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { MOCK_USER } from '../../constants/mockData';

function MenuItem({
  icon,
  label,
  subtitle,
  onPress,
  danger,
  rightElement,
}: {
  icon: any;
  label: string;
  subtitle?: string;
  onPress?: () => void;
  danger?: boolean;
  rightElement?: React.ReactNode;
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
  const user = MOCK_USER;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatarLarge}>
            <Text style={styles.avatarText}>{user.avatarInitials}</Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{user.name}</Text>
            <Text style={styles.profileUsername}>@{user.username}</Text>
            <Text style={styles.profileCity}>
              <MaterialIcons name="location-on" size={12} color={Colors.onSurfaceVariant} />
              {' '}{user.city}
            </Text>
          </View>
          <View style={styles.levelPill}>
            <MaterialIcons name="eco" size={14} color={Colors.primary} />
            <Text style={styles.levelPillText}>{user.level}</Text>
          </View>
        </View>

        {/* Stats */}
        <View style={styles.statsCard}>
          {[
            { label: 'Total Poin', value: user.points.toLocaleString(), icon: 'stars' as const, color: Colors.tertiaryFixedDim },
            { label: 'Pengajuan', value: String(user.totalSubmissions), icon: 'assignment' as const, color: Colors.primary },
            { label: 'Total Berat', value: `${user.totalWeightKg} kg`, icon: 'scale' as const, color: Colors.secondary },
          ].map((s) => (
            <View key={s.label} style={styles.statItem}>
              <MaterialIcons name={s.icon} size={20} color={s.color} />
              <Text style={styles.statValue}>{s.value}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </View>

        {/* Menu: Akun */}
        <Text style={styles.sectionLabel}>Akun</Text>
        <View style={styles.menuGroup}>
          <MenuItem
            icon="edit"
            label="Edit Profil"
            subtitle="Ubah nama, foto, dan kota"
            onPress={() => router.push('/(settings)/edit-profile')}
          />
        </View>

        {/* Menu: Lainnya */}
        <Text style={styles.sectionLabel}>Lainnya</Text>
        <View style={styles.menuGroup}>
          <MenuItem
            icon="privacy-tip"
            label="Privasi & Data"
            onPress={() => router.push('/(settings)/privacy')}
          />
          <MenuItem
            icon="help-outline"
            label="Bantuan & FAQ"
            onPress={() => router.push('/(settings)/faq')}
          />
          <MenuItem
            icon="info-outline"
            label="Tentang Aplikasi"
            subtitle="Versi 1.0.0"
            onPress={() => router.push('/(settings)/about')}
          />
        </View>

        {/* Switch to Officer (demo) */}
        <View style={styles.menuGroup}>
          <MenuItem
            icon="swap-horiz"
            label="Masuk sebagai Petugas"
            subtitle="Mode demo"
            onPress={() => router.replace('/(officer)')}
          />
        </View>

        {/* Danger Zone */}
        <View style={styles.menuGroup}>
          <MenuItem icon="logout" label="Logout" danger onPress={() => router.replace('/(auth)/login')} />
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
    margin: 20,
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: 20, padding: 20,
    flexDirection: 'row', alignItems: 'center', gap: 16,
    borderWidth: 1, borderColor: Colors.surfaceContainerHigh,
  },
  avatarLarge: {
    width: 60, height: 60, borderRadius: 30,
    backgroundColor: Colors.primaryContainer,
    alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { fontFamily: 'PlusJakartaSans_700Bold', fontSize: 20, color: Colors.onPrimaryContainer },
  profileInfo: { flex: 1 },
  profileName: { fontFamily: 'PlusJakartaSans_700Bold', fontSize: 18, color: Colors.onSurface },
  profileUsername: { fontFamily: 'Inter_400Regular', fontSize: 13, color: Colors.onSurfaceVariant, marginTop: 2 },
  profileCity: { fontFamily: 'Inter_400Regular', fontSize: 12, color: Colors.onSurfaceVariant, marginTop: 4 },
  levelPill: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: `${Colors.primary}15`, borderRadius: 999,
    paddingHorizontal: 10, paddingVertical: 4, alignSelf: 'flex-start',
  },
  levelPillText: { fontFamily: 'Inter_600SemiBold', fontSize: 12, color: Colors.primary },

  statsCard: {
    marginHorizontal: 20, marginBottom: 24,
    flexDirection: 'row',
    backgroundColor: Colors.surfaceContainerLow,
    borderRadius: 16, padding: 16,
  },
  statItem: { flex: 1, alignItems: 'center', gap: 4 },
  statValue: { fontFamily: 'PlusJakartaSans_700Bold', fontSize: 16, color: Colors.onSurface },
  statLabel: { fontFamily: 'Inter_400Regular', fontSize: 11, color: Colors.onSurfaceVariant },

  sectionLabel: {
    fontFamily: 'Inter_600SemiBold', fontSize: 12,
    color: Colors.outline, letterSpacing: 0.8,
    textTransform: 'uppercase',
    paddingHorizontal: 20, marginBottom: 8, marginTop: 8,
  },

  menuGroup: {
    marginHorizontal: 20, marginBottom: 8,
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: 16,
    borderWidth: 1, borderColor: Colors.surfaceContainerHigh,
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
