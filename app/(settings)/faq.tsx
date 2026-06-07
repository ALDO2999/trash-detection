import { useState } from 'react';
import {
  LayoutAnimation,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  UIManager,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const FAQS = [
  {
    q: 'Bagaimana cara kerja scan sampah?',
    a: 'Ambil foto sampah Anda (atau pilih dari galeri), lalu AI akan menganalisis jenis sampah secara otomatis beserta tingkat akurasinya. Hasil scan menjadi draft pengajuan yang bisa Anda lanjutkan.',
  },
  {
    q: 'Kapan poin saya masuk?',
    a: 'Poin TIDAK diberikan saat scan. Anda harus menyerahkan sampah fisik ke petugas. Setelah petugas menimbang dan menyetujui pengajuan, poin baru masuk ke saldo Anda berdasarkan berat aktual.',
  },
  {
    q: 'Bagaimana poin dihitung?',
    a: 'Poin = Berat Sampah (kg) × Nilai Poin per Kg. Contoh: Plastik 10 poin/kg, Metal 20 poin/kg, Baterai 50 poin/kg. Jadi 2 kg plastik = 20 poin.',
  },
  {
    q: 'Jenis sampah apa saja yang didukung?',
    a: 'Saat ini ada 6 jenis: Plastic, Cardboard, Metal, Battery, Clothes, dan Shoes. Jenis lain belum termasuk pada versi ini.',
  },
  {
    q: 'Kenapa pengajuan saya ditolak?',
    a: 'Petugas dapat menolak jika sampah tidak sesuai jenis, kondisi tidak layak, atau bercampur dengan sampah lain. Alasan penolakan akan ditampilkan di detail pengajuan Anda.',
  },
  {
    q: 'Bagaimana cara menukar poin?',
    a: 'Buka menu Reward, pilih voucher yang diinginkan (mis. 100 poin = Rp10.000), lalu tukarkan. Voucher dari merchant mitra akan muncul di riwayat Anda.',
  },
  {
    q: 'Apakah poin bisa kedaluwarsa?',
    a: 'Pada versi ini poin tidak memiliki masa kedaluwarsa. Namun voucher hasil penukaran memiliki tanggal kedaluwarsa masing-masing.',
  },
];

export default function FaqScreen() {
  const [open, setOpen] = useState<number | null>(0);

  const toggle = (i: number) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setOpen(open === i ? null : i);
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
        <Text style={styles.headerTitle}>Bantuan & FAQ</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Hero */}
        <View style={styles.hero}>
          <View style={styles.heroIcon}>
            <MaterialIcons name="help-outline" size={28} color={Colors.primary} />
          </View>
          <Text style={styles.heroTitle}>Ada yang bisa kami bantu?</Text>
          <Text style={styles.heroSubtitle}>
            Temukan jawaban dari pertanyaan yang sering diajukan seputar Waste Sort AI.
          </Text>
        </View>

        {/* FAQ accordion */}
        <Text style={styles.sectionLabel}>Pertanyaan Umum</Text>
        <View style={styles.faqList}>
          {FAQS.map((item, i) => {
            const isOpen = open === i;
            return (
              <Pressable
                key={i}
                style={[styles.faqCard, isOpen && styles.faqCardOpen]}
                onPress={() => toggle(i)}
              >
                <View style={styles.faqQuestionRow}>
                  <Text style={styles.faqQuestion}>{item.q}</Text>
                  <MaterialIcons
                    name={isOpen ? 'remove' : 'add'}
                    size={20}
                    color={isOpen ? Colors.primary : Colors.onSurfaceVariant}
                  />
                </View>
                {isOpen && <Text style={styles.faqAnswer}>{item.a}</Text>}
              </Pressable>
            );
          })}
        </View>

        {/* Contact support */}
        <Text style={styles.sectionLabel}>Masih butuh bantuan?</Text>
        <View style={styles.contactGroup}>
          <Pressable style={({ pressed }) => [styles.contactRow, styles.contactRowLast, pressed && styles.pressed]}>
            <View style={styles.contactIcon}>
              <MaterialIcons name="mail-outline" size={20} color={Colors.primary} />
            </View>
            <View style={styles.contactInfo}>
              <Text style={styles.contactTitle}>Email Dukungan</Text>
              <Text style={styles.contactSub}>support@wastesortai.id</Text>
            </View>
            <MaterialIcons name="chevron-right" size={20} color={Colors.outline} />
          </Pressable>
        </View>
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

  faqList: { gap: 10, marginBottom: 16 },
  faqCard: {
    backgroundColor: Colors.surfaceContainerLowest, borderRadius: 14, padding: 16,
    borderWidth: 1, borderColor: Colors.surfaceContainerHigh,
  },
  faqCardOpen: { borderColor: `${Colors.primary}40`, backgroundColor: `${Colors.primary}06` },
  faqQuestionRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  faqQuestion: { flex: 1, fontFamily: 'Inter_600SemiBold', fontSize: 14, color: Colors.onSurface, lineHeight: 20 },
  faqAnswer: {
    fontFamily: 'Inter_400Regular', fontSize: 13, color: Colors.onSurfaceVariant,
    lineHeight: 20, marginTop: 12,
    paddingTop: 12, borderTopWidth: 1, borderTopColor: Colors.surfaceContainerHigh,
  },

  contactGroup: {
    backgroundColor: Colors.surfaceContainerLowest, borderRadius: 16,
    borderWidth: 1, borderColor: Colors.surfaceContainerHigh, overflow: 'hidden',
  },
  contactRow: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    paddingHorizontal: 16, paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: Colors.surfaceContainerLow,
  },
  contactRowLast: { borderBottomWidth: 0 },
  contactIcon: {
    width: 38, height: 38, borderRadius: 12, backgroundColor: `${Colors.primary}15`,
    alignItems: 'center', justifyContent: 'center',
  },
  contactInfo: { flex: 1 },
  contactTitle: { fontFamily: 'Inter_600SemiBold', fontSize: 14, color: Colors.onSurface },
  contactSub: { fontFamily: 'Inter_400Regular', fontSize: 12, color: Colors.onSurfaceVariant, marginTop: 2 },
});
