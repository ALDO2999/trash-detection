import { useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { MOCK_SUBMISSIONS, getWasteCategory, SubmissionStatus } from '../../constants/mockData';

type FilterTab = 'SEMUA' | SubmissionStatus;

const FILTER_TABS: { key: FilterTab; label: string }[] = [
  { key: 'SEMUA', label: 'Semua' },
  { key: 'MENUNGGU_VERIFIKASI', label: 'Menunggu' },
  { key: 'DISETUJUI', label: 'Disetujui' },
  { key: 'DITOLAK', label: 'Ditolak' },
];

const STATUS_CONFIG = {
  MENUNGGU_VERIFIKASI: { label: 'Menunggu', color: Colors.tertiary, bg: `${Colors.tertiaryFixedDim}33`, icon: 'hourglass-empty' as const },
  DISETUJUI: { label: 'Disetujui', color: Colors.primary, bg: `${Colors.primary}15`, icon: 'check-circle' as const },
  DITOLAK: { label: 'Ditolak', color: Colors.error, bg: Colors.errorContainer, icon: 'cancel' as const },
};

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function ClaimsScreen() {
  const [activeFilter, setActiveFilter] = useState<FilterTab>('SEMUA');

  const filtered = activeFilter === 'SEMUA'
    ? MOCK_SUBMISSIONS
    : MOCK_SUBMISSIONS.filter((s) => s.status === activeFilter);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Pengajuan Klaim</Text>
        <Text style={styles.headerSubtitle}>Pantau status sampah yang kamu ajukan</Text>
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterWrapper}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
        {FILTER_TABS.map((tab) => {
          const count = tab.key === 'SEMUA'
            ? MOCK_SUBMISSIONS.length
            : MOCK_SUBMISSIONS.filter((s) => s.status === tab.key).length;
          const isActive = activeFilter === tab.key;
          return (
            <Pressable
              key={tab.key}
              style={[styles.filterTab, isActive && styles.filterTabActive]}
              onPress={() => setActiveFilter(tab.key)}
            >
              <Text style={[styles.filterTabText, isActive && styles.filterTabTextActive]}>
                {tab.label}
              </Text>
              <View style={[styles.filterCount, isActive && styles.filterCountActive]}>
                <Text style={[styles.filterCountText, isActive && styles.filterCountTextActive]}>
                  {count}
                </Text>
              </View>
            </Pressable>
          );
        })}
        </ScrollView>
      </View>

      {/* List */}
      <ScrollView style={styles.listScroll} contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
        {filtered.length === 0 ? (
          <View style={styles.empty}>
            <MaterialIcons name="inbox" size={48} color={Colors.outlineVariant} />
            <Text style={styles.emptyText}>Belum ada pengajuan</Text>
          </View>
        ) : (
          filtered.map((sub) => {
            const cat = getWasteCategory(sub.wasteType);
            const status = STATUS_CONFIG[sub.status];
            return (
              <Pressable
                key={sub.id}
                style={({ pressed }) => [styles.card, pressed && styles.pressed]}
              >
                {/* Card Header */}
                <View style={styles.cardHeader}>
                  <View style={[styles.typeIcon, { backgroundColor: cat.bgColor }]}>
                    <MaterialIcons name={cat.icon as any} size={22} color={cat.color} />
                  </View>
                  <View style={styles.cardInfo}>
                    <Text style={styles.cardId} numberOfLines={1}>#{sub.id}</Text>
                    <Text style={styles.cardDate}>{formatDate(sub.submittedAt)}</Text>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: status.bg }]}>
                    <MaterialIcons name={status.icon} size={12} color={status.color} />
                    <Text style={[styles.statusText, { color: status.color }]}>{status.label}</Text>
                  </View>
                </View>

                {/* Card Body */}
                <View style={styles.cardBody}>
                  <View style={styles.cardRow}>
                    <Text style={styles.cardLabel}>Jenis Sampah</Text>
                    <Text style={styles.cardValue}>{cat.label}</Text>
                  </View>
                  <View style={styles.cardRow}>
                    <Text style={styles.cardLabel}>Estimasi Jumlah</Text>
                    <Text style={styles.cardValue}>{sub.estimatedQty} item</Text>
                  </View>
                  <View style={styles.cardRow}>
                    <Text style={styles.cardLabel}>Estimasi Berat</Text>
                    <Text style={styles.cardValue}>{sub.estimatedWeight} kg</Text>
                  </View>
                  {sub.actualWeight !== undefined && (
                    <View style={styles.cardRow}>
                      <Text style={styles.cardLabel}>Berat Aktual</Text>
                      <Text style={styles.cardValue}>{sub.actualWeight} kg</Text>
                    </View>
                  )}
                </View>

                {/* Points or Rejection */}
                {sub.status === 'DISETUJUI' && sub.pointsEarned && (
                  <View style={styles.pointsRow}>
                    <MaterialIcons name="stars" size={16} color={Colors.primary} />
                    <Text style={styles.pointsText}>+{sub.pointsEarned} EcoPoints diperoleh</Text>
                  </View>
                )}
                {sub.status === 'DITOLAK' && sub.rejectionReason && (
                  <View style={styles.rejectionRow}>
                    <MaterialIcons name="info-outline" size={14} color={Colors.error} />
                    <Text style={styles.rejectionText}>{sub.rejectionReason}</Text>
                  </View>
                )}
              </Pressable>
            );
          })
        )}
        <View style={{ height: 16 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },

  header: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 12 },
  headerTitle: { fontFamily: 'PlusJakartaSans_700Bold', fontSize: 22, color: Colors.onSurface },
  headerSubtitle: { fontFamily: 'Inter_400Regular', fontSize: 14, color: Colors.onSurfaceVariant, marginTop: 2 },

  filterWrapper: { height: 56 },
  listScroll: { flex: 1 },
  filterRow: { paddingHorizontal: 20, paddingVertical: 10, gap: 8, alignItems: 'center' },
  filterTab: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 14, height: 36, borderRadius: 999,
    backgroundColor: Colors.surfaceContainerLow,
    borderWidth: 1.5, borderColor: Colors.surfaceContainerHigh,
  },
  filterTabActive: {
    backgroundColor: `${Colors.primary}12`,
    borderColor: Colors.primary,
  },
  filterTabText: { fontFamily: 'Inter_500Medium', fontSize: 13, color: Colors.onSurfaceVariant },
  filterTabTextActive: { color: Colors.primary, fontFamily: 'Inter_600SemiBold' },
  filterCount: {
    minWidth: 20, height: 20,
    backgroundColor: Colors.surfaceContainerHigh,
    borderRadius: 999, paddingHorizontal: 5,
    alignItems: 'center', justifyContent: 'center',
  },
  filterCountActive: { backgroundColor: `${Colors.primary}25` },
  filterCountText: { fontFamily: 'Inter_600SemiBold', fontSize: 11, color: Colors.onSurfaceVariant },
  filterCountTextActive: { color: Colors.primary },

  list: { paddingHorizontal: 20, gap: 12 },

  empty: { alignItems: 'center', justifyContent: 'center', paddingVertical: 60, gap: 12 },
  emptyText: { fontFamily: 'Inter_400Regular', fontSize: 15, color: Colors.outline },

  card: {
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: 16, padding: 16,
    borderWidth: 1, borderColor: Colors.surfaceContainerHigh,
    gap: 12,
  },
  pressed: { opacity: 0.7 },

  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  typeIcon: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  cardInfo: { flex: 1 },
  cardId: { fontFamily: 'Inter_600SemiBold', fontSize: 15, color: Colors.onSurface },
  cardDate: { fontFamily: 'Inter_400Regular', fontSize: 12, color: Colors.onSurfaceVariant, marginTop: 2 },
  statusBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999,
  },
  statusText: { fontFamily: 'Inter_600SemiBold', fontSize: 11 },

  cardBody: {
    backgroundColor: Colors.surfaceContainerLow,
    borderRadius: 10, padding: 12, gap: 6,
  },
  cardRow: { flexDirection: 'row', justifyContent: 'space-between' },
  cardLabel: { fontFamily: 'Inter_400Regular', fontSize: 13, color: Colors.onSurfaceVariant },
  cardValue: { fontFamily: 'Inter_500Medium', fontSize: 13, color: Colors.onSurface },

  pointsRow: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: `${Colors.primary}10`, borderRadius: 8,
    paddingHorizontal: 12, paddingVertical: 8,
  },
  pointsText: { fontFamily: 'Inter_600SemiBold', fontSize: 13, color: Colors.primary },

  rejectionRow: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: Colors.errorContainer, borderRadius: 8,
    paddingHorizontal: 12, paddingVertical: 8,
  },
  rejectionText: { fontFamily: 'Inter_400Regular', fontSize: 12, color: Colors.error, flex: 1 },
});
