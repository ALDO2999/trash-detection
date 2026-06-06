import { useRef, useState } from 'react';
import {
  Alert,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Colors } from '../../constants/colors';
import OfficerService, { OfficerSubmission } from '../../services/officer.service';
import { WASTE_CATEGORIES } from '../../constants/mockData';
import { WasteType as ApiWasteType } from '../../services/scan.service';

type ScanState = 'scanning' | 'found' | 'manual' | 'loading';

const API_TO_FRONTEND: Record<ApiWasteType, string> = {
  PLASTIC: 'Plastic', CARDBOARD: 'Cardboard',
  METAL: 'Metal', BATTERY: 'Battery', CLOTHES: 'Clothes', SHOES: 'Shoes',
};

export default function OfficerScanScreen() {
  const [state, setState] = useState<ScanState>('scanning');
  const [manualId, setManualId] = useState('');
  const [submission, setSubmission] = useState<OfficerSubmission | null>(null);
  const [permission, requestPermission] = useCameraPermissions();
  const scannedRef = useRef(false);

  const fetchSubmission = async (id: string) => {
    setState('loading');
    try {
      const subs = await OfficerService.getSubmissions('MENUNGGU_VERIFIKASI');
      const found = subs.find((s) => s.id === id || s.id.startsWith(id));
      if (!found) {
        Alert.alert('Tidak Ditemukan', 'Pengajuan tidak ditemukan atau sudah diverifikasi.', [
          { text: 'OK', onPress: () => { setState('scanning'); scannedRef.current = false; } },
        ]);
        return;
      }
      setSubmission(found);
      setState('found');
    } catch {
      Alert.alert('Gagal', 'Tidak dapat mengambil data pengajuan.', [
        { text: 'OK', onPress: () => { setState('scanning'); scannedRef.current = false; } },
      ]);
    }
  };

  const handleBarcodeScanned = ({ data }: { data: string }) => {
    if (scannedRef.current) return;
    scannedRef.current = true;
    fetchSubmission(data.trim());
  };

  const handleManualSubmit = () => {
    if (!manualId.trim()) return;
    scannedRef.current = true;
    fetchSubmission(manualId.trim());
  };

  const handleReset = () => {
    setState('scanning');
    setManualId('');
    setSubmission(null);
    scannedRef.current = false;
  };

  if (!permission) return <View style={styles.container} />;

  if (!permission.granted) {
    return (
      <SafeAreaView style={[styles.container, { alignItems: 'center', justifyContent: 'center', gap: 20, padding: 32 }]} edges={['top', 'bottom']}>
        <MaterialIcons name="qr-code-scanner" size={60} color="rgba(255,255,255,0.6)" />
        <Text style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 20, color: '#fff', textAlign: 'center' }}>
          Izin Kamera Diperlukan
        </Text>
        <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 14, color: 'rgba(255,255,255,0.7)', textAlign: 'center', lineHeight: 21 }}>
          Diperlukan untuk memindai QR Code pengajuan user.
        </Text>
        <Pressable
          onPress={requestPermission}
          style={({ pressed }) => [styles.permissionBtn, pressed && styles.pressed]}
        >
          <Text style={styles.permissionBtnText}>Izinkan Akses Kamera</Text>
        </Pressable>
        <Pressable onPress={() => router.back()}>
          <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 14, color: 'rgba(255,255,255,0.5)' }}>Kembali</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  const cat = submission
    ? WASTE_CATEGORIES.find((c) => c.id === API_TO_FRONTEND[submission.wasteType]) ?? WASTE_CATEGORIES[0]
    : null;

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable
          onPress={() => router.back()}
          style={({ pressed }) => [styles.headerBtn, pressed && styles.pressed]}
        >
          <MaterialIcons name="arrow-back" size={24} color={Colors.onPrimary} />
        </Pressable>
        <Text style={styles.headerTitle}>Scan QR Pengajuan</Text>
        <Pressable
          style={({ pressed }) => [styles.headerBtn, pressed && styles.pressed]}
          onPress={() => setState(state === 'manual' ? 'scanning' : 'manual')}
        >
          <MaterialIcons name={state === 'manual' ? 'qr-code-scanner' : 'keyboard'} size={22} color={Colors.onPrimary} />
        </Pressable>
      </View>

      {/* Camera Area */}
      <View style={styles.cameraArea}>
        {state !== 'manual' && (
          <CameraView
            style={StyleSheet.absoluteFill}
            onBarcodeScanned={state === 'scanning' ? handleBarcodeScanned : undefined}
            barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
          />
        )}

        <View style={styles.cameraOverlay}>
          <View style={styles.scannerFrame}>
            <View style={[styles.corner, styles.cornerTL]} />
            <View style={[styles.corner, styles.cornerTR]} />
            <View style={[styles.corner, styles.cornerBL]} />
            <View style={[styles.corner, styles.cornerBR]} />

            {state === 'found' ? (
              <View style={styles.foundIndicator}>
                <MaterialIcons name="check-circle" size={48} color={Colors.primary} />
                <Text style={styles.foundText}>QR Terdeteksi!</Text>
              </View>
            ) : state === 'loading' ? (
              <View style={styles.foundIndicator}>
                <MaterialIcons name="hourglass-empty" size={48} color={Colors.tertiary} />
                <Text style={styles.foundText}>Mencari pengajuan...</Text>
              </View>
            ) : state === 'manual' ? (
              <View style={styles.foundIndicator}>
                <MaterialIcons name="keyboard" size={48} color="rgba(255,255,255,0.4)" />
                <Text style={styles.foundText}>Mode Manual</Text>
              </View>
            ) : (
              <View style={styles.scanIndicator}>
                <View style={styles.scanLine} />
                <Text style={styles.scanHint}>Arahkan ke QR Code user</Text>
              </View>
            )}
          </View>

          <View style={styles.statusPill}>
            <View style={[styles.statusDot, state !== 'scanning' && { backgroundColor: Colors.tertiary }]} />
            <Text style={styles.statusText}>
              {state === 'scanning' ? 'Scanning active' : state === 'loading' ? 'Memuat...' : state === 'found' ? 'Ditemukan' : 'Mode Manual'}
            </Text>
          </View>
        </View>
      </View>

      {/* Bottom Sheet */}
      <View style={styles.bottomSheet}>
        {state === 'found' && submission && cat ? (
          <View style={styles.foundSheet}>
            <Text style={styles.foundSheetTitle}>Pengajuan Ditemukan</Text>
            <Text style={styles.foundSheetSub}>
              {cat.label}{submission.estimatedWeight ? ` · ${submission.estimatedWeight} kg est.` : ''} · {submission.user.name}
            </Text>
            <Pressable
              style={({ pressed }) => [styles.proceedBtn, pressed && styles.pressed]}
              onPress={() => router.push({ pathname: '/(officer)/verify', params: { id: submission.id } })}
            >
              <Text style={styles.proceedBtnText}>Lanjut ke Verifikasi</Text>
              <MaterialIcons name="arrow-forward" size={20} color={Colors.onPrimary} />
            </Pressable>
            <Pressable onPress={handleReset} style={({ pressed }) => pressed && styles.pressed}>
              <Text style={styles.resetText}>Scan QR Lain</Text>
            </Pressable>
          </View>
        ) : (
          <View style={styles.manualSheet}>
            <Text style={styles.manualTitle}>
              {state === 'manual' ? 'Masukkan ID Pengajuan' : 'Atau masukkan ID Manual'}
            </Text>
            <View style={styles.manualInputRow}>
              <View style={styles.manualInput}>
                <TextInput
                  style={styles.manualInputText}
                  placeholder="ID Pengajuan (8 karakter pertama)"
                  placeholderTextColor={Colors.outline}
                  value={manualId}
                  onChangeText={setManualId}
                  autoCapitalize="none"
                  returnKeyType="search"
                  onSubmitEditing={handleManualSubmit}
                />
              </View>
              <Pressable
                style={({ pressed }) => [
                  styles.manualSubmitBtn,
                  (!manualId || state === 'loading') && styles.manualSubmitDisabled,
                  pressed && styles.pressed,
                ]}
                onPress={handleManualSubmit}
                disabled={!manualId || state === 'loading'}
              >
                <MaterialIcons name="search" size={22} color={Colors.onPrimary} />
              </Pressable>
            </View>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0d1117' },
  pressed: { opacity: 0.7 },

  permissionBtn: {
    backgroundColor: Colors.primary, borderRadius: 999, paddingHorizontal: 28, paddingVertical: 14,
  },
  permissionBtnText: { fontFamily: 'Inter_600SemiBold', fontSize: 15, color: '#fff' },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 12,
  },
  headerBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontFamily: 'PlusJakartaSans_700Bold', fontSize: 18, color: Colors.onPrimary },

  cameraArea: { flex: 1, alignItems: 'center', justifyContent: 'center', position: 'relative' },
  cameraOverlay: { flex: 1, width: '100%', alignItems: 'center', justifyContent: 'center' },

  scannerFrame: {
    width: 260, height: 260,
    alignItems: 'center', justifyContent: 'center',
    position: 'relative',
  },
  corner: { position: 'absolute', width: 32, height: 32, borderColor: Colors.primary, borderWidth: 3.5 },
  cornerTL: { top: 0, left: 0, borderRightWidth: 0, borderBottomWidth: 0, borderTopLeftRadius: 4 },
  cornerTR: { top: 0, right: 0, borderLeftWidth: 0, borderBottomWidth: 0, borderTopRightRadius: 4 },
  cornerBL: { bottom: 0, left: 0, borderRightWidth: 0, borderTopWidth: 0, borderBottomLeftRadius: 4 },
  cornerBR: { bottom: 0, right: 0, borderLeftWidth: 0, borderTopWidth: 0, borderBottomRightRadius: 4 },

  scanIndicator: { alignItems: 'center', gap: 16 },
  scanLine: {
    width: 220, height: 2, backgroundColor: Colors.primary,
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1, shadowRadius: 8, elevation: 5,
  },
  scanHint: { fontFamily: 'Inter_400Regular', fontSize: 13, color: `${Colors.onPrimary}80` },

  foundIndicator: { alignItems: 'center', gap: 8 },
  foundText: { fontFamily: 'Inter_600SemiBold', fontSize: 15, color: Colors.onPrimary },

  statusPill: {
    position: 'absolute', bottom: 24,
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: 999,
    paddingHorizontal: 14, paddingVertical: 7,
  },
  statusDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.primary },
  statusText: { fontFamily: 'Inter_400Regular', fontSize: 13, color: Colors.onPrimary },

  bottomSheet: {
    backgroundColor: Colors.surfaceContainerLowest,
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
    padding: 24,
  },

  foundSheet: { gap: 12, alignItems: 'center' },
  foundSheetTitle: { fontFamily: 'PlusJakartaSans_700Bold', fontSize: 20, color: Colors.onSurface },
  foundSheetSub: { fontFamily: 'Inter_400Regular', fontSize: 14, color: Colors.onSurfaceVariant, textAlign: 'center' },
  proceedBtn: {
    width: '100%', backgroundColor: Colors.primary, borderRadius: 999,
    height: 54, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25, shadowRadius: 6, elevation: 4,
  },
  proceedBtnText: { fontFamily: 'Inter_600SemiBold', fontSize: 16, color: Colors.onPrimary },
  resetText: { fontFamily: 'Inter_500Medium', fontSize: 14, color: Colors.onSurfaceVariant, marginTop: 4 },

  manualSheet: { gap: 16 },
  manualTitle: { fontFamily: 'Inter_600SemiBold', fontSize: 15, color: Colors.onSurface },
  manualInputRow: { flexDirection: 'row', gap: 10 },
  manualInput: {
    flex: 1, backgroundColor: Colors.surfaceContainerLow,
    borderRadius: 12, paddingHorizontal: 16, height: 52,
    justifyContent: 'center',
    borderWidth: 1, borderColor: Colors.surfaceContainerHigh,
  },
  manualInputText: { fontFamily: 'Inter_400Regular', fontSize: 15, color: Colors.onSurface },
  manualSubmitBtn: {
    width: 52, height: 52, borderRadius: 12,
    backgroundColor: Colors.primary,
    alignItems: 'center', justifyContent: 'center',
  },
  manualSubmitDisabled: { opacity: 0.4 },
});
