import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { globalStyles } from '../../styles/globalStyles';
import { colors } from '../../styles/colors';
import { AuditRowSkeleton } from '../../components/common/SkeletonLoader';
import api from '../../services/api';

const ROLE_CONFIG = {
  ADMIN: { color: '#EF4444', bg: 'rgba(239,68,68,0.1)' },
  COURIER: { color: '#F59E0B', bg: 'rgba(245,158,11,0.1)' },
  USER: { color: '#10B981', bg: 'rgba(16,185,129,0.1)' },
};

const UserRow = ({ item, onBlock, onDelete }) => {
  const cfg = ROLE_CONFIG[item.role] || ROLE_CONFIG.USER;
  const lastLogin = item.lastLoginAt ? new Date(item.lastLoginAt).toLocaleDateString('id-ID') : 'Belum pernah';

  return (
    <View style={[styles.userCard, !item.isActive && styles.blockedCard]}>
      <View style={styles.userAvatar}>
        <Text style={styles.avatarText}>{item.name?.charAt(0)?.toUpperCase() || item.email?.charAt(0)?.toUpperCase() || '?'}</Text>
      </View>
      <View style={styles.userInfo}>
        <View style={styles.userTopRow}>
          <Text style={styles.userName} numberOfLines={1}>{item.name || 'Tanpa Nama'}</Text>
          <View style={[styles.roleBadge, { backgroundColor: cfg.bg }]}>
            <Text style={[styles.roleText, { color: cfg.color }]}>{item.role}</Text>
          </View>
        </View>
        <Text style={styles.userEmail} numberOfLines={1}>{item.email}</Text>
        <Text style={styles.userMeta}>Login terakhir: {lastLogin}</Text>
        {!item.isActive && <Text style={styles.blockedLabel}>⛔ DIBLOKIR</Text>}
      </View>
      <View style={styles.actions}>
        <TouchableOpacity onPress={() => onBlock(item)} style={[styles.actionBtn, { backgroundColor: item.isActive ? 'rgba(239,68,68,0.1)' : 'rgba(16,185,129,0.1)' }]}>
          <Ionicons name={item.isActive ? 'ban-outline' : 'checkmark-circle-outline'} size={18} color={item.isActive ? '#EF4444' : '#10B981'} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const DUMMY_USERS = [
  { id: '1', name: 'Andi Pratama', email: 'andi@gmail.com', role: 'USER', isActive: true, lastLoginAt: new Date(Date.now() - 3600000).toISOString() },
  { id: '2', name: 'Siti Kurir JNE', email: 'siti@jne.co.id', role: 'COURIER', isActive: true, lastLoginAt: new Date(Date.now() - 86400000).toISOString() },
  { id: '3', name: 'Budi Santoso', email: 'budi@gmail.com', role: 'USER', isActive: false, lastLoginAt: new Date(Date.now() - 7 * 86400000).toISOString() },
  { id: '4', name: 'Rina Wahyu', email: 'rina@gmail.com', role: 'USER', isActive: true, lastLoginAt: null },
];

export default function AdminUsersScreen({ navigation }) {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filterRole, setFilterRole] = useState('ALL');

  const load = async () => {
    try {
      const params = filterRole !== 'ALL' ? `?role=${filterRole}` : '';
      const res = await api.get(`/admin/users${params}`);
      setUsers(res.data?.data || res.data || []);
    } catch { setUsers(DUMMY_USERS); }
    setIsLoading(false);
  };

  useFocusEffect(useCallback(() => { setIsLoading(true); load(); }, [filterRole]));

  const handleBlock = async (user) => {
    const msg = user.isActive
      ? `Blokir akun "${user.name}"? Mereka tidak akan bisa login.`
      : `Aktifkan kembali akun "${user.name}"?`;

    const confirm = typeof window !== 'undefined' ? window.confirm(msg) : await new Promise(r => Alert.alert('Konfirmasi', msg, [{ text: 'Ya', onPress: () => r(true) }, { text: 'Batal', onPress: () => r(false) }]));
    if (!confirm) return;

    setUsers(prev => prev.map(u => u.id === user.id ? { ...u, isActive: !u.isActive } : u));
    try { await api.patch(`/admin/users/${user.id}/status`, { isActive: !user.isActive }); }
    catch { setUsers(prev => prev.map(u => u.id === user.id ? { ...u, isActive: user.isActive } : u)); }
  };

  const onRefresh = async () => { setRefreshing(true); await load(); setRefreshing(false); };

  const filtered = filterRole === 'ALL' ? users : users.filter(u => u.role === filterRole);
  const ROLES = ['ALL', 'USER', 'COURIER', 'ADMIN'];

  return (
    <View style={globalStyles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={26} color={colors.white} />
        </TouchableOpacity>
        <View>
          <Text style={styles.title}>Manajemen Pengguna</Text>
          <Text style={styles.subtitle}>{users.length} akun terdaftar</Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      {/* Role Filter Pills */}
      <View style={styles.filterRow}>
        {ROLES.map(r => (
          <TouchableOpacity key={r} onPress={() => setFilterRole(r)} style={[styles.pill, filterRole === r && styles.pillActive]}>
            <Text style={[styles.pillText, filterRole === r && styles.pillTextActive]}>{r}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {isLoading ? (
        <View>{[1,2,3,4].map(i => <AuditRowSkeleton key={i} />)}</View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={i => i.id}
          renderItem={({ item }) => <UserRow item={item} onBlock={handleBlock} onDelete={() => {}} />}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
          contentContainerStyle={{ paddingBottom: 120 }}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons name="people-outline" size={52} color="rgba(255,255,255,0.08)" />
              <Text style={[globalStyles.body, { textAlign: 'center', marginTop: 12 }]}>Tidak ada akun ditemukan</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 56, marginBottom: 20 },
  title: { fontSize: 22, fontWeight: '800', color: colors.white, textAlign: 'center' },
  subtitle: { fontSize: 12, color: colors.textSecondary, textAlign: 'center', fontWeight: '600', marginTop: 2 },
  backBtn: { width: 40, height: 40, justifyContent: 'center' },

  filterRow: { flexDirection: 'row', gap: 8, marginBottom: 20 },
  pill: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.04)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.07)' },
  pillActive: { backgroundColor: 'rgba(59,130,246,0.15)', borderColor: 'rgba(59,130,246,0.4)' },
  pillText: { color: colors.textSecondary, fontSize: 12, fontWeight: '700' },
  pillTextActive: { color: colors.primary },

  userCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 18, padding: 16, marginBottom: 10, borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)' },
  blockedCard: { opacity: 0.5, borderColor: 'rgba(239,68,68,0.2)' },
  userAvatar: { width: 46, height: 46, borderRadius: 23, backgroundColor: 'rgba(59,130,246,0.15)', justifyContent: 'center', alignItems: 'center', marginRight: 14 },
  avatarText: { fontSize: 20, fontWeight: '800', color: colors.primary },
  userInfo: { flex: 1 },
  userTopRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  userName: { fontSize: 15, fontWeight: '800', color: colors.white, flex: 1 },
  roleBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  roleText: { fontSize: 10, fontWeight: '800', letterSpacing: 0.5 },
  userEmail: { fontSize: 12, color: colors.textSecondary, marginBottom: 2 },
  userMeta: { fontSize: 11, color: 'rgba(255,255,255,0.2)', fontWeight: '600' },
  blockedLabel: { fontSize: 11, color: '#EF4444', fontWeight: '800', marginTop: 4 },
  actions: { marginLeft: 10 },
  actionBtn: { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  empty: { alignItems: 'center', paddingTop: 80 },
});
