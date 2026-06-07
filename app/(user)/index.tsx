import { useCallback, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useFocusEffect } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { WASTE_CATEGORIES } from '../../constants/mockData';
import { useAuth } from '../../context/AuthContext';
import UserService, { DashboardData } from '../../services/user.service';
import SubmissionService, { Submission } from '../../services/submission.service';
import { WasteType as ApiWasteType } from '../../services/scan.service';

const API_TO_FRONTEND: Record<ApiWasteType, string> = {
  PLASTIC: 'Plastic', CARDBOARD: 'Cardboard',
  METAL: 'Metal', BATTERY: 'Battery', CLOTHES: 'Clothes', SHOES: 'Shoes',
};

const POINTS_PER_KG: Record<ApiWasteType, number> = {
  PLASTIC: 10, CARDBOARD: 8, METAL: 20, BATTERY: 50, CLOTHES: 15, SHOES: 25,
};

const STATUS_CONFIG = {
  MENUNGGU_VERIFIKASI: { label: 'Menunggu', color: Colors.tertiary, bg: `${Colors.tertiaryFixedDim}33` },
  DISETUJUI: { label: 'Disetujui', color: Colors.primary, bg: `${Colors.primary}15` },
  DITOLAK: { label: 'Ditolak', color: Colors.error, bg: Colors.errorContainer },
};

function getLevel(points: number): { label: string; next: number; progress: number } {
  if (points < 100)  return { label: 'Pemula',          next: 100,  progress: points / 100 };
  if (points < 500)  return { label: 'Pejuang Hijau',   next: 500,  progress: (points - 100) / 400 };
  if (points < 1500) return { label: 'Eco Warrior',     next: 1500, progress: (points - 500) / 1000 };
  if (points < 3000) return { label: 'Green Champion',  next: 3000, progress: (points - 1500) / 1500 };
  return { label: 'Master Recycler', next: 3000, progress: 1 };
}

function getInitials(name?: string) {
  if (!name) return '?';
  return name.split(' ').slice(0, 2).map((w) => w[0]).join('').toUpperCase();
}

