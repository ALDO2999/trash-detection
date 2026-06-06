import { useEffect, useRef, useState } from 'react';
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
import { router, useLocalSearchParams } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import AuthService from '../../services/auth.service';
import { getApiErrorMessage } from '../../hooks/useApiError';

const OTP_LENGTH = 6;
const RESEND_SECONDS = 60;

export default function ResetPasswordScreen() {
  const { email } = useLocalSearchParams<{ email: string }>();
  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(''));
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(RESEND_SECONDS);
  const [loading, setLoading] = useState(false);
  const inputRefs = useRef<(TextInput | null)[]>([]);

  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setInterval(() => setCountdown((c) => c - 1), 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  const handleOtpChange = (text: string, index: number) => {
    const digit = text.replace(/\D/g, '').slice(-1);
    const newOtp = [...otp];
    newOtp[index] = digit;
    setOtp(newOtp);
    if (digit && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (key: string, index: number) => {
    if (key === 'Backspace' && !otp[index] && index > 0) {
      const newOtp = [...otp];
      newOtp[index - 1] = '';
      setOtp(newOtp);
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleResend = async () => {
    try {
      await AuthService.forgotPassword(email);
      setOtp(Array(OTP_LENGTH).fill(''));
      setCountdown(RESEND_SECONDS);
      inputRefs.current[0]?.focus();
      Alert.alert('OTP Dikirim', 'Kode OTP baru telah dikirim ke email Anda.');
    } catch (err) {
      Alert.alert('Gagal', getApiErrorMessage(err));
    }
  };

  const isOtpComplete = otp.every((d) => d !== '');
  const passwordsMatch = newPassword.length >= 8 && newPassword === confirmPassword;
  const canSubmit = isOtpComplete && passwordsMatch && !loading;

  const handleReset = async () => {
    if (!canSubmit) return;
    setLoading(true);
    try {
      await AuthService.resetPassword(email, otp.join(''), newPassword);
      Alert.alert('Berhasil', 'Password berhasil direset. Silakan login dengan password baru.', [
        { text: 'Login', onPress: () => router.replace('/(auth)/login') },
      ]);
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

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.iconContainer}>
            <MaterialIcons name="lock-open" size={40} color={Colors.onPrimaryContainer} />
          </View>

          <Text style={styles.title}>Reset Password</Text>
          <Text style={styles.subtitle}>
            Masukkan kode OTP yang dikirim ke{'\n'}
            <Text style={styles.emailHighlight}>{email}</Text>
            {'\n'}lalu buat password baru.
          </Text>

          {/* OTP */}
          <View style={styles.otpRow}>
            {otp.map((digit, i) => (
              <TextInput
                key={i}
                ref={(ref) => { inputRefs.current[i] = ref; }}
                style={[
                  styles.otpInput,
                  focusedIndex === i && styles.otpInputFocused,
                  digit && styles.otpInputFilled,
                ]}
                value={digit}
                onChangeText={(text) => handleOtpChange(text, i)}
                onKeyPress={({ nativeEvent }) => handleKeyPress(nativeEvent.key, i)}
                onFocus={() => setFocusedIndex(i)}
                onBlur={() => setFocusedIndex(null)}
                keyboardType="numeric"
                maxLength={1}
                textAlign="center"
                selectTextOnFocus
              />
            ))}
          </View>

          {/* Resend */}
          <View style={styles.resendRow}>
            <Text style={styles.resendText}>Tidak menerima kode? </Text>
            {countdown > 0 ? (
              <Text style={styles.resendTimer}>Kirim ulang dalam {countdown}d</Text>
            ) : (
              <Pressable onPress={handleResend}>
                <Text style={styles.resendLink}>Kirim ulang</Text>
              </Pressable>
            )}
          </View>

          {/* New password */}
          <View style={styles.fieldGroup}>
            <Text style={[styles.label, focusedField === 'new' && styles.labelFocused]}>Password Baru</Text>
            <View style={[styles.inputWrapper, focusedField === 'new' && styles.inputFocused]}>
              <MaterialIcons
                name="lock-outline"
                size={20}
                color={focusedField === 'new' ? Colors.primary : Colors.outlineVariant}
              />
              <TextInput
                style={styles.input}
                placeholder="Minimal 8 karakter"
                placeholderTextColor={Colors.outline}
                value={newPassword}
                onChangeText={setNewPassword}
                secureTextEntry={!showNew}
                onFocus={() => setFocusedField('new')}
                onBlur={() => setFocusedField(null)}
              />
              <Pressable onPress={() => setShowNew(!showNew)}>
                <MaterialIcons
                  name={showNew ? 'visibility-off' : 'visibility'}
                  size={20}
                  color={Colors.outlineVariant}
                />
              </Pressable>
            </View>
            {newPassword.length > 0 && newPassword.length < 8 && (
              <Text style={styles.errorHint}>Password minimal 8 karakter</Text>
            )}
          </View>

          {/* Confirm password */}
          <View style={styles.fieldGroup}>
            <Text style={[styles.label, focusedField === 'confirm' && styles.labelFocused]}>Konfirmasi Password</Text>
            <View style={[styles.inputWrapper, focusedField === 'confirm' && styles.inputFocused]}>
              <MaterialIcons
                name="lock-outline"
                size={20}
                color={focusedField === 'confirm' ? Colors.primary : Colors.outlineVariant}
              />
              <TextInput
                style={styles.input}
                placeholder="Ulangi password baru"
                placeholderTextColor={Colors.outline}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showConfirm}
                onFocus={() => setFocusedField('confirm')}
                onBlur={() => setFocusedField(null)}
              />
              <Pressable onPress={() => setShowConfirm(!showConfirm)}>
                <MaterialIcons
                  name={showConfirm ? 'visibility-off' : 'visibility'}
                  size={20}
                  color={Colors.outlineVariant}
                />
              </Pressable>
            </View>
            {confirmPassword.length > 0 && newPassword !== confirmPassword && (
              <Text style={styles.errorHint}>Password tidak cocok</Text>
            )}
          </View>

          <Pressable
            style={({ pressed }) => [
              styles.submitButton,
              !canSubmit && styles.submitDisabled,
              pressed && canSubmit && styles.pressed,
            ]}
            onPress={handleReset}
            disabled={!canSubmit}
          >
            <MaterialIcons name="check-circle-outline" size={20} color={Colors.onPrimary} />
            <Text style={styles.submitText}>{loading ? 'Memproses...' : 'Reset Password'}</Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },

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
    paddingHorizontal: 24, paddingTop: 32, paddingBottom: 40, gap: 16,
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
  },
  emailHighlight: {
    fontFamily: 'Inter_600SemiBold', color: Colors.primary,
  },

  otpRow: { flexDirection: 'row', gap: 8, marginVertical: 4 },
  otpInput: {
    width: 48, height: 58, borderRadius: 12,
    backgroundColor: Colors.surfaceContainerLow,
    fontFamily: 'PlusJakartaSans_700Bold', fontSize: 22, color: Colors.onSurface,
    borderWidth: 2, borderColor: 'transparent',
  },
  otpInputFocused: { borderColor: Colors.primary, backgroundColor: Colors.surfaceContainerLowest },
  otpInputFilled: { borderColor: `${Colors.primary}4D` },

  resendRow: {
    flexDirection: 'row', alignItems: 'center',
    flexWrap: 'wrap', justifyContent: 'center',
  },
  resendText: { fontFamily: 'Inter_400Regular', fontSize: 13, color: Colors.onSurfaceVariant },
  resendTimer: { fontFamily: 'Inter_600SemiBold', fontSize: 13, color: Colors.primary },
  resendLink: { fontFamily: 'Inter_600SemiBold', fontSize: 13, color: Colors.primary },

  fieldGroup: { gap: 7, width: '100%' },
  label: { fontFamily: 'Inter_600SemiBold', fontSize: 13, color: Colors.onSurfaceVariant },
  labelFocused: { color: Colors.primary },
  inputWrapper: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: Colors.surfaceContainerLow,
    borderRadius: 14, paddingHorizontal: 16, height: 54,
    borderWidth: 2, borderColor: 'transparent',
  },
  inputFocused: { backgroundColor: Colors.surfaceContainerLowest, borderColor: Colors.primary },
  input: { flex: 1, fontFamily: 'Inter_400Regular', fontSize: 15, color: Colors.onSurface },
  errorHint: { fontFamily: 'Inter_400Regular', fontSize: 12, color: Colors.error },

  submitButton: {
    width: '100%', backgroundColor: Colors.primary, borderRadius: 999, height: 56,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25, shadowRadius: 8, elevation: 4, marginTop: 8,
  },
  submitDisabled: { opacity: 0.45, elevation: 0, shadowOpacity: 0 },
  submitText: { fontFamily: 'Inter_600SemiBold', fontSize: 16, color: Colors.onPrimary },
});
