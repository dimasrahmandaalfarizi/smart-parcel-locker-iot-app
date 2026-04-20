import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { globalStyles } from '../../styles/globalStyles';
import { colors } from '../../styles/colors';
import { AuditRowSkeleton } from '../../components/common/SkeletonLoader';
import api from '../../services/api';

const TYPE_CONFIG = {
  PACKAGE_ARRIVED: { icon: 'cube', color: '#3B82F6', label: 'Paket Tiba' },
  PENALTY_WARNING: { icon: 'warning-outline', color: '#F59E0B', label: 'Peringatan Denda' },
  PAYMENT_SUCCESS: { icon: 'checkmark-circle', color: '#10B981', label: 'Pembayaran Sukses' },
  SYSTEM: { icon: 'information-circle', color: '#8B5CF6', label: 'Sistem' },
};

const NotifItem = ({ item, onPress }) => {
  const config = TYPE_CONFIG[item.type] || TYPE_CONFIG.SYSTEM;
  const date = new Date(item.createdAt);
  const timeAgo = (ms) => {
    const diff = Date.now() - ms;
    if (diff < 3600000) return `${Math.floor(diff/60000)} menit lalu`;
    if (diff < 86400000) return `${Math.floor(diff/3600000)} jam lalu`;
    return `${Math.floor(diff/86400000)} hari lalu`;
  };

  return (
    <TouchableOpacity style={[styles.notifCard, !item.isRead && styles.unreadCard]} onPress={() => onPress(item)} activeOpacity={0.85}>
      <View style={[styles.notifIcon, { backgroundColor: `${config.color}18` }]}>
        <Ionicons name={config.icon} size={22} color={config.color} />
      </View>
      <View style={styles.notifContent}>
        <View style={styles.notifHeader}>
          <Text style={styles.notifTitle}>{item.title}</Text>
          {!item.isRead && <View style={styles.unreadDot} />}
        </View>
        <Text style={styles.notifMsg} numberOfLines={2}>{item.message}</Text>
        <Text style={styles.notifTime}>{timeAgo(date.getTime())}</Text>
      </View>
    </TouchableOpacity>
  );
};

const DUMMY_NOTIFS = [
  { id: '1', type: 'PACKAGE_ARRIVED', title: 'Paket Tiba!', message: 'Paket JNE-2024-881230 telah dimasukkan ke Loker A3 oleh Kurir. Segera ambil sebelum 48 jam.', isRead: false, createdAt: new Date(Date.now() - 30 * 60000).toISOString() },
  { id: '2', type: 'PAYMENT_SUCCESS', title: 'Pembayaran Berhasil', message: 'Denda keterlambatan sebesar Rp 10.000 telah berhasil dilunasi via GoPay. Loker kini terbuka.', isRead: false, createdAt: new Date(Date.now() - 2 * 3600000).toISOString() },
  { id: '3', type: 'PENALTY_WARNING', title: 'Peringatan: Paket Hampir Kena Denda', message: 'Paket SICEPAT-X-99201 sudah 40 jam di loker. Ambil segera untuk menghindari denda Rp 15.000.', isRead: true, createdAt: new Date(Date.now() - 6 * 3600000).toISOString() },
  { id: '4', type: 'SYSTEM', title: 'Sistem Diperbarui', message: 'Smart Locker v3.5 telah berhasil diperbarui. Fitur baru: Berbagi PIN Wakil Pengambilan.', isRead: true, createdAt: new Date(Date.now() - 2 * 86400000).toISOString() },
];

export default function NotificationScreen({ navigation }) {
  const [notifs, setNotifs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const unreadCount = notifs.filter(n => !n.isRead).length;

  const load = async () => {
    try {
      const res = await api.get('/notifications');
      setNotifs(res.data?.data || res.data || []);
    } catch { setNotifs(DUMMY_NOTIFS); }
    setIsLoading(false);
  };

  useFocusEffect(useCallback(() => { load(); }, []));

  const handleMarkRead = async (item) => {
    if (item.isRead) return;
    setNotifs(prev => prev.map(n => n.id === item.id ? { ...n, isRead: true } : n));
    try { await api.patch(`/notifications/${item.id}/read`); } catch {}
  };

  const handleMarkAll = async () => {
    setNotifs(prev => prev.map(n => ({ ...n, isRead: true })));
    try { await api.patch('/notifications/read-all'); } catch {}
  };

  const onRefresh = async () => { setRefreshing(true); await load(); setRefreshing(false); };

  return (
    <View style={globalStyles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={26} color={colors.white} />
        </TouchableOpacity>
        <View>
          <Text style={styles.title}>Kotak Masuk</Text>
          {unreadCount > 0 && <Text style={styles.unreadLabel}>{unreadCount} belum dibaca</Text>}
        </View>
        {unreadCount > 0 ? (
          <TouchableOpacity onPress={handleMarkAll} style={styles.readAllBtn}>
            <Text style={styles.readAllText}>Baca Semua</Text>
          </TouchableOpacity>
        ) : <View style={{ width: 80 }} />}
      </View>

      {isLoading ? (
        <View>{[1,2,3,4].map(i => <AuditRowSkeleton key={i} />)}</View>
      ) : (
        <FlatList
          data={notifs}
          keyExtractor={i => i.id}
          renderItem={({ item }) => <NotifItem item={item} onPress={handleMarkRead} />}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
          contentContainerStyle={{ paddingBottom: 120 }}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons name="notifications-off-outline" size={52} color="rgba(255,255,255,0.08)" />
              <Text style={[globalStyles.body, { textAlign: 'center', marginTop: 12, fontWeight: '700' }]}>Tidak ada notifikasi</Text>
              <Text style={[globalStyles.bodySmall, { textAlign: 'center', marginTop: 6 }]}>Kami akan memberitahu saat ada paket tiba.</Text>
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
  unreadLabel: { fontSize: 12, color: colors.primary, fontWeight: '700', marginTop: 2 },
  backBtn: { width: 40, height: 40, justifyContent: 'center' },
  readAllBtn: { paddingHorizontal: 12, paddingVertical: 6, backgroundColor: 'rgba(59,130,246,0.1)', borderRadius: 10, borderWidth: 1, borderColor: 'rgba(59,130,246,0.25)' },
  readAllText: { color: colors.primary, fontSize: 12, fontWeight: '700' },

  notifCard: { flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.025)', borderRadius: 18, padding: 16, marginBottom: 10, borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)' },
  unreadCard: { backgroundColor: 'rgba(59,130,246,0.06)', borderColor: 'rgba(59,130,246,0.2)' },
  notifIcon: { width: 46, height: 46, borderRadius: 13, justifyContent: 'center', alignItems: 'center', marginRight: 14 },
  notifContent: { flex: 1 },
  notifHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 5 },
  notifTitle: { fontSize: 15, fontWeight: '800', color: colors.white, flex: 1 },
  unreadDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.primary, marginLeft: 8 },
  notifMsg: { fontSize: 13, color: colors.textSecondary, lineHeight: 18, marginBottom: 8 },
  notifTime: { fontSize: 11, color: 'rgba(255,255,255,0.25)', fontWeight: '600' },
  empty: { alignItems: 'center', paddingTop: 80 },
});
