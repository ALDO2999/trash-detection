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
import UserService from '../../services/user.service';
import { getApiErrorMessage } from '../../hooks/useApiError';

export default function ChangePasswordScreen() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [focused, setFocused] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const isNewValid = newPassword.length >= 8;
  const isConfirmMatch = newPassword === confirmPassword;
  const canSave = currentPassword.length > 0 && isNewValid && isConfirmMatch;

  const handleSave = async () => {
    if (!canSave || saving) return;
    setSaving(true);
    try {
      await UserService.changePassword(currentPassword, newPassword);
      Alert.alert('Berhasil', 'Password berhasil diubah.', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (err) {
      Alert.alert('Gagal', getApiErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const renderField = (
    key: string,
    label: string,
    value: string,
    setter: (v: string) => void,
    show: boolean,
    toggleShow: () => void,
    hint?: string,
    errorHint?: string,
  ) => (
    <View style={styles.fieldGroup}>
      <Text style={[styles.label, focused === key && styles.labelFocused]}>{label}</Text>
      <View style={[styles.inputWrapper, focused === key && styles.inputFocused]}>
        <MaterialIcons
          name="lock-outline"
          size={20}
          color={focused === key ? Colors.primary : Colors.outlineVariant}
        />
        <TextInput
          style={styles.input}
          placeholder={hint}
          placeholderTextColor={Colors.outline}
          value={value}
          onChangeText={setter}
          secureTextEntry={!show}
          onFocus={() => setFocused(key)}
          onBlur={() => setFocused(null)}
        />
        <Pressable onPress={toggleShow}>
          <MaterialIcons
            name={show ? 'visibility-off' : 'visibility'}
            size={20}
            color={Colors.outlineVariant}
          />
        </Pressable>
      </View>
      {errorHint && <Text style={styles.errorHint}>{errorHint}</Text>}
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Pressable
          onPress={() => router.back()}
          style={({ pressed }) => [styles.backBtn, pressed && styles.pressed]}
        >
          <MaterialIcons name="arrow-back" size={24} color={Colors.onSurface} />
        </Pressable>
        <Text style={styles.headerTitle}>Ubah Password</Text>
        <View style={{ width: 40 }} />
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
          <View style={styles.infoCard}>
            <MaterialIcons name="info-outline" size={20} color={Colors.primary} />
            <Text style={styles.infoText}>
              Password baru minimal 8 karakter. Setelah diubah, gunakan password baru untuk login berikutnya.
            </Text>
          </View>

          <View style={styles.form}>
            {renderField(
              'current', 'Password Saat Ini',
              currentPassword, setCurrentPassword,
              showCurrent, () => setShowCurrent(!showCurrent),
              'Masukkan password saat ini',
            )}

            {renderField(
              'new', 'Password Baru',
              newPassword, setNewPassword,
              showNew, () => setShowNew(!showNew),
              'Minimal 8 karakter',
              newPassword.length > 0 && !isNewValid ? 'Password minimal 8 karakter' : undefined,
            )}

            {renderField(
              'confirm', 'Konfirmasi Password Baru',
              confirmPassword, setConfirmPassword,
              showConfirm, () => setShowConfirm(!showConfirm),
              'Ulangi password baru',
              confirmPassword.length > 0 && !isConfirmMatch ? 'Password tidak cocok' : undefined,
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <View style={styles.footer}>
        <Pressable
          style={({ pressed }) => [
            styles.saveBtn,
            (!canSave || saving) && styles.saveBtnDisabled,
            pressed && canSave && styles.pressed,
          ]}
          onPress={handleSave}
          disabled={!canSave || saving}
        >
          <MaterialIcons name="check" size={20} color={Colors.onPrimary} />
          <Text style={styles.saveBtnText}>{saving ? 'Menyimpan...' : 'Simpan Password Baru'}</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  flex: { flex: 1 },
  pressed: { opacity: 0.7 },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 12, height: 56,
    borderBottomWidth: 1, borderBottomColor: Colors.surfaceContainerHigh,
    backgroundColor: Colors.surface,
  },
  backBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontFamily: 'PlusJakartaSans_700Bold', fontSize: 18, color: Colors.onSurface },

  scroll: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 40, gap: 20 },

  infoCard: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 12,
    backgroundColor: `${Colors.primary}12`, borderRadius: 14, padding: 14,
    borderWidth: 1, borderColor: `${Colors.primary}30`,
  },
  infoText: {
    flex: 1, fontFamily: 'Inter_400Regular', fontSize: 13,
    color: Colors.onSurface, lineHeight: 19,
  },

  form: { gap: 18 },
  fieldGroup: { gap: 7 },
  label: { fontFamily: 'Inter_600SemiBold', fontSize: 13, color: Colors.onSurfaceVariant },
  labelFocused: { color: Colors.primary },
  inputWrapper: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: Colors.surfaceContainerLow, borderRadius: 14,
    paddingHorizontal: 16, height: 54,
    borderWidth: 2, borderColor: 'transparent',
  },
  inputFocused: { backgroundColor: Colors.surfaceContainerLowest, borderColor: Colors.primary },
  input: { flex: 1, fontFamily: 'Inter_400Regular', fontSize: 15, color: Colors.onSurface },
  errorHint: { fontFamily: 'Inter_400Regular', fontSize: 12, color: Colors.error },

  footer: {
    paddingHorizontal: 20, paddingTop: 12, paddingBottom: 28,
    borderTopWidth: 1, borderTopColor: Colors.surfaceContainerHigh,
    backgroundColor: Colors.background,
  },
  saveBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: Colors.primary, borderRadius: 999, height: 54,
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25, shadowRadius: 8, elevation: 4,
  },
  saveBtnDisabled: { opacity: 0.45, elevation: 0, shadowOpacity: 0 },
  saveBtnText: { fontFamily: 'Inter_600SemiBold', fontSize: 16, color: Colors.onPrimary },
});
