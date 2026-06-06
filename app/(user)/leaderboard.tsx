import { useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { MOCK_LEADERBOARD, LeaderboardEntry } from '../../constants/mockData';

type Period = 'week' | 'all';
type Scope = 'national' | 'city';

const SCOPES: { id: Scope; label: string; icon: any }[] = [
  { id: 'national', label: 'Nasional', icon: 'public' },
  { id: 'city', label: 'Kota (Jakarta)', icon: 'location-on' },
];

function Avatar({ entry, size }: { entry: LeaderboardEntry; size: number }) {
  return (
    <View
      style={[
        styles.avatar,
        { width: size, height: size, borderRadius: size / 2, backgroundColor: entry.avatarColor },
      ]}
    >
      <Text style={[styles.avatarText, { fontSize: size * 0.36 }]}>{entry.avatarInitials}</Text>
    </View>
  );
}

export default function LeaderboardScreen() {
  const [period, setPeriod] = useState<Period>('week');
  const [scope, setScope] = useState<Scope>('national');

  const sorted = [...MOCK_LEADERBOARD].sort((a, b) => b.points - a.points);
  const [first, second, third, ...rest] = sorted;
  const currentUser = sorted.find((e) => e.isCurrentUser);
  const currentRank = currentUser ? sorted.indexOf(currentUser) + 1 : 0;

  const formatPts = (pts: number) =>
    pts >= 1000 ? `${(pts / 1000).toFixed(1)}k` : `${pts}`;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* ── Header ── */}
      <View style={styles.header}>
        <View style={styles.headerTitleRow}>
          <MaterialIcons name="leaderboard" size={24} color={Colors.primary} />
          <Text style={styles.headerTitle}>Leaderboard</Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* ── Period toggle ── */}
        <View style={styles.toggleRow}>
          <Pressable
            style={[styles.toggleBtn, period === 'week' && styles.toggleBtnActive]}
            onPress={() => setPeriod('week')}
          >
            <Text style={[styles.toggleText, period === 'week' && styles.toggleTextActive]}>
              Minggu Ini
            </Text>
          </Pressable>
          <Pressable
            style={[styles.toggleBtn, period === 'all' && styles.toggleBtnActive]}
            onPress={() => setPeriod('all')}
          >
            <Text style={[styles.toggleText, period === 'all' && styles.toggleTextActive]}>
              Semua Waktu
            </Text>
          </Pressable>
        </View>

        {/* ── Scope chips ── */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipRow}
        >
          {SCOPES.map((s) => {
            const active = scope === s.id;
            return (
              <Pressable
                key={s.id}
                style={[styles.chip, active && styles.chipActive]}
                onPress={() => setScope(s.id)}
              >
                <MaterialIcons
                  name={s.icon}
                  size={14}
                  color={active ? Colors.onPrimary : Colors.secondary}
                />
                <Text style={[styles.chipText, active && styles.chipTextActive]}>{s.label}</Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {/* ── Podium ── */}
        <View style={styles.podium}>
          {/* 2nd */}
          <View style={styles.podiumSide}>
            <View style={styles.podiumAvatarWrap}>
              <Avatar entry={second} size={64} />
              <View style={[styles.rankPill, styles.rankSilver]}>
                <Text style={styles.rankPillText}>2nd</Text>
              </View>
            </View>
            <Text style={styles.podiumName} numberOfLines={1}>
              {second.name.split(' ')[0]} {second.name.split(' ')[1]?.[0] ?? ''}.
            </Text>
            <Text style={styles.podiumPts}>{formatPts(second.points)}</Text>
          </View>

          {/* 1st */}
          <View style={styles.podiumCenter}>
            <MaterialIcons name="emoji-events" size={32} color={Colors.tertiaryFixedDim} />
            <View style={styles.podiumAvatarWrap}>
              <View style={styles.winnerRing}>
                <Avatar entry={first} size={84} />
              </View>
              <View style={[styles.rankPill, styles.rankGold]}>
                <Text style={styles.rankPillTextGold}>Winner</Text>
              </View>
            </View>
            <Text style={styles.podiumNameWinner} numberOfLines={1}>
              {first.name.split(' ')[0]} {first.name.split(' ')[1]?.[0] ?? ''}.
            </Text>
            <Text style={styles.podiumPtsWinner}>
              {formatPts(first.points)}
              <Text style={styles.podiumPtsUnit}> pts</Text>
            </Text>
          </View>

          {/* 3rd */}
          <View style={styles.podiumSide}>
            <View style={styles.podiumAvatarWrap}>
              <Avatar entry={third} size={64} />
              <View style={[styles.rankPill, styles.rankBronze]}>
                <Text style={styles.rankPillText}>3rd</Text>
              </View>
            </View>
            <Text style={styles.podiumName} numberOfLines={1}>
              {third.name.split(' ')[0]} {third.name.split(' ')[1]?.[0] ?? ''}.
            </Text>
            <Text style={styles.podiumPts}>{formatPts(third.points)}</Text>
          </View>
        </View>

        {/* ── Global rank list ── */}
        <Text style={styles.sectionTitle}>Peringkat Global</Text>
        <View style={styles.list}>
          {rest.map((entry, i) => {
            const rank = i + 4;
            return (
              <View
                key={entry.id}
                style={[styles.listItem, entry.isCurrentUser && styles.listItemCurrent]}
              >
                <Text style={styles.listRank}>{rank}</Text>
                <Avatar entry={entry} size={44} />
                <View style={styles.listInfo}>
                  <View style={styles.listNameRow}>
                    <Text style={styles.listName} numberOfLines={1}>
                      {entry.name}
                    </Text>
                    {rank === 4 && (
                      <MaterialIcons name="military-tech" size={15} color={Colors.tertiaryFixedDim} />
                    )}
                    {entry.isCurrentUser && (
                      <View style={styles.youBadge}>
                        <Text style={styles.youBadgeText}>Kamu</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.listPts}>{entry.points.toLocaleString()} poin</Text>
                </View>
                <Text style={styles.listRankTag}>#{rank}</Text>
              </View>
            );
          })}
        </View>
      </ScrollView>

      {/* ── Sticky current-user footer ── */}
      {currentUser && (
        <View style={styles.footer}>
          <View style={styles.footerRank}>
            <Text style={styles.footerRankNum}>{currentRank}</Text>
          </View>
          <View style={styles.footerAvatar}>
            <MaterialIcons name="recycling" size={22} color={Colors.onPrimary} />
          </View>
          <View style={styles.footerInfo}>
            <Text style={styles.footerLabel}>Peringkat Kamu</Text>
            <Text style={styles.footerLevel}>
              {currentUser.level} · Level 12
            </Text>
          </View>
          <View style={styles.footerPtsWrap}>
            <Text style={styles.footerPts}>{currentUser.points.toLocaleString()}</Text>
            <Text style={styles.footerPtsLabel}>POIN</Text>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },

  // Header
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 12,
  },
  headerTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  headerTitle: { fontFamily: 'PlusJakartaSans_700Bold', fontSize: 22, color: Colors.primary },

  scroll: { paddingBottom: 120 },

  // Period toggle
  toggleRow: {
    flexDirection: 'row', marginHorizontal: 20, marginBottom: 16,
    backgroundColor: Colors.surfaceContainerHigh, borderRadius: 999, padding: 4,
  },
  toggleBtn: { flex: 1, height: 38, borderRadius: 999, alignItems: 'center', justifyContent: 'center' },
  toggleBtnActive: {
    backgroundColor: Colors.primary,
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25, shadowRadius: 4, elevation: 2,
  },
  toggleText: { fontFamily: 'Inter_600SemiBold', fontSize: 13, color: Colors.onSurfaceVariant },
  toggleTextActive: { color: Colors.onPrimary },

  // Scope chips
  chipRow: { paddingHorizontal: 20, gap: 8, paddingBottom: 20 },
  chip: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: 14, height: 34, borderRadius: 999,
    backgroundColor: Colors.secondaryContainer,
  },
  chipActive: { backgroundColor: Colors.secondary },
  chipText: { fontFamily: 'Inter_600SemiBold', fontSize: 12, color: Colors.secondary },
  chipTextActive: { color: Colors.onPrimary },

  // Podium
  podium: {
    flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'center',
    gap: 12, paddingHorizontal: 20, marginBottom: 28,
  },
  podiumSide: { alignItems: 'center', flex: 1, gap: 4 },
  podiumCenter: { alignItems: 'center', flex: 1.2, gap: 4 },
  podiumAvatarWrap: { alignItems: 'center', marginBottom: 8 },
  winnerRing: {
    padding: 4, borderRadius: 50, borderWidth: 3, borderColor: Colors.tertiaryFixedDim,
  },
  rankPill: {
    position: 'absolute', bottom: -8, alignSelf: 'center',
    paddingHorizontal: 10, paddingVertical: 2, borderRadius: 999,
    borderWidth: 2, borderColor: Colors.background,
  },
  rankGold: { backgroundColor: Colors.tertiaryFixedDim },
  rankSilver: { backgroundColor: '#B0BEC5' },
  rankBronze: { backgroundColor: '#BCAAA4' },
  rankPillText: { fontFamily: 'Inter_600SemiBold', fontSize: 10, color: Colors.onPrimary },
  rankPillTextGold: { fontFamily: 'Inter_600SemiBold', fontSize: 10, color: '#5b4300' },
  podiumName: { fontFamily: 'Inter_600SemiBold', fontSize: 13, color: Colors.onSurface },
  podiumNameWinner: { fontFamily: 'PlusJakartaSans_700Bold', fontSize: 16, color: Colors.onSurface },
  podiumPts: { fontFamily: 'PlusJakartaSans_700Bold', fontSize: 16, color: Colors.primary },
  podiumPtsWinner: { fontFamily: 'PlusJakartaSans_800ExtraBold', fontSize: 26, color: Colors.primary },
  podiumPtsUnit: { fontFamily: 'Inter_500Medium', fontSize: 13, color: Colors.onSurfaceVariant },

  // Avatar
  avatar: { alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontFamily: 'Inter_600SemiBold', color: '#fff' },

  // List
  sectionTitle: {
    fontFamily: 'PlusJakartaSans_700Bold', fontSize: 18, color: Colors.onSurface,
    paddingHorizontal: 20, marginBottom: 12,
  },
  list: { paddingHorizontal: 20, gap: 10 },
  listItem: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: 14, padding: 12,
    borderWidth: 1, borderColor: Colors.surfaceContainerHigh,
  },
  listItemCurrent: {
    borderColor: Colors.primary, borderWidth: 1.5,
    backgroundColor: `${Colors.primary}08`,
  },
  listRank: {
    fontFamily: 'PlusJakartaSans_700Bold', fontSize: 15, color: Colors.onSurfaceVariant,
    width: 22, textAlign: 'center',
  },
  listInfo: { flex: 1, gap: 2 },
  listNameRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  listName: { fontFamily: 'Inter_600SemiBold', fontSize: 14, color: Colors.onSurface, flexShrink: 1 },
  youBadge: {
    backgroundColor: `${Colors.primary}15`, paddingHorizontal: 7, paddingVertical: 1, borderRadius: 999,
  },
  youBadgeText: { fontFamily: 'Inter_600SemiBold', fontSize: 10, color: Colors.primary },
  listPts: { fontFamily: 'Inter_400Regular', fontSize: 12, color: Colors.onSurfaceVariant },
  listRankTag: { fontFamily: 'Inter_600SemiBold', fontSize: 13, color: Colors.primary },

  // Footer
  footer: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    flexDirection: 'row', alignItems: 'center', gap: 12,
    marginHorizontal: 16, marginBottom: 16,
    backgroundColor: Colors.primary, borderRadius: 16, padding: 14,
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 12, elevation: 6,
  },
  footerRank: {
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: `${Colors.onPrimary}26`,
    alignItems: 'center', justifyContent: 'center',
  },
  footerRankNum: { fontFamily: 'PlusJakartaSans_700Bold', fontSize: 18, color: Colors.onPrimary },
  footerAvatar: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: `${Colors.onPrimary}26`,
    alignItems: 'center', justifyContent: 'center',
  },
  footerInfo: { flex: 1 },
  footerLabel: { fontFamily: 'Inter_600SemiBold', fontSize: 14, color: Colors.onPrimary },
  footerLevel: { fontFamily: 'Inter_400Regular', fontSize: 12, color: `${Colors.onPrimary}CC`, marginTop: 1 },
  footerPtsWrap: { alignItems: 'flex-end' },
  footerPts: { fontFamily: 'PlusJakartaSans_700Bold', fontSize: 20, color: Colors.onPrimary },
  footerPtsLabel: { fontFamily: 'Inter_500Medium', fontSize: 10, color: `${Colors.onPrimary}99`, letterSpacing: 1 },
});
