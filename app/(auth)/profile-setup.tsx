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

export default function ProfileSetupScreen() {
  const [username, setUsername] = useState('');
  const [city, setCity] = useState('');
  const [usernameFocused, setUsernameFocused] = useState(false);
  const [cityFocused, setCityFocused] = useState(false);

  const handleSave = () => {
    if (username && city) {
      router.replace('/(auth)/categories');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Background blobs */}
      <View style={styles.blobTopRight} />
      <View style={styles.blobBottomLeft} />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.logoRow}>
          <MaterialIcons name="eco" size={24} color={Colors.primary} />
          <Text style={styles.headerTitle}>WasteSort AI</Text>
        </View>
        <Pressable
          onPress={() => router.replace('/(auth)/categories')}
          style={({ pressed }) => pressed && styles.pressed}
        >
          <Text style={styles.skipText}>Lewati</Text>
        </Pressable>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Welcome */}
          <View style={styles.welcome}>
            <Text style={styles.title}>Lengkapi Profil</Text>
            <Text style={styles.subtitle}>
              Personalisasi pengalaman sortir sampah pintar Anda hari ini.
            </Text>
          </View>

          {/* Avatar Upload */}
          <View style={styles.avatarSection}>
            <View style={styles.avatarContainer}>
              <View style={styles.avatarPlaceholder}>
                <MaterialIcons name="add-a-photo" size={32} color={Colors.onSurfaceVariant} />
                <Text style={styles.avatarLabel}>Unggah Foto</Text>
              </View>
              <View style={styles.avatarEditButton}>
                <MaterialIcons name="edit" size={18} color={Colors.onPrimary} />
              </View>
            </View>
          </View>

          {/* Fields */}
          <View style={styles.fields}>
            {/* Username */}
            <View style={styles.fieldGroup}>
              <View style={styles.labelRow}>
                <MaterialIcons name="person-outline" size={16} color={Colors.onSurfaceVariant} />
                <Text style={[styles.label, usernameFocused && styles.labelFocused]}>Username</Text>
              </View>
              <View style={[styles.inputWrapper, usernameFocused && styles.inputFocused]}>
                <TextInput
                  style={styles.input}
                  placeholder="Masukkan nama pengguna"
                  placeholderTextColor={Colors.outline}
                  value={username}
                  onChangeText={setUsername}
                  onFocus={() => setUsernameFocused(true)}
                  onBlur={() => setUsernameFocused(false)}
                  autoCapitalize="none"
                />
              </View>
            </View>

            {/* City */}
            <View style={styles.fieldGroup}>
              <View style={styles.labelRow}>
                <MaterialIcons name="location-on" size={16} color={Colors.onSurfaceVariant} />
                <Text style={[styles.label, cityFocused && styles.labelFocused]}>
                  Kota/Kabupaten
                </Text>
                <View style={styles.importantBadge}>
                  <Text style={styles.importantText}>PENTING</Text>
                </View>
              </View>
              <View style={[styles.inputWrapper, cityFocused && styles.inputFocused]}>
                <MaterialIcons
                  name="search"
                  size={20}
                  color={cityFocused ? Colors.primary : Colors.onSurfaceVariant}
                  style={styles.searchIcon}
                />
                <TextInput
                  style={[styles.input, styles.inputWithIcon]}
                  placeholder="Cari kota Anda..."
                  placeholderTextColor={Colors.outline}
                  value={city}
                  onChangeText={setCity}
                  onFocus={() => setCityFocused(true)}
                  onBlur={() => setCityFocused(false)}
                />
              </View>
              <Text style={styles.fieldHint}>
                Digunakan untuk merekomendasikan tempat pembuangan sampah terdekat.
              </Text>
            </View>

            {/* Info chip */}
            <View style={styles.infoChip}>
              <MaterialIcons name="info-outline" size={20} color={Colors.primaryContainer} />
              <Text style={styles.infoText}>
                Data Anda aman. Kami hanya menggunakan informasi lokasi untuk membantu Anda mengelola limbah secara efisien.
              </Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Floating CTA */}
      <View style={styles.footer}>
        <Pressable
          style={({ pressed }) => [
            styles.saveButton,
            (!username || !city) && styles.saveDisabled,
            pressed && styles.pressed,
          ]}
          onPress={handleSave}
        >
          <Text style={styles.saveText}>Simpan & Lanjut</Text>
          <MaterialIcons name="arrow-forward" size={20} color={Colors.onPrimary} />
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  flex: {
    flex: 1,
  },
  blobTopRight: {
    position: 'absolute',
    top: '-10%' as any,
    right: '-10%' as any,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: `${Colors.primary}0D`,
    zIndex: -1,
  },
  blobBottomLeft: {
    position: 'absolute',
    bottom: '-5%' as any,
    left: '-5%' as any,
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: `${Colors.tertiary}0D`,
    zIndex: -1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    height: 56,
    backgroundColor: `${Colors.surface}CC`,
    borderBottomWidth: 1,
    borderBottomColor: Colors.surfaceContainerHigh,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontFamily: 'PlusJakartaSans_700Bold',
    fontSize: 20,
    color: Colors.primary,
  },
  skipText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
    color: Colors.onSurfaceVariant,
  },
  pressed: {
    opacity: 0.7,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 28,
    paddingBottom: 120,
  },
  welcome: {
    alignItems: 'center',
    marginBottom: 32,
    gap: 6,
  },
  title: {
    fontFamily: 'PlusJakartaSans_700Bold',
    fontSize: 26,
    color: Colors.onSurface,
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 15,
    color: Colors.onSurfaceVariant,
    textAlign: 'center',
    lineHeight: 22,
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: 40,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatarPlaceholder: {
    width: 128,
    height: 128,
    borderRadius: 64,
    backgroundColor: Colors.surfaceContainerHigh,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: Colors.outlineVariant,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  avatarLabel: {
    fontFamily: 'Inter_500Medium',
    fontSize: 12,
    color: Colors.onSurfaceVariant,
  },
  avatarEditButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: Colors.surface,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  fields: {
    gap: 24,
  },
  fieldGroup: {
    gap: 8,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  label: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 13,
    color: Colors.onSurfaceVariant,
    flex: 1,
  },
  labelFocused: {
    color: Colors.primary,
  },
  importantBadge: {
    backgroundColor: Colors.tertiaryContainer,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
  },
  importantText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 9,
    color: Colors.onTertiary,
    letterSpacing: 0.8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F1F1',
    borderRadius: 14,
    paddingHorizontal: 16,
    height: 56,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  inputFocused: {
    backgroundColor: Colors.surfaceContainerLowest,
    borderColor: Colors.primary,
  },
  searchIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontFamily: 'Inter_400Regular',
    fontSize: 15,
    color: Colors.onSurface,
  },
  inputWithIcon: {
    flex: 1,
  },
  fieldHint: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: Colors.onSurfaceVariant,
    marginLeft: 2,
    lineHeight: 17,
  },
  infoChip: {
    flexDirection: 'row',
    gap: 12,
    backgroundColor: `${Colors.primaryContainer}1A`,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: `${Colors.primaryContainer}33`,
  },
  infoText: {
    flex: 1,
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    color: Colors.onSurface,
    lineHeight: 19,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingBottom: 36,
    paddingTop: 16,
    backgroundColor: Colors.background,
  },
  saveButton: {
    backgroundColor: Colors.primary,
    borderRadius: 999,
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  saveDisabled: {
    opacity: 0.5,
  },
  saveText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 16,
    color: Colors.onPrimary,
  },
});
