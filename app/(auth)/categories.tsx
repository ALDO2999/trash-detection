import { useState } from 'react';
import {
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

const CATEGORIES = [
  { id: 'plastic', label: 'Plastic', icon: 'water-drop' as const },
  { id: 'paper', label: 'Paper', icon: 'description' as const },
  { id: 'cardboard', label: 'Cardboard', icon: 'inventory-2' as const },
  { id: 'metal', label: 'Metal', icon: 'hardware' as const },
  { id: 'battery', label: 'Battery', icon: 'battery-full' as const },
  { id: 'clothes', label: 'Clothes', icon: 'checkroom' as const },
  { id: 'shoes', label: 'Shoes', icon: 'roller-skating' as const },
];

export default function CategoriesScreen() {
  const [selected, setSelected] = useState<string[]>([]);

  const toggleCategory = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  const handleContinue = () => {
    router.replace('/(user)');
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
        <Text style={styles.headerTitle}>WasteSort AI</Text>
        <Pressable
          onPress={handleContinue}
          style={({ pressed }) => pressed && styles.pressed}
        >
          <Text style={styles.skipText}>Lewati</Text>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Headline */}
        <View style={styles.headline}>
          <Text style={styles.title}>Apa yang paling sering{'\n'}kamu kumpulkan?</Text>
          <Text style={styles.subtitle}>
            Pilih kategori sampah yang paling sering kamu temukan untuk personalisasi pengalaman sortir pintarmu.
          </Text>
        </View>

        {/* Category Grid */}
        <View style={styles.grid}>
          {CATEGORIES.map((cat) => {
            const isActive = selected.includes(cat.id);
            return (
              <Pressable
                key={cat.id}
                style={({ pressed }) => [
                  styles.categoryCard,
                  isActive && styles.categoryCardActive,
                  pressed && styles.cardPressed,
                ]}
                onPress={() => toggleCategory(cat.id)}
              >
                <View style={[styles.iconContainer, isActive && styles.iconContainerActive]}>
                  <MaterialIcons
                    name={cat.icon}
                    size={32}
                    color={isActive ? Colors.onPrimary : Colors.onSurface}
                  />
                </View>
                <Text style={[styles.categoryLabel, isActive && styles.categoryLabelActive]}>
                  {cat.label}
                </Text>
                {isActive && (
                  <View style={styles.checkOverlay}>
                    <MaterialIcons name="check-circle" size={18} color={Colors.primary} />
                  </View>
                )}
              </Pressable>
            );
          })}
        </View>

        {/* Selection hint */}
        {selected.length > 0 && (
          <View style={styles.selectionHint}>
            <Text style={styles.selectionText}>
              {selected.length} kategori dipilih
            </Text>
          </View>
        )}
      </ScrollView>

      {/* CTA Footer */}
      <View style={styles.footer}>
        <Pressable
          style={({ pressed }) => [
            styles.continueButton,
            selected.length === 0 && styles.continueDisabled,
            pressed && styles.pressed,
          ]}
          onPress={handleContinue}
        >
          <Text style={styles.continueText}>
            {selected.length > 0 ? 'Lanjutkan' : 'Pilih Kategori'}
          </Text>
          {selected.length > 0 && (
            <MaterialIcons name="arrow-forward" size={20} color={Colors.onPrimary} />
          )}
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
    paddingTop: 24,
    paddingBottom: 120,
  },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 32,
  },
  progressBar: {
    width: 48,
    height: 6,
    borderRadius: 999,
    backgroundColor: Colors.outlineVariant,
  },
  progressActive: {
    backgroundColor: Colors.primary,
  },
  headline: {
    alignItems: 'center',
    marginBottom: 32,
    gap: 10,
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
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  categoryCard: {
    width: '47%',
    backgroundColor: Colors.surfaceContainerLow,
    borderWidth: 1,
    borderColor: Colors.outlineVariant,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    gap: 12,
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  categoryCardActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.onPrimaryContainer,
  },
  cardPressed: {
    transform: [{ scale: 0.96 }],
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.surfaceContainerHigh,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainerActive: {
    backgroundColor: Colors.primary,
  },
  categoryLabel: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
    color: Colors.onSurface,
    letterSpacing: 0.1,
  },
  categoryLabelActive: {
    color: Colors.primary,
  },
  checkOverlay: {
    position: 'absolute',
    top: 10,
    right: 10,
  },
  selectionHint: {
    alignItems: 'center',
    marginTop: 20,
    padding: 10,
    backgroundColor: `${Colors.primary}1A`,
    borderRadius: 999,
  },
  selectionText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 13,
    color: Colors.primary,
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
  continueButton: {
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
  continueDisabled: {
    backgroundColor: Colors.surfaceContainerHigh,
    shadowOpacity: 0,
    elevation: 0,
  },
  continueText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 16,
    color: Colors.onPrimary,
  },
});
