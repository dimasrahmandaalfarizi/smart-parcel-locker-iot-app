import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl, TouchableOpacity } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { globalStyles } from '../../styles/globalStyles';
import { colors } from '../../styles/colors';
import { PackageCardSkeleton } from '../../components/common/SkeletonLoader';
import StatusBadge from '../../components/locker/StatusBadge';
import api from '../../services/api';

const HistoryItem = ({ item, onPress }) => {
  const isPenalty = item.overtimeFee > 0;
  const date = item.updatedAt ? new Date(item.updatedAt) : new Date();

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
      <View style={styles.cardHeader}>
        <View style={[styles.iconBox, { backgroundColor: isPenalty ? 'rgba(239,68,68,0.1)' : 'rgba(16,185,129,0.1)' }]}>
          <Ionicons
            name={isPenalty ? 'warning-outline' : 'checkmark-circle-outline'}
            size={22}
            color={isPenalty ? '#EF4444' : '#10B981'}
          />
        </View>
        <View style={styles.cardInfo}>
          <Text style={styles.tracking} numberOfLines={1}>{item.trackingCode || 'Tanpa Kode'}</Text>
          <Text style={styles.date}>
            {date.toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })} — {date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
          </Text>
        </View>
        <StatusBadge status={item.status?.toLowerCase() || 'delivered'} />
      </View>

      <View style={styles.cardFooter}>
        <View style={styles.footerChip}>
          <Ionicons name="cube-outline" size={13} color={colors.textSecondary} style={{ marginRight: 4 }} />
          <Text style={styles.footerChipText}>{item.lockerNumber || `Loker #${item.lockerId || '?'}`}</Text>
        </View>
        {isPenalty && (
          <View style={styles.penaltyChip}>
            <Text style={styles.penaltyText}>Denda Rp {item.overtimeFee?.toLocaleString('id-ID')}</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

// ─── Dummy data saat API history belum tersedia ───────────────────────────────
const DUMMY_HISTORY = [
  { id: '1', trackingCode: 'JNE-2024-881230', status: 'DELIVERED', lockerNumber: 'Loker A3', overtimeFee: 0, updatedAt: new Date(Date.now() - 1 * 24 * 3600000).toISOString() },
  { id: '2', trackingCode: 'SICEPAT-X-99201', status: 'DELIVERED', lockerNumber: 'Loker B1', overtimeFee: 15000, updatedAt: new Date(Date.now() - 3 * 24 * 3600000).toISOString() },
  { id: '3', trackingCode: 'J&T-20240119-41', status: 'DELIVERED', lockerNumber: 'Loker C2', overtimeFee: 0, updatedAt: new Date(Date.now() - 7 * 24 * 3600000).toISOString() },
  { id: '4', trackingCode: 'ANTERAJA-882010', status: 'DELIVERED', lockerNumber: 'Loker A1', overtimeFee: 10000, updatedAt: new Date(Date.now() - 14 * 24 * 3600000).toISOString() },
];

export default function PackageHistoryScreen({ navigation }) {
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadHistory = async () => {
    try {
      const res = await api.get('/packages/history');
      setHistory(res.data?.data || res.data || []);
    } catch {
      // Gunakan dummy jika endpoint belum ada di backend
      setHistory(DUMMY_HISTORY);
    }
    setIsLoading(false);
  };

  useFocusEffect(useCallback(() => { loadHistory(); }, []));

  const onRefresh = async () => {
    setRefreshing(true);
    await loadHistory();
    setRefreshing(false);
  };

  return (
    <View style={globalStyles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={26} color={colors.white} />
        </TouchableOpacity>
        <Text style={styles.title}>Riwayat Paket</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Summary Stats */}
      {!isLoading && history.length > 0 && (
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statNum}>{history.length}</Text>
            <Text style={styles.statLabel}>Total Paket</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={[styles.statNum, { color: '#10B981' }]}>
              {history.filter(p => !p.overtimeFee || p.overtimeFee === 0).length}
            </Text>
            <Text style={styles.statLabel}>Tepat Waktu</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={[styles.statNum, { color: '#EF4444' }]}>
              {history.filter(p => p.overtimeFee > 0).length}
            </Text>
            <Text style={styles.statLabel}>Terkena Denda</Text>
          </View>
        </View>
      )}

      {/* List */}
      {isLoading ? (
        <View style={{ paddingHorizontal: 0, paddingTop: 8 }}>
          {[1, 2, 3, 4].map(i => <PackageCardSkeleton key={i} />)}
        </View>
      ) : (
        <FlatList
          data={history}
          keyExtractor={item => item.id?.toString() || Math.random().toString()}
          renderItem={({ item }) => (
            <HistoryItem item={item} onPress={() => navigation.navigate('PackageDetail', { packageData: item })} />
          )}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
          contentContainerStyle={{ paddingBottom: 120, paddingTop: 8 }}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons name="archive-outline" size={56} color="rgba(255,255,255,0.1)" />
              <Text style={[globalStyles.body, { marginTop: 14, textAlign: 'center', fontWeight: '700' }]}>Belum ada riwayat pengambilan</Text>
              <Text style={[globalStyles.bodySmall, { textAlign: 'center', marginTop: 6 }]}>Paket yang sudah Anda ambil akan tampil di sini.</Text>
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

  statsRow: { flexDirection: 'row', gap: 12, marginBottom: 24 },
  statBox: { flex: 1, backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 18, padding: 16, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.07)' },
  statNum: { fontSize: 26, fontWeight: '900', color: colors.white },
  statLabel: { fontSize: 11, color: colors.textSecondary, marginTop: 4, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },

  card: { backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 20, padding: 18, marginBottom: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)' },
  cardHeader: { flexDirection: 'row', alignItems: 'center' },
  iconBox: { width: 48, height: 48, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  cardInfo: { flex: 1, marginLeft: 12 },
  tracking: { fontSize: 15, fontWeight: '800', color: colors.white, marginBottom: 4 },
  date: { fontSize: 12, color: colors.textSecondary, fontWeight: '500' },

  cardFooter: { flexDirection: 'row', alignItems: 'center', marginTop: 14, gap: 8 },
  footerChip: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.05)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  footerChipText: { color: colors.textSecondary, fontSize: 12, fontWeight: '600' },
  penaltyChip: { backgroundColor: 'rgba(239,68,68,0.1)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, borderWidth: 1, borderColor: 'rgba(239,68,68,0.3)' },
  penaltyText: { color: '#EF4444', fontSize: 12, fontWeight: '700' },

  empty: { alignItems: 'center', paddingTop: 80 },
});
