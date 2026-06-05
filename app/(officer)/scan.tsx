import { useState } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';

type ScanState = 'scanning' | 'found' | 'manual';

export default function OfficerScanScreen() {
  const [state, setState] = useState<ScanState>('scanning');
  const [manualId, setManualId] = useState('');

  const handleDummyScan = () => {
    setTimeout(() => setState('found'), 1500);
  };

  const handleManualSubmit = () => {
    if (manualId.trim()) {
      router.push('/(officer)/submissions');
    }
  };

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
        <Pressable style={({ pressed }) => [styles.headerBtn, pressed && styles.pressed]}>
          <MaterialIcons name="help-outline" size={22} color={Colors.onPrimary} />
        </Pressable>
      </View>

      {/* Camera Area */}
      <View style={styles.cameraArea}>
        {/* Simulated camera */}
        <View style={styles.cameraOverlay}>
          {/* Corner markers */}
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
            ) : (
              <View style={styles.scanIndicator}>
                <View style={styles.scanLine} />
                <Text style={styles.scanHint}>Arahkan ke QR Code user</Text>
              </View>
            )}
          </View>

          {/* Status */}
          <View style={styles.statusPill}>
            <View style={styles.statusDot} />
            <Text style={styles.statusText}>Scanning active · Live System</Text>
          </View>
        </View>

        {/* Quick actions overlay */}
        <View style={styles.quickActions}>
          <Pressable style={styles.quickBtn}>
            <MaterialIcons name="flashlight-on" size={22} color={Colors.onSurface} />
          </Pressable>
          <Pressable style={styles.quickBtn} onPress={handleDummyScan}>
            <MaterialIcons name="center-focus-strong" size={22} color={Colors.onSurface} />
          </Pressable>
        </View>
      </View>

      {/* Bottom Sheet */}
      <View style={styles.bottomSheet}>
        {state === 'found' ? (
          <View style={styles.foundSheet}>
            <Text style={styles.foundSheetTitle}>Pengajuan Ditemukan</Text>
            <Text style={styles.foundSheetSub}>ID: WS-002 · Metal · 1.5 kg est.</Text>
            <Pressable
              style={({ pressed }) => [styles.proceedBtn, pressed && styles.pressed]}
              onPress={() => router.push('/(officer)/submissions')}
            >
              <Text style={styles.proceedBtnText}>Lanjut ke Verifikasi</Text>
              <MaterialIcons name="arrow-forward" size={20} color={Colors.onPrimary} />
            </Pressable>
          </View>
        ) : (
          <View style={styles.manualSheet}>
            <Text style={styles.manualTitle}>Atau masukkan ID Manual</Text>
            <View style={styles.manualInputRow}>
              <View style={styles.manualInput}>
                <TextInput
                  style={styles.manualInputText}
                  placeholder="Contoh: WS-002"
                  placeholderTextColor={Colors.outline}
                  value={manualId}
                  onChangeText={setManualId}
                  autoCapitalize="characters"
                />
              </View>
              <Pressable
                style={({ pressed }) => [
                  styles.manualSubmitBtn,
                  !manualId && styles.manualSubmitDisabled,
                  pressed && styles.pressed,
                ]}
                onPress={handleManualSubmit}
                disabled={!manualId}
              >
                <MaterialIcons name="search" size={22} color={Colors.onPrimary} />
              </Pressable>
            </View>
            <Pressable
              style={({ pressed }) => [styles.demoScanBtn, pressed && styles.pressed]}
              onPress={handleDummyScan}
            >
              <MaterialIcons name="qr-code-scanner" size={18} color={Colors.primary} />
              <Text style={styles.demoScanText}>Simulasi Scan QR</Text>
            </Pressable>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0d1117' },
  pressed: { opacity: 0.7 },

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
    width: 220, height: 2,
    backgroundColor: Colors.primary,
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

  quickActions: {
    position: 'absolute', right: 20, top: '30%',
    gap: 12,
  },
  quickBtn: {
    width: 48, height: 48, borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center', justifyContent: 'center',
  },

  bottomSheet: {
    backgroundColor: Colors.surfaceContainerLowest,
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
    padding: 24,
  },

  foundSheet: { gap: 12, alignItems: 'center' },
  foundSheetTitle: { fontFamily: 'PlusJakartaSans_700Bold', fontSize: 20, color: Colors.onSurface },
  foundSheetSub: { fontFamily: 'Inter_400Regular', fontSize: 14, color: Colors.onSurfaceVariant },
  proceedBtn: {
    width: '100%', backgroundColor: Colors.primary, borderRadius: 999,
    height: 54, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25, shadowRadius: 6, elevation: 4,
  },
  proceedBtnText: { fontFamily: 'Inter_600SemiBold', fontSize: 16, color: Colors.onPrimary },

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
  demoScanBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    paddingVertical: 8,
  },
  demoScanText: { fontFamily: 'Inter_500Medium', fontSize: 13, color: Colors.primary },
});
