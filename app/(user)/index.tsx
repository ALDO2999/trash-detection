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
import {
  MOCK_USER,
  MOCK_WASTE_STATS,
  MOCK_SUBMISSIONS,
  WASTE_CATEGORIES,
  getWasteCategory,
} from '../../constants/mockData';

const DAYS = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];

export default function UserDashboard() {
  const user = MOCK_USER;
  const recentSubmissions = MOCK_SUBMISSIONS.slice(0, 3);
  const pendingCount = MOCK_SUBMISSIONS.filter((s) => s.status === 'MENUNGGU_VERIFIKASI').length;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {/* ── Top App Bar ── */}
        <View style={styles.topBar}>
          <View style={styles.logoRow}>
            <MaterialIcons name="recycling" size={24} color={Colors.primary} />
            <Text style={styles.logoText}>WasteSort AI</Text>
          </View>
          <View style={styles.topBarActions}>
            <Pressable style={styles.iconBtn}>
              <MaterialIcons name="notifications-none" size={24} color={Colors.onSurface} />
            </Pressable>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{user.avatarInitials}</Text>
            </View>
          </View>
        </View>

        {/* ── Greeting ── */}
        <View style={styles.greeting}>
          <Text style={styles.greetingText}>Selamat pagi, {user.name.split(' ')[0]}! 👋</Text>
          <Text style={styles.greetingSubtext}>Ayo terus jaga bumi kita hari ini.</Text>
        </View>

        {/* ── Points Card ── */}
        <View style={styles.pointsCard}>
          <View style={styles.pointsCardHeader}>
            <View>
              <Text style={styles.pointsLabel}>Total EcoPoints</Text>
              <Text style={styles.pointsValue}>{user.points.toLocaleString()}</Text>
            </View>
            <View style={styles.rankBadge}>
              <MaterialIcons name="emoji-events" size={16} color={Colors.tertiaryFixedDim} />
              <Text style={styles.rankText}>Rank #{user.rank}</Text>
            </View>
          </View>

          {/* Level progress */}
          <View style={styles.levelRow}>
            <Text style={styles.levelText}>{user.level}</Text>
            <Text style={styles.levelPercent}>{Math.round(user.levelProgress * 100)}%</Text>
          </View>
          <View style={styles.progressBg}>
            <View style={[styles.progressFill, { width: `${user.levelProgress * 100}%` as any }]} />
          </View>

          {/* Stats row */}
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{user.totalSubmissions}</Text>
              <Text style={styles.statLabel}>Pengajuan</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{user.totalWeightKg} kg</Text>
              <Text style={styles.statLabel}>Total Berat</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{pendingCount}</Text>
              <Text style={styles.statLabel}>Menunggu</Text>
            </View>
          </View>
        </View>

        {/* ── Streak ── */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <MaterialIcons name="local-fire-department" size={18} color={Colors.tertiaryFixedDim} />
            <Text style={styles.sectionTitle}>{user.streakDays}-Hari Streak</Text>
          </View>
          <View style={styles.streakRow}>
            {DAYS.map((day, i) => (
              <View key={day} style={styles.streakDay}>
                <View style={[styles.streakDot, i < user.streakDays && styles.streakDotActive]}>
                  {i < user.streakDays && (
                    <MaterialIcons name="check" size={12} color={Colors.onPrimary} />
                  )}
                </View>
                <Text style={[styles.streakDayLabel, i < user.streakDays && styles.streakDayLabelActive]}>
                  {day}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* ── Quick Actions ── */}
        <View style={styles.quickActions}>
          <Pressable
            style={({ pressed }) => [styles.primaryAction, pressed && styles.pressed]}
            onPress={() => router.push('/(user)/scan')}
          >
            <MaterialIcons name="document-scanner" size={22} color={Colors.onPrimary} />
            <Text style={styles.primaryActionText}>Scan Sekarang</Text>
          </Pressable>
          <Pressable
            style={({ pressed }) => [styles.secondaryAction, pressed && styles.pressed]}
            onPress={() => router.push('/(user)/rewards')}
          >
            <MaterialIcons name="card-giftcard" size={22} color={Colors.primary} />
            <Text style={styles.secondaryActionText}>Tukar Poin</Text>
          </Pressable>
        </View>

        {/* ── Statistik Sampah ── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Statistik Sampah Kamu</Text>
          <View style={styles.wasteStats}>
            {MOCK_WASTE_STATS.map((stat) => {
              const cat = getWasteCategory(stat.type);
              return (
                <View key={stat.type} style={styles.wasteStatItem}>
                  <View style={[styles.wasteIcon, { backgroundColor: cat.bgColor }]}>
                    <MaterialIcons name={cat.icon as any} size={18} color={cat.color} />
                  </View>
                  <View style={styles.wasteInfo}>
                    <Text style={styles.wasteType}>{cat.label}</Text>
                    <View style={styles.wasteBarBg}>
                      <View
                        style={[
                          styles.wasteBarFill,
                          {
                            width: `${(stat.totalKg / 30) * 100}%` as any,
                            backgroundColor: cat.color,
                          },
                        ]}
                      />
                    </View>
                  </View>
                  <Text style={styles.wasteKg}>{stat.totalKg} kg</Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* ── Pengajuan Terbaru ── */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Pengajuan Terbaru</Text>
            <Pressable onPress={() => router.push('/(user)/claims')}>
              <Text style={styles.seeAll}>Lihat Semua</Text>
            </Pressable>
          </View>
          <View style={styles.submissionList}>
            {recentSubmissions.map((sub) => {
              const cat = getWasteCategory(sub.wasteType);
              const statusConfig = {
                MENUNGGU_VERIFIKASI: { label: 'Menunggu', color: Colors.tertiary, bg: `${Colors.tertiaryFixedDim}33` },
                DISETUJUI: { label: 'Disetujui', color: Colors.primary, bg: `${Colors.primary}15` },
                DITOLAK: { label: 'Ditolak', color: Colors.error, bg: Colors.errorContainer },
              }[sub.status];

              return (
                <Pressable key={sub.id} style={({ pressed }) => [styles.submissionCard, pressed && styles.pressed]}>
                  <View style={[styles.subIcon, { backgroundColor: cat.bgColor }]}>
                    <MaterialIcons name={cat.icon as any} size={20} color={cat.color} />
                  </View>
                  <View style={styles.subInfo}>
                    <Text style={styles.subId}>#{sub.id}</Text>
                    <Text style={styles.subMeta}>
                      {cat.label} · {sub.estimatedWeight} kg
                    </Text>
                  </View>
                  <View>
                    <View style={[styles.statusBadge, { backgroundColor: statusConfig.bg }]}>
                      <Text style={[styles.statusText, { color: statusConfig.color }]}>
                        {statusConfig.label}
                      </Text>
                    </View>
                    {sub.pointsEarned && (
                      <Text style={styles.pointsEarned}>+{sub.pointsEarned} pts</Text>
                    )}
                  </View>
                </Pressable>
              );
            })}
          </View>
        </View>

        <View style={{ height: 16 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scroll: { paddingBottom: 24 },

  // Top Bar
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  logoRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  logoText: { fontFamily: 'PlusJakartaSans_700Bold', fontSize: 18, color: Colors.primary },
  topBarActions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  iconBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  avatar: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: Colors.primaryContainer,
    alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { fontFamily: 'Inter_600SemiBold', fontSize: 13, color: Colors.onPrimaryContainer },

  // Greeting
  greeting: { paddingHorizontal: 20, marginBottom: 16 },
  greetingText: { fontFamily: 'PlusJakartaSans_700Bold', fontSize: 22, color: Colors.onSurface },
  greetingSubtext: { fontFamily: 'Inter_400Regular', fontSize: 14, color: Colors.onSurfaceVariant, marginTop: 2 },

  // Points Card
  pointsCard: {
    marginHorizontal: 20,
    backgroundColor: Colors.primary,
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
  },
  pointsCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
  pointsLabel: { fontFamily: 'Inter_400Regular', fontSize: 13, color: `${Colors.onPrimary}CC` },
  pointsValue: { fontFamily: 'PlusJakartaSans_700Bold', fontSize: 36, color: Colors.onPrimary, marginTop: 2 },
  rankBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: `${Colors.onPrimary}1A`, borderRadius: 999,
    paddingHorizontal: 10, paddingVertical: 4,
  },
  rankText: { fontFamily: 'Inter_600SemiBold', fontSize: 12, color: Colors.tertiaryFixedDim },
  levelRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  levelText: { fontFamily: 'Inter_600SemiBold', fontSize: 13, color: `${Colors.onPrimary}DD` },
  levelPercent: { fontFamily: 'Inter_600SemiBold', fontSize: 13, color: `${Colors.onPrimary}DD` },
  progressBg: { height: 6, backgroundColor: `${Colors.onPrimary}33`, borderRadius: 999, marginBottom: 20 },
  progressFill: { height: 6, backgroundColor: Colors.onPrimary, borderRadius: 999 },
  statsRow: { flexDirection: 'row', justifyContent: 'space-around' },
  statItem: { alignItems: 'center' },
  statValue: { fontFamily: 'PlusJakartaSans_700Bold', fontSize: 18, color: Colors.onPrimary },
  statLabel: { fontFamily: 'Inter_400Regular', fontSize: 12, color: `${Colors.onPrimary}99`, marginTop: 2 },
  statDivider: { width: 1, backgroundColor: `${Colors.onPrimary}33` },

  // Streak
  section: { paddingHorizontal: 20, marginBottom: 20 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 12 },
  sectionTitle: { fontFamily: 'PlusJakartaSans_700Bold', fontSize: 16, color: Colors.onSurface },
  streakRow: { flexDirection: 'row', justifyContent: 'space-between' },
  streakDay: { alignItems: 'center', gap: 4 },
  streakDot: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: Colors.surfaceContainerHigh,
    alignItems: 'center', justifyContent: 'center',
  },
  streakDotActive: { backgroundColor: Colors.primary },
  streakDayLabel: { fontFamily: 'Inter_500Medium', fontSize: 11, color: Colors.outline },
  streakDayLabelActive: { color: Colors.primary },

  // Quick Actions
  quickActions: { flexDirection: 'row', gap: 12, paddingHorizontal: 20, marginBottom: 20 },
  primaryAction: {
    flex: 1, backgroundColor: Colors.primary, borderRadius: 14,
    height: 52, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25, shadowRadius: 6, elevation: 4,
  },
  primaryActionText: { fontFamily: 'Inter_600SemiBold', fontSize: 14, color: Colors.onPrimary },
  secondaryAction: {
    flex: 1, backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: 14, height: 52, flexDirection: 'row',
    alignItems: 'center', justifyContent: 'center', gap: 8,
    borderWidth: 1.5, borderColor: Colors.primary,
  },
  secondaryActionText: { fontFamily: 'Inter_600SemiBold', fontSize: 14, color: Colors.primary },
  pressed: { opacity: 0.7 },

  // Waste stats
  wasteStats: { gap: 10 },
  wasteStatItem: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  wasteIcon: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  wasteInfo: { flex: 1, gap: 4 },
  wasteType: { fontFamily: 'Inter_500Medium', fontSize: 13, color: Colors.onSurface },
  wasteBarBg: { height: 5, backgroundColor: Colors.surfaceContainerHigh, borderRadius: 999 },
  wasteBarFill: { height: 5, borderRadius: 999 },
  wasteKg: { fontFamily: 'Inter_600SemiBold', fontSize: 13, color: Colors.onSurfaceVariant, width: 44, textAlign: 'right' },

  // Recent submissions
  seeAll: { fontFamily: 'Inter_600SemiBold', fontSize: 13, color: Colors.primary },
  submissionList: { gap: 10 },
  submissionCard: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: 14, padding: 14,
    borderWidth: 1, borderColor: Colors.surfaceContainerHigh,
  },
  subIcon: { width: 42, height: 42, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  subInfo: { flex: 1 },
  subId: { fontFamily: 'Inter_600SemiBold', fontSize: 14, color: Colors.onSurface },
  subMeta: { fontFamily: 'Inter_400Regular', fontSize: 12, color: Colors.onSurfaceVariant, marginTop: 2 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 999, alignSelf: 'flex-end' },
  statusText: { fontFamily: 'Inter_600SemiBold', fontSize: 11 },
  pointsEarned: { fontFamily: 'Inter_600SemiBold', fontSize: 11, color: Colors.primary, textAlign: 'right', marginTop: 3 },
});