export default function UserDashboard() {
  const { user, refreshUser } = useAuth();
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const hasLoaded = useRef(false);

  const loadData = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true); else if (!hasLoaded.current) setLoading(true);
    try {
      const [dash, subs] = await Promise.all([
        UserService.getDashboard(),
        SubmissionService.getMySubmissions(),
      ]);
      setDashboard(dash);
      setSubmissions(subs);
      hasLoaded.current = true;
    } catch {
      // keep existing data on error
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Muat ulang data + segarkan saldo poin user setiap kali layar difokuskan
  useFocusEffect(
    useCallback(() => {
      loadData();
      refreshUser();
    }, [loadData, refreshUser]),
  );

  const pts = dashboard?.totalPointsEarned ?? 0;
  const pointBalance = dashboard?.pointBalance ?? 0;
  const level = getLevel(pts);
  const initials = user ? getInitials(user.name) : '?';
  const firstName = user?.name?.split(' ')[0] ?? '';
  const recentSubmissions = submissions.slice(0, 3);

  const WASTE_TYPES: ApiWasteType[] = ['PLASTIC', 'CARDBOARD', 'METAL', 'BATTERY', 'CLOTHES', 'SHOES'];
  const wasteStats = dashboard?.wasteStats;
  const maxWeight = wasteStats
    ? Math.max(...WASTE_TYPES.map((t) => wasteStats[t]?.totalWeight ?? 0), 1)
    : 1;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => loadData(true)} colors={[Colors.primary]} />
        }
      >
        {/* ── Top App Bar ── */}
        <View style={styles.topBar}>
          <View style={styles.logoRow}>
            <MaterialIcons name="recycling" size={24} color={Colors.primary} />
            <Text style={styles.logoText}>Waste Sort AI</Text>
          </View>
          <Pressable
            style={({ pressed }) => [styles.avatar, pressed && styles.pressed]}
            onPress={() => router.push('/(user)/profile')}
          >
            <Text style={styles.avatarText}>{initials}</Text>
          </Pressable>
        </View>

        {/* ── Greeting ── */}
        <View style={styles.greeting}>
          <Text style={styles.greetingText}>Halo, {firstName}! 👋</Text>
          <Text style={styles.greetingSubtext}>Ayo terus jaga bumi kita hari ini.</Text>
        </View>

        {/* ── Points Card ── */}
        <View style={styles.pointsCard}>
          <View style={styles.pointsCardHeader}>
            <View>
              <Text style={styles.pointsLabel}>Total Poin</Text>
              <Text style={styles.pointsValue}>{pts.toLocaleString()}</Text>
            </View>
            <View style={styles.levelPillCard}>
              <MaterialIcons name="eco" size={14} color={Colors.tertiaryFixedDim} />
              <Text style={styles.levelPillText}>{level.label}</Text>
            </View>
          </View>

          {/* Level progress */}
          <View style={styles.levelRow}>
            <Text style={styles.levelText}>{level.label}</Text>
            <Text style={styles.levelPercent}>{Math.round(level.progress * 100)}%</Text>
          </View>
          <View style={styles.progressBg}>
            <View style={[styles.progressFill, { width: `${level.progress * 100}%` as any }]} />
          </View>

          {/* Stats row */}
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{dashboard?.totalSubmissions ?? '—'}</Text>
              <Text style={styles.statLabel}>Pengajuan</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{dashboard ? `${dashboard.totalWeightKg} kg` : '—'}</Text>
              <Text style={styles.statLabel}>Total Berat</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{dashboard?.pendingSubmissions ?? '—'}</Text>
              <Text style={styles.statLabel}>Menunggu</Text>
            </View>
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
          {loading ? (
            <ActivityIndicator color={Colors.primary} style={{ marginTop: 16 }} />
          ) : (
            <View style={styles.wasteStats}>
              {WASTE_TYPES.map((apiType) => {
                const frontendType = API_TO_FRONTEND[apiType];
                const cat = WASTE_CATEGORIES.find((c) => c.id === frontendType) ?? WASTE_CATEGORIES[0];
                const weight = wasteStats?.[apiType]?.totalWeight ?? 0;
                const barWidth = `${(weight / maxWeight) * 100}%` as any;
                return (
                  <View key={apiType} style={styles.wasteStatItem}>
                    <View style={[styles.wasteIcon, { backgroundColor: cat.bgColor }]}>
                      <MaterialIcons name={cat.icon as any} size={18} color={cat.color} />
                    </View>
                    <View style={styles.wasteInfo}>
                      <Text style={styles.wasteType}>{cat.label}</Text>
                      <View style={styles.wasteBarBg}>
                        <View style={[styles.wasteBarFill, { width: barWidth, backgroundColor: cat.color }]} />
                      </View>
                    </View>
                    <Text style={styles.wasteKg}>{weight} kg</Text>
                  </View>
                );
              })}
            </View>
          )}
        </View>

        {/* ── Pengajuan Terbaru ── */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Pengajuan Terbaru</Text>
            <Pressable onPress={() => router.push('/(user)/claims')}>
              <Text style={styles.seeAll}>Lihat Semua</Text>
            </Pressable>
          </View>

          {loading ? (
            <ActivityIndicator color={Colors.primary} style={{ marginTop: 8 }} />
          ) : recentSubmissions.length === 0 ? (
            <View style={styles.emptySubmissions}>
              <MaterialIcons name="inbox" size={32} color={Colors.outlineVariant} />
              <Text style={styles.emptyText}>Belum ada pengajuan</Text>
            </View>
          ) : (
            <View style={styles.submissionList}>
              {recentSubmissions.map((sub) => {
                const frontendType = API_TO_FRONTEND[sub.wasteType];
                const cat = WASTE_CATEGORIES.find((c) => c.id === frontendType) ?? WASTE_CATEGORIES[0];
                const statusConfig = STATUS_CONFIG[sub.status];
                const earnedPts = sub.actualWeight
                  ? Math.floor(sub.actualWeight * POINTS_PER_KG[sub.wasteType])
                  : null;

                return (
                  <Pressable key={sub.id} style={({ pressed }) => [styles.submissionCard, pressed && styles.pressed]} onPress={() => router.push({ pathname: '/(user)/submission-detail', params: { id: sub.id } })}>
                    <View style={[styles.subIcon, { backgroundColor: cat.bgColor }]}>
                      <MaterialIcons name={cat.icon as any} size={20} color={cat.color} />
                    </View>
                    <View style={styles.subInfo}>
                      <Text style={styles.subId}>#{sub.id.slice(0, 8)}</Text>
                      <Text style={styles.subMeta}>
                        {cat.label}{sub.estimatedWeight ? ` · ${sub.estimatedWeight} kg` : ''}
                      </Text>
                    </View>
                    <View>
                      <View style={[styles.statusBadge, { backgroundColor: statusConfig.bg }]}>
                        <Text style={[styles.statusText, { color: statusConfig.color }]}>
                          {statusConfig.label}
                        </Text>
                      </View>
                      {earnedPts !== null && sub.status === 'DISETUJUI' && (
                        <Text style={styles.pointsEarned}>+{earnedPts} pts</Text>
                      )}
                    </View>
                  </Pressable>
                );
              })}
            </View>
          )}
        </View>

        <View style={{ height: 16 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scroll: { paddingBottom: 24 },

  topBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 12,
  },
  logoRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  logoText: { fontFamily: 'PlusJakartaSans_700Bold', fontSize: 18, color: Colors.primary },
  avatar: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: Colors.primaryContainer,
    alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { fontFamily: 'Inter_600SemiBold', fontSize: 13, color: Colors.onPrimaryContainer },

  greeting: { paddingHorizontal: 20, marginBottom: 16 },
  greetingText: { fontFamily: 'PlusJakartaSans_700Bold', fontSize: 22, color: Colors.onSurface },
  greetingSubtext: { fontFamily: 'Inter_400Regular', fontSize: 14, color: Colors.onSurfaceVariant, marginTop: 2 },

  pointsCard: {
    marginHorizontal: 20, backgroundColor: Colors.primary,
    borderRadius: 20, padding: 20, marginBottom: 20,
  },
  pointsCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
  pointsLabel: { fontFamily: 'Inter_400Regular', fontSize: 13, color: `${Colors.onPrimary}CC` },
  pointsValue: { fontFamily: 'PlusJakartaSans_700Bold', fontSize: 36, color: Colors.onPrimary, marginTop: 2 },
  levelPillCard: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: `${Colors.onPrimary}1A`, borderRadius: 999,
    paddingHorizontal: 10, paddingVertical: 4,
  },
  levelPillText: { fontFamily: 'Inter_600SemiBold', fontSize: 12, color: Colors.tertiaryFixedDim },
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

  section: { paddingHorizontal: 20, marginBottom: 20 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  sectionTitle: { fontFamily: 'PlusJakartaSans_700Bold', fontSize: 16, color: Colors.onSurface },
  seeAll: { fontFamily: 'Inter_600SemiBold', fontSize: 13, color: Colors.primary },

  wasteStats: { gap: 10, marginTop: 12 },
  wasteStatItem: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  wasteIcon: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  wasteInfo: { flex: 1, gap: 4 },
  wasteType: { fontFamily: 'Inter_500Medium', fontSize: 13, color: Colors.onSurface },
  wasteBarBg: { height: 5, backgroundColor: Colors.surfaceContainerHigh, borderRadius: 999 },
  wasteBarFill: { height: 5, borderRadius: 999 },
  wasteKg: { fontFamily: 'Inter_600SemiBold', fontSize: 13, color: Colors.onSurfaceVariant, width: 44, textAlign: 'right' },

  emptySubmissions: { alignItems: 'center', paddingVertical: 24, gap: 8 },
  emptyText: { fontFamily: 'Inter_400Regular', fontSize: 14, color: Colors.outline },

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
