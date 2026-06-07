import { useCallback, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { Colors } from '../../constants/colors';
import VoucherService, { Voucher, VoucherRedemption } from '../../services/voucher.service';
import PointsService, { PointTransaction } from '../../services/points.service';
import { getApiErrorMessage } from '../../hooks/useApiError';
import { useAuth } from '../../context/AuthContext';

type Tab = 'voucher' | 'milik' | 'riwayat';

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
}

function formatRupiah(value: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(value);
}

function daysRemaining(expiresAt: string) {
  const ms = new Date(expiresAt).getTime() - Date.now();
  return Math.ceil(ms / (1000 * 60 * 60 * 24));
}

export default function RewardsScreen() {
  const { refreshUser } = useAuth();
  const [tab, setTab] = useState<Tab>('voucher');

  const [pointBalance, setPointBalance] = useState(0);
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [myVouchers, setMyVouchers] = useState<VoucherRedemption[]>([]);
  const [transactions, setTransactions] = useState<PointTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [redeemingId, setRedeemingId] = useState<string | null>(null);
  const [successId, setSuccessId] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const hasLoaded = useRef(false);

  const loadAll = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true); else if (!hasLoaded.current) setLoading(true);
    try {
      const [balance, vList, myList, txList] = await Promise.all([
        PointsService.getBalance(),
        VoucherService.getAll(),
        VoucherService.getMyRedemptions(),
        PointsService.getHistory(),
      ]);
      setPointBalance(balance);
      setVouchers(vList);
      setMyVouchers(myList);
      setTransactions(txList);
      hasLoaded.current = true;
    } catch {
      // keep existing
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  const handleCopyCode = async (code: string) => {
    await Clipboard.setStringAsync(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode((c) => (c === code ? null : c)), 1500);
  };

  useFocusEffect(useCallback(() => { loadAll(); }, [loadAll]));

  const handleRedeem = async (voucher: Voucher) => {
    if (pointBalance < voucher.pointCost) return;

    Alert.alert(
      'Tukar Voucher',
      `Tukar ${voucher.pointCost} Poin dengan ${voucher.name} (${formatRupiah(voucher.value)})?`,
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Ya, Tukar',
          onPress: async () => {
            setRedeemingId(voucher.id);
            try {
              await VoucherService.redeem(voucher.id);
              setPointBalance((prev) => prev - voucher.pointCost);
              setSuccessId(voucher.id);
              setTimeout(() => setSuccessId(null), 2500);
              // Refresh voucher milik, riwayat poin + saldo global, lalu pindah ke tab Voucher Saya
              const [myList, txList] = await Promise.all([
                VoucherService.getMyRedemptions(),
                PointsService.getHistory(),
              ]);
              setMyVouchers(myList);
              setTransactions(txList);
              refreshUser();
              setTab('milik');
            } catch (err) {
              Alert.alert('Gagal', getApiErrorMessage(err));
            } finally {
              setRedeemingId(null);
            }
          },
        },
      ],
    );
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
            {loading ? (
              <ActivityIndicator color={Colors.onPrimary} />
            ) : (
              <Text style={styles.pointsValue}>{pointBalance.toLocaleString()}</Text>
            )}
            <Text style={styles.pointsLabel}>Poin tersedia</Text>
          </View>
        </View>
        <View style={styles.pointsHint}>
          <MaterialIcons name="info-outline" size={14} color={`${Colors.onPrimary}AA`} />
          <Text style={styles.pointsHintText}>Poin diperoleh setelah verifikasi petugas</Text>
        </View>
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        {(['voucher', 'milik', 'riwayat'] as Tab[]).map((t) => (
          <Pressable
            key={t}
            style={[styles.tab, tab === t && styles.tabActive]}
            onPress={() => setTab(t)}
          >
            <Text
              numberOfLines={1}
              style={[styles.tabText, tab === t && styles.tabTextActive]}
            >
              {t === 'voucher' ? 'Tukar' : t === 'milik' ? 'Voucher Saya' : 'Riwayat'}
            </Text>
          </Pressable>
        ))}
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => loadAll(true)} colors={[Colors.primary]} />
        }
      >
        {loading ? (
          <ActivityIndicator color={Colors.primary} style={{ marginTop: 40 }} />
        ) : tab === 'voucher' ? (
          <View style={styles.voucherList}>
            {vouchers.length === 0 ? (
              <View style={styles.emptyBox}>
                <MaterialIcons name="card-giftcard" size={48} color={Colors.outlineVariant} />
                <Text style={styles.emptyText}>Belum ada voucher tersedia</Text>
              </View>
            ) : (
              vouchers.map((v) => {
                const canRedeem = pointBalance >= v.pointCost && v.stock > 0;
                const isRedeeming = redeemingId === v.id;
                const justRedeemed = successId === v.id;
                return (
                  <View key={v.id} style={[styles.voucherCard, !canRedeem && styles.voucherCardDisabled]}>
                    <View style={styles.voucherLeft}>
                      <View style={styles.merchantBadge}>
                        <MaterialIcons name="storefront" size={20} color={Colors.primary} />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.voucherTitle}>{v.name}</Text>
                        <Text style={styles.voucherValue}>{formatRupiah(v.value)}</Text>
                        <View style={styles.voucherMeta}>
                          <Text style={styles.voucherStock}>Stok: {v.stock}</Text>
                          {v.expiresAt && (
                            <Text style={styles.voucherExpiry}>· s/d {formatDate(v.expiresAt)}</Text>
                          )}
                        </View>
                      </View>
                    </View>
                    <View style={styles.voucherRight}>
                      <Text style={styles.voucherPoints}>{v.pointCost} pts</Text>
                      <Pressable
                        style={({ pressed }) => [
                          styles.redeemBtn,
                          !canRedeem && styles.redeemBtnDisabled,
                          justRedeemed && styles.redeemBtnSuccess,
                          pressed && canRedeem && styles.pressed,
                        ]}
                        onPress={() => handleRedeem(v)}
                        disabled={!canRedeem || isRedeeming}
                      >
                        {isRedeeming ? (
                          <ActivityIndicator size="small" color={Colors.onPrimary} />
                        ) : (
                          <Text style={[styles.redeemBtnText, !canRedeem && styles.redeemBtnTextDisabled]}>
                            {justRedeemed ? '✓ Berhasil' : 'Tukar'}
                          </Text>
                        )}
                      </Pressable>
                    </View>
                  </View>
                );
              })
            )}

            <View style={styles.infoBox}>
              <MaterialIcons name="info-outline" size={18} color={Colors.tertiary} />
              <Text style={styles.infoText}>
                Setelah ditukar, voucher beserta kode-nya tersimpan di tab "Voucher Saya" dan berlaku 14 hari. Kode juga dikirim ke email Anda.
              </Text>
            </View>
          </View>
        ) : tab === 'milik' ? (
          <View style={styles.myVoucherList}>
            {myVouchers.length === 0 ? (
              <View style={styles.emptyBox}>
                <MaterialIcons name="confirmation-number" size={48} color={Colors.outlineVariant} />
                <Text style={styles.emptyText}>Belum ada voucher yang ditukar</Text>
                <Pressable onPress={() => setTab('voucher')}>
                  <Text style={styles.emptyLink}>Tukar voucher sekarang</Text>
                </Pressable>
              </View>
            ) : (
              myVouchers.map((r) => {
                const left = daysRemaining(r.expiresAt);
                const expired = left <= 0;
                const copied = copiedCode === r.code;
                return (
                  <View key={r.id} style={[styles.myVoucherCard, expired && styles.myVoucherCardExpired]}>
                    <View style={styles.myVoucherHeader}>
                      <View style={styles.merchantBadge}>
                        <MaterialIcons name="storefront" size={20} color={expired ? Colors.outline : Colors.primary} />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.voucherTitle}>{r.voucher.name}</Text>
                        <Text style={[styles.voucherValue, expired && styles.mutedText]}>
                          {formatRupiah(r.voucher.value)}
                        </Text>
                      </View>
                      <View style={[styles.statusPill, expired ? styles.statusPillExpired : styles.statusPillActive]}>
                        <MaterialIcons
                          name={expired ? 'cancel' : 'check-circle'}
                          size={12}
                          color={expired ? Colors.error : Colors.primary}
                        />
                        <Text style={[styles.statusPillText, { color: expired ? Colors.error : Colors.primary }]}>
                          {expired ? 'Kedaluwarsa' : 'Aktif'}
                        </Text>
                      </View>
                    </View>

                    {/* Kode voucher */}
                    <Pressable
                      style={({ pressed }) => [styles.codeBox, pressed && styles.pressed]}
                      onPress={() => handleCopyCode(r.code)}
                      disabled={expired}
                    >
                      <View>
                        <Text style={styles.codeLabel}>Kode Voucher</Text>
                        <Text style={[styles.codeValue, expired && styles.mutedText]}>{r.code}</Text>
                      </View>
                      <View style={styles.copyBtn}>
                        <MaterialIcons
                          name={copied ? 'check' : 'content-copy'}
                          size={16}
                          color={copied ? Colors.primary : Colors.onSurfaceVariant}
                        />
                        <Text style={[styles.copyBtnText, copied && { color: Colors.primary }]}>
                          {copied ? 'Tersalin' : 'Salin'}
                        </Text>
                      </View>
                    </Pressable>

                    {/* Expiry */}
                    <View style={styles.myVoucherFooter}>
                      <MaterialIcons
                        name="schedule"
                        size={14}
                        color={expired ? Colors.error : left <= 3 ? Colors.tertiary : Colors.onSurfaceVariant}
                      />
                      <Text
                        style={[
                          styles.expiryText,
                          expired
                            ? { color: Colors.error }
                            : left <= 3
                            ? { color: Colors.tertiary }
                            : null,
                        ]}
                      >
                        {expired
                          ? `Kedaluwarsa ${formatDate(r.expiresAt)}`
                          : `Berlaku sampai ${formatDate(r.expiresAt)} · ${left} hari lagi`}
                      </Text>
                    </View>
                  </View>
                );
              })
            )}
          </View>
        ) : (
          <View style={styles.transactionList}>
            {transactions.length === 0 ? (
              <View style={styles.emptyBox}>
                <MaterialIcons name="receipt-long" size={48} color={Colors.outlineVariant} />
                <Text style={styles.emptyText}>Belum ada riwayat transaksi</Text>
              </View>
            ) : (
              transactions.map((tx) => (
                <View key={tx.id} style={styles.txItem}>
                  <View style={[
                    styles.txIcon,
                    { backgroundColor: tx.type === 'EARNED' ? `${Colors.primary}15` : Colors.errorContainer },
                  ]}>
                    <MaterialIcons
                      name={tx.type === 'EARNED' ? 'add-circle' : 'redeem'}
                      size={20}
                      color={tx.type === 'EARNED' ? Colors.primary : Colors.error}
                    />
                  </View>
                  <View style={styles.txInfo}>
                    <Text style={styles.txDesc}>{tx.description}</Text>
                    <Text style={styles.txDate}>{formatDate(tx.createdAt)}</Text>
                  </View>
                  <Text style={[
                    styles.txPoints,
                    { color: tx.type === 'EARNED' ? Colors.primary : Colors.error },
                  ]}>
                    {tx.type === 'EARNED' ? '+' : '-'}{tx.amount} pts
                  </Text>
                </View>
              ))
            )}
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
  tabActive: {
    backgroundColor: Colors.surfaceContainerLowest,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08, shadowRadius: 4, elevation: 2,
  },
  tabText: { fontFamily: 'Inter_500Medium', fontSize: 13, color: Colors.onSurfaceVariant },
  tabTextActive: { fontFamily: 'Inter_600SemiBold', color: Colors.primary },

  scroll: { paddingHorizontal: 20 },

  emptyBox: { alignItems: 'center', paddingVertical: 48, gap: 12 },
  emptyText: { fontFamily: 'Inter_400Regular', fontSize: 14, color: Colors.outline },

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
  voucherValue: { fontFamily: 'PlusJakartaSans_700Bold', fontSize: 15, color: Colors.primary, marginTop: 2 },
  voucherMeta: { flexDirection: 'row', gap: 4, marginTop: 2 },
  voucherStock: { fontFamily: 'Inter_400Regular', fontSize: 11, color: Colors.onSurfaceVariant },
  voucherExpiry: { fontFamily: 'Inter_400Regular', fontSize: 11, color: Colors.outline },
  voucherRight: { alignItems: 'flex-end', gap: 8 },
  voucherPoints: { fontFamily: 'PlusJakartaSans_700Bold', fontSize: 15, color: Colors.primary },
  redeemBtn: {
    backgroundColor: Colors.primary, borderRadius: 999,
    paddingHorizontal: 16, paddingVertical: 7, minWidth: 64, alignItems: 'center',
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

  emptyLink: { fontFamily: 'Inter_600SemiBold', fontSize: 14, color: Colors.primary, marginTop: 4 },
  mutedText: { color: Colors.outline },

  myVoucherList: { gap: 12 },
  myVoucherCard: {
    backgroundColor: Colors.surfaceContainerLowest, borderRadius: 16, padding: 16, gap: 14,
    borderWidth: 1, borderColor: Colors.surfaceContainerHigh,
  },
  myVoucherCardExpired: { opacity: 0.65 },
  myVoucherHeader: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  statusPill: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999,
  },
  statusPillActive: { backgroundColor: `${Colors.primary}15` },
  statusPillExpired: { backgroundColor: Colors.errorContainer },
  statusPillText: { fontFamily: 'Inter_600SemiBold', fontSize: 11 },

  codeBox: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: Colors.surfaceContainerLow, borderRadius: 12, padding: 14,
    borderWidth: 1, borderColor: Colors.surfaceContainerHigh, borderStyle: 'dashed',
  },
  codeLabel: { fontFamily: 'Inter_400Regular', fontSize: 11, color: Colors.onSurfaceVariant },
  codeValue: {
    fontFamily: 'PlusJakartaSans_700Bold', fontSize: 18, color: Colors.onSurface,
    letterSpacing: 1, marginTop: 2,
  },
  copyBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  copyBtnText: { fontFamily: 'Inter_600SemiBold', fontSize: 12, color: Colors.onSurfaceVariant },

  myVoucherFooter: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  expiryText: { fontFamily: 'Inter_500Medium', fontSize: 12, color: Colors.onSurfaceVariant },

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
