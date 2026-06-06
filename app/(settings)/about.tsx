import {
  Image,
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
import { WASTE_CATEGORIES } from '../../constants/mockData';

const FEATURES = [
  { icon: 'document-scanner', title: 'Scan AI', desc: 'Deteksi jenis sampah otomatis lewat foto.' },
  { icon: 'verified', title: 'Verifikasi Petugas', desc: 'Poin diberikan setelah sampah ditimbang petugas.' },
  { icon: 'card-giftcard', title: 'Tukar Reward', desc: 'Tukarkan poin dengan voucher merchant mitra.' },
  { icon: 'leaderboard', title: 'Leaderboard', desc: 'Bersaing dengan komunitas di kota Anda.' },
];

const LINKS = [
  { icon: 'privacy-tip', label: 'Kebijakan Privasi', route: '/(settings)/privacy' as const },
];

export default function AboutScreen() {
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Pressable
          onPress={() => router.back()}
          style={({ pressed }) => [styles.backBtn, pressed && styles.pressed]}
        >
          <MaterialIcons name="arrow-back" size={24} color={Colors.onSurface} />
        </Pressable>
        <Text style={styles.headerTitle}>Tentang Aplikasi</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Logo + version */}
        <View style={styles.brand}>
          <View style={styles.logoBox}>
            <Image
              source={require('../../assets/logo-trash.png')}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>
          <Text style={styles.appName}>WasteSort AI</Text>
          <Text style={styles.tagline}>Pengelolaan Sampah Berbasis AI & Reward</Text>
          <View style={styles.versionBadge}>
            <Text style={styles.versionText}>Versi 1.0.0</Text>
          </View>
        </View>

        {/* Mission */}
        <View style={styles.missionCard}>
          <MaterialIcons name="eco" size={22} color={Colors.primary} />
          <Text style={styles.missionText}>
            EcoPoint membantu masyarakat memilah sampah, mencatat kontribusi daur ulang, dan
            mendapatkan reward — menjadikan menjaga bumi sebagai kebiasaan yang menyenangkan.
          </Text>
        </View>

        {/* Features */}
        <Text style={styles.sectionLabel}>Fitur Utama</Text>
        <View style={styles.featureGrid}>
          {FEATURES.map((f) => (
            <View key={f.title} style={styles.featureCard}>
              <View style={styles.featureIcon}>
                <MaterialIcons name={f.icon as any} size={22} color={Colors.primary} />
              </View>
              <Text style={styles.featureTitle}>{f.title}</Text>
              <Text style={styles.featureDesc}>{f.desc}</Text>
            </View>
          ))}
        </View>

        {/* Supported waste types */}
        <Text style={styles.sectionLabel}>Jenis Sampah Didukung</Text>
        <View style={styles.wasteChips}>
          {WASTE_CATEGORIES.map((c) => (
            <View key={c.id} style={[styles.wasteChip, { backgroundColor: c.bgColor }]}>
              <MaterialIcons name={c.icon as any} size={14} color={c.color} />
              <Text style={[styles.wasteChipText, { color: c.color }]}>{c.label}</Text>
            </View>
          ))}
        </View>

        {/* Links */}
        <Text style={styles.sectionLabel}>Lainnya</Text>
        <View style={styles.linkGroup}>
          {LINKS.map((l, i) => (
            <Pressable
              key={l.label}
              style={({ pressed }) => [
                styles.linkRow,
                i === LINKS.length - 1 && styles.linkRowLast,
                pressed && styles.pressedBg,
              ]}
              onPress={() => l.route && router.push(l.route)}
            >
              <MaterialIcons name={l.icon as any} size={20} color={Colors.secondary} />
              <Text style={styles.linkText}>{l.label}</Text>
              <MaterialIcons name="chevron-right" size={20} color={Colors.outline} />
            </Pressable>
          ))}
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Dibuat dengan 💚 oleh Tim EcoPoint</Text>
          <Text style={styles.footerCopyright}>© 2026 EcoPoint. Hak cipta dilindungi.</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  pressed: { opacity: 0.6 },
  pressedBg: { backgroundColor: Colors.surfaceContainerLow },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 12, height: 56,
    borderBottomWidth: 1, borderBottomColor: Colors.surfaceContainerHigh,
    backgroundColor: Colors.surface,
  },
  backBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontFamily: 'PlusJakartaSans_700Bold', fontSize: 18, color: Colors.onSurface },

  scroll: { padding: 20, paddingBottom: 40 },

  brand: { alignItems: 'center', gap: 6, marginBottom: 24 },
  logoBox: {
    width: 88, height: 88, borderRadius: 24, backgroundColor: `${Colors.primaryContainer}20`,
    alignItems: 'center', justifyContent: 'center', marginBottom: 6,
  },
  logo: { width: 60, height: 60 },
  appName: { fontFamily: 'PlusJakartaSans_700Bold', fontSize: 24, color: Colors.primary },
  tagline: { fontFamily: 'Inter_400Regular', fontSize: 13, color: Colors.onSurfaceVariant, textAlign: 'center' },
  versionBadge: {
    backgroundColor: Colors.surfaceContainerHigh, borderRadius: 999,
    paddingHorizontal: 12, paddingVertical: 4, marginTop: 6,
  },
  versionText: { fontFamily: 'Inter_600SemiBold', fontSize: 12, color: Colors.onSurfaceVariant },

  missionCard: {
    flexDirection: 'row', gap: 14, alignItems: 'flex-start',
    backgroundColor: `${Colors.primary}0D`, borderRadius: 16, padding: 16,
    borderWidth: 1, borderColor: `${Colors.primary}20`, marginBottom: 8,
  },
  missionText: { flex: 1, fontFamily: 'Inter_400Regular', fontSize: 14, color: Colors.onSurface, lineHeight: 21 },

  sectionLabel: {
    fontFamily: 'Inter_600SemiBold', fontSize: 12, color: Colors.outline,
    letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 10, marginTop: 16,
  },

  featureGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  featureCard: {
    width: '47%', flexGrow: 1,
    backgroundColor: Colors.surfaceContainerLowest, borderRadius: 14, padding: 16, gap: 8,
    borderWidth: 1, borderColor: Colors.surfaceContainerHigh,
  },
  featureIcon: {
    width: 40, height: 40, borderRadius: 12, backgroundColor: `${Colors.primary}15`,
    alignItems: 'center', justifyContent: 'center',
  },
  featureTitle: { fontFamily: 'Inter_600SemiBold', fontSize: 14, color: Colors.onSurface },
  featureDesc: { fontFamily: 'Inter_400Regular', fontSize: 12, color: Colors.onSurfaceVariant, lineHeight: 17 },

  wasteChips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  wasteChip: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 12, paddingVertical: 7, borderRadius: 999,
  },
  wasteChipText: { fontFamily: 'Inter_600SemiBold', fontSize: 13 },

  linkGroup: {
    backgroundColor: Colors.surfaceContainerLowest, borderRadius: 16,
    borderWidth: 1, borderColor: Colors.surfaceContainerHigh, overflow: 'hidden',
  },
  linkRow: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    paddingHorizontal: 16, paddingVertical: 15,
    borderBottomWidth: 1, borderBottomColor: Colors.surfaceContainerLow,
  },
  linkRowLast: { borderBottomWidth: 0 },
  linkText: { flex: 1, fontFamily: 'Inter_500Medium', fontSize: 15, color: Colors.onSurface },

  footer: { alignItems: 'center', gap: 4, marginTop: 28 },
  footerText: { fontFamily: 'Inter_500Medium', fontSize: 13, color: Colors.onSurfaceVariant },
  footerCopyright: { fontFamily: 'Inter_400Regular', fontSize: 12, color: Colors.outline },
});
