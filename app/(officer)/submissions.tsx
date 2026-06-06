import { useCallback, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useFocusEffect } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { WASTE_CATEGORIES } from '../../constants/mockData';
import OfficerService, { OfficerSubmission } from '../../services/officer.service';
import ScanService, { WasteType as ApiWasteType } from '../../services/scan.service';
import { getApiErrorMessage } from '../../hooks/useApiError';

type VerifyStep = 'list' | 'detail' | 'approve_success' | 'reject';

const REJECT_REASONS = [
  'Sampah tidak sesuai',
  'Sampah tercampur',
  'QR kadaluarsa',
  'Lainnya',
];

const POINTS_PER_KG: Record<ApiWasteType, number> = {
  PLASTIC: 10, CARDBOARD: 8, METAL: 20, BATTERY: 50, CLOTHES: 15, SHOES: 25,
};

const API_TO_FRONTEND: Record<ApiWasteType, string> = {
  PLASTIC: 'Plastic', CARDBOARD: 'Cardboard',
  METAL: 'Metal', BATTERY: 'Battery', CLOTHES: 'Clothes', SHOES: 'Shoes',
};

function getCategory(wasteType: ApiWasteType) {
  return WASTE_CATEGORIES.find((c) => c.id === API_TO_FRONTEND[wasteType]) ?? WASTE_CATEGORIES[0];
}

function calcPts(wasteType: ApiWasteType, weight: number) {
  return Math.floor(weight * POINTS_PER_KG[wasteType]);
}

