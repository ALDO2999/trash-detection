import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { WASTE_CATEGORIES } from '../../constants/mockData';
import OfficerService, { OfficerSubmission } from '../../services/officer.service';
import ScanService, { WasteType as ApiWasteType } from '../../services/scan.service';
import { getApiErrorMessage } from '../../hooks/useApiError';

const POINTS_PER_KG: Record<ApiWasteType, number> = {
  PLASTIC: 10, CARDBOARD: 8, METAL: 20, BATTERY: 50, CLOTHES: 15, SHOES: 25,
};

const API_TO_FRONTEND: Record<ApiWasteType, string> = {
  PLASTIC: 'Plastic', CARDBOARD: 'Cardboard',
  METAL: 'Metal', BATTERY: 'Battery', CLOTHES: 'Clothes', SHOES: 'Shoes',
};

const REJECT_REASONS = ['Sampah tidak sesuai', 'Sampah tercampur', 'QR kadaluarsa', 'Lainnya'];

function getCategory(wasteType: ApiWasteType) {
  return WASTE_CATEGORIES.find((c) => c.id === API_TO_FRONTEND[wasteType]) ?? WASTE_CATEGORIES[0];
}

type Step = 'detail' | 'reject' | 'success';

export default function VerifyScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [submission, setSubmission] = useState<OfficerSubmission | null>(null);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState<Step>('detail');
  const [actualWeight, setActualWeight] = useState('');
  const [rejectReason, setRejectReason] = useState('');
  const [rejectNotes, setRejectNotes] = useState('');
  const [approvedPts, setApprovedPts] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  useFocusEffect(useCallback(() => {
    let active = true;
    OfficerService.getSubmissionDetail(id).then((data) => {
      if (active) {
        setSubmission(data);
        setActualWeight(data.estimatedWeight ? String(data.estimatedWeight) : '');
        setLoading(false);
      }
    }).catch(() => {
      if (active) setLoading(false);
    });
    return () => { active = false; };
  }, [id]));

  const handleApprove = async () => {
    if (!submission) return;
    const weight = parseFloat(actualWeight);
    if (!weight || weight <= 0) {
      Alert.alert('Input Tidak Valid', 'Masukkan berat aktual yang valid.');
      return;
    }
    setSubmitting(true);
    try {
      await OfficerService.verifySubmission(submission.id, 'APPROVE', weight);
      setApprovedPts(Math.floor(weight * POINTS_PER_KG[submission.wasteType]));
      setStep('success');
    } catch (err) {
      Alert.alert('Gagal', getApiErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const handleRejectSubmit = async () => {
    if (!submission || !rejectReason) return;
    const notes = rejectNotes ? `${rejectReason}: ${rejectNotes}` : rejectReason;
    setSubmitting(true);
    try {
      await OfficerService.verifySubmission(submission.id, 'REJECT', undefined, notes);
      router.replace('/(officer)/submissions');
    } catch (err) {
      Alert.alert('Gagal', getApiErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.loadingBox}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Memuat pengajuan...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!submission) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={({ pressed }) => [styles.backBtn, pressed && styles.pressed]}>
            <MaterialIcons name="arrow-back" size={24} color={Colors.onSurface} />
          </Pressable>
          <Text style={styles.headerTitle}>Verifikasi</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.loadingBox}>
          <MaterialIcons name="error-outline" size={48} color={Colors.outlineVariant} />
          <Text style={styles.loadingText}>Pengajuan tidak ditemukan</Text>
          <Pressable style={({ pressed }) => [styles.backBtn2, pressed && styles.pressed]} onPress={() => router.back()}>
            <Text style={styles.backBtn2Text}>Kembali</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  if (submission.status !== 'MENUNGGU_VERIFIKASI') {
    const isApproved = submission.status === 'DISETUJUI';
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <Pressable onPress={() => router.replace('/(officer)/submissions')} style={({ pressed }) => [styles.backBtn, pressed && styles.pressed]}>
            <MaterialIcons name="arrow-back" size={24} color={Colors.onSurface} />
          </Pressable>
          <Text style={styles.headerTitle}>#{id.slice(0, 8)}</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.loadingBox}>
          <MaterialIcons
            name={isApproved ? 'check-circle' : 'cancel'}
            size={56}
            color={isApproved ? Colors.primary : Colors.error}
          />
          <Text style={styles.alreadyTitle}>
            Sudah {isApproved ? 'Disetujui' : 'Ditolak'}
          </Text>
          <Text style={styles.alreadySub}>
            Pengajuan ini sudah diverifikasi sebelumnya
          </Text>
          <Pressable
            style={({ pressed }) => [styles.backBtn2, pressed && styles.pressed]}
            onPress={() => router.replace('/(officer)/submissions')}
          >
            <Text style={styles.backBtn2Text}>Kembali ke Daftar</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const cat = getCategory(submission.wasteType);
  const weight = parseFloat(actualWeight) || 0;
  const estPts = submission.estimatedWeight ? Math.floor(submission.estimatedWeight * POINTS_PER_KG[submission.wasteType]) : 0;
  const actualPts = Math.floor(weight * POINTS_PER_KG[submission.wasteType]);
  const photoUrl = ScanService.getImageUrl(submission.imageUrl || submission.scanResult?.imageUrl);

  // ── Success ──
  if (step === 'success') {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.successScreen}>
          <View style={styles.successIcon}>
            <MaterialIcons name="check-circle" size={64} color={Colors.primary} />
          </View>
          <Text style={styles.successTitle}>Pengajuan Disetujui!</Text>
          <Text style={styles.successSub}>#{submission.id.slice(0, 8)} berhasil diverifikasi via QR</Text>
          <Text style={styles.successUser}>👤 {submission.user.name}</Text>
          <View style={styles.successStats}>
            <View style={styles.successStatItem}>
              <Text style={styles.successStatValue}>{parseFloat(actualWeight).toFixed(2)} kg</Text>
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
          <Pressable
            style={({ pressed }) => [styles.doneBtn, pressed && styles.pressed]}
            onPress={() => router.replace('/(officer)/submissions')}
          >
            <Text style={styles.doneBtnText}>Kembali ke Daftar</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  // ── Reject step ──
  if (step === 'reject') {
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
          <View style={styles.warningCard}>
            <MaterialIcons name="warning" size={18} color={Colors.error} />
            <Text style={styles.warningText}>Menolak pengajuan ini akan mengirim notifikasi kepada user.</Text>
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
          <Pressable
            style={({ pressed }) => [
              styles.confirmRejectBtn,
              (!rejectReason || submitting) && styles.confirmRejectDisabled,
              pressed && styles.pressed,
            ]}
            onPress={handleRejectSubmit}
            disabled={!rejectReason || submitting}
          >
            {submitting ? <ActivityIndicator color={Colors.onError} /> : (
              <>
                <MaterialIcons name="cancel" size={20} color={Colors.onError} />
                <Text style={styles.confirmRejectText}>Konfirmasi Penolakan</Text>
              </>
            )}
          </Pressable>
          <View style={{ height: 40 }} />
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ── Main detail ──
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.replace('/(officer)/submissions')} style={({ pressed }) => [styles.backBtn, pressed && styles.pressed]}>
          <MaterialIcons name="arrow-back" size={24} color={Colors.onSurface} />
        </Pressable>
        <Text style={styles.headerTitle}>#{submission.id.slice(0, 8)}</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {/* QR badge */}
        <View style={styles.qrBadge}>
          <MaterialIcons name="qr-code-scanner" size={16} color={Colors.primary} />
          <Text style={styles.qrBadgeText}>Dibuka via Scan QR</Text>
        </View>

        {/* Scan photo */}
        {photoUrl ? (
          <View style={styles.photoCard}>
            <Text style={styles.photoLabel}>Foto Scan User</Text>
            <Image source={{ uri: photoUrl }} style={styles.photo} resizeMode="cover" />
            {submission.scanResult && (
              <View style={styles.aiRow}>
                <MaterialIcons name="auto-awesome" size={14} color={Colors.tertiary} />
                <Text style={styles.aiText}>
                  AI: {submission.scanResult.predictedType} · {Math.round(submission.scanResult.confidence ?? 0)}% yakin
                </Text>
              </View>
            )}
          </View>
        ) : null}

        {/* User info */}
        <View style={styles.userInfoCard}>
          <MaterialIcons name="person" size={18} color={Colors.primary} />
          <Text style={styles.userInfoText}>{submission.user.name} · {submission.user.email}</Text>
        </View>

        {/* Waste type header */}
        <View style={[styles.typeHeader, { backgroundColor: cat.bgColor }]}>
          <MaterialIcons name={cat.icon as any} size={32} color={cat.color} />
          <View>
            <Text style={[styles.typeHeaderLabel, { color: cat.color }]}>{cat.label}</Text>
            <Text style={styles.typeHeaderSub}>
              {submission.estimatedWeight ? `Est. ${submission.estimatedWeight} kg` : 'Berat belum diisi'}
            </Text>
          </View>
        </View>

        {/* Weight input */}
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
            {submission.estimatedWeight ? (
              <View style={styles.estWeight}>
                <Text style={styles.estWeightLabel}>Estimasi</Text>
                <Text style={styles.estWeightValue}>{submission.estimatedWeight} kg</Text>
              </View>
            ) : null}
          </View>
        </View>

        {/* Points calc */}
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
            {submitting ? <ActivityIndicator color={Colors.onPrimary} /> : (
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
        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  pressed: { opacity: 0.7 },
  loadingBox: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 14, paddingHorizontal: 32 },
  loadingText: { fontFamily: 'Inter_400Regular', fontSize: 15, color: Colors.onSurfaceVariant, textAlign: 'center' },
  alreadyTitle: { fontFamily: 'PlusJakartaSans_700Bold', fontSize: 22, color: Colors.onSurface },
  alreadySub: { fontFamily: 'Inter_400Regular', fontSize: 14, color: Colors.onSurfaceVariant, textAlign: 'center' },
  backBtn2: {
    backgroundColor: Colors.primary, borderRadius: 999,
    paddingHorizontal: 28, paddingVertical: 12,
  },
  backBtn2Text: { fontFamily: 'Inter_600SemiBold', fontSize: 15, color: Colors.onPrimary },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: Colors.surfaceContainerHigh,
  },
  backBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontFamily: 'PlusJakartaSans_700Bold', fontSize: 20, color: Colors.onSurface },

  scroll: { paddingHorizontal: 20, paddingTop: 12, gap: 12 },

  qrBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: `${Colors.primary}12`, borderRadius: 999,
    paddingHorizontal: 14, paddingVertical: 6, alignSelf: 'flex-start',
  },
  qrBadgeText: { fontFamily: 'Inter_600SemiBold', fontSize: 12, color: Colors.primary },

  photoCard: {
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: 16, overflow: 'hidden',
    borderWidth: 1, borderColor: Colors.surfaceContainerHigh,
  },
  photoLabel: {
    fontFamily: 'Inter_600SemiBold', fontSize: 13, color: Colors.onSurfaceVariant,
    paddingHorizontal: 14, paddingTop: 12, paddingBottom: 8,
  },
  photo: { width: '100%', height: 220 },
  aiRow: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 14, paddingVertical: 10,
    backgroundColor: `${Colors.tertiaryFixedDim}22`,
  },
  aiText: { fontFamily: 'Inter_500Medium', fontSize: 12, color: Colors.tertiary },

  userInfoCard: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: `${Colors.primary}10`, borderRadius: 12,
    paddingHorizontal: 14, paddingVertical: 10,
  },
  userInfoText: { fontFamily: 'Inter_500Medium', fontSize: 13, color: Colors.onSurface, flex: 1 },

  typeHeader: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    borderRadius: 16, padding: 16,
  },
  typeHeaderLabel: { fontFamily: 'PlusJakartaSans_700Bold', fontSize: 20 },
  typeHeaderSub: { fontFamily: 'Inter_400Regular', fontSize: 13, color: Colors.onSurfaceVariant, marginTop: 2 },

  detailCard: {
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: 16, padding: 16,
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
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25, shadowRadius: 6, elevation: 4,
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
  doneBtn: {
    width: '100%', backgroundColor: Colors.primary, borderRadius: 999, height: 52,
    alignItems: 'center', justifyContent: 'center',
  },
  doneBtnText: { fontFamily: 'Inter_600SemiBold', fontSize: 15, color: Colors.onPrimary },

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
  confirmRejectBtn: {
    backgroundColor: Colors.error, borderRadius: 999, height: 52,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
  },
  confirmRejectDisabled: { opacity: 0.4 },
  confirmRejectText: { fontFamily: 'Inter_600SemiBold', fontSize: 15, color: Colors.onError },
});
