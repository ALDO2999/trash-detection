import { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Image,
  Linking,
  Modal,
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
import * as ImagePicker from 'expo-image-picker';
import { CameraView, useCameraPermissions } from 'expo-camera';
import QRCode from 'react-native-qrcode-svg';
import { Colors } from '../../constants/colors';
import { WASTE_CATEGORIES, WasteType, calcPoints } from '../../constants/mockData';
import ScanService, { ScanResult, WasteType as ApiWasteType } from '../../services/scan.service';
import SubmissionService from '../../services/submission.service';
import WasteBankService, { WasteBank } from '../../services/wasteBank.service';
import { getApiErrorMessage } from '../../hooks/useApiError';

type ScanStep = 'camera' | 'analyzing' | 'review' | 'summary' | 'qr';

interface ScannedItem {
  id: string;
  type: WasteType;
  apiWasteType: ApiWasteType;
  scanResultId: string;
  confidence: number;
  imageUri: string;
}

// Map API WasteType ke frontend WasteType (mockData format)
const API_TO_FRONTEND: Record<ApiWasteType, WasteType> = {
  PLASTIC: 'Plastic',
  CARDBOARD: 'Cardboard',
  METAL: 'Metal',
  BATTERY: 'Battery',
  CLOTHES: 'Clothes',
  SHOES: 'Shoes',
};

// Map frontend WasteType → API WasteType (untuk koreksi kategori manual)
const FRONTEND_TO_API: Record<WasteType, ApiWasteType> = {
  Plastic: 'PLASTIC',
  Cardboard: 'CARDBOARD',
  Metal: 'METAL',
  Battery: 'BATTERY',
  Clothes: 'CLOTHES',
  Shoes: 'SHOES',
};

const SORTING_TIPS = [
  'Pastikan hanya ada satu jenis sampah dominan dalam bingkai agar AI lebih akurat.',
  'Gunakan pencahayaan yang cukup dan latar belakang polos.',
  'Bersihkan sampah dari sisa makanan/cairan sebelum difoto.',
  'Untuk botol plastik, remas terlebih dahulu agar bentuknya jelas.',
  'Jika hasil deteksi kurang tepat, gunakan "Ganti Kategori" untuk koreksi manual.',
];

export default function ScanScreen() {
  const [step, setStep] = useState<ScanStep>('camera');
  const [progress, setProgress] = useState(0);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [selectedImageUri, setSelectedImageUri] = useState<string | null>(null);
  const [scannedItems, setScannedItems] = useState<ScannedItem[]>([]);
  const [submittedId, setSubmittedId] = useState<string | null>(null);
  const [calcWeight, setCalcWeight] = useState('1');
  const [submitting, setSubmitting] = useState(false);
  const [facing, setFacing] = useState<'front' | 'back'>('back');
  const [overrideType, setOverrideType] = useState<WasteType | null>(null);
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [wasteBanks, setWasteBanks] = useState<WasteBank[]>([]);
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);

  useEffect(() => {
    WasteBankService.getAll().then(setWasteBanks).catch(() => {});
  }, []);

  const showGuide = () => {
    Alert.alert(
      'Panduan Scan Sampah',
      SORTING_TIPS.map((t, i) => `${i + 1}. ${t}`).join('\n\n'),
      [{ text: 'Mengerti' }],
    );
  };

  const openMaps = (bank: WasteBank) => {
    const url = `https://www.google.com/maps/search/?api=1&query=${bank.latitude},${bank.longitude}`;
    Linking.openURL(url).catch(() => Alert.alert('Gagal', 'Tidak dapat membuka peta.'));
  };

  const takePhoto = async () => {
    if (!cameraRef.current) return;
    try {
      const photo = await cameraRef.current.takePictureAsync({ quality: 0.8 });
      if (photo?.uri) await uploadAndAnalyze(photo.uri);
    } catch {
      Alert.alert('Gagal', 'Tidak dapat mengambil foto. Coba lagi.');
    }
  };

  const pickAndScan = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Izin Diperlukan', 'Izinkan akses galeri untuk memilih foto sampah.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.8,
    });
    if (result.canceled || !result.assets[0]) return;
    await uploadAndAnalyze(result.assets[0].uri, result.assets[0].mimeType);
  };

  const uploadAndAnalyze = async (uri: string, mimeType?: string) => {
    setSelectedImageUri(uri);
    setStep('analyzing');
    setProgress(0);

    // Progress animasi sementara upload berlangsung
    let p = 0;
    const interval = setInterval(() => {
      p += Math.random() * 12 + 5;
      if (p >= 90) { clearInterval(interval); p = 90; }
      setProgress(Math.min(Math.round(p), 90));
    }, 150);

    try {
      const result = await ScanService.scanImage(uri, mimeType ?? 'image/jpeg');
      clearInterval(interval);
      setProgress(100);
      setScanResult(result);
      setOverrideType(null);
      setTimeout(() => setStep('review'), 400);
    } catch (err) {
      clearInterval(interval);
      setStep('camera');
      Alert.alert('Scan Gagal', getApiErrorMessage(err));
    }
  };

  const handleRetake = () => {
    setScanResult(null);
    setSelectedImageUri(null);
    setOverrideType(null);
    setStep('camera');
  };

  const addCurrentItem = () => {
    if (!scanResult) return;
    const frontendType = overrideType ?? API_TO_FRONTEND[scanResult.predictedType];
    const newItem: ScannedItem = {
      id: Date.now().toString(),
      type: frontendType,
      apiWasteType: FRONTEND_TO_API[frontendType],
      scanResultId: scanResult.scanResultId,
      confidence: scanResult.confidence,
      imageUri: selectedImageUri ?? '',
    };
    setScannedItems((prev) => [...prev, newItem]);
  };

  const handleAddCategory = () => {
    addCurrentItem();
    setScanResult(null);
    setSelectedImageUri(null);
    setOverrideType(null);
    setStep('camera');
  };

  const handleGoToSummary = () => {
    addCurrentItem();
    setStep('summary');
  };

  const handleRemoveItem = (id: string) => {
    const item = scannedItems.find((it) => it.id === id);
    Alert.alert(
      'Hapus Barang?',
      `"${item?.type ?? 'barang ini'}" akan dihapus dari batch.`,
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Hapus',
          style: 'destructive',
          onPress: () => setScannedItems((prev) => prev.filter((it) => it.id !== id)),
        },
      ]
    );
  };

  const handleSubmit = async () => {
    if (scannedItems.length === 0 || submitting) return;
    setSubmitting(true);
    try {
      // Buat submission untuk item pertama (satu submission per scan)
      const first = scannedItems[0];
      const submission = await SubmissionService.create(
        first.scanResultId,
        first.apiWasteType,
        parseFloat(calcWeight) || undefined,
      );
      setSubmittedId(submission.id);
      setStep('qr');
    } catch (err) {
      Alert.alert('Gagal', getApiErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const handleBackToHome = () => {
    setScannedItems([]);
    setScanResult(null);
    setSelectedImageUri(null);
    setSubmittedId(null);
    setStep('camera');
    router.replace('/(user)');
  };

  const effectiveType: WasteType = scanResult
    ? (overrideType ?? API_TO_FRONTEND[scanResult.predictedType])
    : WASTE_CATEGORIES[0].id;
  const detectedCat = WASTE_CATEGORIES.find((c) => c.id === effectiveType)!;
  const isOverridden = overrideType !== null;
  const detectedConfidence = scanResult?.confidence ?? 0;
  const calcResult = scanResult
    ? calcPoints(effectiveType, parseFloat(calcWeight) || 0)
    : 0;

  const confColor =
    detectedConfidence >= 85 ? Colors.primary
    : detectedConfidence >= 70 ? Colors.tertiary
    : Colors.error;
  const confLabel =
    detectedConfidence >= 85 ? 'Tinggi'
    : detectedConfidence >= 70 ? 'Sedang'
    : 'Rendah';

  // ─── CAMERA ───────────────────────────────────────────────────────────────
  if (step === 'camera') {
    // Permission belum diminta
    if (!cameraPermission) {
      return <View style={styles.cameraScreen} />;
    }

    // Permission ditolak — tampilkan screen minta izin
    if (!cameraPermission.granted) {
      return (
        <View style={[styles.cameraScreen, { alignItems: 'center', justifyContent: 'center', gap: 20, padding: 32 }]}>
          <MaterialIcons name="camera-alt" size={60} color="rgba(255,255,255,0.6)" />
          <Text style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 20, color: '#fff', textAlign: 'center' }}>
            Izin Kamera Diperlukan
          </Text>
          <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 14, color: 'rgba(255,255,255,0.7)', textAlign: 'center', lineHeight: 21 }}>
            Waste Sort AI memerlukan akses kamera untuk mendeteksi jenis sampah secara otomatis menggunakan AI.
          </Text>
          <Pressable
            onPress={requestCameraPermission}
            style={({ pressed }) => [styles.permissionBtn, pressed && { opacity: 0.8 }]}
          >
            <Text style={styles.permissionBtnText}>Izinkan Akses Kamera</Text>
          </Pressable>
          <Pressable onPress={() => router.replace('/(user)')}>
            <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 14, color: 'rgba(255,255,255,0.5)', marginTop: 4 }}>
              Kembali
            </Text>
          </Pressable>
        </View>
      );
    }

    return (
      <View style={styles.cameraScreen}>
        {/* Live camera preview */}
        <CameraView
          ref={cameraRef}
          style={StyleSheet.absoluteFill}
          facing={facing}
        />

        {/* Top bar */}
        <SafeAreaView edges={['top']} style={styles.cameraTopBar}>
          <Pressable
            onPress={() => router.replace('/(user)')}
            style={({ pressed }) => [styles.cameraIconBtn, pressed && { opacity: 0.6 }]}
          >
            <MaterialIcons name="close" size={24} color="#fff" />
          </Pressable>

          <View style={styles.aiReadyBadge}>
            <MaterialIcons name="document-scanner" size={14} color="#fff" />
            <View style={styles.aiDot} />
            <Text style={styles.aiReadyText}>AI READY</Text>
          </View>

          <Pressable
            onPress={() => setFacing((f) => (f === 'back' ? 'front' : 'back'))}
            style={({ pressed }) => [styles.cameraIconBtn, pressed && { opacity: 0.6 }]}
          >
            <MaterialIcons name="flip-camera-android" size={24} color="#fff" />
          </Pressable>
        </SafeAreaView>

        {/* Viewfinder */}
        <View style={styles.viewfinder}>
          <View style={styles.scanFrame}>
            <View style={[styles.corner, styles.cornerTL]} />
            <View style={[styles.corner, styles.cornerTR]} />
            <View style={[styles.corner, styles.cornerBL]} />
            <View style={[styles.corner, styles.cornerBR]} />
          </View>
          <Text style={styles.alignHint}>Posisikan sampah di dalam bingkai, lalu ambil foto</Text>
        </View>

        {/* Bottom controls */}
        <SafeAreaView edges={['bottom']} style={styles.cameraBottom}>
          {/* Auto-detect indicator */}
          <View style={styles.autoDetectRow}>
            <View style={styles.autoDetectChip}>
              <MaterialIcons name="auto-awesome" size={14} color="#fff" />
              <Text style={styles.autoDetectText}>Deteksi Otomatis oleh AI</Text>
            </View>
          </View>

          {/* Capture row */}
          <View style={styles.captureRow}>
            <Pressable
              onPress={pickAndScan}
              style={({ pressed }) => [styles.captureSecondaryBtn, pressed && { opacity: 0.6 }]}
            >
              <MaterialIcons name="photo-library" size={26} color="#fff" />
              <Text style={styles.captureSecondaryText}>Galeri</Text>
            </Pressable>

            <Pressable
              onPress={takePhoto}
              style={({ pressed }) => [styles.captureBtn, pressed && { transform: [{ scale: 0.94 }] }]}
            >
              <View style={styles.captureBtnInner} />
            </Pressable>

            <Pressable
              onPress={showGuide}
              style={({ pressed }) => [styles.captureSecondaryBtn, pressed && { opacity: 0.6 }]}
            >
              <MaterialIcons name="help-outline" size={26} color="#fff" />
              <Text style={styles.captureSecondaryText}>Panduan</Text>
            </Pressable>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  // ─── ANALYZING ────────────────────────────────────────────────────────────
  if (step === 'analyzing') {
    return (
      <View style={styles.analyzingScreen}>
        <SafeAreaView edges={['top']} style={styles.analyzingTop}>
          <Text style={styles.analyzingPct}>{progress}%</Text>
          <View style={styles.avatarSmall}>
            <MaterialIcons name="recycling" size={22} color={Colors.onPrimary} />
          </View>
        </SafeAreaView>

        <View style={styles.analyzingCenter}>
          <View style={styles.analyzingCard}>
            <View style={styles.analyzingIcon}>
              <MaterialIcons name="recycling" size={36} color={Colors.onPrimaryContainer} />
            </View>
            <Text style={styles.analyzingTitle}>Menganalisis Sampah...</Text>
            <View style={styles.aiVisionBadge}>
              <MaterialIcons name="visibility" size={12} color={Colors.primary} />
              <Text style={styles.aiVisionText}>AI Vision Aktif</Text>
            </View>

            <View style={styles.progressSection}>
              <View style={styles.progressLabelRow}>
                <Text style={styles.progressLabel}>Kemajuan Analisis</Text>
                <Text style={styles.progressPct}>{progress}%</Text>
              </View>
              <View style={styles.progressTrack}>
                <View style={[styles.progressFill, { width: `${progress}%` }]} />
              </View>
            </View>

            <View style={styles.analyzingStats}>
              <View style={styles.analyzingStat}>
                <MaterialIcons name="check-circle" size={16} color={Colors.primary} />
                <Text style={styles.analyzingStatLabel}>Akurasi</Text>
                <Text style={styles.analyzingStatValue}>Tinggi</Text>
              </View>
              <View style={styles.analyzingDivider} />
              <View style={styles.analyzingStat}>
                <MaterialIcons name="category" size={16} color={Colors.secondary} />
                <Text style={styles.analyzingStatLabel}>Material</Text>
                <Text style={styles.analyzingStatValue}>
                  {progress > 50 && scanResult ? API_TO_FRONTEND[scanResult.predictedType] : '...'}
                </Text>
              </View>
            </View>

            <Text style={styles.analyzingFooter}>
              Tunggu sebentar, kami sedang menentukan jalur daur ulang terbaik untuk objek ini.
            </Text>
          </View>
        </View>
      </View>
    );
  }

  // ─── REVIEW ───────────────────────────────────────────────────────────────
  if (step === 'review') {
    return (
      <SafeAreaView style={styles.reviewScreen} edges={['top', 'bottom']}>
        <View style={styles.reviewHeader}>
          <Pressable
            onPress={() => setStep('camera')}
            style={({ pressed }) => [styles.reviewBackBtn, pressed && { opacity: 0.6 }]}
          >
            <MaterialIcons name="arrow-back" size={22} color={Colors.onSurface} />
          </Pressable>
          <Text style={styles.reviewHeaderTitle}>EcoScan AI</Text>
          <View style={{ width: 36 }} />
        </View>

        <ScrollView contentContainerStyle={styles.reviewScroll} showsVerticalScrollIndicator={false}>
          {/* Detected badge */}
          <View style={styles.reviewDetectedBadge}>
            <MaterialIcons name="check-circle" size={8} color={Colors.primary} />
            <Text style={styles.reviewDetectedText}>Item berhasil dideteksi</Text>
          </View>

          {/* Image */}
          <View style={styles.reviewImageBox}>
            {selectedImageUri ? (
              <Image source={{ uri: selectedImageUri }} style={[styles.reviewImagePlaceholder, { resizeMode: 'cover' }]} />
            ) : (
              <View style={[styles.reviewImagePlaceholder, { backgroundColor: detectedCat.bgColor }]}>
                <MaterialIcons name={detectedCat.icon as any} size={80} color={detectedCat.color} />
              </View>
            )}
            <View style={styles.aiVerifiedBadge}>
              <MaterialIcons name="verified" size={12} color="#fff" />
              <Text style={styles.aiVerifiedText}>AI Terverifikasi</Text>
            </View>
          </View>

          {/* Item info */}
          <Text style={styles.reviewItemName}>{detectedCat.label}</Text>
          <View style={styles.reviewCategoryRow}>
            <MaterialIcons name="recycling" size={15} color={Colors.primary} />
            <Text style={styles.reviewCategoryLabel}>Kategori: </Text>
            <Text style={[styles.reviewCategoryValue, { color: detectedCat.color }]}>
              {detectedCat.label}
            </Text>
          </View>

          {/* AI Accuracy */}
          <View style={styles.accuracyCard}>
            <View style={styles.accuracyHeader}>
              <View style={styles.accuracyLabelRow}>
                <MaterialIcons name="auto-awesome" size={16} color={confColor} />
                <Text style={styles.accuracyLabel}>Tingkat Akurasi AI</Text>
              </View>
              <View style={styles.accuracyValueRow}>
                <Text style={[styles.accuracyValue, { color: confColor }]}>
                  {detectedConfidence}%
                </Text>
                <View style={[styles.accuracyTag, { backgroundColor: `${confColor}1A` }]}>
                  <Text style={[styles.accuracyTagText, { color: confColor }]}>{confLabel}</Text>
                </View>
              </View>
            </View>
            <View style={styles.accuracyTrack}>
              <View
                style={[
                  styles.accuracyFill,
                  { width: `${detectedConfidence}%`, backgroundColor: confColor },
                ]}
              />
            </View>
            {detectedConfidence < 70 && (
              <Text style={styles.accuracyHint}>
                Keyakinan rendah — pastikan foto jelas atau ganti kategori secara manual.
              </Text>
            )}
          </View>

          <Pressable
            style={({ pressed }) => [styles.changeCategoryBtn, pressed && { opacity: 0.6 }]}
            onPress={() => setShowCategoryPicker(true)}
          >
            <MaterialIcons name="edit" size={14} color={Colors.primary} />
            <Text style={styles.changeCategoryText}>
              {isOverridden ? 'Kategori diubah manual · Ganti lagi' : 'Ganti Kategori'}
            </Text>
          </Pressable>

          {/* Point calculator */}
          <View style={styles.calcCard}>
            <View style={styles.calcHeader}>
              <MaterialIcons name="calculate" size={18} color={Colors.primary} />
              <Text style={styles.calcTitle}>Kalkulator Poin</Text>
            </View>
            <Text style={styles.calcInfo}>
              Poin = Berat (kg) × Poin/kg
            </Text>

            <View style={styles.calcRow}>
              <View style={styles.calcInputBox}>
                <TextInput
                  style={styles.calcInputText}
                  value={calcWeight}
                  onChangeText={setCalcWeight}
                  keyboardType="decimal-pad"
                  placeholder="0"
                  placeholderTextColor={Colors.outline}
                />
                <Text style={styles.calcInputUnit}>kg</Text>
              </View>
              <Text style={styles.calcOperator}>×</Text>
              <View style={styles.calcRateBox}>
                <Text style={styles.calcRateValue}>{detectedCat.pointsPerKg}</Text>
                <Text style={styles.calcRateUnit}>poin/kg</Text>
              </View>
            </View>

            <View style={styles.calcResultRow}>
              <Text style={styles.calcResultLabel}>Hasil Poin</Text>
              <Text style={styles.calcResultValue}>{calcResult} poin</Text>
            </View>

            <View style={styles.calcNote}>
              <MaterialIcons name="info-outline" size={13} color={Colors.onSurfaceVariant} />
              <Text style={styles.calcNoteText}>
                Kalkulator ini hanya simulasi. Poin final dihitung dari berat aktual saat ditimbang petugas.
              </Text>
            </View>
          </View>

          {/* Actions */}
          <View style={styles.reviewActionRow}>
            <Pressable
              style={({ pressed }) => [styles.reviewSecondaryBtn, pressed && { opacity: 0.7 }]}
              onPress={handleRetake}
            >
              <MaterialIcons name="camera-alt" size={18} color={Colors.primary} />
              <Text style={styles.reviewSecondaryText}>Ambil Ulang</Text>
            </Pressable>
            <Pressable
              style={({ pressed }) => [styles.reviewSecondaryBtn, pressed && { opacity: 0.7 }]}
              onPress={handleAddCategory}
            >
              <MaterialIcons name="add-a-photo" size={18} color={Colors.primary} />
              <Text style={styles.reviewSecondaryText}>Tambah Kategori</Text>
            </Pressable>
          </View>

          <Pressable
            style={({ pressed }) => [styles.summaryBtn, pressed && { opacity: 0.85 }]}
            onPress={handleGoToSummary}
          >
            <Text style={styles.summaryBtnText}>Lanjut ke Ringkasan</Text>
            <MaterialIcons name="arrow-forward" size={18} color="#fff" />
          </Pressable>

          {/* Tips */}
          <View style={styles.tipCard}>
            <View style={styles.tipIconBox}>
              <MaterialIcons name="tips-and-updates" size={18} color={Colors.tertiary} />
            </View>
            <View style={{ flex: 1, gap: 2 }}>
              <Text style={styles.tipTitle}>Tips Eco-Sorting</Text>
              <Text style={styles.tipText}>
                {scanResult?.predictedType === 'PLASTIC'
                  ? 'Lepas label plastik dan remas botol untuk menghemat ruang di tempat sampah daur ulang.'
                  : scanResult?.predictedType === 'CARDBOARD'
                  ? 'Lipat/ratakan kardus agar mudah ditumpuk dan ditimbang petugas.'
                  : 'Pisahkan sampah ini dari sampah organik agar mudah didaur ulang.'}
              </Text>
            </View>
          </View>
        </ScrollView>

        {/* Category picker modal */}
        <Modal
          visible={showCategoryPicker}
          transparent
          animationType="slide"
          onRequestClose={() => setShowCategoryPicker(false)}
        >
          <Pressable style={styles.modalBackdrop} onPress={() => setShowCategoryPicker(false)}>
            <Pressable style={styles.modalSheet} onPress={(e) => e.stopPropagation()}>
              <View style={styles.modalHandle} />
              <Text style={styles.modalTitle}>Pilih Kategori Sampah</Text>
              <Text style={styles.modalSubtitle}>Koreksi jika hasil deteksi AI kurang tepat.</Text>
              <View style={styles.modalGrid}>
                {WASTE_CATEGORIES.map((cat) => {
                  const active = cat.id === effectiveType;
                  return (
                    <Pressable
                      key={cat.id}
                      style={[styles.modalCatItem, active && { borderColor: cat.color, backgroundColor: cat.bgColor }]}
                      onPress={() => {
                        setOverrideType(cat.id);
                        setShowCategoryPicker(false);
                      }}
                    >
                      <View style={[styles.modalCatIcon, { backgroundColor: cat.bgColor }]}>
                        <MaterialIcons name={cat.icon as any} size={22} color={cat.color} />
                      </View>
                      <Text style={styles.modalCatLabel}>{cat.label}</Text>
                      {active && <MaterialIcons name="check-circle" size={16} color={cat.color} />}
                    </Pressable>
                  );
                })}
              </View>
            </Pressable>
          </Pressable>
        </Modal>
      </SafeAreaView>
    );
  }

  // ─── SUMMARY ──────────────────────────────────────────────────────────────
  if (step === 'summary') {
    return (
      <SafeAreaView style={styles.summaryScreen} edges={['top', 'bottom']}>
        <View style={styles.summaryHeader}>
          <Pressable
            onPress={() => setStep('review')}
            style={({ pressed }) => [styles.reviewBackBtn, pressed && { opacity: 0.6 }]}
          >
            <MaterialIcons name="arrow-back" size={22} color={Colors.onSurface} />
          </Pressable>
          <Text style={styles.reviewHeaderTitle}>EcoScan AI</Text>
          <View style={{ width: 36 }} />
        </View>

        {/* Step indicator */}
        <View style={styles.stepIndicator}>
          {['Scan', 'Review', 'Selesai'].map((label, i) => {
            const done = i < 2;
            const active = i === 1;
            return (
              <View key={label} style={styles.stepItem}>
                <View style={[styles.stepCircle, done && styles.stepCircleDone, active && styles.stepCircleActive]}>
                  {done ? (
                    <MaterialIcons name="check" size={14} color="#fff" />
                  ) : (
                    <Text style={styles.stepNumber}>{i + 1}</Text>
                  )}
                </View>
                <Text style={[styles.stepLabel, (done || active) && styles.stepLabelActive]}>
                  {label}
                </Text>
                {i < 2 && (
                  <View style={[styles.stepLine, done && styles.stepLineDone]} />
                )}
              </View>
            );
          })}
        </View>

        <ScrollView contentContainerStyle={styles.summaryScroll} showsVerticalScrollIndicator={false}>
          <Text style={styles.summaryTitle}>Ringkasan Batch</Text>
          <Text style={styles.summarySubtitle}>
            Berikut adalah daftar sampah yang berhasil dipindai dan siap untuk disetor.
          </Text>

          {/* Items list */}
          {scannedItems.length === 0 ? (
            <View style={styles.summaryEmpty}>
              <MaterialIcons name="inventory-2" size={40} color={Colors.outlineVariant} />
              <Text style={styles.summaryEmptyText}>Belum ada barang dalam batch</Text>
              <Pressable
                style={({ pressed }) => [styles.summaryEmptyBtn, pressed && { opacity: 0.7 }]}
                onPress={() => setStep('camera')}
              >
                <MaterialIcons name="add-a-photo" size={18} color={Colors.primary} />
                <Text style={styles.summaryEmptyBtnText}>Scan Barang</Text>
              </Pressable>
            </View>
          ) : (
            <View style={styles.summaryItemList}>
              {scannedItems.map((item) => {
                const cat = WASTE_CATEGORIES.find((c) => c.id === item.type)!;
                return (
                  <View key={item.id} style={styles.summaryItemCard}>
                    <View style={[styles.summaryItemIcon, { backgroundColor: cat.bgColor }]}>
                      <MaterialIcons name={cat.icon as any} size={24} color={cat.color} />
                    </View>
                    <View style={{ flex: 1, gap: 5 }}>
                      <Text style={styles.summaryItemName}>
                        {cat.label}
                      </Text>
                      <View style={[styles.summaryItemChip, { backgroundColor: cat.bgColor }]}>
                        <Text style={[styles.summaryItemChipText, { color: cat.color }]}>
                          {cat.label.toUpperCase()}
                        </Text>
                      </View>
                    </View>
                    <Pressable
                      onPress={() => handleRemoveItem(item.id)}
                      style={({ pressed }) => [styles.summaryDeleteBtn, pressed && { opacity: 0.6 }]}
                      hitSlop={8}
                    >
                      <MaterialIcons name="delete-outline" size={20} color={Colors.error} />
                    </Pressable>
                  </View>
                );
              })}
            </View>
          )}

          {/* Note: points unknown until officer verification */}
          <View style={styles.summaryNote}>
            <MaterialIcons name="info-outline" size={16} color={Colors.onSurfaceVariant} />
            <Text style={styles.summaryNoteText}>
              Poin akan diberikan setelah sampah ditimbang dan diverifikasi petugas saat drop-off.
            </Text>
          </View>

          {/* Drop-off location */}
          <Text style={styles.sectionLabel}>TITIK DROP-OFF / BANK SAMPAH</Text>
          {wasteBanks.length === 0 ? (
            <View style={styles.mapCard}>
              <View style={styles.locationInfo}>
                <Text style={styles.locationAddress}>Memuat lokasi bank sampah...</Text>
              </View>
            </View>
          ) : (
            wasteBanks.slice(0, 3).map((bank) => (
              <View key={bank.id} style={styles.bankCard}>
                <View style={styles.bankIcon}>
                  <MaterialIcons name="store" size={22} color={Colors.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.locationName}>{bank.name}</Text>
                  <Text style={styles.locationAddress}>{bank.address}, {bank.city}</Text>
                  <View style={styles.locationHours}>
                    <MaterialIcons name="access-time" size={13} color={Colors.onSurfaceVariant} />
                    <Text style={styles.locationHoursText}>{bank.openHours}</Text>
                  </View>
                </View>
                <Pressable
                  style={({ pressed }) => [styles.navigateBtn, pressed && { opacity: 0.6 }]}
                  onPress={() => openMaps(bank)}
                  hitSlop={8}
                >
                  <MaterialIcons name="navigation" size={20} color={Colors.primary} />
                </Pressable>
              </View>
            ))
          )}

          <Pressable
            style={({ pressed }) => [
              styles.submitQrBtn,
              scannedItems.length === 0 && styles.submitQrBtnDisabled,
              pressed && { opacity: 0.85 },
            ]}
            onPress={handleSubmit}
            disabled={scannedItems.length === 0}
          >
            <Text style={styles.submitQrBtnText}>Selesaikan & Buat QR</Text>
            <MaterialIcons name="qr-code-2" size={22} color="#fff" />
          </Pressable>
          <Text style={styles.qrFootnote}>Kode QR akan digunakan untuk validasi di Bank Sampah</Text>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ─── QR CODE ──────────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={styles.qrScreen} edges={['top', 'bottom']}>
      <View style={styles.qrHeader}>
        <Pressable style={styles.qrMenuBtn}>
          <MaterialIcons name="menu" size={24} color={Colors.onSurface} />
        </Pressable>
        <Text style={styles.reviewHeaderTitle}>EcoScan AI</Text>
        <View style={styles.qrAvatar}>
          <MaterialIcons name="person" size={20} color={Colors.onPrimary} />
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.qrScroll} showsVerticalScrollIndicator={false}>
        {/* Success banner */}
        <View style={styles.successBanner}>
          <View style={styles.successIcon}>
            <MaterialIcons name="check-circle" size={28} color={Colors.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.successTitle}>Berhasil Disubmit!</Text>
            <Text style={styles.successSubtitle}>
              Langkah terakhir: Serahkan sampah Anda ke petugas.
            </Text>
          </View>
        </View>

        {/* QR Card */}
        <View style={styles.qrCard}>
          <Text style={styles.qrCardLabel}>YOUR DROP-OFF QR CODE</Text>
          <View style={styles.qrCodeBox}>
            {submittedId ? (
              <QRCode value={submittedId} size={160} />
            ) : (
              <View style={styles.qrCodePlaceholder}>
                <MaterialIcons name="qr-code-2" size={120} color={Colors.onSurface} />
              </View>
            )}
          </View>
          <Text style={styles.qrIdText}>ID: {submittedId?.slice(0, 8)}</Text>
          <Text style={styles.qrValidText}>
            Tunjukkan ke petugas saat menyerahkan sampah
          </Text>
        </View>

        {/* Actions */}
        <Pressable
          style={({ pressed }) => [styles.homeBtn, pressed && { opacity: 0.85 }]}
          onPress={handleBackToHome}
        >
          <MaterialIcons name="home" size={20} color="#fff" />
          <Text style={styles.homeBtnText}>Kembali ke Home</Text>
        </Pressable>

        {/* Footer info */}
        <View style={styles.qrFooterRow}>
          <View style={styles.qrFooterChip}>
            <MaterialIcons name="place" size={13} color={Colors.onSurfaceVariant} />
            <Text style={styles.qrFooterChipText}>Waste Sort AI Sudirman</Text>
          </View>
          <View style={styles.qrFooterChip}>
            <MaterialIcons name="inventory" size={13} color={Colors.onSurfaceVariant} />
            <Text style={styles.qrFooterChipText}>{scannedItems.length} Items</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  // ─── CAMERA ───────────────────────────────────────────────────────────────
  cameraScreen: { flex: 1, backgroundColor: '#111' },
  permissionBtn: {
    backgroundColor: Colors.primary, borderRadius: 999,
    paddingHorizontal: 28, paddingVertical: 14,
  },
  permissionBtnText: { fontFamily: 'Inter_600SemiBold', fontSize: 15, color: '#fff' },
  cameraTopBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingTop: 8, paddingBottom: 12,
  },
  cameraIconBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center', justifyContent: 'center',
  },
  aiReadyBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 14, paddingVertical: 7, borderRadius: 999,
  },
  aiDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: '#4caf50' },
  aiReadyText: { fontFamily: 'Inter_600SemiBold', fontSize: 13, color: '#fff' },
  viewfinder: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16 },
  scanFrame: { width: 260, height: 260, position: 'relative', alignItems: 'center', justifyContent: 'center' },
  corner: { position: 'absolute', width: 28, height: 28, borderColor: '#4caf50', borderWidth: 3 },
  cornerTL: { top: 0, left: 0, borderRightWidth: 0, borderBottomWidth: 0, borderTopLeftRadius: 4 },
  cornerTR: { top: 0, right: 0, borderLeftWidth: 0, borderBottomWidth: 0, borderTopRightRadius: 4 },
  cornerBL: { bottom: 0, left: 0, borderRightWidth: 0, borderTopWidth: 0, borderBottomLeftRadius: 4 },
  cornerBR: { bottom: 0, right: 0, borderLeftWidth: 0, borderTopWidth: 0, borderBottomRightRadius: 4 },
  alignHint: { fontFamily: 'Inter_400Regular', fontSize: 14, color: 'rgba(255,255,255,0.75)' },
  cameraBottom: { paddingHorizontal: 24, paddingBottom: 16, gap: 16 },
  autoDetectRow: { alignItems: 'center' },
  autoDetectChip: {
    flexDirection: 'row', alignItems: 'center', gap: 7,
    paddingHorizontal: 16, paddingVertical: 9, borderRadius: 999,
    backgroundColor: Colors.primary,
  },
  autoDetectText: { fontFamily: 'Inter_600SemiBold', fontSize: 13, color: '#fff' },
  captureRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16 },
  captureSecondaryBtn: { alignItems: 'center', gap: 5, width: 60 },
  captureSecondaryText: { fontFamily: 'Inter_400Regular', fontSize: 12, color: 'rgba(255,255,255,0.8)' },
  captureBtn: {
    width: 76, height: 76, borderRadius: 38,
    backgroundColor: 'rgba(255,255,255,0.3)',
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 3, borderColor: '#fff',
  },
  captureBtnInner: {
    width: 58, height: 58, borderRadius: 29, backgroundColor: '#fff',
  },

  // ─── ANALYZING ────────────────────────────────────────────────────────────
  analyzingScreen: { flex: 1, backgroundColor: Colors.background },
  analyzingTop: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 12,
  },
  analyzingPct: { fontFamily: 'PlusJakartaSans_700Bold', fontSize: 22, color: Colors.onSurface },
  avatarSmall: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center',
  },
  analyzingCenter: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24 },
  analyzingCard: {
    width: '100%', backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: 24, padding: 28, alignItems: 'center', gap: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.07, shadowRadius: 16, elevation: 3,
    borderWidth: 1, borderColor: Colors.surfaceContainerHigh,
  },
  analyzingIcon: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: Colors.primaryContainer,
    alignItems: 'center', justifyContent: 'center',
  },
  analyzingTitle: { fontFamily: 'PlusJakartaSans_700Bold', fontSize: 22, color: Colors.onSurface, textAlign: 'center' },
  aiVisionBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: `${Colors.primary}15`, paddingHorizontal: 12, paddingVertical: 5, borderRadius: 999,
  },
  aiVisionText: { fontFamily: 'Inter_600SemiBold', fontSize: 12, color: Colors.primary },
  progressSection: { width: '100%', gap: 8 },
  progressLabelRow: { flexDirection: 'row', justifyContent: 'space-between' },
  progressLabel: { fontFamily: 'Inter_400Regular', fontSize: 13, color: Colors.onSurfaceVariant },
  progressPct: { fontFamily: 'Inter_600SemiBold', fontSize: 13, color: Colors.primary },
  progressTrack: { height: 8, backgroundColor: Colors.surfaceContainerHigh, borderRadius: 999, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: Colors.primary, borderRadius: 999 },
  analyzingStats: {
    flexDirection: 'row', width: '100%',
    backgroundColor: Colors.surfaceContainerLow, borderRadius: 14, padding: 14, gap: 12,
  },
  analyzingStat: { flex: 1, alignItems: 'center', gap: 4 },
  analyzingStatLabel: { fontFamily: 'Inter_400Regular', fontSize: 12, color: Colors.onSurfaceVariant },
  analyzingStatValue: { fontFamily: 'Inter_600SemiBold', fontSize: 13, color: Colors.onSurface },
  analyzingDivider: { width: 1, backgroundColor: Colors.outlineVariant },
  analyzingFooter: {
    fontFamily: 'Inter_400Regular', fontSize: 13, color: Colors.onSurfaceVariant,
    textAlign: 'center', lineHeight: 20,
  },

  // ─── REVIEW ───────────────────────────────────────────────────────────────
  reviewScreen: { flex: 1, backgroundColor: Colors.background },
  reviewHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, height: 56,
    borderBottomWidth: 1, borderBottomColor: Colors.surfaceContainerHigh,
    backgroundColor: Colors.surface,
  },
  reviewHeaderTitle: { fontFamily: 'PlusJakartaSans_700Bold', fontSize: 18, color: Colors.onSurface },
  reviewBackBtn: {
    width: 36, height: 36, borderRadius: 18,
    alignItems: 'center', justifyContent: 'center',
  },
  reviewScroll: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 36, gap: 14 },
  reviewDetectedBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    alignSelf: 'flex-start',
  },
  reviewDetectedText: { fontFamily: 'Inter_600SemiBold', fontSize: 13, color: Colors.primary },
  reviewImageBox: { position: 'relative', alignSelf: 'stretch' },
  reviewImagePlaceholder: {
    width: '100%', height: 200, borderRadius: 16,
    alignItems: 'center', justifyContent: 'center',
  },
  aiVerifiedBadge: {
    position: 'absolute', top: 12, right: 12,
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: Colors.primary, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 999,
  },
  aiVerifiedText: { fontFamily: 'Inter_600SemiBold', fontSize: 11, color: '#fff' },
  reviewItemName: { fontFamily: 'PlusJakartaSans_700Bold', fontSize: 22, color: Colors.onSurface },
  reviewCategoryRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  reviewCategoryLabel: { fontFamily: 'Inter_400Regular', fontSize: 14, color: Colors.onSurfaceVariant },
  reviewCategoryValue: { fontFamily: 'Inter_600SemiBold', fontSize: 14 },
  accuracyCard: {
    backgroundColor: Colors.surfaceContainerLow, borderRadius: 14, padding: 14, gap: 10,
  },
  accuracyHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  accuracyLabelRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  accuracyLabel: { fontFamily: 'Inter_600SemiBold', fontSize: 13, color: Colors.onSurface },
  accuracyValueRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  accuracyValue: { fontFamily: 'PlusJakartaSans_700Bold', fontSize: 16 },
  accuracyTag: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 999 },
  accuracyTagText: { fontFamily: 'Inter_600SemiBold', fontSize: 11 },
  accuracyTrack: { height: 7, backgroundColor: Colors.surfaceContainerHigh, borderRadius: 999, overflow: 'hidden' },
  accuracyFill: { height: '100%', borderRadius: 999 },
  accuracyHint: { fontFamily: 'Inter_400Regular', fontSize: 12, color: Colors.error, lineHeight: 17 },
  changeCategoryBtn: { flexDirection: 'row', alignItems: 'center', gap: 5, alignSelf: 'flex-start' },
  changeCategoryText: { fontFamily: 'Inter_600SemiBold', fontSize: 13, color: Colors.primary },

  calcCard: {
    backgroundColor: Colors.surfaceContainerLowest, borderRadius: 16, padding: 16, gap: 12,
    borderWidth: 1, borderColor: Colors.surfaceContainerHigh,
  },
  calcHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  calcTitle: { fontFamily: 'PlusJakartaSans_700Bold', fontSize: 16, color: Colors.onSurface },
  calcInfo: { fontFamily: 'Inter_500Medium', fontSize: 13, color: Colors.onSurfaceVariant },
  calcRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  calcInputBox: {
    flex: 1, flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: Colors.surfaceContainerLowest, borderRadius: 12,
    paddingHorizontal: 14, height: 56,
    borderWidth: 2, borderColor: Colors.primary,
  },
  calcInputText: {
    flex: 1, fontFamily: 'PlusJakartaSans_700Bold', fontSize: 22, color: Colors.onSurface,
  },
  calcInputUnit: { fontFamily: 'Inter_500Medium', fontSize: 15, color: Colors.onSurfaceVariant },
  calcOperator: { fontFamily: 'PlusJakartaSans_700Bold', fontSize: 20, color: Colors.onSurfaceVariant },
  calcRateBox: {
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: Colors.surfaceContainerLow, borderRadius: 12,
    paddingHorizontal: 16, height: 56, minWidth: 80,
  },
  calcRateValue: { fontFamily: 'PlusJakartaSans_700Bold', fontSize: 20, color: Colors.onSurface },
  calcRateUnit: { fontFamily: 'Inter_400Regular', fontSize: 11, color: Colors.onSurfaceVariant },
  calcResultRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: `${Colors.primary}10`, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14,
  },
  calcResultLabel: { fontFamily: 'Inter_600SemiBold', fontSize: 14, color: Colors.onSurface },
  calcResultValue: { fontFamily: 'PlusJakartaSans_700Bold', fontSize: 22, color: Colors.primary },
  calcNote: { flexDirection: 'row', alignItems: 'flex-start', gap: 6 },
  calcNoteText: {
    flex: 1, fontFamily: 'Inter_400Regular', fontSize: 12, color: Colors.onSurfaceVariant, lineHeight: 17,
  },
  reviewActionRow: { flexDirection: 'row', gap: 10 },
  reviewSecondaryBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    borderWidth: 1.5, borderColor: Colors.primary, borderRadius: 999, height: 50,
  },
  reviewSecondaryText: { fontFamily: 'Inter_600SemiBold', fontSize: 14, color: Colors.primary },
  summaryBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: Colors.primary, borderRadius: 999, height: 54,
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25, shadowRadius: 8, elevation: 4,
  },
  summaryBtnText: { fontFamily: 'Inter_600SemiBold', fontSize: 16, color: '#fff' },
  tipCard: {
    flexDirection: 'row', gap: 12, alignItems: 'flex-start',
    backgroundColor: `${Colors.tertiary}10`, borderRadius: 14, padding: 14,
    borderWidth: 1, borderColor: `${Colors.tertiary}25`,
  },
  tipIconBox: {
    width: 34, height: 34, borderRadius: 10,
    backgroundColor: `${Colors.tertiary}20`, alignItems: 'center', justifyContent: 'center',
  },
  tipTitle: { fontFamily: 'Inter_600SemiBold', fontSize: 13, color: Colors.onSurface },
  tipText: { fontFamily: 'Inter_400Regular', fontSize: 12, color: Colors.onSurfaceVariant, lineHeight: 18 },

  // ─── SUMMARY ──────────────────────────────────────────────────────────────
  summaryScreen: { flex: 1, backgroundColor: Colors.background },
  summaryHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, height: 56,
    borderBottomWidth: 1, borderBottomColor: Colors.surfaceContainerHigh,
    backgroundColor: Colors.surface,
  },
  stepIndicator: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingVertical: 14, paddingHorizontal: 32, gap: 0,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1, borderBottomColor: Colors.surfaceContainerHigh,
  },
  stepItem: { flexDirection: 'row', alignItems: 'center' },
  stepCircle: {
    width: 26, height: 26, borderRadius: 13,
    backgroundColor: Colors.surfaceContainerHigh,
    alignItems: 'center', justifyContent: 'center',
  },
  stepCircleDone: { backgroundColor: Colors.primary },
  stepCircleActive: { backgroundColor: Colors.primary },
  stepNumber: { fontFamily: 'Inter_600SemiBold', fontSize: 12, color: Colors.onSurfaceVariant },
  stepLabel: {
    fontFamily: 'Inter_400Regular', fontSize: 12, color: Colors.onSurfaceVariant,
    marginHorizontal: 6,
  },
  stepLabelActive: { color: Colors.primary, fontFamily: 'Inter_600SemiBold' },
  stepLine: { width: 32, height: 2, backgroundColor: Colors.outlineVariant, marginHorizontal: 2 },
  stepLineDone: { backgroundColor: Colors.primary },
  summaryScroll: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 36, gap: 16 },
  summaryTitle: { fontFamily: 'PlusJakartaSans_700Bold', fontSize: 24, color: Colors.onSurface },
  summarySubtitle: { fontFamily: 'Inter_400Regular', fontSize: 14, color: Colors.onSurfaceVariant, lineHeight: 21 },
  summaryItemList: { gap: 10 },
  summaryItemCard: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    backgroundColor: Colors.surfaceContainerLowest, borderRadius: 14, padding: 14,
    borderWidth: 1, borderColor: Colors.surfaceContainerHigh,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 1,
  },
  summaryItemIcon: { width: 48, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  summaryItemName: { fontFamily: 'Inter_600SemiBold', fontSize: 14, color: Colors.onSurface },
  summaryItemChip: { alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  summaryItemChipText: { fontFamily: 'Inter_600SemiBold', fontSize: 10, letterSpacing: 0.5 },
  summaryDeleteBtn: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: Colors.errorContainer, alignItems: 'center', justifyContent: 'center',
  },
  summaryEmpty: {
    alignItems: 'center', justifyContent: 'center', gap: 10,
    paddingVertical: 32,
    backgroundColor: Colors.surfaceContainerLow, borderRadius: 16,
  },
  summaryEmptyText: { fontFamily: 'Inter_500Medium', fontSize: 14, color: Colors.onSurfaceVariant },
  summaryEmptyBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    borderWidth: 1.5, borderColor: Colors.primary, borderRadius: 999,
    paddingHorizontal: 18, height: 44,
  },
  summaryEmptyBtnText: { fontFamily: 'Inter_600SemiBold', fontSize: 14, color: Colors.primary },
  summaryNote: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 8,
    backgroundColor: Colors.surfaceContainerLow, borderRadius: 12, padding: 14,
  },
  summaryNoteText: {
    flex: 1, fontFamily: 'Inter_400Regular', fontSize: 13, color: Colors.onSurfaceVariant, lineHeight: 19,
  },
  sectionLabel: {
    fontFamily: 'Inter_600SemiBold', fontSize: 11, color: Colors.onSurfaceVariant,
    letterSpacing: 0.8, marginTop: 4,
  },
  mapCard: {
    backgroundColor: Colors.surfaceContainerLowest, borderRadius: 16,
    overflow: 'hidden', borderWidth: 1, borderColor: Colors.surfaceContainerHigh,
  },
  mapPlaceholder: {
    height: 130, backgroundColor: Colors.surfaceContainerHigh,
    alignItems: 'center', justifyContent: 'center', gap: 4,
  },
  mapPlaceholderText: { fontFamily: 'Inter_400Regular', fontSize: 12, color: Colors.outlineVariant },
  mapDistanceBadge: {
    position: 'absolute', bottom: 10, left: 10,
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: Colors.surfaceContainerLowest, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 999,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 2,
  },
  mapDistanceText: { fontFamily: 'Inter_600SemiBold', fontSize: 12, color: Colors.onSurface },
  locationInfo: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    padding: 14,
  },
  locationName: { fontFamily: 'Inter_600SemiBold', fontSize: 15, color: Colors.onSurface },
  locationAddress: { fontFamily: 'Inter_400Regular', fontSize: 12, color: Colors.onSurfaceVariant, marginTop: 2 },
  locationHours: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  locationHoursText: { fontFamily: 'Inter_400Regular', fontSize: 12, color: Colors.onSurfaceVariant },
  navigateBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: `${Colors.primary}15`, alignItems: 'center', justifyContent: 'center',
  },
  submitQrBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
    backgroundColor: Colors.primary, borderRadius: 999, height: 56,
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25, shadowRadius: 10, elevation: 4,
  },
  submitQrBtnDisabled: { backgroundColor: Colors.outlineVariant, shadowOpacity: 0, elevation: 0 },
  submitQrBtnText: { fontFamily: 'Inter_600SemiBold', fontSize: 16, color: '#fff' },
  qrFootnote: {
    fontFamily: 'Inter_400Regular', fontSize: 12, color: Colors.onSurfaceVariant,
    textAlign: 'center', lineHeight: 18,
  },

  // ─── QR ───────────────────────────────────────────────────────────────────
  qrScreen: { flex: 1, backgroundColor: Colors.background },
  qrHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, height: 56,
    borderBottomWidth: 1, borderBottomColor: Colors.surfaceContainerHigh,
    backgroundColor: Colors.surface,
  },
  qrMenuBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  qrAvatar: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center',
  },
  qrScroll: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 40, gap: 16 },
  successBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    backgroundColor: Colors.surfaceContainerLowest, borderRadius: 16, padding: 16,
    borderWidth: 1, borderColor: `${Colors.primary}30`,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 6, elevation: 1,
  },
  successIcon: {
    width: 48, height: 48, borderRadius: 24,
    backgroundColor: `${Colors.primary}15`, alignItems: 'center', justifyContent: 'center',
  },
  successTitle: { fontFamily: 'PlusJakartaSans_700Bold', fontSize: 18, color: Colors.onSurface },
  successSubtitle: { fontFamily: 'Inter_400Regular', fontSize: 13, color: Colors.onSurfaceVariant, lineHeight: 19, marginTop: 2 },
  qrCard: {
    backgroundColor: Colors.surfaceContainerLowest, borderRadius: 20, padding: 24, alignItems: 'center', gap: 14,
    borderWidth: 1, borderColor: Colors.surfaceContainerHigh,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.07, shadowRadius: 14, elevation: 3,
  },
  qrCardLabel: {
    fontFamily: 'Inter_600SemiBold', fontSize: 11, color: Colors.onSurfaceVariant,
    letterSpacing: 1.2,
  },
  qrCodeBox: {
    padding: 16, backgroundColor: '#fff', borderRadius: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8, elevation: 2,
  },
  qrCodePlaceholder: {
    width: 160, height: 160, alignItems: 'center', justifyContent: 'center',
  },
  qrIdText: {
    fontFamily: 'Inter_600SemiBold', fontSize: 13, color: Colors.onSurfaceVariant, letterSpacing: 0.5,
  },
  qrValidText: {
    fontFamily: 'Inter_400Regular', fontSize: 14, color: Colors.onSurfaceVariant,
    textAlign: 'center', lineHeight: 20,
  },
  homeBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: Colors.primary, borderRadius: 999, height: 56,
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25, shadowRadius: 10, elevation: 4,
  },
  homeBtnText: { fontFamily: 'Inter_600SemiBold', fontSize: 16, color: '#fff' },
  saveBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    borderWidth: 1.5, borderColor: Colors.outlineVariant, borderRadius: 999, height: 50,
  },
  saveBtnText: { fontFamily: 'Inter_600SemiBold', fontSize: 15, color: Colors.onSurface },
  qrFooterRow: { flexDirection: 'row', justifyContent: 'center', gap: 10 },
  qrFooterChip: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: Colors.surfaceContainerLow, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999,
  },
  qrFooterChipText: { fontFamily: 'Inter_400Regular', fontSize: 12, color: Colors.onSurfaceVariant },

  // ─── Bank sampah card ───────────────────────────────────────────────────────
  bankCard: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: Colors.surfaceContainerLowest, borderRadius: 14, padding: 14,
    borderWidth: 1, borderColor: Colors.surfaceContainerHigh,
  },
  bankIcon: {
    width: 44, height: 44, borderRadius: 12,
    backgroundColor: `${Colors.primary}15`, alignItems: 'center', justifyContent: 'center',
  },

  // ─── Category picker modal ──────────────────────────────────────────────────
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' },
  modalSheet: {
    backgroundColor: Colors.surfaceContainerLowest,
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
    padding: 24, paddingBottom: 36, gap: 6,
  },
  modalHandle: {
    width: 40, height: 4, borderRadius: 2, backgroundColor: Colors.outlineVariant,
    alignSelf: 'center', marginBottom: 12,
  },
  modalTitle: { fontFamily: 'PlusJakartaSans_700Bold', fontSize: 18, color: Colors.onSurface },
  modalSubtitle: { fontFamily: 'Inter_400Regular', fontSize: 13, color: Colors.onSurfaceVariant, marginBottom: 12 },
  modalGrid: { gap: 8 },
  modalCatItem: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingHorizontal: 14, paddingVertical: 12, borderRadius: 12,
    borderWidth: 1.5, borderColor: Colors.surfaceContainerHigh,
    backgroundColor: Colors.surfaceContainerLowest,
  },
  modalCatIcon: { width: 40, height: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  modalCatLabel: { flex: 1, fontFamily: 'Inter_600SemiBold', fontSize: 15, color: Colors.onSurface },
});
