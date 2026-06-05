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
import {
  MOCK_USER,
  MOCK_VOUCHERS,
  MOCK_TRANSACTIONS,
} from '../../constants/mockData';

type Tab = 'voucher' | 'riwayat';

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function RewardsScreen() {
  const [tab, setTab] = useState<Tab>('voucher');
  const [redeemSuccess, setRedeemSuccess] = useState<string | null>(null);

  const handleRedeem = (id: string, points: number) => {
    if (MOCK_USER.points >= points) {
      setRedeemSuccess(id);
      setTimeout(() => setRedeemSuccess(null), 2000);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Poin & Reward</Text>
      </View>

      {/* Points summary */}
      <View style={styles.pointsSummary}>
        <View style={styles.pointsMain}>
          <MaterialIcons name="stars" size={28} color={Colors.tertiaryFixedDim} />
          <View>
            <Text style={styles.pointsValue}>{MOCK_USER.points.toLocaleString()}</Text>
            <Text style={styles.pointsLabel}>EcoPoints tersedia</Text>
          </View>
        </View>
        <View style={styles.pointsHint}>
          <MaterialIcons name="info-outline" size={14} color={Colors.onSurfaceVariant} />
          <Text style={styles.pointsHintText}>Poin diperoleh setelah verifikasi petugas</Text>
        </View>
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        {(['voucher', 'riwayat'] as Tab[]).map((t) => (
          <Pressable
            key={t}
            style={[styles.tab, tab === t && styles.tabActive]}
            onPress={() => setTab(t)}
          >
            <Text style={[styles.tabText, tab === t && styles.tabTextActive]}>
              {t === 'voucher' ? 'Tukar Voucher' : 'Riwayat Poin'}
            </Text>
          </Pressable>
        ))}
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {tab === 'voucher' ? (
          <View style={styles.voucherList}>
            {MOCK_VOUCHERS.map((v) => {
              const canRedeem = MOCK_USER.points >= v.pointsRequired;
              const justRedeemed = redeemSuccess === v.id;
              return (
                <View key={v.id} style={[styles.voucherCard, !canRedeem && styles.voucherCardDisabled]}>
                  <View style={styles.voucherLeft}>
                    <View style={styles.merchantBadge}>
                      <MaterialIcons name="storefront" size={20} color={Colors.primary} />
                    </View>
                    <View>
                      <Text style={styles.voucherTitle}>{v.title}</Text>
                      <Text style={styles.voucherMerchant}>{v.merchant}</Text>
                      <Text style={styles.voucherExpiry}>Berlaku s/d {formatDate(v.expiresAt)}</Text>
                    </View>
                  </View>
                  <View style={styles.voucherRight}>
                    <Text style={styles.voucherPoints}>{v.pointsRequired} pts</Text>
                    <Pressable
                      style={({ pressed }) => [
                        styles.redeemBtn,
                        !canRedeem && styles.redeemBtnDisabled,
                        justRedeemed && styles.redeemBtnSuccess,
                        pressed && canRedeem && styles.pressed,
                      ]}
                      onPress={() => handleRedeem(v.id, v.pointsRequired)}
                      disabled={!canRedeem}
                    >
                      <Text style={[styles.redeemBtnText, !canRedeem && styles.redeemBtnTextDisabled]}>
                        {justRedeemed ? 'Berhasil!' : 'Tukar'}
                      </Text>
                    </Pressable>
                  </View>
                </View>
              );
            })}

            <View style={styles.infoBox}>
              <MaterialIcons name="info-outline" size={18} color={Colors.tertiary} />
              <Text style={styles.infoText}>
                Voucher dikirim ke email terdaftar setelah penukaran berhasil.
              </Text>
            </View>
          </View>
        ) : (
          <View style={styles.transactionList}>
            {MOCK_TRANSACTIONS.map((tx) => (
              <View key={tx.id} style={styles.txItem}>
                <View style={[
                  styles.txIcon,
                  { backgroundColor: tx.type === 'earned' ? `${Colors.primary}15` : Colors.errorContainer },
                ]}>
                  <MaterialIcons
                    name={tx.type === 'earned' ? 'add-circle' : 'redeem'}
                    size={20}
                    color={tx.type === 'earned' ? Colors.primary : Colors.error}
                  />
                </View>
                <View style={styles.txInfo}>
                  <Text style={styles.txDesc}>{tx.description}</Text>
                  <Text style={styles.txDate}>{formatDate(tx.date)}</Text>
                </View>
                <Text style={[
                  styles.txPoints,
                  { color: tx.type === 'earned' ? Colors.primary : Colors.error },
                ]}>
                  {tx.type === 'earned' ? '+' : ''}{tx.points} pts
                </Text>
              </View>
            ))}
          </View>
        )}
        <View style={{ height: 20 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },

  header: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 4 },
  headerTitle: { fontFamily: 'PlusJakartaSans_700Bold', fontSize: 22, color: Colors.onSurface },

  pointsSummary: {
    marginHorizontal: 20, marginVertical: 16,
    backgroundColor: Colors.primary, borderRadius: 20, padding: 20, gap: 12,
  },
  pointsMain: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  pointsValue: { fontFamily: 'PlusJakartaSans_700Bold', fontSize: 32, color: Colors.onPrimary },
  pointsLabel: { fontFamily: 'Inter_400Regular', fontSize: 13, color: `${Colors.onPrimary}CC` },
  pointsHint: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  pointsHintText: { fontFamily: 'Inter_400Regular', fontSize: 12, color: `${Colors.onPrimary}AA`, flex: 1 },

  tabs: {
    flexDirection: 'row',
    marginHorizontal: 20, marginBottom: 16,
    backgroundColor: Colors.surfaceContainerLow,
    borderRadius: 12, padding: 4,
  },
  tab: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 10 },
  tabActive: { backgroundColor: Colors.surfaceContainerLowest, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.08, shadowRadius: 4, elevation: 2 },
  tabText: { fontFamily: 'Inter_500Medium', fontSize: 14, color: Colors.onSurfaceVariant },
  tabTextActive: { fontFamily: 'Inter_600SemiBold', color: Colors.primary },

  scroll: { paddingHorizontal: 20 },

  voucherList: { gap: 12 },
  voucherCard: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: Colors.surfaceContainerLowest, borderRadius: 16, padding: 16,
    borderWidth: 1, borderColor: Colors.surfaceContainerHigh,
  },
  voucherCardDisabled: { opacity: 0.5 },
  voucherLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  merchantBadge: {
    width: 44, height: 44, borderRadius: 12,
    backgroundColor: `${Colors.primary}15`,
    alignItems: 'center', justifyContent: 'center',
  },
  voucherTitle: { fontFamily: 'Inter_600SemiBold', fontSize: 14, color: Colors.onSurface },
  voucherMerchant: { fontFamily: 'Inter_400Regular', fontSize: 12, color: Colors.onSurfaceVariant },
  voucherExpiry: { fontFamily: 'Inter_400Regular', fontSize: 11, color: Colors.outline, marginTop: 2 },
  voucherRight: { alignItems: 'flex-end', gap: 8 },
  voucherPoints: { fontFamily: 'PlusJakartaSans_700Bold', fontSize: 15, color: Colors.primary },
  redeemBtn: {
    backgroundColor: Colors.primary, borderRadius: 999,
    paddingHorizontal: 16, paddingVertical: 7,
  },
  redeemBtnDisabled: { backgroundColor: Colors.surfaceContainerHigh },
  redeemBtnSuccess: { backgroundColor: Colors.primaryContainer },
  redeemBtnText: { fontFamily: 'Inter_600SemiBold', fontSize: 13, color: Colors.onPrimary },
  redeemBtnTextDisabled: { color: Colors.outline },
  pressed: { opacity: 0.7 },

  infoBox: {
    flexDirection: 'row', gap: 10, alignItems: 'flex-start',
    backgroundColor: `${Colors.tertiaryFixedDim}22`, borderRadius: 12, padding: 14,
    borderWidth: 1, borderColor: `${Colors.tertiaryFixedDim}44`,
  },
  infoText: { flex: 1, fontFamily: 'Inter_400Regular', fontSize: 13, color: Colors.onSurfaceVariant, lineHeight: 19 },

  transactionList: { gap: 2 },
  txItem: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: Colors.surfaceContainerHigh,
  },
  txIcon: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  txInfo: { flex: 1 },
  txDesc: { fontFamily: 'Inter_500Medium', fontSize: 14, color: Colors.onSurface },
  txDate: { fontFamily: 'Inter_400Regular', fontSize: 12, color: Colors.onSurfaceVariant, marginTop: 2 },
  txPoints: { fontFamily: 'PlusJakartaSans_700Bold', fontSize: 15 },
});
