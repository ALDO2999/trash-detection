import { useState } from 'react';
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
import { WASTE_CATEGORIES, WasteType, calcPoints } from '../../constants/mockData';

type ScanState = 'idle' | 'scanning' | 'result';

const DUMMY_DETECT_RESULTS: { type: WasteType; confidence: number }[] = [
  { type: 'Plastic', confidence: 92 },
  { type: 'Paper', confidence: 75 },
  { type: 'Metal', confidence: 61 },
];

export default function ScanScreen() {
  const [state, setState] = useState<ScanState>('idle');
  const [detected, setDetected] = useState<WasteType>('Plastic');
  const [confidence, setConfidence] = useState(92);
  const [qty, setQty] = useState(1);

  const handleScan = () => {
    setState('scanning');
    setTimeout(() => {
      const result = DUMMY_DETECT_RESULTS[Math.floor(Math.random() * DUMMY_DETECT_RESULTS.length)];
      setDetected(result.type);
      setConfidence(result.confidence);
      setState('result');
    }, 2000);
  };

  const handleReset = () => {
    setState('idle');
    setQty(1);
  };

  const handleSubmitClaim = () => {
    setState('idle');
    setQty(1);
    router.push('/(user)/claims');
  };

  const detectedCat = WASTE_CATEGORIES.find((c) => c.id === detected)!;
  const estimatedWeight = qty * 0.3;
  const estimatedPoints = calcPoints(detected, estimatedWeight);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Scan Sampah</Text>
        <Text style={styles.headerSubtitle}>Arahkan kamera ke sampah yang ingin diidentifikasi</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Camera Area */}
        <View style={styles.cameraContainer}>
          {state === 'idle' && (
            <View style={styles.cameraIdle}>
              <View style={styles.scanFrame}>
                <View style={[styles.corner, styles.cornerTL]} />
                <View style={[styles.corner, styles.cornerTR]} />
                <View style={[styles.corner, styles.cornerBL]} />
                <View style={[styles.corner, styles.cornerBR]} />
                <MaterialIcons name="document-scanner" size={64} color={`${Colors.primary}66`} />
                <Text style={styles.cameraHint}>Tekan tombol untuk scan</Text>
              </View>
            </View>
          )}

          {state === 'scanning' && (
            <View style={styles.cameraScanning}>
              <View style={styles.scanFrame}>
                <View style={[styles.corner, styles.cornerTL]} />
                <View style={[styles.corner, styles.cornerTR]} />
                <View style={[styles.corner, styles.cornerBL]} />
                <View style={[styles.corner, styles.cornerBR]} />
                <View style={styles.scanLine} />
                <Text style={styles.scanningText}>Menganalisa...</Text>
              </View>
            </View>
          )}

          {state === 'result' && (
            <View style={styles.cameraResult}>
              <View style={[styles.detectedBadge, { backgroundColor: detectedCat.bgColor }]}>
                <MaterialIcons name={detectedCat.icon as any} size={48} color={detectedCat.color} />
              </View>
              <View style={styles.confidenceRow}>
                <MaterialIcons name="verified" size={16} color={Colors.primary} />
                <Text style={styles.confidenceText}>Keyakinan AI: {confidence}%</Text>
              </View>
            </View>
          )}
        </View>

        {/* Result / AI info */}
        {state === 'result' ? (
          <View style={styles.resultCard}>
            <Text style={styles.resultTitle}>Hasil Deteksi</Text>

            <View style={[styles.detectedChip, { backgroundColor: detectedCat.bgColor }]}>
              <MaterialIcons name={detectedCat.icon as any} size={20} color={detectedCat.color} />
              <Text style={[styles.detectedLabel, { color: detectedCat.color }]}>
                {detectedCat.label}
              </Text>
            </View>

            {/* Qty selector */}
            <View style={styles.qtyRow}>
              <Text style={styles.qtyLabel}>Jumlah Estimasi</Text>
              <View style={styles.qtyStepper}>
                <Pressable
                  style={styles.stepBtn}
                  onPress={() => setQty(Math.max(1, qty - 1))}
                >
                  <MaterialIcons name="remove" size={18} color={Colors.onSurface} />
                </Pressable>
                <Text style={styles.qtyValue}>{qty}</Text>
                <Pressable style={styles.stepBtn} onPress={() => setQty(qty + 1)}>
                  <MaterialIcons name="add" size={18} color={Colors.onSurface} />
                </Pressable>
              </View>
            </View>

            {/* Estimate */}
            <View style={styles.estimateCard}>
              <View style={styles.estimateRow}>
                <Text style={styles.estimateLabel}>Estimasi Berat</Text>
                <Text style={styles.estimateValue}>{estimatedWeight.toFixed(1)} kg</Text>
              </View>
              <View style={styles.estimateRow}>
                <Text style={styles.estimateLabel}>Nilai Poin/kg</Text>
                <Text style={styles.estimateValue}>{detectedCat.pointsPerKg} pts</Text>
              </View>
              <View style={[styles.estimateRow, styles.estimateTotalRow]}>
                <Text style={styles.estimateTotalLabel}>Estimasi Poin</Text>
                <Text style={styles.estimateTotalValue}>~{estimatedPoints} pts</Text>
              </View>
            </View>

            <Text style={styles.disclaimer}>
              * Poin final dihitung berdasarkan berat aktual setelah verifikasi petugas.
            </Text>

            <View style={styles.resultActions}>
              <Pressable
                style={({ pressed }) => [styles.submitBtn, pressed && styles.pressed]}
                onPress={handleSubmitClaim}
              >
                <MaterialIcons name="assignment-turned-in" size={20} color={Colors.onPrimary} />
                <Text style={styles.submitBtnText}>Ajukan Klaim</Text>
              </Pressable>
              <Pressable
                style={({ pressed }) => [styles.retryBtn, pressed && styles.pressed]}
                onPress={handleReset}
              >
                <MaterialIcons name="replay" size={20} color={Colors.primary} />
                <Text style={styles.retryBtnText}>Scan Ulang</Text>
              </Pressable>
            </View>
          </View>
        ) : (
          /* Category list hint */
          <View style={styles.categoryHints}>
            <Text style={styles.categoryHintsTitle}>Jenis Sampah yang Didukung</Text>
            <View style={styles.categoryGrid}>
              {WASTE_CATEGORIES.map((cat) => (
                <View key={cat.id} style={[styles.categoryChip, { backgroundColor: cat.bgColor }]}>
                  <MaterialIcons name={cat.icon as any} size={16} color={cat.color} />
                  <Text style={[styles.categoryChipText, { color: cat.color }]}>{cat.label}</Text>
                  <Text style={[styles.categoryChipPts, { color: cat.color }]}>
                    {cat.pointsPerKg} pts/kg
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}
      </ScrollView>

      {/* Scan Button */}
      {state !== 'result' && (
        <View style={styles.scanBtnContainer}>
          <Pressable
            style={({ pressed }) => [
              styles.scanBtn,
              state === 'scanning' && styles.scanBtnDisabled,
              pressed && styles.pressed,
            ]}
            onPress={handleScan}
            disabled={state === 'scanning'}
          >
            <MaterialIcons
              name={state === 'scanning' ? 'hourglass-empty' : 'camera-alt'}
              size={28}
              color={Colors.onPrimary}
            />
            <Text style={styles.scanBtnText}>
              {state === 'scanning' ? 'Menganalisa...' : 'Mulai Scan'}
            </Text>
          </Pressable>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scroll: { paddingHorizontal: 20, paddingBottom: 120 },

  header: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 12 },
  headerTitle: { fontFamily: 'PlusJakartaSans_700Bold', fontSize: 22, color: Colors.onSurface },
  headerSubtitle: { fontFamily: 'Inter_400Regular', fontSize: 14, color: Colors.onSurfaceVariant, marginTop: 2 },

  // Camera area
  cameraContainer: {
    width: '100%',
    aspectRatio: 4 / 3,
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 20,
    backgroundColor: '#1a1a2e',
  },
  cameraIdle: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  cameraScanning: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  cameraResult: {
    flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16,
    backgroundColor: Colors.surfaceContainerLow,
  },
  scanFrame: {
    width: 220, height: 220,
    alignItems: 'center', justifyContent: 'center',
    position: 'relative',
  },
  corner: {
    position: 'absolute', width: 24, height: 24,
    borderColor: Colors.primary, borderWidth: 3,
  },
  cornerTL: { top: 0, left: 0, borderRightWidth: 0, borderBottomWidth: 0 },
  cornerTR: { top: 0, right: 0, borderLeftWidth: 0, borderBottomWidth: 0 },
  cornerBL: { bottom: 0, left: 0, borderRightWidth: 0, borderTopWidth: 0 },
  cornerBR: { bottom: 0, right: 0, borderLeftWidth: 0, borderTopWidth: 0 },
  cameraHint: { fontFamily: 'Inter_400Regular', fontSize: 13, color: `${Colors.onPrimary}80`, marginTop: 12 },
  scanLine: {
    position: 'absolute', left: 0, right: 0, height: 2,
    backgroundColor: Colors.primary, top: '50%',
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8, shadowRadius: 4,
  },
  scanningText: { fontFamily: 'Inter_600SemiBold', fontSize: 14, color: Colors.onPrimary, marginTop: 12 },
  detectedBadge: {
    width: 100, height: 100, borderRadius: 50,
    alignItems: 'center', justifyContent: 'center',
  },
  confidenceRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  confidenceText: { fontFamily: 'Inter_600SemiBold', fontSize: 14, color: Colors.primary },

  // Result Card
  resultCard: {
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: 20, padding: 20,
    borderWidth: 1, borderColor: Colors.surfaceContainerHigh,
    gap: 16, marginBottom: 20,
  },
  resultTitle: { fontFamily: 'PlusJakartaSans_700Bold', fontSize: 18, color: Colors.onSurface },
  detectedChip: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingHorizontal: 16, paddingVertical: 10,
    borderRadius: 12, alignSelf: 'flex-start',
  },
  detectedLabel: { fontFamily: 'Inter_600SemiBold', fontSize: 16 },
  qtyRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  qtyLabel: { fontFamily: 'Inter_500Medium', fontSize: 14, color: Colors.onSurface },
  qtyStepper: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  stepBtn: {
    width: 32, height: 32, borderRadius: 8,
    backgroundColor: Colors.surfaceContainerHigh,
    alignItems: 'center', justifyContent: 'center',
  },
  qtyValue: { fontFamily: 'PlusJakartaSans_700Bold', fontSize: 18, color: Colors.onSurface, minWidth: 28, textAlign: 'center' },
  estimateCard: {
    backgroundColor: Colors.surfaceContainerLow,
    borderRadius: 14, padding: 16, gap: 8,
  },
  estimateRow: { flexDirection: 'row', justifyContent: 'space-between' },
  estimateLabel: { fontFamily: 'Inter_400Regular', fontSize: 14, color: Colors.onSurfaceVariant },
  estimateValue: { fontFamily: 'Inter_500Medium', fontSize: 14, color: Colors.onSurface },
  estimateTotalRow: {
    borderTopWidth: 1, borderTopColor: Colors.outlineVariant,
    paddingTop: 8, marginTop: 4,
  },
  estimateTotalLabel: { fontFamily: 'Inter_600SemiBold', fontSize: 15, color: Colors.onSurface },
  estimateTotalValue: { fontFamily: 'PlusJakartaSans_700Bold', fontSize: 16, color: Colors.primary },
  disclaimer: { fontFamily: 'Inter_400Regular', fontSize: 12, color: Colors.onSurfaceVariant, lineHeight: 17 },
  resultActions: { gap: 10 },
  submitBtn: {
    backgroundColor: Colors.primary, borderRadius: 999, height: 52,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25, shadowRadius: 6, elevation: 3,
  },
  submitBtnText: { fontFamily: 'Inter_600SemiBold', fontSize: 15, color: Colors.onPrimary },
  retryBtn: {
    borderWidth: 1.5, borderColor: Colors.primary, borderRadius: 999,
    height: 48, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
  },
  retryBtnText: { fontFamily: 'Inter_600SemiBold', fontSize: 15, color: Colors.primary },
  pressed: { opacity: 0.7 },

  // Category hints
  categoryHints: { gap: 12 },
  categoryHintsTitle: { fontFamily: 'PlusJakartaSans_700Bold', fontSize: 16, color: Colors.onSurface },
  categoryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  categoryChip: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999,
  },
  categoryChipText: { fontFamily: 'Inter_600SemiBold', fontSize: 13 },
  categoryChipPts: { fontFamily: 'Inter_400Regular', fontSize: 11, opacity: 0.8 },

  // Scan button
  scanBtnContainer: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    paddingHorizontal: 20, paddingBottom: 28, paddingTop: 12,
    backgroundColor: Colors.background,
  },
  scanBtn: {
    backgroundColor: Colors.primary, borderRadius: 999,
    height: 58, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 10, elevation: 5,
  },
  scanBtnDisabled: { opacity: 0.6 },
  scanBtnText: { fontFamily: 'Inter_600SemiBold', fontSize: 16, color: Colors.onPrimary },
});
