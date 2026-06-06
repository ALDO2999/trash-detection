import { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
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
import { Colors } from '../../constants/colors';
import { useAuth } from '../../context/AuthContext';
import { getApiErrorMessage } from '../../hooks/useApiError';

export default function SignupEmailScreen() {
  const { register } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [nameFocused, setNameFocused] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [loading, setLoading] = useState(false);

  const isValid =
    name.trim().length > 0 &&
    email.includes('@') &&
    email.includes('.') &&
    password.length >= 8;

  const handleSubmit = async () => {
    if (!isValid || loading) return;
    setLoading(true);
    try {
      await register({ name: name.trim(), email, password });
      router.push({ pathname: '/(auth)/otp', params: { email } });
    } catch (err) {
      Alert.alert('Pendaftaran Gagal', getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

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
        <Text style={styles.headerTitle}>Buat Akun</Text>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Hero */}
          <View style={styles.hero}>
            <View style={styles.logoIcon}>
              <MaterialIcons name="recycling" size={32} color={Colors.onPrimaryContainer} />
            </View>
            <Text style={styles.heroTitle}>Mulai Perjalanan Hijau</Text>
            <Text style={styles.heroSubtitle}>
              Isi data di bawah — kami akan mengirimkan kode OTP untuk verifikasi email Anda.
            </Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            {/* Nama */}
            <View style={styles.fieldGroup}>
              <Text style={[styles.label, nameFocused && styles.labelFocused]}>
                Nama Lengkap
              </Text>
              <View style={[styles.inputWrapper, nameFocused && styles.inputFocused]}>
                <TextInput
                  style={styles.input}
                  placeholder="Masukkan nama lengkap Anda"
                  placeholderTextColor={Colors.outline}
                  value={name}
                  onChangeText={setName}
                  onFocus={() => setNameFocused(true)}
                  onBlur={() => setNameFocused(false)}
                  returnKeyType="next"
                />
                {name.trim().length > 0 && (
                  <MaterialIcons name="check-circle" size={18} color={Colors.primary} />
                )}
              </View>
              <Text style={styles.hint}>Gunakan nama resmi untuk verifikasi reward.</Text>
            </View>

            {/* Email */}
            <View style={styles.fieldGroup}>
              <Text style={[styles.label, emailFocused && styles.labelFocused]}>
                Alamat Email
              </Text>
              <View style={[styles.inputWrapper, emailFocused && styles.inputFocused]}>
                <TextInput
                  style={styles.input}
                  placeholder="nama@email.com"
                  placeholderTextColor={Colors.outline}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                  onFocus={() => setEmailFocused(true)}
                  onBlur={() => setEmailFocused(false)}
                  returnKeyType="next"
                />
                {email.includes('@') && email.includes('.') && (
                  <MaterialIcons name="check-circle" size={18} color={Colors.primary} />
                )}
              </View>
              <Text style={styles.hint}>
                Notifikasi dan kode OTP akan dikirim ke email ini.
              </Text>
            </View>

            {/* Password */}
            <View style={styles.fieldGroup}>
              <Text style={[styles.label, passwordFocused && styles.labelFocused]}>
                Password Akun EcoPoint
              </Text>
              <View style={[styles.inputWrapper, passwordFocused && styles.inputFocused]}>
                <TextInput
                  style={styles.input}
                  placeholder="Minimal 8 karakter"
                  placeholderTextColor={Colors.outline}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  onFocus={() => setPasswordFocused(true)}
                  onBlur={() => setPasswordFocused(false)}
                  returnKeyType="done"
                  onSubmitEditing={handleSubmit}
                />
                <Pressable onPress={() => setShowPassword(!showPassword)}>
                  <MaterialIcons
                    name={showPassword ? 'visibility-off' : 'visibility'}
                    size={20}
                    color={Colors.outlineVariant}
                  />
                </Pressable>
              </View>
              <View style={styles.hintRow}>
                <MaterialIcons name="info-outline" size={13} color={Colors.onSurfaceVariant} />
                <Text style={styles.hint}>
                  Ini adalah password untuk masuk ke aplikasi, bukan password email Anda.
                </Text>
              </View>
            </View>
          </View>

          {/* OTP Notice */}
          <View style={styles.otpNotice}>
            <MaterialIcons name="mark-email-unread" size={18} color={Colors.primary} />
            <Text style={styles.otpNoticeText}>
              Setelah mendaftar, kode OTP akan dikirim ke email Anda untuk verifikasi. Akun dibuat setelah OTP valid.
            </Text>
          </View>

          {/* Submit */}
          <Pressable
            style={({ pressed }) => [
              styles.submitButton,
              !isValid && styles.submitDisabled,
              pressed && isValid && styles.pressed,
            ]}
            onPress={handleSubmit}
            disabled={!isValid || loading}
          >
            {loading
              ? <MaterialIcons name="hourglass-empty" size={20} color={Colors.onPrimary} />
              : <MaterialIcons name="send" size={20} color={Colors.onPrimary} />
            }
            <Text style={styles.submitText}>
              {loading ? 'Mengirim OTP...' : 'Daftar & Kirim OTP'}
            </Text>
          </Pressable>

          {/* Login link */}
          <View style={styles.loginRow}>
            <Text style={styles.loginText}>Sudah punya akun? </Text>
            <Pressable onPress={() => router.replace('/(auth)/login')}>
              <Text style={styles.loginLink}>Masuk</Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  flex: { flex: 1 },

  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 20, height: 56, gap: 12,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1, borderBottomColor: Colors.surfaceContainerHigh,
  },
  backButton: {
    width: 40, height: 40, borderRadius: 20,
    alignItems: 'center', justifyContent: 'center',
  },
  headerTitle: {
    fontFamily: 'PlusJakartaSans_700Bold', fontSize: 20, color: Colors.primary,
  },
  pressed: { opacity: 0.7 },

  scroll: { paddingHorizontal: 24, paddingTop: 28, paddingBottom: 40, gap: 24 },

  hero: { alignItems: 'center', gap: 8 },
  logoIcon: {
    width: 64, height: 64, borderRadius: 20,
    backgroundColor: Colors.primaryContainer,
    alignItems: 'center', justifyContent: 'center', marginBottom: 4,
  },
  heroTitle: {
    fontFamily: 'PlusJakartaSans_700Bold', fontSize: 22, color: Colors.onSurface,
  },
  heroSubtitle: {
    fontFamily: 'Inter_400Regular', fontSize: 14,
    color: Colors.onSurfaceVariant, textAlign: 'center', lineHeight: 21,
  },

  form: { gap: 16 },
  fieldGroup: { gap: 7 },
  label: {
    fontFamily: 'Inter_600SemiBold', fontSize: 13,
    color: Colors.onSurfaceVariant, letterSpacing: 0.1,
  },
  labelFocused: { color: Colors.primary },
  inputWrapper: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.surfaceContainerLow,
    borderRadius: 14, paddingHorizontal: 16, height: 54,
    borderWidth: 2, borderColor: 'transparent',
  },
  inputFocused: {
    backgroundColor: Colors.surfaceContainerLowest, borderColor: Colors.primary,
  },
  input: {
    flex: 1, fontFamily: 'Inter_400Regular', fontSize: 15, color: Colors.onSurface,
  },
  hintRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 5 },
  hint: {
    flex: 1, fontFamily: 'Inter_400Regular', fontSize: 12,
    color: Colors.onSurfaceVariant, lineHeight: 17,
  },

  otpNotice: {
    flexDirection: 'row', gap: 10, alignItems: 'flex-start',
    backgroundColor: `${Colors.primary}10`, borderRadius: 12, padding: 14,
    borderWidth: 1, borderColor: `${Colors.primary}20`,
  },
  otpNoticeText: {
    flex: 1, fontFamily: 'Inter_400Regular', fontSize: 13,
    color: Colors.onSurfaceVariant, lineHeight: 19,
  },

  submitButton: {
    backgroundColor: Colors.primary, borderRadius: 999, height: 56,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25, shadowRadius: 8, elevation: 4,
  },
  submitDisabled: { opacity: 0.45, elevation: 0, shadowOpacity: 0 },
  submitText: {
    fontFamily: 'Inter_600SemiBold', fontSize: 16, color: Colors.onPrimary,
  },

  loginRow: {
    flexDirection: 'row', justifyContent: 'center', alignItems: 'center',
  },
  loginText: {
    fontFamily: 'Inter_400Regular', fontSize: 14, color: Colors.onSurfaceVariant,
  },
  loginLink: {
    fontFamily: 'Inter_600SemiBold', fontSize: 14, color: Colors.primary,
  },
});
