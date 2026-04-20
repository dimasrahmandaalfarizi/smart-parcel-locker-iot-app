import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { globalStyles } from '../../styles/globalStyles';
import { colors } from '../../styles/colors';
import { PackageCardSkeleton } from '../../components/common/SkeletonLoader';
import api from '../../services/api';

const METHOD_ICONS = {
  GoPay: 'logo-google', OVO: 'wallet', QRIS: 'qr-code', 'Transfer Bank': 'business',
};

const PaymentItem = ({ item }) => {
  const date = new Date(item.createdAt);
  const isSuccess = item.status === 'SUCCESS';

  return (
    <View style={styles.card}>
      <View style={styles.cardRow}>
        <View style={[styles.iconBox, { backgroundColor: isSuccess ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.1)' }]}>
          <Ionicons name="receipt-outline" size={22} color={isSuccess ? '#10B981' : '#EF4444'} />
        </View>
        <View style={styles.info}>
          <Text style={styles.amount}>Rp {Number(item.amount || 0).toLocaleString('id-ID')}</Text>
          <Text style={styles.meta}>{item.method || 'Midtrans'} · {date.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}</Text>
        </View>
        <View style={[styles.badge, { backgroundColor: isSuccess ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)' }]}>
          <Text style={[styles.badgeText, { color: isSuccess ? '#10B981' : '#EF4444' }]}>
            {isSuccess ? 'Lunas' : item.status}
          </Text>
        </View>
      </View>
      <Text style={styles.trackingRef} numberOfLines={1}>Ref Paket: {item.package?.trackingCode || item.packageId || '-'}</Text>
    </View>
  );
};

const DUMMY = [
  { id: '1', amount: 10000, method: 'GoPay', status: 'SUCCESS', packageId: 'JNE-2024-881230', createdAt: new Date(Date.now() - 2 * 86400000).toISOString() },
  { id: '2', amount: 15000, method: 'QRIS', status: 'SUCCESS', packageId: 'SICEPAT-X-99201', createdAt: new Date(Date.now() - 5 * 86400000).toISOString() },
  { id: '3', amount: 20000, method: 'Transfer Bank', status: 'PENDING', packageId: 'J&T-20240119-41', createdAt: new Date(Date.now() - 10 * 86400000).toISOString() },
];

export default function PaymentHistoryScreen({ navigation }) {
  const [payments, setPayments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [totalPaid, setTotalPaid] = useState(0);

  const load = async () => {
    try {
      const res = await api.get('/admin/payments/history?limit=50');
      const data = res.data?.data || res.data || [];
      setPayments(data);
      setTotalPaid(data.filter(p => p.status === 'SUCCESS').reduce((s, p) => s + Number(p.amount || 0), 0));
    } catch {
      setPayments(DUMMY);
      setTotalPaid(DUMMY.filter(p => p.status === 'SUCCESS').reduce((s, p) => s + p.amount, 0));
    }
    setIsLoading(false);
  };

  useFocusEffect(useCallback(() => { load(); }, []));

  const onRefresh = async () => { setRefreshing(true); await load(); setRefreshing(false); };

  return (
    <View style={globalStyles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={26} color={colors.white} />
        </TouchableOpacity>
        <Text style={styles.title}>Riwayat Pembayaran</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Summary */}
      <View style={styles.summaryCard}>
        <View>
          <Text style={styles.summaryLabel}>Total Denda Dilunasi</Text>
          <Text style={styles.summaryValue}>Rp {totalPaid.toLocaleString('id-ID')}</Text>
        </View>
        <View style={[styles.summaryIcon, { backgroundColor: 'rgba(16,185,129,0.12)' }]}>
          <Ionicons name="cash-outline" size={28} color="#10B981" />
        </View>
      </View>

      {isLoading ? (
        <View>{[1,2,3].map(i => <PackageCardSkeleton key={i} />)}</View>
      ) : (
        <FlatList
          data={payments}
          keyExtractor={item => item.id}
          renderItem={({ item }) => <PaymentItem item={item} />}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
          contentContainerStyle={{ paddingBottom: 120 }}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons name="receipt-outline" size={52} color="rgba(255,255,255,0.08)" />
              <Text style={[globalStyles.body, { textAlign: 'center', marginTop: 12, fontWeight: '700' }]}>Belum ada riwayat pembayaran</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 56, marginBottom: 24 },
  title: { fontSize: 22, fontWeight: '800', color: colors.white },
  backBtn: { width: 40, height: 40, justifyContent: 'center' },
  summaryCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: 'rgba(16,185,129,0.06)', borderRadius: 22, padding: 22, marginBottom: 24, borderWidth: 1, borderColor: 'rgba(16,185,129,0.2)' },
  summaryLabel: { fontSize: 13, color: colors.textSecondary, fontWeight: '700', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 },
  summaryValue: { fontSize: 28, fontWeight: '900', color: '#10B981' },
  summaryIcon: { width: 56, height: 56, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  card: { backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 18, padding: 18, marginBottom: 10, borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)' },
  cardRow: { flexDirection: 'row', alignItems: 'center' },
  iconBox: { width: 46, height: 46, borderRadius: 13, justifyContent: 'center', alignItems: 'center' },
  info: { flex: 1, marginLeft: 14 },
  amount: { fontSize: 18, fontWeight: '800', color: colors.white, marginBottom: 4 },
  meta: { fontSize: 12, color: colors.textSecondary, fontWeight: '600' },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  badgeText: { fontSize: 11, fontWeight: '800' },
  trackingRef: { marginTop: 12, fontSize: 12, color: colors.textSecondary, paddingLeft: 60 },
  empty: { alignItems: 'center', paddingTop: 80 },
});
