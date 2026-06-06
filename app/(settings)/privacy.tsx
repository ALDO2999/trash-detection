import { useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';

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
  const [shareStats, setShareStats] = useState(true);

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

        {/* Preferences */}
        <Text style={styles.sectionLabel}>Preferensi Data</Text>
        <View style={styles.card}>
          <ToggleRow
            icon="leaderboard"
            title="Tampil di Leaderboard"
            subtitle="Tampilkan nama & poin Anda di peringkat publik"
            value={shareStats}
            onValueChange={setShareStats}
            last
          />
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

        {/* Danger actions */}
        <View style={styles.card}>
          <Pressable style={({ pressed }) => [styles.actionRow, pressed && styles.pressed]}>
            <MaterialIcons name="download" size={20} color={Colors.secondary} />
            <Text style={styles.actionText}>Unduh Data Saya</Text>
            <MaterialIcons name="chevron-right" size={20} color={Colors.outline} />
          </Pressable>
          <Pressable style={({ pressed }) => [styles.actionRow, styles.actionRowLast, pressed && styles.pressed]}>
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

function ToggleRow({
  icon, title, subtitle, value, onValueChange, last,
}: {
  icon: any; title: string; subtitle: string; value: boolean; onValueChange: (v: boolean) => void; last?: boolean;
}) {
  return (
    <View style={[styles.toggleRow, last && styles.toggleRowLast]}>
      <View style={styles.toggleIcon}>
        <MaterialIcons name={icon} size={20} color={Colors.primary} />
      </View>
      <View style={styles.toggleInfo}>
        <Text style={styles.toggleTitle}>{title}</Text>
        <Text style={styles.toggleSubtitle}>{subtitle}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: Colors.outlineVariant, true: `${Colors.primary}66` }}
        thumbColor={value ? Colors.primary : Colors.outline}
      />
    </View>
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

  toggleRow: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    paddingHorizontal: 16, paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: Colors.surfaceContainerLow,
  },
  toggleRowLast: { borderBottomWidth: 0 },
  toggleIcon: {
    width: 36, height: 36, borderRadius: 10, backgroundColor: `${Colors.primary}15`,
    alignItems: 'center', justifyContent: 'center',
  },
  toggleInfo: { flex: 1 },
  toggleTitle: { fontFamily: 'Inter_600SemiBold', fontSize: 14, color: Colors.onSurface },
  toggleSubtitle: { fontFamily: 'Inter_400Regular', fontSize: 12, color: Colors.onSurfaceVariant, marginTop: 2, lineHeight: 16 },

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
