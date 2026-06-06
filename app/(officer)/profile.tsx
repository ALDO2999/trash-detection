import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { MOCK_OFFICER } from '../../constants/mockData';

export default function OfficerProfileScreen() {
  const officer = MOCK_OFFICER;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{officer.avatarInitials}</Text>
          </View>
          <Text style={styles.name}>{officer.name}</Text>
          <Text style={styles.role}>Petugas Verifikasi</Text>
          <View style={styles.stationBadge}>
            <MaterialIcons name="business" size={13} color={Colors.secondary} />
            <Text style={styles.stationText}>Station #4421 · {officer.city}</Text>
          </View>
        </View>

        <View style={styles.statsCard}>
          {[
            { label: 'Verifikasi Hari Ini', value: '57', icon: 'check-circle' as const, color: Colors.primary },
            { label: 'Total Kg', value: '120', icon: 'scale' as const, color: Colors.secondary },
            { label: 'Poin Diberikan', value: '2,450', icon: 'stars' as const, color: Colors.tertiaryFixedDim },
          ].map((s) => (
            <View key={s.label} style={styles.statItem}>
              <MaterialIcons name={s.icon} size={20} color={s.color} />
              <Text style={styles.statValue}>{s.value}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </View>

        <Text style={styles.sectionLabel}>Akun</Text>
        <View style={styles.menuGroup}>
          {[
            { icon: 'email' as const, label: officer.email },
            { icon: 'badge' as const, label: 'ID Petugas: OFF-001' },
          ].map((item) => (
            <View key={item.label} style={styles.menuItem}>
              <View style={styles.menuIcon}>
                <MaterialIcons name={item.icon} size={18} color={Colors.primary} />
              </View>
              <Text style={styles.menuLabel}>{item.label}</Text>
            </View>
          ))}
        </View>

        <Text style={styles.sectionLabel}>Mode</Text>
        <View style={styles.menuGroup}>
          <Pressable
            style={({ pressed }) => [styles.menuItem, pressed && styles.pressed]}
            onPress={() => router.replace('/(user)')}
          >
            <View style={styles.menuIcon}>
              <MaterialIcons name="swap-horiz" size={18} color={Colors.primary} />
            </View>
            <Text style={styles.menuLabel}>Masuk sebagai User</Text>
            <MaterialIcons name="chevron-right" size={18} color={Colors.outline} />
          </Pressable>
        </View>

        <Text style={styles.sectionLabel}>Lainnya</Text>
        <View style={styles.menuGroup}>
          <Pressable
            style={({ pressed }) => [styles.menuItem, pressed && styles.pressed]}
            onPress={() => router.push('/(settings)/faq')}
          >
            <View style={styles.menuIcon}>
              <MaterialIcons name="help-outline" size={18} color={Colors.primary} />
            </View>
            <Text style={styles.menuLabel}>Bantuan & FAQ</Text>
            <MaterialIcons name="chevron-right" size={18} color={Colors.outline} />
          </Pressable>
          <Pressable
            style={({ pressed }) => [styles.menuItem, pressed && styles.pressed]}
            onPress={() => router.push('/(settings)/about')}
          >
            <View style={styles.menuIcon}>
              <MaterialIcons name="info-outline" size={18} color={Colors.primary} />
            </View>
            <Text style={styles.menuLabel}>Tentang Aplikasi</Text>
            <MaterialIcons name="chevron-right" size={18} color={Colors.outline} />
          </Pressable>
        </View>

        <View style={styles.menuGroup}>
          <Pressable
            style={({ pressed }) => [styles.menuItem, pressed && styles.pressed]}
            onPress={() => router.replace('/(auth)/login')}
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
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: Colors.secondary, alignItems: 'center', justifyContent: 'center', marginBottom: 4,
  },
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
    flexDirection: 'row',
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
});
