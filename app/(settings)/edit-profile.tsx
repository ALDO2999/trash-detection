import { useState } from 'react';
import {
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
import { MOCK_USER } from '../../constants/mockData';

export default function EditProfileScreen() {
  const user = MOCK_USER;
  const [name, setName] = useState(user.name);
  const [username, setUsername] = useState(user.username);
  const [city, setCity] = useState(user.city);
  const [phone, setPhone] = useState('');
  const [focused, setFocused] = useState<string | null>(null);

  const handleSave = () => {
    router.back();
  };

  const field = (
    key: string,
    label: string,
    value: string,
    setter: (v: string) => void,
    opts?: { placeholder?: string; icon?: any; keyboardType?: any; autoCapitalize?: any; hint?: string }
  ) => (
    <View style={styles.fieldGroup}>
      <Text style={[styles.label, focused === key && styles.labelFocused]}>{label}</Text>
      <View style={[styles.inputWrapper, focused === key && styles.inputFocused]}>
        {opts?.icon && (
          <MaterialIcons
            name={opts.icon}
            size={20}
            color={focused === key ? Colors.primary : Colors.outlineVariant}
          />
        )}
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={setter}
          placeholder={opts?.placeholder}
          placeholderTextColor={Colors.outline}
          keyboardType={opts?.keyboardType}
          autoCapitalize={opts?.autoCapitalize}
          onFocus={() => setFocused(key)}
          onBlur={() => setFocused(null)}
        />
      </View>
      {opts?.hint && <Text style={styles.hint}>{opts.hint}</Text>}
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable
          onPress={() => router.back()}
          style={({ pressed }) => [styles.backBtn, pressed && styles.pressed]}
        >
          <MaterialIcons name="arrow-back" size={24} color={Colors.onSurface} />
        </Pressable>
        <Text style={styles.headerTitle}>Edit Profil</Text>
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
          {/* Avatar */}
          <View style={styles.avatarSection}>
            <View style={styles.avatarWrap}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{user.avatarInitials}</Text>
              </View>
              <Pressable style={({ pressed }) => [styles.avatarEditBtn, pressed && styles.pressed]}>
                <MaterialIcons name="photo-camera" size={16} color={Colors.onPrimary} />
              </Pressable>
            </View>
            <Pressable>
              <Text style={styles.changePhotoText}>Ubah Foto Profil</Text>
            </Pressable>
          </View>

          {/* Fields */}
          <View style={styles.form}>
            {field('name', 'Nama Lengkap', name, setName, { icon: 'person-outline', placeholder: 'Nama lengkap' })}
            {field('username', 'Username', username, setUsername, {
              icon: 'alternate-email',
              placeholder: 'username',
              autoCapitalize: 'none',
            })}
            {field('city', 'Kota/Kabupaten', city, setCity, {
              icon: 'location-on',
              placeholder: 'Kota domisili',
              hint: 'Digunakan untuk rekomendasi bank sampah terdekat & leaderboard kota.',
            })}
            {field('phone', 'Nomor Telepon', phone, setPhone, {
              icon: 'phone',
              placeholder: '08xxxxxxxxxx',
              keyboardType: 'phone-pad',
            })}

            {/* Email (read-only) */}
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Email</Text>
              <View style={[styles.inputWrapper, styles.inputDisabled]}>
                <MaterialIcons name="mail-outline" size={20} color={Colors.outlineVariant} />
                <Text style={styles.inputDisabledText}>{user.email}</Text>
                <MaterialIcons name="lock-outline" size={16} color={Colors.outline} />
              </View>
              <Text style={styles.hint}>Email tidak dapat diubah karena terhubung dengan akun.</Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Save */}
      <View style={styles.footer}>
        <Pressable
          style={({ pressed }) => [styles.saveBtn, pressed && styles.pressed]}
          onPress={handleSave}
        >
          <MaterialIcons name="check" size={20} color={Colors.onPrimary} />
          <Text style={styles.saveBtnText}>Simpan Perubahan</Text>
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

  scroll: { paddingHorizontal: 20, paddingTop: 24, paddingBottom: 40 },

  avatarSection: { alignItems: 'center', marginBottom: 28, gap: 10 },
  avatarWrap: { position: 'relative' },
  avatar: {
    width: 96, height: 96, borderRadius: 48,
    backgroundColor: Colors.primaryContainer, alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { fontFamily: 'PlusJakartaSans_700Bold', fontSize: 32, color: Colors.onPrimaryContainer },
  avatarEditBtn: {
    position: 'absolute', bottom: 0, right: 0,
    width: 32, height: 32, borderRadius: 16, backgroundColor: Colors.primary,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 3, borderColor: Colors.background,
  },
  changePhotoText: { fontFamily: 'Inter_600SemiBold', fontSize: 14, color: Colors.primary },

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
  inputDisabled: { backgroundColor: Colors.surfaceContainerHigh },
  input: { flex: 1, fontFamily: 'Inter_400Regular', fontSize: 15, color: Colors.onSurface },
  inputDisabledText: { flex: 1, fontFamily: 'Inter_400Regular', fontSize: 15, color: Colors.onSurfaceVariant },
  hint: { fontFamily: 'Inter_400Regular', fontSize: 12, color: Colors.onSurfaceVariant, lineHeight: 17 },

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
  saveBtnText: { fontFamily: 'Inter_600SemiBold', fontSize: 16, color: Colors.onPrimary },
});