export default function SubmissionsScreen() {
  const [step, setStep] = useState<VerifyStep>('list');
  const [submissions, setSubmissions] = useState<OfficerSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const hasLoaded = useRef(false);

  const [selected, setSelected] = useState<OfficerSubmission | null>(null);
  const [actualWeight, setActualWeight] = useState('');
  const [rejectReason, setRejectReason] = useState('');
  const [rejectNotes, setRejectNotes] = useState('');
  const [approvedPts, setApprovedPts] = useState(0);

  const loadSubmissions = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true); else if (!hasLoaded.current) setLoading(true);
    try {
      const data = await OfficerService.getSubmissions('MENUNGGU_VERIFIKASI');
      setSubmissions(data);
      hasLoaded.current = true;
    } catch {
      // keep existing
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { loadSubmissions(); }, [loadSubmissions]));

  const handleSelect = (sub: OfficerSubmission) => {
    setSelected(sub);
    setActualWeight(sub.estimatedWeight ? String(sub.estimatedWeight) : '');
    setStep('detail');
  };

  const handleApprove = async () => {
    if (!selected) return;
    const weight = parseFloat(actualWeight);
    if (!weight || weight <= 0) {
      Alert.alert('Input Tidak Valid', 'Masukkan berat aktual yang valid.');
      return;
    }
    setSubmitting(true);
    try {
      await OfficerService.verifySubmission(selected.id, 'APPROVE', weight);
      setApprovedPts(calcPts(selected.wasteType, weight));
      setStep('approve_success');
      // Hapus dari list lokal
      setSubmissions((prev) => prev.filter((s) => s.id !== selected.id));
    } catch (err) {
      Alert.alert('Gagal', getApiErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const handleRejectSubmit = async () => {
    if (!selected || !rejectReason) return;
    const notes = rejectNotes ? `${rejectReason}: ${rejectNotes}` : rejectReason;
    setSubmitting(true);
    try {
      await OfficerService.verifySubmission(selected.id, 'REJECT', undefined, notes);
      setSubmissions((prev) => prev.filter((s) => s.id !== selected.id));
      handleBackToList();
    } catch (err) {
      Alert.alert('Gagal', getApiErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const handleBackToList = () => {
    setStep('list');
    setSelected(null);
    setActualWeight('');
    setRejectReason('');
    setRejectNotes('');
  };

  // ── Approve success ──
  if (step === 'approve_success' && selected) {
    const cat = getCategory(selected.wasteType);
    const weight = parseFloat(actualWeight);
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.successScreen}>
          <View style={styles.successIcon}>
            <MaterialIcons name="check-circle" size={64} color={Colors.primary} />
          </View>
          <Text style={styles.successTitle}>Pengajuan Disetujui!</Text>
          <Text style={styles.successSub}>#{selected.id.slice(0, 8)} telah berhasil diverifikasi</Text>
          <Text style={styles.successUser}>👤 {selected.user.name}</Text>

          <View style={styles.successStats}>
            <View style={styles.successStatItem}>
              <Text style={styles.successStatValue}>{weight.toFixed(2)} kg</Text>
              <Text style={styles.successStatLabel}>Berat Aktual</Text>
            </View>
            <View style={styles.successStatDivider} />
            <View style={styles.successStatItem}>
              <Text style={[styles.successStatValue, { color: Colors.primary }]}>{approvedPts} pts</Text>
              <Text style={styles.successStatLabel}>Poin Diberikan</Text>
            </View>
          </View>

          <View style={[styles.categoryChip, { backgroundColor: cat.bgColor }]}>
            <MaterialIcons name={cat.icon as any} size={18} color={cat.color} />
            <Text style={[styles.categoryChipText, { color: cat.color }]}>{cat.label}</Text>
          </View>

          <View style={styles.successActions}>
            <Pressable
              style={({ pressed }) => [styles.nextBtn, pressed && styles.pressed]}
              onPress={handleBackToList}
            >
              <Text style={styles.nextBtnText}>Pengajuan Berikutnya</Text>
            </Pressable>
            <Pressable
              style={({ pressed }) => [styles.dashBtn, pressed && styles.pressed]}
              onPress={() => router.push('/(officer)')}
            >
              <Text style={styles.dashBtnText}>Kembali ke Dashboard</Text>
            </Pressable>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  // ── Reject form ──
  if (step === 'reject' && selected) {
    const cat = getCategory(selected.wasteType);
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <Pressable onPress={() => setStep('detail')} style={({ pressed }) => pressed && styles.pressed}>
            <MaterialIcons name="arrow-back" size={24} color={Colors.onSurface} />
          </Pressable>
          <Text style={styles.headerTitle}>Tolak Pengajuan</Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView contentContainerStyle={styles.scroll}>
          <View style={styles.rejectInfoCard}>
            <View style={[styles.typeIcon, { backgroundColor: cat.bgColor }]}>
              <MaterialIcons name={cat.icon as any} size={24} color={cat.color} />
            </View>
            <View>
              <Text style={styles.cardId}>#{selected.id.slice(0, 8)}</Text>
              <Text style={styles.cardMeta}>{cat.label}{selected.estimatedWeight ? ` · ${selected.estimatedWeight} kg est.` : ''}</Text>
            </View>
          </View>

          <View style={styles.warningCard}>
            <MaterialIcons name="warning" size={18} color={Colors.error} />
            <Text style={styles.warningText}>
              Menolak pengajuan ini akan mengirim notifikasi kepada user secara langsung.
            </Text>
          </View>

          <Text style={styles.fieldLabel}>Alasan Penolakan</Text>
          <View style={styles.reasonList}>
            {REJECT_REASONS.map((r) => (
              <Pressable
                key={r}
                style={[styles.reasonOption, rejectReason === r && styles.reasonOptionActive]}
                onPress={() => setRejectReason(r)}
              >
                <View style={[styles.radioOuter, rejectReason === r && styles.radioOuterActive]}>
                  {rejectReason === r && <View style={styles.radioInner} />}
                </View>
                <Text style={[styles.reasonText, rejectReason === r && styles.reasonTextActive]}>{r}</Text>
              </Pressable>
            ))}
          </View>

          <Text style={styles.fieldLabel}>Catatan Tambahan (opsional)</Text>
          <TextInput
            style={styles.notesInput}
            placeholder="Tuliskan catatan untuk user..."
            placeholderTextColor={Colors.outline}
            value={rejectNotes}
            onChangeText={setRejectNotes}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />

          <View style={styles.rejectActions}>
            <Pressable
              style={({ pressed }) => [
                styles.confirmRejectBtn,
                (!rejectReason || submitting) && styles.confirmRejectDisabled,
                pressed && styles.pressed,
              ]}
              onPress={handleRejectSubmit}
              disabled={!rejectReason || submitting}
            >
              {submitting ? (
                <ActivityIndicator color={Colors.onError} />
              ) : (
                <>
                  <MaterialIcons name="cancel" size={20} color={Colors.onError} />
                  <Text style={styles.confirmRejectText}>Konfirmasi Penolakan</Text>
                </>
              )}
            </Pressable>
            <Pressable
              style={({ pressed }) => [styles.backReviewBtn, pressed && styles.pressed]}
              onPress={() => setStep('detail')}
            >
              <Text style={styles.backReviewText}>Kembali ke Review</Text>
            </Pressable>
          </View>
          <View style={{ height: 24 }} />
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ── Detail / verify ──
  if (step === 'detail' && selected) {
    const cat = getCategory(selected.wasteType);
    const weight = parseFloat(actualWeight) || 0;
    const estPts = selected.estimatedWeight ? calcPts(selected.wasteType, selected.estimatedWeight) : 0;
    const actualPts = calcPts(selected.wasteType, weight);
    const diff = actualPts - estPts;

    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <Pressable onPress={handleBackToList} style={({ pressed }) => pressed && styles.pressed}>
            <MaterialIcons name="arrow-back" size={24} color={Colors.onSurface} />
          </Pressable>
          <Text style={styles.headerTitle}>#{selected.id.slice(0, 8)}</Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView contentContainerStyle={styles.scroll}>
          {/* User info */}
          <View style={styles.userInfoCard}>
            <MaterialIcons name="person" size={18} color={Colors.primary} />
            <Text style={styles.userInfoText}>{selected.user.name} · {selected.user.email}</Text>
          </View>

          {/* Scan photo */}
          {(selected.imageUrl || selected.scanResult?.imageUrl) ? (
            <View style={styles.photoCard}>
              <Text style={styles.photoCardLabel}>Foto Scan User</Text>
              <Image
                source={{ uri: ScanService.getImageUrl(selected.imageUrl || selected.scanResult?.imageUrl) }}
                style={styles.scanPhoto}
                resizeMode="cover"
              />
              {selected.scanResult && (
                <View style={styles.aiRow}>
                  <MaterialIcons name="auto-awesome" size={14} color={Colors.tertiary} />
                  <Text style={styles.aiText}>
                    AI: {selected.scanResult.predictedType} · {Math.round(selected.scanResult.confidence ?? 0)}% yakin
                  </Text>
                </View>
              )}
            </View>
          ) : null}

          {/* Waste type */}
          <View style={[styles.typeHeader, { backgroundColor: cat.bgColor }]}>
            <MaterialIcons name={cat.icon as any} size={32} color={cat.color} />
            <View>
              <Text style={[styles.typeHeaderLabel, { color: cat.color }]}>{cat.label}</Text>
              <Text style={styles.typeHeaderSub}>
                {selected.estimatedWeight ? `Est. ${selected.estimatedWeight} kg` : 'Berat belum diisi'}
              </Text>
            </View>
          </View>

          {/* Weight Input */}
          <View style={styles.detailCard}>
            <Text style={styles.detailCardTitle}>Input Berat Aktual</Text>
            <View style={styles.weightInputRow}>
              <View style={styles.weightInput}>
                <TextInput
                  style={styles.weightInputText}
                  value={actualWeight}
                  onChangeText={setActualWeight}
                  keyboardType="decimal-pad"
                  placeholder="0.00"
                  placeholderTextColor={Colors.outline}
                />
                <Text style={styles.weightUnit}>kg</Text>
              </View>
              {selected.estimatedWeight ? (
                <View style={styles.estWeight}>
                  <Text style={styles.estWeightLabel}>Estimasi</Text>
                  <Text style={styles.estWeightValue}>{selected.estimatedWeight} kg</Text>
                </View>
              ) : null}
            </View>
            {selected.estimatedWeight && weight > 0 &&
              Math.abs(weight - selected.estimatedWeight) / selected.estimatedWeight > 0.15 && (
              <View style={styles.correctionWarning}>
                <MaterialIcons name="warning" size={14} color={Colors.tertiary} />
                <Text style={styles.correctionWarningText}>Koreksi melebihi 15% dari estimasi</Text>
              </View>
            )}
          </View>

          {/* Point Calculation */}
          <View style={styles.detailCard}>
            <Text style={styles.detailCardTitle}>Kalkulasi Poin</Text>
            {estPts > 0 && (
              <View style={styles.calcRow}>
                <Text style={styles.calcLabel}>Estimasi</Text>
                <Text style={styles.calcValue}>{estPts} pts</Text>
              </View>
            )}
            <View style={styles.calcRow}>
              <Text style={styles.calcLabel}>Aktual</Text>
              <Text style={[styles.calcValue, styles.calcValueHighlight]}>{actualPts} pts</Text>
            </View>
            {estPts > 0 && diff !== 0 && (
              <View style={styles.calcRow}>
                <Text style={styles.calcLabel}>Selisih</Text>
                <Text style={[styles.calcValue, { color: diff > 0 ? Colors.primary : Colors.error }]}>
                  {diff > 0 ? '+' : ''}{diff} pts
                </Text>
              </View>
            )}
            <View style={styles.calcDivider} />
            <View style={styles.calcTotalRow}>
              <Text style={styles.calcTotalLabel}>Poin Diberikan</Text>
              <Text style={styles.calcTotalValue}>{actualPts} pts</Text>
            </View>
          </View>

          {/* Actions */}
          <View style={styles.detailActions}>
            <Pressable
              style={({ pressed }) => [
                styles.approveBtn,
                (submitting || weight <= 0) && { opacity: 0.5 },
                pressed && styles.pressed,
              ]}
              onPress={handleApprove}
              disabled={submitting || weight <= 0}
            >
              {submitting ? (
                <ActivityIndicator color={Colors.onPrimary} />
              ) : (
                <>
                  <MaterialIcons name="check-circle" size={20} color={Colors.onPrimary} />
                  <Text style={styles.approveBtnText}>Setujui Pengajuan</Text>
                </>
              )}
            </Pressable>
            <Pressable
              style={({ pressed }) => [styles.rejectBtn, pressed && styles.pressed]}
              onPress={() => setStep('reject')}
              disabled={submitting}
            >
              <MaterialIcons name="cancel" size={20} color={Colors.error} />
              <Text style={styles.rejectBtnText}>Tolak</Text>
            </Pressable>
          </View>
          <View style={{ height: 24 }} />
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ── List view ──
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Daftar Pengajuan</Text>
        <View style={styles.headerRight}>
          <View style={styles.pendingCount}>
            <Text style={styles.pendingCountText}>{submissions.length} menunggu</Text>
          </View>
          <Pressable
            style={({ pressed }) => [styles.scanQrBtn, pressed && styles.pressed]}
            onPress={() => router.push('/(officer)/scan')}
          >
            <MaterialIcons name="qr-code-scanner" size={20} color={Colors.primary} />
          </Pressable>
        </View>
      </View>

      {loading ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.scroll}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={() => loadSubmissions(true)} colors={[Colors.primary]} />
          }
        >
          {submissions.length === 0 ? (
            <View style={styles.emptyBox}>
              <MaterialIcons name="check-circle" size={48} color={Colors.primary} />
              <Text style={styles.emptyTitle}>Semua Selesai!</Text>
              <Text style={styles.emptyText}>Tidak ada pengajuan yang menunggu verifikasi.</Text>
            </View>
          ) : (
            submissions.map((sub) => {
              const cat = getCategory(sub.wasteType);
              return (
                <Pressable
                  key={sub.id}
                  style={({ pressed }) => [styles.queueCard, pressed && styles.pressed]}
                  onPress={() => handleSelect(sub)}
                >
                  <View style={[styles.typeIcon, { backgroundColor: cat.bgColor }]}>
                    <MaterialIcons name={cat.icon as any} size={22} color={cat.color} />
                  </View>
                  <View style={styles.queueInfo}>
                    <Text style={styles.cardId}>#{sub.id.slice(0, 8)}</Text>
                    <Text style={styles.cardMeta}>
                      {cat.label}{sub.estimatedWeight ? ` · ${sub.estimatedWeight} kg` : ''} · {sub.user.name}
                    </Text>
                  </View>
                  <Pressable
                    style={({ pressed }) => [styles.verifyBtn, pressed && styles.pressed]}
                    onPress={() => handleSelect(sub)}
                  >
                    <Text style={styles.verifyBtnText}>Verifikasi</Text>
                  </Pressable>
                </Pressable>
              );
            })
          )}
          <View style={{ height: 24 }} />
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  pressed: { opacity: 0.7 },
  scroll: { paddingHorizontal: 20, paddingTop: 8, gap: 12 },
  loadingBox: { flex: 1, alignItems: 'center', justifyContent: 'center' },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: Colors.surfaceContainerHigh,
  },
  headerTitle: { fontFamily: 'PlusJakartaSans_700Bold', fontSize: 20, color: Colors.onSurface },
  pendingCount: {
    backgroundColor: `${Colors.tertiary}1A`, borderRadius: 999,
    paddingHorizontal: 12, paddingVertical: 4,
  },
  pendingCountText: { fontFamily: 'Inter_600SemiBold', fontSize: 13, color: Colors.tertiary },

  emptyBox: { alignItems: 'center', paddingVertical: 60, gap: 12 },
  emptyTitle: { fontFamily: 'PlusJakartaSans_700Bold', fontSize: 20, color: Colors.onSurface },
  emptyText: { fontFamily: 'Inter_400Regular', fontSize: 14, color: Colors.onSurfaceVariant, textAlign: 'center' },

  queueCard: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: 16, padding: 16,
    borderWidth: 1, borderColor: Colors.surfaceContainerHigh,
  },
  typeIcon: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  queueInfo: { flex: 1 },
  cardId: { fontFamily: 'Inter_600SemiBold', fontSize: 15, color: Colors.onSurface },
  cardMeta: { fontFamily: 'Inter_400Regular', fontSize: 12, color: Colors.onSurfaceVariant, marginTop: 2 },
  verifyBtn: {
    backgroundColor: Colors.primary, borderRadius: 999,
    paddingHorizontal: 14, paddingVertical: 7,
  },
  verifyBtnText: { fontFamily: 'Inter_600SemiBold', fontSize: 13, color: Colors.onPrimary },

  userInfoCard: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: `${Colors.primary}10`, borderRadius: 12,
    paddingHorizontal: 14, paddingVertical: 10, marginBottom: 12,
  },
  userInfoText: { fontFamily: 'Inter_500Medium', fontSize: 13, color: Colors.onSurface, flex: 1 },

  typeHeader: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    borderRadius: 16, padding: 16, marginBottom: 12,
  },
  typeHeaderLabel: { fontFamily: 'PlusJakartaSans_700Bold', fontSize: 20 },
  typeHeaderSub: { fontFamily: 'Inter_400Regular', fontSize: 13, color: Colors.onSurfaceVariant, marginTop: 2 },

  detailCard: {
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: 16, padding: 16, marginBottom: 12,
    borderWidth: 1, borderColor: Colors.surfaceContainerHigh, gap: 12,
  },
  detailCardTitle: { fontFamily: 'Inter_600SemiBold', fontSize: 15, color: Colors.onSurface },
  weightInputRow: { flexDirection: 'row', gap: 12, alignItems: 'center' },
  weightInput: {
    flex: 1, flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.surfaceContainerLow,
    borderRadius: 12, paddingHorizontal: 16, height: 52,
    borderWidth: 2, borderColor: Colors.primary,
  },
  weightInputText: { flex: 1, fontFamily: 'PlusJakartaSans_700Bold', fontSize: 22, color: Colors.onSurface },
  weightUnit: { fontFamily: 'Inter_500Medium', fontSize: 16, color: Colors.onSurfaceVariant },
  estWeight: { alignItems: 'center' },
  estWeightLabel: { fontFamily: 'Inter_400Regular', fontSize: 11, color: Colors.onSurfaceVariant },
  estWeightValue: { fontFamily: 'Inter_600SemiBold', fontSize: 15, color: Colors.onSurface },
  correctionWarning: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: `${Colors.tertiaryFixedDim}22`, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8,
  },
  correctionWarningText: { fontFamily: 'Inter_400Regular', fontSize: 12, color: Colors.tertiary },

  calcRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  calcLabel: { fontFamily: 'Inter_400Regular', fontSize: 14, color: Colors.onSurfaceVariant },
  calcValue: { fontFamily: 'Inter_500Medium', fontSize: 14, color: Colors.onSurface },
  calcValueHighlight: { color: Colors.primary, fontFamily: 'Inter_600SemiBold' },
  calcDivider: { height: 1, backgroundColor: Colors.outlineVariant },
  calcTotalRow: { flexDirection: 'row', justifyContent: 'space-between' },
  calcTotalLabel: { fontFamily: 'Inter_600SemiBold', fontSize: 16, color: Colors.onSurface },
  calcTotalValue: { fontFamily: 'PlusJakartaSans_700Bold', fontSize: 20, color: Colors.primary },

  detailActions: { gap: 10 },
  approveBtn: {
    backgroundColor: Colors.primary, borderRadius: 999, height: 54,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.25, shadowRadius: 6, elevation: 4,
  },
  approveBtnText: { fontFamily: 'Inter_600SemiBold', fontSize: 16, color: Colors.onPrimary },
  rejectBtn: {
    borderWidth: 1.5, borderColor: Colors.error, borderRadius: 999, height: 48,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
  },
  rejectBtnText: { fontFamily: 'Inter_600SemiBold', fontSize: 15, color: Colors.error },

  successScreen: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32, gap: 16 },
  successIcon: { width: 100, height: 100, borderRadius: 50, backgroundColor: `${Colors.primary}15`, alignItems: 'center', justifyContent: 'center' },
  successTitle: { fontFamily: 'PlusJakartaSans_700Bold', fontSize: 26, color: Colors.onSurface },
  successSub: { fontFamily: 'Inter_400Regular', fontSize: 14, color: Colors.onSurfaceVariant },
  successUser: { fontFamily: 'Inter_500Medium', fontSize: 14, color: Colors.onSurface },
  successStats: { flexDirection: 'row', gap: 32 },
  successStatItem: { alignItems: 'center', gap: 4 },
  successStatValue: { fontFamily: 'PlusJakartaSans_700Bold', fontSize: 24, color: Colors.onSurface },
  successStatLabel: { fontFamily: 'Inter_400Regular', fontSize: 13, color: Colors.onSurfaceVariant },
  successStatDivider: { width: 1, height: 48, backgroundColor: Colors.outlineVariant },
  categoryChip: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12 },
  categoryChipText: { fontFamily: 'Inter_600SemiBold', fontSize: 15 },
  successActions: { width: '100%', gap: 10 },
  nextBtn: { backgroundColor: Colors.primary, borderRadius: 999, height: 52, alignItems: 'center', justifyContent: 'center' },
  nextBtnText: { fontFamily: 'Inter_600SemiBold', fontSize: 15, color: Colors.onPrimary },
  dashBtn: { borderWidth: 1.5, borderColor: Colors.outline, borderRadius: 999, height: 48, alignItems: 'center', justifyContent: 'center' },
  dashBtnText: { fontFamily: 'Inter_600SemiBold', fontSize: 15, color: Colors.onSurfaceVariant },

  rejectInfoCard: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: 14, padding: 16, marginBottom: 12,
    borderWidth: 1, borderColor: Colors.surfaceContainerHigh,
  },
  warningCard: {
    flexDirection: 'row', gap: 10, alignItems: 'flex-start',
    backgroundColor: Colors.errorContainer, borderRadius: 12, padding: 14, marginBottom: 20,
  },
  warningText: { flex: 1, fontFamily: 'Inter_400Regular', fontSize: 13, color: Colors.error, lineHeight: 19 },
  fieldLabel: { fontFamily: 'Inter_600SemiBold', fontSize: 14, color: Colors.onSurface, marginBottom: 10 },
  reasonList: { gap: 8, marginBottom: 20 },
  reasonOption: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: Colors.surfaceContainerLowest, borderRadius: 12,
    padding: 14, borderWidth: 1.5, borderColor: Colors.surfaceContainerHigh,
  },
  reasonOptionActive: { borderColor: Colors.primary, backgroundColor: `${Colors.primary}08` },
  radioOuter: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: Colors.outline, alignItems: 'center', justifyContent: 'center' },
  radioOuterActive: { borderColor: Colors.primary },
  radioInner: { width: 10, height: 10, borderRadius: 5, backgroundColor: Colors.primary },
  reasonText: { fontFamily: 'Inter_400Regular', fontSize: 14, color: Colors.onSurface },
  reasonTextActive: { fontFamily: 'Inter_600SemiBold', color: Colors.primary },
  notesInput: {
    backgroundColor: Colors.surfaceContainerLow, borderRadius: 12,
    padding: 14, minHeight: 90, marginBottom: 20,
    fontFamily: 'Inter_400Regular', fontSize: 14, color: Colors.onSurface,
    borderWidth: 1, borderColor: Colors.surfaceContainerHigh,
  },
  rejectActions: { gap: 10 },
  confirmRejectBtn: {
    backgroundColor: Colors.error, borderRadius: 999, height: 52,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
  },
  confirmRejectDisabled: { opacity: 0.4 },
  confirmRejectText: { fontFamily: 'Inter_600SemiBold', fontSize: 15, color: Colors.onError },
  backReviewBtn: { borderWidth: 1.5, borderColor: Colors.outline, borderRadius: 999, height: 48, alignItems: 'center', justifyContent: 'center' },
  backReviewText: { fontFamily: 'Inter_600SemiBold', fontSize: 15, color: Colors.onSurfaceVariant },

  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  scanQrBtn: {
    width: 38, height: 38, borderRadius: 10,
    backgroundColor: `${Colors.primary}12`,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: `${Colors.primary}30`,
  },

  photoCard: {
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: 16, overflow: 'hidden', marginBottom: 12,
    borderWidth: 1, borderColor: Colors.surfaceContainerHigh,
  },
  photoCardLabel: {
    fontFamily: 'Inter_600SemiBold', fontSize: 13, color: Colors.onSurfaceVariant,
    paddingHorizontal: 14, paddingTop: 12, paddingBottom: 8,
  },
  scanPhoto: { width: '100%', height: 220 },
  aiRow: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 14, paddingVertical: 10,
    backgroundColor: `${Colors.tertiaryFixedDim}22`,
  },
  aiText: { fontFamily: 'Inter_500Medium', fontSize: 12, color: Colors.tertiary },
});
