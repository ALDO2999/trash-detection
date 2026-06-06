import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import QRCode from 'react-native-qrcode-svg';
import { Colors } from '../../constants/colors';
import { WASTE_CATEGORIES } from '../../constants/mockData';
import SubmissionService, { Submission } from '../../services/submission.service';
import ScanService, { WasteType as ApiWasteType } from '../../services/scan.service';

const API_TO_FRONTEND: Record<ApiWasteType, string> = {
  PLASTIC: 'Plastic', CARDBOARD: 'Cardboard',
  METAL: 'Metal', BATTERY: 'Battery', CLOTHES: 'Clothes', SHOES: 'Shoes',
};

const POINTS_PER_KG: Record<ApiWasteType, number> = {
  PLASTIC: 10, CARDBOARD: 8, METAL: 20, BATTERY: 50, CLOTHES: 15, SHOES: 25,
};

const STATUS_CONFIG = {
  MENUNGGU_VERIFIKASI: { label: 'Menunggu Verifikasi', color: Colors.tertiary, bg: `${Colors.tertiaryFixedDim}33`, icon: 'hourglass-empty' as const },
  DISETUJUI: { label: 'Disetujui', color: Colors.primary, bg: `${Colors.primary}15`, icon: 'check-circle' as const },
  DITOLAK: { label: 'Ditolak', color: Colors.error, bg: Colors.errorContainer, icon: 'cancel' as const },
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('id-ID', {
    day: 'numeric', month: 'long', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

function DetailRow({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={[styles.detailValue, highlight && styles.detailValueHighlight]}>{value}</Text>
    </View>
  );
}

export default function SubmissionDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [submission, setSubmission] = useState<Submission | null>(null);
  const [loading, setLoading] = useState(true);

  useFocusEffect(useCallback(() => {
    let active = true;
    SubmissionService.getDetail(id).then((data) => {
      if (active) { setSubmission(data); setLoading(false); }
    }).catch(() => {
      if (active) setLoading(false);
    });
    return () => { active = false; };
  }, [id]));

  const cat = submission
    ? (WASTE_CATEGORIES.find((c) => c.id === API_TO_FRONTEND[submission.wasteType]) ?? WASTE_CATEGORIES[0])
    : null;
  const status = submission ? STATUS_CONFIG[submission.status] : null;
  const earnedPts = submission?.actualWeight
    ? Math.floor(submission.actualWeight * POINTS_PER_KG[submission.wasteType])
    : null;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Pressable
          onPress={() => router.back()}
          style={({ pressed }) => [styles.backBtn, pressed && styles.pressed]}
        >
          <MaterialIcons name="arrow-back" size={24} color={Colors.onSurface} />
        </Pressable>
        <Text style={styles.headerTitle}>Detail Pengajuan</Text>
        <View style={{ width: 40 }} />
      </View>

      {loading ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : !submission || !cat || !status ? (
        <View style={styles.loadingBox}>
          <MaterialIcons name="error-outline" size={48} color={Colors.outlineVariant} />
          <Text style={styles.errorText}>Pengajuan tidak ditemukan</Text>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
        >
          {/* Photo */}
          {submission.imageUrl ? (
            <View style={styles.photoSection}>
              <Image
                source={{ uri: ScanService.getImageUrl(submission.imageUrl) }}
                style={styles.photo}
                resizeMode="cover"
              />
              <View style={[styles.photoOverlay]}>
                <View style={[styles.typeIconSmall, { backgroundColor: cat.bgColor }]}>
                  <MaterialIcons name={cat.icon as any} size={14} color={cat.color} />
                </View>
                <Text style={styles.photoTypeLabel}>{cat.label}</Text>
              </View>
            </View>
          ) : (
            <View style={styles.photoPlaceholder}>
              <MaterialIcons name="image-not-supported" size={40} color={Colors.outlineVariant} />
              <Text style={styles.photoPlaceholderText}>Foto tidak tersedia</Text>
            </View>
          )}

          {/* Status + ID */}
          <View style={styles.idRow}>
            <Text style={styles.submissionId}>#{submission.id.slice(0, 8).toUpperCase()}</Text>
            <View style={[styles.statusBadge, { backgroundColor: status.bg }]}>
              <MaterialIcons name={status.icon} size={12} color={status.color} />
              <Text style={[styles.statusText, { color: status.color }]}>{status.label}</Text>
            </View>
          </View>

          {/* Details card */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Informasi Pengajuan</Text>
            <View style={styles.divider} />
            <DetailRow label="Jenis Sampah" value={cat.label} />
            {submission.estimatedWeight != null && (
              <DetailRow label="Estimasi Berat" value={`${submission.estimatedWeight} kg`} />
            )}
            {submission.actualWeight != null && (
              <DetailRow label="Berat Aktual" value={`${submission.actualWeight} kg`} />
            )}
            {earnedPts !== null && submission.status === 'DISETUJUI' && (
              <DetailRow label="Poin Diperoleh" value={`+${earnedPts} pts`} highlight />
            )}
            <DetailRow label="Tanggal Pengajuan" value={formatDate(submission.createdAt)} />
            {submission.reviewedBy && (
              <DetailRow label="Diverifikasi oleh" value={submission.reviewedBy.name} />
            )}
          </View>

          {/* Rejection notes */}
          {submission.status === 'DITOLAK' && submission.notes && (
            <View style={styles.rejectionCard}>
              <MaterialIcons name="info-outline" size={18} color={Colors.error} />
              <View style={styles.rejectionContent}>
                <Text style={styles.rejectionTitle}>Alasan Penolakan</Text>
                <Text style={styles.rejectionText}>{submission.notes}</Text>
              </View>
            </View>
          )}

          {/* QR Code section */}
          <View style={styles.qrCard}>
            <Text style={styles.qrTitle}>Kode QR Pengajuan</Text>
            <Text style={styles.qrSubtitle}>
              Tunjukkan kode ini kepada petugas saat menyerahkan sampah
            </Text>
            <View style={styles.qrContainer}>
              <QRCode
                value={submission.id}
                size={180}
                color={Colors.onSurface}
                backgroundColor={Colors.surfaceContainerLowest}
              />
            </View>
            <View style={styles.qrIdRow}>
              <MaterialIcons name="qr-code" size={14} color={Colors.onSurfaceVariant} />
              <Text style={styles.qrIdText}>{submission.id}</Text>
            </View>
            {submission.status === 'DISETUJUI' && (
              <View style={styles.qrUsedBadge}>
                <MaterialIcons name="check-circle" size={14} color={Colors.primary} />
                <Text style={styles.qrUsedText}>Pengajuan sudah diverifikasi</Text>
              </View>
            )}
            {submission.status === 'DITOLAK' && (
              <View style={[styles.qrUsedBadge, { backgroundColor: Colors.errorContainer }]}>
                <MaterialIcons name="cancel" size={14} color={Colors.error} />
                <Text style={[styles.qrUsedText, { color: Colors.error }]}>Pengajuan ditolak</Text>
              </View>
            )}
          </View>

          <View style={{ height: 24 }} />
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  pressed: { opacity: 0.7 },
  loadingBox: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  errorText: { fontFamily: 'Inter_400Regular', fontSize: 15, color: Colors.outline },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 12, height: 56,
    borderBottomWidth: 1, borderBottomColor: Colors.surfaceContainerHigh,
    backgroundColor: Colors.surface,
  },
  backBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontFamily: 'PlusJakartaSans_700Bold', fontSize: 18, color: Colors.onSurface },

  scroll: { paddingBottom: 24 },

  photoSection: { position: 'relative' },
  photo: { width: '100%', height: 240 },
  photoOverlay: {
    position: 'absolute', bottom: 12, left: 12,
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: 20,
    paddingHorizontal: 10, paddingVertical: 5,
  },
  typeIconSmall: { width: 22, height: 22, borderRadius: 6, alignItems: 'center', justifyContent: 'center' },
  photoTypeLabel: { fontFamily: 'Inter_600SemiBold', fontSize: 13, color: '#fff' },
  photoPlaceholder: {
    height: 180, backgroundColor: Colors.surfaceContainerLow,
    alignItems: 'center', justifyContent: 'center', gap: 8,
  },
  photoPlaceholderText: { fontFamily: 'Inter_400Regular', fontSize: 13, color: Colors.outline },

  idRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 14,
  },
  submissionId: { fontFamily: 'PlusJakartaSans_700Bold', fontSize: 18, color: Colors.onSurface },
  statusBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 12, paddingVertical: 5, borderRadius: 999,
  },
  statusText: { fontFamily: 'Inter_600SemiBold', fontSize: 12 },

  card: {
    marginHorizontal: 20, marginBottom: 12,
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: 16, padding: 16,
    borderWidth: 1, borderColor: Colors.surfaceContainerHigh,
    gap: 10,
  },
  cardTitle: { fontFamily: 'Inter_600SemiBold', fontSize: 14, color: Colors.onSurfaceVariant },
  divider: { height: 1, backgroundColor: Colors.surfaceContainerHigh },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  detailLabel: { fontFamily: 'Inter_400Regular', fontSize: 14, color: Colors.onSurfaceVariant },
  detailValue: { fontFamily: 'Inter_500Medium', fontSize: 14, color: Colors.onSurface },
  detailValueHighlight: { fontFamily: 'Inter_700Bold', fontSize: 15, color: Colors.primary },

  rejectionCard: {
    flexDirection: 'row', gap: 12, alignItems: 'flex-start',
    marginHorizontal: 20, marginBottom: 12,
    backgroundColor: Colors.errorContainer, borderRadius: 14, padding: 14,
  },
  rejectionContent: { flex: 1, gap: 4 },
  rejectionTitle: { fontFamily: 'Inter_600SemiBold', fontSize: 13, color: Colors.error },
  rejectionText: { fontFamily: 'Inter_400Regular', fontSize: 13, color: Colors.error, lineHeight: 18 },

  qrCard: {
    marginHorizontal: 20, marginTop: 4,
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: 20, padding: 20,
    borderWidth: 1, borderColor: Colors.surfaceContainerHigh,
    alignItems: 'center', gap: 8,
  },
  qrTitle: { fontFamily: 'PlusJakartaSans_700Bold', fontSize: 16, color: Colors.onSurface },
  qrSubtitle: {
    fontFamily: 'Inter_400Regular', fontSize: 13,
    color: Colors.onSurfaceVariant, textAlign: 'center', lineHeight: 19,
  },
  qrContainer: {
    padding: 16, backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: 16, marginVertical: 8,
    borderWidth: 1, borderColor: Colors.surfaceContainerHigh,
  },
  qrIdRow: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: Colors.surfaceContainerLow,
    borderRadius: 8, paddingHorizontal: 12, paddingVertical: 6,
  },
  qrIdText: {
    fontFamily: 'Inter_400Regular', fontSize: 10,
    color: Colors.onSurfaceVariant, letterSpacing: 0.5,
  },
  qrUsedBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: `${Colors.primary}12`, borderRadius: 999,
    paddingHorizontal: 14, paddingVertical: 6,
  },
  qrUsedText: {
    fontFamily: 'Inter_600SemiBold', fontSize: 12, color: Colors.primary,
  },
});
