import {
  Alert,
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
import { useAuth } from '../../context/AuthContext';
import UserService from '../../services/user.service';
import { getApiErrorMessage } from '../../hooks/useApiError';

const POLICY_SECTIONS = [
  {
    icon: 'cloud-upload',
    title: 'Data yang Kami Kumpulkan',
    body: 'Kami menyimpan nama, email, kota, foto sampah hasil scan, serta riwayat pengajuan dan poin Anda. Foto digunakan untuk membantu petugas memverifikasi jenis sampah.',
  },
  {
    icon: 'insights',
    title: 'Bagaimana Data Digunakan',
    body: 'Data dipakai untuk menghitung poin, menampilkan statistik kontribusi, merekomendasikan bank sampah terdekat, dan meningkatkan akurasi model AI deteksi sampah.',
  },
  {
    icon: 'lock',
    title: 'Keamanan Data',
    body: 'Data Anda disimpan terenkripsi dan tidak dibagikan ke pihak ketiga tanpa persetujuan, kecuali diwajibkan oleh hukum yang berlaku.',
  },
  {
    icon: 'gavel',
    title: 'Hak Anda',
    body: 'Anda berhak meminta salinan, memperbarui, atau menghapus data pribadi kapan saja melalui menu pengaturan atau dengan menghubungi tim dukungan.',
  },
];

export default function PrivacyScreen() {
  const { logout } = useAuth();

  const handleDeleteAccount = () => {
    Alert.alert(
      'Hapus Akun & Data',
      'Semua data Anda termasuk riwayat pengajuan, poin, dan informasi pribadi akan dihapus permanen. Tindakan ini tidak dapat dibatalkan.',
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Hapus Akun',
          style: 'destructive',
          onPress: () => {
            Alert.alert(
              'Konfirmasi Terakhir',
              'Anda yakin ingin menghapus akun? Data tidak dapat dipulihkan.',
              [
                { text: 'Tidak', style: 'cancel' },
                {
                  text: 'Ya, Hapus',
                  style: 'destructive',
                  onPress: async () => {
                    try {
                      await UserService.deleteAccount();
                      await logout();
                    } catch (err) {
                      Alert.alert('Gagal', getApiErrorMessage(err));
                    }
                  },
                },
              ],
            );
          },
        },
      ],
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Pressable
          onPress={() => router.back()}
          style={({ pressed }) => [styles.backBtn, pressed && styles.pressed]}
        >
          <MaterialIcons name="arrow-back" size={24} color={Colors.onSurface} />
        </Pressable>
        <Text style={styles.headerTitle}>Privasi & Data</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Hero */}
        <View style={styles.hero}>
          <View style={styles.heroIcon}>
            <MaterialIcons name="shield" size={28} color={Colors.primary} />
          </View>
          <Text style={styles.heroTitle}>Privasi Anda Terlindungi</Text>
          <Text style={styles.heroSubtitle}>
            Kami transparan tentang data yang dikumpulkan dan memberi Anda kendali penuh.
          </Text>
        </View>

        {/* Policy */}
        <Text style={styles.sectionLabel}>Kebijakan Privasi</Text>
        <View style={styles.policyList}>
          {POLICY_SECTIONS.map((s) => (
            <View key={s.title} style={styles.policyCard}>
              <View style={styles.policyIcon}>
                <MaterialIcons name={s.icon as any} size={20} color={Colors.primary} />
              </View>
              <View style={styles.policyContent}>
                <Text style={styles.policyTitle}>{s.title}</Text>
                <Text style={styles.policyBody}>{s.body}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Danger zone */}
        <Text style={styles.sectionLabel}>Zona Bahaya</Text>
        <View style={styles.card}>
          <Pressable
            style={({ pressed }) => [styles.actionRow, styles.actionRowLast, pressed && styles.pressed]}
            onPress={handleDeleteAccount}
          >
            <MaterialIcons name="delete-outline" size={20} color={Colors.error} />
            <Text style={[styles.actionText, { color: Colors.error }]}>Hapus Akun & Data</Text>
            <MaterialIcons name="chevron-right" size={20} color={Colors.outline} />
          </Pressable>
        </View>

        <Text style={styles.footnote}>Terakhir diperbarui: Juni 2026</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  pressed: { opacity: 0.6 },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 12, height: 56,
    borderBottomWidth: 1, borderBottomColor: Colors.surfaceContainerHigh,
    backgroundColor: Colors.surface,
  },
  backBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontFamily: 'PlusJakartaSans_700Bold', fontSize: 18, color: Colors.onSurface },

  scroll: { padding: 20, paddingBottom: 40 },

  hero: { alignItems: 'center', gap: 8, marginBottom: 24 },
  heroIcon: {
    width: 64, height: 64, borderRadius: 20, backgroundColor: `${Colors.primary}15`,
    alignItems: 'center', justifyContent: 'center', marginBottom: 4,
  },
  heroTitle: { fontFamily: 'PlusJakartaSans_700Bold', fontSize: 20, color: Colors.onSurface },
  heroSubtitle: {
    fontFamily: 'Inter_400Regular', fontSize: 14, color: Colors.onSurfaceVariant,
    textAlign: 'center', lineHeight: 21, maxWidth: 300,
  },

  sectionLabel: {
    fontFamily: 'Inter_600SemiBold', fontSize: 12, color: Colors.outline,
    letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 10, marginTop: 8,
  },
  card: {
    backgroundColor: Colors.surfaceContainerLowest, borderRadius: 16,
    borderWidth: 1, borderColor: Colors.surfaceContainerHigh, overflow: 'hidden', marginBottom: 16,
  },

  policyList: { gap: 12, marginBottom: 16 },
  policyCard: {
    flexDirection: 'row', gap: 14, alignItems: 'flex-start',
    backgroundColor: Colors.surfaceContainerLow, borderRadius: 14, padding: 16,
  },
  policyIcon: {
    width: 38, height: 38, borderRadius: 12, backgroundColor: `${Colors.primary}15`,
    alignItems: 'center', justifyContent: 'center',
  },
  policyContent: { flex: 1, gap: 3 },
  policyTitle: { fontFamily: 'Inter_600SemiBold', fontSize: 15, color: Colors.onSurface },
  policyBody: { fontFamily: 'Inter_400Regular', fontSize: 13, color: Colors.onSurfaceVariant, lineHeight: 20 },

  actionRow: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    paddingHorizontal: 16, paddingVertical: 16,
    borderBottomWidth: 1, borderBottomColor: Colors.surfaceContainerLow,
  },
  actionRowLast: { borderBottomWidth: 0 },
  actionText: { flex: 1, fontFamily: 'Inter_500Medium', fontSize: 15, color: Colors.onSurface },

  footnote: { fontFamily: 'Inter_400Regular', fontSize: 12, color: Colors.outline, textAlign: 'center', marginTop: 4 },
});
