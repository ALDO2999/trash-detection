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
import OfficerService, { OfficerDashboard as OfficerDashboardData, OfficerSubmission } from '../../services/officer.service';
import { WasteType as ApiWasteType } from '../../services/scan.service';

const API_TO_FRONTEND: Record<ApiWasteType, string> = {
  PLASTIC: 'Plastic', CARDBOARD: 'Cardboard',
  METAL: 'Metal', BATTERY: 'Battery', CLOTHES: 'Clothes', SHOES: 'Shoes',
};

function getInitials(name: string) {
  return name.split(' ').slice(0, 2).map((w) => w[0]).join('').toUpperCase();
}

export default function OfficerDashboard() {
  const { user } = useAuth();
  const [dashboard, setDashboard] = useState<OfficerDashboardData | null>(null);
  const [queue, setQueue] = useState<OfficerSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const hasLoaded = useRef(false);

  const loadData = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true); else if (!hasLoaded.current) setLoading(true);
    try {
      const [dash, pending] = await Promise.all([
        OfficerService.getDashboard(),
        OfficerService.getSubmissions('MENUNGGU_VERIFIKASI'),
      ]);
      setDashboard(dash);
      setQueue(pending);
      hasLoaded.current = true;
    } catch {
      // keep existing data on error
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { loadData(); }, [loadData]));

  const initials = user ? getInitials(user.name) : '?';
  const recent = queue.slice(0, 4);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => loadData(true)} colors={[Colors.primary]} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>Officer Portal</Text>
            <Text style={styles.headerSubtitle}>{user?.name ?? '—'}</Text>
          </View>
          <View style={styles.officerAvatar}>
            <Text style={styles.officerAvatarText}>{initials}</Text>
          </View>
        </View>

        {/* Hero CTA */}
        <View style={styles.heroBanner}>
          <View style={{ flex: 1 }}>
            <Text style={styles.heroTitle}>Siap Memverifikasi? 🌿</Text>
            <Text style={styles.heroSubtitle}>
              {dashboard?.totalPending ?? '...'} pengajuan menunggu konfirmasi
            </Text>
          </View>
          <Pressable
            style={({ pressed }) => [styles.scanQrBtn, pressed && styles.pressed]}
            onPress={() => router.push('/(officer)/submissions')}
          >
            <MaterialIcons name="assignment" size={20} color={Colors.onPrimary} />
            <Text style={styles.scanQrBtnText}>Verifikasi</Text>
          </Pressable>
        </View>

        {/* Stats Bento */}
        {loading ? (
          <ActivityIndicator color={Colors.primary} style={{ marginBottom: 16 }} />
        ) : (
          <View style={styles.bentoGrid}>
            <View style={[styles.bentoCard, styles.bentoPending]}>
              <MaterialIcons name="hourglass-empty" size={24} color={Colors.tertiary} />
              <Text style={styles.bentoValue}>{dashboard?.totalPending ?? 0}</Text>
              <Text style={styles.bentoLabel}>Menunggu</Text>
            </View>
            <View style={[styles.bentoCard, styles.bentoCompleted]}>
              <MaterialIcons name="check-circle" size={24} color={Colors.primary} />
              <Text style={styles.bentoValue}>{dashboard?.totalApproved ?? 0}</Text>
              <Text style={styles.bentoLabel}>Disetujui</Text>
            </View>
            <View style={[styles.bentoCard, styles.bentoWeight]}>
              <MaterialIcons name="scale" size={24} color={Colors.secondary} />
              <Text style={styles.bentoValue}>{dashboard?.totalWeightKg ?? 0} kg</Text>
              <Text style={styles.bentoLabel}>Total Berat</Text>
            </View>
            <View style={[styles.bentoCard, styles.bentoPoints]}>
              <MaterialIcons name="stars" size={24} color={Colors.tertiaryFixedDim} />
              <Text style={styles.bentoValue}>{(dashboard?.totalPointsGiven ?? 0).toLocaleString()}</Text>
              <Text style={styles.bentoLabel}>Poin Diberikan</Text>
            </View>
          </View>
        )}

        {/* System Status */}
        <View style={styles.statusCard}>
          <View style={styles.statusRow}>
            <View style={styles.statusDot} />
            <Text style={styles.statusText}>AI Detection System Online</Text>
          </View>
          <Text style={styles.statusSub}>Model aktif · Waste Sort AI v1.0</Text>
        </View>

        {/* Recent Pending Queue */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Antrian Pengajuan</Text>
            <Pressable onPress={() => router.push('/(officer)/submissions')}>
              <Text style={styles.seeAll}>Lihat Semua</Text>
            </Pressable>
          </View>

          {loading ? (
            <ActivityIndicator color={Colors.primary} />
          ) : recent.length === 0 ? (
            <View style={styles.emptyQueue}>
              <MaterialIcons name="check-circle" size={36} color={Colors.primary} />
              <Text style={styles.emptyQueueText}>Semua pengajuan sudah ditangani</Text>
            </View>
          ) : (
            <View style={styles.queueList}>
              {recent.map((sub) => {
                const frontendType = API_TO_FRONTEND[sub.wasteType];
                const cat = WASTE_CATEGORIES.find((c) => c.id === frontendType) ?? WASTE_CATEGORIES[0];
                return (
                  <Pressable
                    key={sub.id}
                    style={({ pressed }) => [styles.queueCard, pressed && styles.pressed]}
                    onPress={() => router.push('/(officer)/submissions')}
                  >
                    <View style={[styles.queueIcon, { backgroundColor: cat.bgColor }]}>
                      <MaterialIcons name={cat.icon as any} size={20} color={cat.color} />
                    </View>
                    <View style={styles.queueInfo}>
                      <Text style={styles.queueId}>#{sub.id.slice(0, 8)}</Text>
                      <Text style={styles.queueMeta}>
                        {cat.label}{sub.estimatedWeight ? ` · ${sub.estimatedWeight} kg` : ''} · {sub.user.name}
                      </Text>
                    </View>
                    <View style={styles.pendingBadge}>
                      <Text style={styles.pendingBadgeText}>Menunggu</Text>
                    </View>
                    <MaterialIcons name="chevron-right" size={18} color={Colors.outline} />
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
  pressed: { opacity: 0.7 },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingTop: 16, paddingBottom: 12,
  },
  headerTitle: { fontFamily: 'PlusJakartaSans_700Bold', fontSize: 22, color: Colors.onSurface },
  headerSubtitle: { fontFamily: 'Inter_400Regular', fontSize: 13, color: Colors.onSurfaceVariant, marginTop: 2 },
  officerAvatar: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: Colors.secondary,
    alignItems: 'center', justifyContent: 'center',
  },
  officerAvatarText: { fontFamily: 'Inter_600SemiBold', fontSize: 16, color: Colors.onSecondary },

  heroBanner: {
    marginHorizontal: 20, marginBottom: 20,
    backgroundColor: Colors.primary, borderRadius: 20, padding: 20,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12,
  },
  heroTitle: { fontFamily: 'PlusJakartaSans_700Bold', fontSize: 18, color: Colors.onPrimary },
  heroSubtitle: { fontFamily: 'Inter_400Regular', fontSize: 13, color: `${Colors.onPrimary}CC`, marginTop: 4 },
  scanQrBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: Colors.onPrimary, borderRadius: 999,
    paddingHorizontal: 16, paddingVertical: 10,
  },
  scanQrBtnText: { fontFamily: 'Inter_600SemiBold', fontSize: 14, color: Colors.primary },

  bentoGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, paddingHorizontal: 20, marginBottom: 16 },
  bentoCard: {
    width: '47%', borderRadius: 16, padding: 16, gap: 6, alignItems: 'flex-start',
    borderWidth: 1, borderColor: Colors.surfaceContainerHigh,
  },
  bentoPending: { backgroundColor: `${Colors.tertiaryFixedDim}18` },
  bentoCompleted: { backgroundColor: `${Colors.primary}10` },
  bentoWeight: { backgroundColor: `${Colors.secondary}10` },
  bentoPoints: { backgroundColor: `${Colors.tertiaryFixedDim}18` },
  bentoValue: { fontFamily: 'PlusJakartaSans_700Bold', fontSize: 22, color: Colors.onSurface },
  bentoLabel: { fontFamily: 'Inter_400Regular', fontSize: 12, color: Colors.onSurfaceVariant },

  statusCard: {
    marginHorizontal: 20, marginBottom: 20,
    backgroundColor: Colors.surfaceContainerLow,
    borderRadius: 14, padding: 14, gap: 4,
    borderWidth: 1, borderColor: Colors.surfaceContainerHigh,
  },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  statusDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.primary },
  statusText: { fontFamily: 'Inter_600SemiBold', fontSize: 14, color: Colors.onSurface },
  statusSub: { fontFamily: 'Inter_400Regular', fontSize: 12, color: Colors.onSurfaceVariant },

  section: { paddingHorizontal: 20 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { fontFamily: 'PlusJakartaSans_700Bold', fontSize: 16, color: Colors.onSurface },
  seeAll: { fontFamily: 'Inter_600SemiBold', fontSize: 13, color: Colors.primary },

  emptyQueue: { alignItems: 'center', paddingVertical: 28, gap: 10 },
  emptyQueueText: { fontFamily: 'Inter_400Regular', fontSize: 14, color: Colors.onSurfaceVariant },

  queueList: { gap: 10 },
  queueCard: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: 14, padding: 14,
    borderWidth: 1, borderColor: Colors.surfaceContainerHigh,
  },
  queueIcon: { width: 42, height: 42, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  queueInfo: { flex: 1 },
  queueId: { fontFamily: 'Inter_600SemiBold', fontSize: 14, color: Colors.onSurface },
  queueMeta: { fontFamily: 'Inter_400Regular', fontSize: 12, color: Colors.onSurfaceVariant, marginTop: 2 },
  pendingBadge: {
    backgroundColor: `${Colors.tertiaryFixedDim}33`, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 3,
  },
  pendingBadgeText: { fontFamily: 'Inter_600SemiBold', fontSize: 11, color: Colors.tertiary },
});
