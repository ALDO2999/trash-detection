import { useRef, useState } from 'react';
import {
  Dimensions,
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
  ViewToken,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';

const { width } = Dimensions.get('window');

const slides = [
  {
    id: '1',
    badge: 'AI Scanner',
    badgeIcon: 'smart-toy' as const,
    title: 'Scan dan Kenali\nSampahmu',
    subtitle: 'Identifikasi jenis sampah hanya dengan mengambil foto menggunakan teknologi AI kami.',
    illustration: require('../../assets/logo-trash.png'),
    bgColor: '#a3f69c',
  },
  {
    id: '2',
    badge: 'EcoPoints',
    badgeEmoji: '🏆',
    title: 'Setiap Sampah\nBernilai',
    subtitle: 'Kumpulkan poin dari setiap sampah yang kamu pilah dan tukarkan dengan berbagai reward menarik.',
    illustration: require('../../assets/logo-trash.png'),
    bgColor: '#fdcdbc',
  },
  {
    id: '3',
    badge: 'Community Impact',
    badgeEmoji: '🌍',
    title: 'Buat Dampak yang\nLebih Besar',
    subtitle: 'Ikuti tantangan, kumpulkan badge, dan lihat kontribusi nyatamu bersama komunitas dalam menjaga lingkungan.',
    illustration: require('../../assets/logo-trash.png'),
    bgColor: '#e1e3e4',
  },
];

type Slide = typeof slides[0];

function OnboardingSlide({ item }: { item: Slide }) {
  return (
    <View style={[styles.slide, { width }]}>
      <View style={styles.illustrationContainer}>
        <View style={[styles.illustrationBg, { backgroundColor: item.bgColor }]} />
        <Image source={item.illustration} style={styles.illustration} resizeMode="contain" />
      </View>

      <View style={styles.textContainer}>
        <View style={styles.badge}>
          {item.badgeEmoji ? (
            <Text style={styles.badgeEmoji}>{item.badgeEmoji}</Text>
          ) : (
            <MaterialIcons name={item.badgeIcon!} size={18} color={Colors.primary} />
          )}
          <Text style={styles.badgeText}>{item.badge}</Text>
        </View>

        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.subtitle}>{item.subtitle}</Text>
      </View>
    </View>
  );
}

export default function OnboardingScreen() {
  const [activeIndex, setActiveIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems[0]) {
        setActiveIndex(viewableItems[0].index ?? 0);
      }
    }
  );

  const handleNext = () => {
    if (activeIndex < slides.length - 1) {
      flatListRef.current?.scrollToIndex({ index: activeIndex + 1, animated: true });
    } else {
      router.replace('/(auth)/login');
    }
  };

  const handleSkip = () => {
    router.replace('/(auth)/login');
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.logoRow}>
          <MaterialIcons name="recycling" size={28} color={Colors.primary} />
          <Text style={styles.logoText}>EcoPoint</Text>
        </View>
        <Pressable onPress={handleSkip} style={({ pressed }) => pressed && styles.pressed}>
          <Text style={styles.skipText}>Lewati</Text>
        </Pressable>
      </View>

      {/* Slides */}
      <FlatList
        ref={flatListRef}
        data={slides}
        renderItem={({ item }) => <OnboardingSlide item={item} />}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onViewableItemsChanged={onViewableItemsChanged.current}
        viewabilityConfig={{ viewAreaCoveragePercentThreshold: 50 }}
        style={styles.flatList}
      />

      {/* Footer */}
      <View style={styles.footer}>
        {/* Dot Indicators */}
        <View style={styles.dots}>
          {slides.map((_, i) => (
            <View
              key={i}
              style={[
                styles.dot,
                i === activeIndex ? styles.dotActive : styles.dotInactive,
              ]}
            />
          ))}
        </View>

        {/* CTA Button */}
        <Pressable
          style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
          onPress={handleNext}
        >
          <Text style={styles.buttonText}>
            {activeIndex === slides.length - 1 ? 'Mulai Sekarang' : 'Lanjut'}
          </Text>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  logoText: {
    fontFamily: 'PlusJakartaSans_700Bold',
    fontSize: 18,
    color: Colors.primary,
  },
  skipText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
    color: Colors.onSurfaceVariant,
    letterSpacing: 0.1,
  },
  pressed: {
    opacity: 0.7,
  },
  flatList: {
    flex: 1,
  },
  slide: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  illustrationContainer: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  illustrationBg: {
    position: 'absolute',
    width: 280,
    height: 280,
    borderRadius: 140,
    opacity: 0.25,
  },
  illustration: {
    width: 280,
    height: 280,
  },
  textContainer: {
    alignItems: 'center',
    paddingBottom: 24,
    gap: 12,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 6,
    backgroundColor: `${Colors.primaryContainer}18`,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: `${Colors.primary}18`,
  },
  badgeEmoji: {
    fontSize: 16,
  },
  badgeText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 13,
    color: Colors.primary,
    letterSpacing: 0.1,
  },
  title: {
    fontFamily: 'PlusJakartaSans_700Bold',
    fontSize: 28,
    color: Colors.onSurface,
    textAlign: 'center',
    lineHeight: 36,
  },
  subtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 15,
    color: Colors.onSurfaceVariant,
    textAlign: 'center',
    lineHeight: 24,
    maxWidth: 300,
  },
  footer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    paddingTop: 24,
    gap: 20,
    alignItems: 'center',
  },
  dots: {
    flexDirection: 'row',
    gap: 6,
    alignItems: 'center',
  },
  dot: {
    borderRadius: 999,
  },
  dotActive: {
    width: 12,
    height: 12,
    backgroundColor: Colors.primary,
  },
  dotInactive: {
    width: 8,
    height: 8,
    backgroundColor: Colors.outlineVariant,
  },
  button: {
    width: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 999,
    paddingVertical: 16,
    paddingHorizontal: 32,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonPressed: {
    transform: [{ scale: 0.97 }],
    opacity: 0.9,
  },
  buttonText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 16,
    color: Colors.onPrimary,
    letterSpacing: 0.1,
  },
});
