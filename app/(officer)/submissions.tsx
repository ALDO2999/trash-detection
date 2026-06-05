import { useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import {
  MOCK_OFFICER_QUEUE,
  getWasteCategory,
  calcPoints,
  Submission,
} from '../../constants/mockData';

type VerifyStep = 'list' | 'detail' | 'approve_success' | 'reject';

const REJECT_REASONS = [
  'Sampah tidak sesuai',
  'Sampah tercampur',
  'QR kadaluarsa',
  'Lainnya',
];

export default function SubmissionsScreen() {
  const [step, setStep] = useState<VerifyStep>('list');
  const [selected, setSelected] = useState<Submission | null>(null);
  const [actualWeight, setActualWeight] = useState('');
  const [rejectReason, setRejectReason] = useState('');
  const [rejectNotes, setRejectNotes] = useState('');

  const handleSelect = (sub: Submission) => {
    setSelected(sub);
    setActualWeight(String(sub.estimatedWeight));
    setStep('detail');
  };

  const handleApprove = () => setStep('approve_success');
  const handleRejectConfirm = () => setStep('reject');
  const handleRejectSubmit = () => {
    setStep('list');
    setSelected(null);
  };

  const handleBackToList = () => {
    setStep('list');
    setSelected(null);
    setActualWeight('');
    setRejectReason('');
    setRejectNotes('');
  };

  if (step === 'approve_success' && selected) {
    const cat = getWasteCategory(selected.wasteType);
    const weight = parseFloat(actualWeight) || selected.estimatedWeight;
    const pts = calcPoints(selected.wasteType, weight);
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.successScreen}>
          <View style={styles.successIcon}>
            <MaterialIcons name="check-circle" size={64} color={Colors.primary} />
          </View>
          <Text style={styles.successTitle}>Pengajuan Disetujui!</Text>
          <Text style={styles.successSub}>#{selected.id} telah berhasil diverifikasi</Text>

          <View style={styles.successStats}>
            <View style={styles.successStatItem}>
              <Text style={styles.successStatValue}>{weight.toFixed(2)} kg</Text>
              <Text style={styles.successStatLabel}>Berat Aktual</Text>
            </View>
            <View style={styles.successStatDivider} />
            <View style={styles.successStatItem}>
              <Text style={[styles.successStatValue, { color: Colors.primary }]}>{pts} pts</Text>
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

  if (step === 'reject' && selected) {
    const cat = getWasteCategory(selected.wasteType);
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
          {/* Submission info */}
          <View style={styles.rejectInfoCard}>
            <View style={[styles.typeIcon, { backgroundColor: cat.bgColor }]}>
              <MaterialIcons name={cat.icon as any} size={24} color={cat.color} />
            </View>
            <View>
              <Text style={styles.cardId}>#{selected.id}</Text>
              <Text style={styles.cardMeta}>{cat.label} · {selected.estimatedWeight} kg est.</Text>
            </View>
          </View>

          {/* Warning */}
          <View style={styles.warningCard}>
            <MaterialIcons name="warning" size={18} color={Colors.error} />
            <Text style={styles.warningText}>
              Menolak pengajuan ini akan mengirim notifikasi kepada user secara langsung.
            </Text>
          </View>

          {/* Reasons */}
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

          {/* Notes */}
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
                !rejectReason && styles.confirmRejectDisabled,
                pressed && styles.pressed,
              ]}
              onPress={handleRejectSubmit}
              disabled={!rejectReason}
            >
              <MaterialIcons name="cancel" size={20} color={Colors.onError} />
              <Text style={styles.confirmRejectText}>Konfirmasi Penolakan</Text>
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

  if (step === 'detail' && selected) {
    const cat = getWasteCategory(selected.wasteType);
    const weight = parseFloat(actualWeight) || selected.estimatedWeight;
    const estPts = calcPoints(selected.wasteType, selected.estimatedWeight);
    const actualPts = calcPoints(selected.wasteType, weight);
    const diff = actualPts - estPts;

    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <Pressable onPress={handleBackToList} style={({ pressed }) => pressed && styles.pressed}>
            <MaterialIcons name="arrow-back" size={24} color={Colors.onSurface} />
          </Pressable>
          <Text style={styles.headerTitle}>#{selected.id}</Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView contentContainerStyle={styles.scroll}>
          {/* Waste type */}
          <View style={[styles.typeHeader, { backgroundColor: cat.bgColor }]}>
            <MaterialIcons name={cat.icon as any} size={32} color={cat.color} />
            <View>
              <Text style={[styles.typeHeaderLabel, { color: cat.color }]}>{cat.label}</Text>
              <Text style={styles.typeHeaderSub}>Est. {selected.estimatedWeight} kg · {selected.estimatedQty} item</Text>
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
              <View style={styles.estWeight}>
                <Text style={styles.estWeightLabel}>Estimasi AI</Text>
                <Text style={styles.estWeightValue}>{selected.estimatedWeight} kg</Text>
              </View>
            </View>
            {Math.abs(weight - selected.estimatedWeight) / selected.estimatedWeight > 0.15 && (
              <View style={styles.correctionWarning}>
                <MaterialIcons name="warning" size={14} color={Colors.tertiary} />
                <Text style={styles.correctionWarningText}>
                  Koreksi melebihi 15% dari estimasi AI
                </Text>
              </View>
            )}
          </View>

          {/* Point Calculation */}
          <View style={styles.detailCard}>
            <Text style={styles.detailCardTitle}>Kalkulasi Poin</Text>
            <View style={styles.calcRow}>
              <Text style={styles.calcLabel}>Estimasi (AI)</Text>
              <Text style={styles.calcValue}>{estPts} pts</Text>
            </View>
            <View style={styles.calcRow}>
              <Text style={styles.calcLabel}>Aktual</Text>
              <Text style={[styles.calcValue, styles.calcValueHighlight]}>{actualPts} pts</Text>
            </View>
            {diff !== 0 && (
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
              style={({ pressed }) => [styles.approveBtn, pressed && styles.pressed]}
              onPress={handleApprove}
            >
              <MaterialIcons name="check-circle" size={20} color={Colors.onPrimary} />
              <Text style={styles.approveBtnText}>Setujui Pengajuan</Text>
            </Pressable>
            <Pressable
              style={({ pressed }) => [styles.rejectBtn, pressed && styles.pressed]}
              onPress={handleRejectConfirm}
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
        <View style={styles.pendingCount}>
          <Text style={styles.pendingCountText}>{MOCK_OFFICER_QUEUE.length} menunggu</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {MOCK_OFFICER_QUEUE.map((sub) => {
          const cat = getWasteCategory(sub.wasteType);
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
                <Text style={styles.cardId}>#{sub.id}</Text>
                <Text style={styles.cardMeta}>
                  {cat.label} · {sub.estimatedWeight} kg · {sub.estimatedQty} item
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
        })}
        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  pressed: { opacity: 0.7 },
  scroll: { paddingHorizontal: 20, paddingTop: 8, gap: 12 },

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

  // Detail view
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
  weightInputText: {
    flex: 1, fontFamily: 'PlusJakartaSans_700Bold', fontSize: 22, color: Colors.onSurface,
  },
  weightUnit: { fontFamily: 'Inter_500Medium', fontSize: 16, color: Colors.onSurfaceVariant },
  estWeight: { alignItems: 'center' },
  estWeightLabel: { fontFamily: 'Inter_400Regular', fontSize: 11, color: Colors.onSurfaceVariant },
  estWeightValue: { fontFamily: 'Inter_600SemiBold', fontSize: 15, color: Colors.onSurface },
  correctionWarning: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: `${Colors.tertiaryFixedDim}22`, borderRadius: 8,
    paddingHorizontal: 12, paddingVertical: 8,
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

  // Success
  successScreen: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32, gap: 16 },
  successIcon: { width: 100, height: 100, borderRadius: 50, backgroundColor: `${Colors.primary}15`, alignItems: 'center', justifyContent: 'center' },
  successTitle: { fontFamily: 'PlusJakartaSans_700Bold', fontSize: 26, color: Colors.onSurface },
  successSub: { fontFamily: 'Inter_400Regular', fontSize: 14, color: Colors.onSurfaceVariant },
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

  // Reject
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
});
