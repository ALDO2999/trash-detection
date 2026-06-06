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
import AuthService from '../../services/auth.service';
import { getApiErrorMessage } from '../../hooks/useApiError';

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const [focused, setFocused] = useState(false);
  const [loading, setLoading] = useState(false);

  const isValid = email.includes('@') && email.includes('.');

  const handleSend = async () => {
    if (!isValid || loading) return;
    setLoading(true);
    try {
      await AuthService.forgotPassword(email.trim().toLowerCase());
      router.push({
        pathname: '/(auth)/reset-password',
        params: { email: email.trim().toLowerCase() },
      });
    } catch (err) {
      Alert.alert('Gagal', getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.blobTopRight} />
      <View style={styles.blobBottomLeft} />

      <View style={styles.header}>
        <Pressable
          onPress={() => router.back()}
          style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
        >
          <MaterialIcons name="arrow-back" size={24} color={Colors.primary} />
        </Pressable>
        <Text style={styles.headerTitle}>EcoPoint</Text>
        <View style={{ width: 40 }} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.iconContainer}>
            <MaterialIcons name="lock-reset" size={40} color={Colors.onPrimaryContainer} />
          </View>

          <Text style={styles.title}>Lupa Password?</Text>
          <Text style={styles.subtitle}>
            Masukkan email yang terdaftar di akun Anda. Kami akan mengirimkan kode OTP untuk mereset password.
          </Text>

          <View style={styles.fieldGroup}>
            <Text style={[styles.label, focused && styles.labelFocused]}>Email</Text>
            <View style={[styles.inputWrapper, focused && styles.inputFocused]}>
              <MaterialIcons
                name="mail-outline"
                size={20}
                color={focused ? Colors.primary : Colors.outlineVariant}
              />
              <TextInput
                style={styles.input}
                placeholder="nama@email.com"
                placeholderTextColor={Colors.outline}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                returnKeyType="done"
                onSubmitEditing={handleSend}
              />
            </View>
          </View>

          <Pressable
            style={({ pressed }) => [
              styles.submitButton,
              (!isValid || loading) && styles.submitDisabled,
              pressed && isValid && styles.pressed,
            ]}
            onPress={handleSend}
            disabled={!isValid || loading}
          >
            <MaterialIcons name="send" size={20} color={Colors.onPrimary} />
            <Text style={styles.submitText}>{loading ? 'Mengirim...' : 'Kirim Kode OTP'}</Text>
          </Pressable>

          <View style={styles.helpCard}>
            <MaterialIcons name="info-outline" size={22} color={Colors.tertiary} />
            <View style={styles.helpContent}>
              <Text style={styles.helpTitle}>Tidak menerima email?</Text>
              <Text style={styles.helpText}>
                Pastikan email yang dimasukkan sudah benar dan akun Anda sudah diverifikasi. Cek juga folder spam.
              </Text>
            </View>
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
    position: 'absolute', top: -60, right: -60,
    width: 240, height: 240, borderRadius: 120,
    backgroundColor: `${Colors.primaryContainer}1A`, zIndex: -1,
  },
  blobBottomLeft: {
    position: 'absolute', bottom: -60, left: -60,
    width: 200, height: 200, borderRadius: 100,
    backgroundColor: `${Colors.secondaryContainer}33`, zIndex: -1,
  },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, height: 56,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1, borderBottomColor: Colors.surfaceContainerHigh,
  },
  backButton: {
    width: 40, height: 40, borderRadius: 20,
    alignItems: 'center', justifyContent: 'center',
  },
  headerTitle: { fontFamily: 'PlusJakartaSans_700Bold', fontSize: 20, color: Colors.primary },
  pressed: { opacity: 0.7 },

  content: {
    flexGrow: 1, alignItems: 'center',
    paddingHorizontal: 24, paddingTop: 40, paddingBottom: 40, gap: 20,
  },

  iconContainer: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: Colors.primaryContainer,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15, shadowRadius: 6, elevation: 2,
  },

  title: {
    fontFamily: 'PlusJakartaSans_700Bold', fontSize: 26,
    color: Colors.onSurface, textAlign: 'center',
  },
  subtitle: {
    fontFamily: 'Inter_400Regular', fontSize: 14,
    color: Colors.onSurfaceVariant, textAlign: 'center', lineHeight: 21,
    maxWidth: 300,
  },

  fieldGroup: { gap: 8, width: '100%' },
  label: { fontFamily: 'Inter_600SemiBold', fontSize: 14, color: Colors.onSurface },
  labelFocused: { color: Colors.primary },
  inputWrapper: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: Colors.surfaceContainerLow,
    borderRadius: 14, paddingHorizontal: 16, height: 56,
    borderWidth: 2, borderColor: 'transparent',
  },
  inputFocused: { backgroundColor: Colors.surfaceContainerLowest, borderColor: Colors.primary },
  input: { flex: 1, fontFamily: 'Inter_400Regular', fontSize: 15, color: Colors.onSurface },

  submitButton: {
    width: '100%', backgroundColor: Colors.primary, borderRadius: 999, height: 56,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25, shadowRadius: 8, elevation: 4,
  },
  submitDisabled: { opacity: 0.45, elevation: 0, shadowOpacity: 0 },
  submitText: { fontFamily: 'Inter_600SemiBold', fontSize: 16, color: Colors.onPrimary },

  helpCard: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 14,
    backgroundColor: Colors.surfaceContainer, borderRadius: 14, padding: 16,
    borderWidth: 1, borderColor: Colors.outlineVariant, width: '100%',
  },
  helpContent: { flex: 1, gap: 4 },
  helpTitle: { fontFamily: 'Inter_600SemiBold', fontSize: 13, color: Colors.onSurface },
  helpText: { fontFamily: 'Inter_400Regular', fontSize: 13, color: Colors.onSurfaceVariant, lineHeight: 19 },
});
