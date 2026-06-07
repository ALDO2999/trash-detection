import { useState } from 'react';
import {
  Alert,
  Image,
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

export default function LoginScreen() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [loading, setLoading] = useState(false);

  const isValid = email.includes('@') && password.length >= 8;

  const handleLogin = async () => {
    if (!isValid || loading) return;
    setLoading(true);
    try {
      await login({ email, password });
    } catch (err) {
      Alert.alert('Login Gagal', getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.blobTopRight} />
      <View style={styles.blobBottomLeft} />

      {/* Header */}
      <View style={styles.header}>
        <Pressable
          onPress={() => router.replace('/(onboarding)')}
          style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
        >
          <MaterialIcons name="arrow-back" size={24} color={Colors.primary} />
        </Pressable>
        <Text style={styles.headerTitle}>Waste Sort AI</Text>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Hero */}
          <View style={styles.hero}>
            <View style={styles.logoContainer}>
              <Image
                source={require('../../assets/logo-trash.png')}
                style={styles.logoImage}
                resizeMode="contain"
              />
            </View>
            <Text style={styles.heroTitle}>Selamat Datang Kembali</Text>
            <Text style={styles.heroSubtitle}>
              Lanjutkan langkah Anda dalam menjaga kelestarian bumi.
            </Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            {/* Email */}
            <View style={styles.fieldGroup}>
              <Text style={[styles.label, emailFocused && styles.labelFocused]}>Email</Text>
              <View style={[styles.inputWrapper, emailFocused && styles.inputFocused]}>
                <TextInput
                  style={styles.input}
                  placeholder="nama@email.com"
                  placeholderTextColor={Colors.outline}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  onFocus={() => setEmailFocused(true)}
                  onBlur={() => setEmailFocused(false)}
                  returnKeyType="next"
                />
                <MaterialIcons
                  name="mail-outline"
                  size={20}
                  color={emailFocused ? Colors.primary : Colors.outlineVariant}
                />
              </View>
            </View>

            {/* Password */}
            <View style={styles.fieldGroup}>
              <View style={styles.labelRow}>
                <Text style={[styles.label, passwordFocused && styles.labelFocused]}>
                  Kata Sandi
                </Text>
                <Pressable onPress={() => router.push('/(auth)/forgot-password')}>
                  <Text style={styles.forgotText}>Lupa Password?</Text>
                </Pressable>
              </View>
              <View style={[styles.inputWrapper, passwordFocused && styles.inputFocused]}>
                <TextInput
                  style={styles.input}
                  placeholder="Masukkan kata sandi"
                  placeholderTextColor={Colors.outline}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  onFocus={() => setPasswordFocused(true)}
                  onBlur={() => setPasswordFocused(false)}
                  returnKeyType="done"
                  onSubmitEditing={handleLogin}
                />
                <Pressable onPress={() => setShowPassword(!showPassword)}>
                  <MaterialIcons
                    name={showPassword ? 'visibility-off' : 'visibility'}
                    size={20}
                    color={Colors.outlineVariant}
                  />
                </Pressable>
              </View>
            </View>

            {/* Submit */}
            <Pressable
              style={({ pressed }) => [
                styles.submitButton,
                (!isValid || loading) && styles.submitDisabled,
                pressed && isValid && styles.buttonPressed,
              ]}
              onPress={handleLogin}
              disabled={!isValid || loading}
            >
              <Text style={styles.submitText}>{loading ? 'Memproses...' : 'Masuk'}</Text>
              <MaterialIcons name="login" size={20} color={Colors.onPrimary} />
            </Pressable>
          </View>

          {/* Register link */}
          <View style={styles.registerRow}>
            <Text style={styles.registerText}>Belum punya akun? </Text>
            <Pressable onPress={() => router.push('/(auth)/signup-email')}>
              <Text style={styles.registerLink}>Daftar Sekarang</Text>
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

  blobTopRight: {
    position: 'absolute', top: -40, right: -40,
    width: 180, height: 180, borderRadius: 90,
    backgroundColor: `${Colors.primaryFixed}20`, zIndex: -1,
  },
  blobBottomLeft: {
    position: 'absolute', bottom: -60, left: -60,
    width: 200, height: 200, borderRadius: 100,
    backgroundColor: `${Colors.primaryContainer}12`, zIndex: -1,
  },

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

  content: {
    flexGrow: 1, paddingHorizontal: 24,
    justifyContent: 'center', gap: 28, paddingTop: 24, paddingBottom: 32,
  },

  hero: { alignItems: 'center', gap: 10 },
  logoContainer: {
    width: 80, height: 80, borderRadius: 24,
    backgroundColor: `${Colors.primaryContainer}20`,
    alignItems: 'center', justifyContent: 'center', marginBottom: 4,
  },
  logoImage: { width: 56, height: 56 },
  heroTitle: {
    fontFamily: 'PlusJakartaSans_700Bold', fontSize: 26,
    color: Colors.onSurface, textAlign: 'center',
  },
  heroSubtitle: {
    fontFamily: 'Inter_400Regular', fontSize: 14,
    color: Colors.onSurfaceVariant, textAlign: 'center', lineHeight: 21,
  },

  form: { gap: 16 },
  fieldGroup: { gap: 8 },
  labelRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
  },
  label: {
    fontFamily: 'Inter_600SemiBold', fontSize: 14,
    color: Colors.onSurface, letterSpacing: 0.1,
  },
  labelFocused: { color: Colors.primary },
  forgotText: {
    fontFamily: 'Inter_600SemiBold', fontSize: 13, color: Colors.primary,
  },
  inputWrapper: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.surfaceContainerLow,
    borderRadius: 14, paddingHorizontal: 16, height: 56,
    borderWidth: 2, borderColor: 'transparent',
  },
  inputFocused: {
    backgroundColor: Colors.surfaceContainerLowest, borderColor: Colors.primary,
  },
  input: {
    flex: 1, fontFamily: 'Inter_400Regular', fontSize: 15, color: Colors.onSurface,
  },

  submitButton: {
    backgroundColor: Colors.primary, borderRadius: 999, height: 56,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25, shadowRadius: 8, elevation: 4, marginTop: 4,
  },
  submitDisabled: { opacity: 0.45, elevation: 0, shadowOpacity: 0 },
  buttonPressed: { transform: [{ scale: 0.97 }], opacity: 0.9 },
  submitText: {
    fontFamily: 'Inter_600SemiBold', fontSize: 16, color: Colors.onPrimary,
  },

  registerRow: {
    flexDirection: 'row', justifyContent: 'center', alignItems: 'center',
  },
  registerText: {
    fontFamily: 'Inter_400Regular', fontSize: 14, color: Colors.onSurfaceVariant,
  },
  registerLink: {
    fontFamily: 'Inter_600SemiBold', fontSize: 14, color: Colors.primary,
  },
});
