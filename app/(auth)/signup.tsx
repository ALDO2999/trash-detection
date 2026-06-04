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

export default function SignupScreen() {
  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable
          onPress={() => router.back()}
          style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
        >
          <MaterialIcons name="arrow-back" size={24} color={Colors.primary} />
        </Pressable>
        <Text style={styles.headerTitle}>WasteSort AI</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Hero Image */}
        <View style={styles.heroImageContainer}>
          <Image
            source={require('../../assets/logo-trash.png')}
            style={styles.heroImage}
            resizeMode="contain"
          />
          <View style={styles.heroImageOverlay} />
        </View>

        {/* Headline */}
        <View style={styles.headline}>
          <Text style={styles.title}>Mulai Perjalanan{'\n'}Hijau Kamu</Text>
          <Text style={styles.subtitle}>
            Bergabunglah dengan komunitas cerdas yang peduli lingkungan melalui pemilahan sampah berbasis AI.
          </Text>
        </View>

        {/* Auth Options */}
        <View style={styles.options}>
          {/* Google */}
          <Pressable
            style={({ pressed }) => [styles.optionButton, styles.optionGoogle, pressed && styles.pressed]}
          >
            <MaterialIcons name="g-mobiledata" size={28} color="#4285F4" />
            <Text style={styles.optionText}>Daftar dengan Google</Text>
          </Pressable>

          {/* Apple */}
          <Pressable
            style={({ pressed }) => [styles.optionButton, styles.optionApple, pressed && styles.pressed]}
          >
            <MaterialIcons name="apple" size={22} color="#fff" />
            <Text style={[styles.optionText, styles.optionTextWhite]}>Daftar dengan Apple</Text>
          </Pressable>

          {/* Divider */}
          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>ATAU</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Email */}
          <Pressable
            style={({ pressed }) => [styles.optionButton, styles.optionEmail, pressed && styles.pressed]}
            onPress={() => router.push('/(auth)/signup-email')}
          >
            <MaterialIcons name="mail-outline" size={22} color={Colors.secondary} />
            <Text style={[styles.optionText, styles.optionTextSecondary]}>Daftar dengan Email</Text>
          </Pressable>
        </View>

        {/* Login Link */}
        <View style={styles.loginRow}>
          <Text style={styles.loginText}>Sudah punya akun? </Text>
          <Pressable onPress={() => router.push('/(auth)/login')}>
            <Text style={styles.loginLink}>Masuk</Text>
          </Pressable>
        </View>

        {/* Trust Badges */}
        <View style={styles.trustBadges}>
          {[
            { icon: 'lock' as const, label: 'Data Aman' },
            { icon: 'verified-user' as const, label: 'Terverifikasi' },
            { icon: 'eco' as const, label: '100% Hijau' },
          ].map((badge) => (
            <View key={badge.label} style={styles.trustBadge}>
              <MaterialIcons name={badge.icon} size={22} color={Colors.secondary} />
              <Text style={styles.trustLabel}>{badge.label}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    height: 56,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.surfaceContainerHigh,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontFamily: 'PlusJakartaSans_700Bold',
    fontSize: 20,
    color: Colors.primary,
  },
  headerSpacer: {
    width: 40,
  },
  pressed: {
    opacity: 0.7,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 40,
  },
  heroImageContainer: {
    width: '100%',
    height: 200,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 24,
    backgroundColor: Colors.surfaceContainer,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: `${Colors.outlineVariant}4D`,
  },
  heroImage: {
    width: 140,
    height: 140,
  },
  heroImageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 60,
  },
  headline: {
    alignItems: 'center',
    marginBottom: 32,
    gap: 8,
  },
  title: {
    fontFamily: 'PlusJakartaSans_700Bold',
    fontSize: 26,
    color: Colors.onSurface,
    textAlign: 'center',
    lineHeight: 34,
  },
  subtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 15,
    color: Colors.onSurfaceVariant,
    textAlign: 'center',
    lineHeight: 22,
  },
  options: {
    gap: 12,
    marginBottom: 32,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    height: 56,
    borderRadius: 999,
    paddingHorizontal: 24,
  },
  optionGoogle: {
    backgroundColor: Colors.surfaceContainerLowest,
    borderWidth: 1,
    borderColor: Colors.outlineVariant,
  },
  optionApple: {
    backgroundColor: Colors.onSurface,
  },
  optionEmail: {
    borderWidth: 1.5,
    borderColor: Colors.secondary,
    backgroundColor: 'transparent',
  },
  optionText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
    color: Colors.onSurface,
    letterSpacing: 0.1,
  },
  optionTextWhite: {
    color: '#fff',
  },
  optionTextSecondary: {
    color: Colors.secondary,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginVertical: 4,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.outlineVariant,
  },
  dividerText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 11,
    color: Colors.onSurfaceVariant,
    letterSpacing: 1,
  },
  loginRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
  },
  loginText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 15,
    color: Colors.onSurfaceVariant,
  },
  loginLink: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 15,
    color: Colors.primary,
  },
  trustBadges: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    opacity: 0.6,
  },
  trustBadge: {
    alignItems: 'center',
    gap: 6,
  },
  trustLabel: {
    fontFamily: 'Inter_500Medium',
    fontSize: 11,
    color: Colors.onSurfaceVariant,
  },
});
