import { useCallback, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import UserService, { LeaderboardData, LeaderboardEntry } from '../../services/user.service';
import { mediaUrl } from '../../services/api';

interface DisplayEntry extends LeaderboardEntry {
  avatarColor: string;
  avatarInitials: string;
}

const AVATAR_COLORS = ['#2E7D32', '#1565C0', '#6A1B9A', '#BF360C', '#00695C', '#4527A0', '#E65100', '#AD1457'];

function getInitials(name: string) {
  return name.split(' ').slice(0, 2).map((w) => w[0]).join('').toUpperCase();
}

function levelOf(points: number) {
  if (points >= 3000) return 'Master Recycler';
  if (points >= 1500) return 'Green Champion';
  if (points >= 500) return 'Eco Warrior';
  if (points >= 100) return 'Pejuang Hijau';
  return 'Pemula';
}

function toDisplay(e: LeaderboardEntry): DisplayEntry {
  return {
    ...e,
    avatarInitials: getInitials(e.name),
    avatarColor: AVATAR_COLORS[(e.rank - 1) % AVATAR_COLORS.length],
  };
}

function Avatar({ entry, size }: { entry: DisplayEntry; size: number }) {
  const uri = mediaUrl(entry.avatarUrl);
  return (
    <View
      style={[
        styles.avatar,
        { width: size, height: size, borderRadius: size / 2, backgroundColor: entry.avatarColor },
      ]}
    >
      {uri ? (
        <Image source={{ uri }} style={{ width: size, height: size }} />
      ) : (
        <Text style={[styles.avatarText, { fontSize: size * 0.36 }]}>{entry.avatarInitials}</Text>
      )}
    </View>
  );
}

function firstName(name: string) {
  const parts = name.split(' ');
  return `${parts[0]}${parts[1] ? ` ${parts[1][0]}.` : ''}`;
}

const formatPts = (pts: number) => (pts >= 1000 ? `${(pts / 1000).toFixed(1)}k` : `${pts}`);

export default function LeaderboardScreen() {
  const [data, setData] = useState<LeaderboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const hasLoaded = useRef(false);

  const load = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true); else if (!hasLoaded.current) setLoading(true);
    try {
      const res = await UserService.getLeaderboard();
      setData(res);
      hasLoaded.current = true;
    } catch {
      // keep existing
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const entries = (data?.entries ?? []).map(toDisplay);
  const first = entries[0];
  const second = entries[1];
  const third = entries[2];
  const rest = entries.slice(3);
  const currentUser = data?.currentUser ?? null;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* ── Header ── */}
      <View style={styles.header}>
        <View style={styles.headerTitleRow}>
          <MaterialIcons name="leaderboard" size={24} color={Colors.primary} />
          <Text style={styles.headerTitle}>Leaderboard</Text>
        </View>
      </View>

      {loading ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scroll}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={() => load(true)} colors={[Colors.primary]} />
          }
        >
          <Text style={styles.subtitle}>Peringkat berdasarkan total EcoPoints</Text>

          {entries.length === 0 ? (
            <View style={styles.emptyBox}>
              <MaterialIcons name="emoji-events" size={48} color={Colors.outlineVariant} />
              <Text style={styles.emptyText}>Belum ada peringkat. Jadilah yang pertama!</Text>
            </View>
          ) : (
            <>
              {/* ── Podium ── */}
              <View style={styles.podium}>
                {/* 2nd */}
                {second ? (
                  <View style={styles.podiumSide}>
                    <View style={styles.podiumAvatarWrap}>
                      <Avatar entry={second} size={64} />
                      <View style={[styles.rankPill, styles.rankSilver]}>
                        <Text style={styles.rankPillText}>2nd</Text>
                      </View>
                    </View>
                    <Text style={styles.podiumName} numberOfLines={1}>{firstName(second.name)}</Text>
                    <Text style={styles.podiumPts}>{formatPts(second.points)}</Text>
                  </View>
                ) : <View style={styles.podiumSide} />}

                {/* 1st */}
                {first && (
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
                    <Text style={styles.podiumNameWinner} numberOfLines={1}>{firstName(first.name)}</Text>
                    <Text style={styles.podiumPtsWinner}>
                      {formatPts(first.points)}
                      <Text style={styles.podiumPtsUnit}> pts</Text>
                    </Text>
                  </View>
                )}

                {/* 3rd */}
                {third ? (
                  <View style={styles.podiumSide}>
                    <View style={styles.podiumAvatarWrap}>
                      <Avatar entry={third} size={64} />
                      <View style={[styles.rankPill, styles.rankBronze]}>
                        <Text style={styles.rankPillText}>3rd</Text>
                      </View>
                    </View>
                    <Text style={styles.podiumName} numberOfLines={1}>{firstName(third.name)}</Text>
                    <Text style={styles.podiumPts}>{formatPts(third.points)}</Text>
                  </View>
                ) : <View style={styles.podiumSide} />}
              </View>

              {/* ── Global rank list ── */}
              {rest.length > 0 && (
                <>
                  <Text style={styles.sectionTitle}>Peringkat Global</Text>
                  <View style={styles.list}>
                    {rest.map((entry) => (
                      <View
                        key={entry.id}
                        style={[styles.listItem, entry.isCurrentUser && styles.listItemCurrent]}
                      >
                        <Text style={styles.listRank}>{entry.rank}</Text>
                        <Avatar entry={entry} size={44} />
                        <View style={styles.listInfo}>
                          <View style={styles.listNameRow}>
                            <Text style={styles.listName} numberOfLines={1}>{entry.name}</Text>
                            {entry.isCurrentUser && (
                              <View style={styles.youBadge}>
                                <Text style={styles.youBadgeText}>Kamu</Text>
                              </View>
                            )}
                          </View>
                          <Text style={styles.listPts}>{entry.points.toLocaleString()} poin</Text>
                        </View>
                        <Text style={styles.listRankTag}>#{entry.rank}</Text>
                      </View>
                    ))}
                  </View>
                </>
              )}
            </>
          )}
        </ScrollView>
      )}

      {/* ── Sticky current-user footer ── */}
      {currentUser && (
        <View style={styles.footer}>
          <View style={styles.footerRank}>
            <Text style={styles.footerRankNum}>{currentUser.rank}</Text>
          </View>
          <View style={styles.footerAvatar}>
            {mediaUrl(currentUser.avatarUrl) ? (
              <Image source={{ uri: mediaUrl(currentUser.avatarUrl) }} style={styles.footerAvatarImg} />
            ) : (
              <MaterialIcons name="recycling" size={22} color={Colors.onPrimary} />
            )}
          </View>
          <View style={styles.footerInfo}>
            <Text style={styles.footerLabel}>Peringkat Kamu</Text>
            <Text style={styles.footerLevel}>{levelOf(currentUser.points)}</Text>
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
  loadingBox: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  subtitle: {
    fontFamily: 'Inter_400Regular', fontSize: 13, color: Colors.onSurfaceVariant,
    paddingHorizontal: 20, marginBottom: 20,
  },

  emptyBox: { alignItems: 'center', paddingVertical: 60, gap: 12, paddingHorizontal: 32 },
  emptyText: { fontFamily: 'Inter_400Regular', fontSize: 14, color: Colors.outline, textAlign: 'center' },

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
  avatar: { alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
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
    width: 40, height: 40, borderRadius: 20, overflow: 'hidden',
    backgroundColor: `${Colors.onPrimary}26`,
    alignItems: 'center', justifyContent: 'center',
  },
  footerAvatarImg: { width: 40, height: 40 },
  footerInfo: { flex: 1 },
  footerLabel: { fontFamily: 'Inter_600SemiBold', fontSize: 14, color: Colors.onPrimary },
  footerLevel: { fontFamily: 'Inter_400Regular', fontSize: 12, color: `${Colors.onPrimary}CC`, marginTop: 1 },
  footerPtsWrap: { alignItems: 'flex-end' },
  footerPts: { fontFamily: 'PlusJakartaSans_700Bold', fontSize: 20, color: Colors.onPrimary },
  footerPtsLabel: { fontFamily: 'Inter_500Medium', fontSize: 10, color: `${Colors.onPrimary}99`, letterSpacing: 1 },
});
