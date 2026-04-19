import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { globalStyles } from '../../styles/globalStyles';
import { colors } from '../../styles/colors';
import { useAuth } from '../../hooks/useAuth';

const SettingItem = ({ icon, title, subtitle, onPress, isDestructive }) => (
  <TouchableOpacity style={styles.settingItem} onPress={onPress}>
    <View style={[styles.iconBox, isDestructive && { backgroundColor: 'rgba(239,68,68,0.1)' }]}>
      <Ionicons name={icon} size={20} color={isDestructive ? '#EF4444' : colors.primary} />
    </View>
    <View style={styles.settingTextContainer}>
      <Text style={[styles.settingTitle, isDestructive && { color: '#EF4444' }]}>{title}</Text>
      {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
    </View>
    <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
  </TouchableOpacity>
);

export default function ProfileScreen() {
  const { userInfo, logout } = useAuth();
  const role = userInfo?.role?.toUpperCase() || 'USER';

  return (
    <ScrollView style={globalStyles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profil Saya</Text>
      </View>

      <View style={styles.profileCard}>
        <View style={styles.avatarContainer}>
          <Text style={styles.avatarText}>{userInfo?.name?.charAt(0)?.toUpperCase() || userInfo?.email?.charAt(0)?.toUpperCase() || 'U'}</Text>
        </View>
        <View style={styles.infoContainer}>
          <Text style={styles.nameText}>{userInfo?.name || 'Pengguna Loker'}</Text>
          <Text style={styles.emailText}>{userInfo?.email}</Text>
          <View style={styles.roleBadge}>
            <Text style={styles.roleText}>{role}</Text>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Akun & Otentikasi</Text>
        <View style={styles.cardGroup}>
          <SettingItem icon="person-outline" title="Informasi Personal" subtitle="Ubah nama & foto profil" />
          <SettingItem icon="mail-outline" title="Alamat Surel" subtitle="Verifikasi email Anda" />
          <SettingItem icon="shield-checkmark-outline" title="Keamanan" subtitle="Ganti password & Biometrik FaceID" />
        </View>
      </View>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Preferensi Aplikasi</Text>
        <View style={styles.cardGroup}>
          <SettingItem icon="notifications-outline" title="Notifikasi Tiba" subtitle="Atur Push Notification (FCM)" />
          <SettingItem icon="moon-outline" title="Tema Tampilan" subtitle="Liquid Dark Mode (Bawaan)" />
        </View>
      </View>

      <View style={[styles.section, { marginBottom: 120 }]}>
        <Text style={styles.sectionTitle}>Sistem</Text>
        <View style={styles.cardGroup}>
          <SettingItem icon="help-buoy-outline" title="Bantuan & FAQ" />
          <SettingItem icon="information-circle-outline" title="Versi Aplikasi" subtitle="v2.0.0 (Pro Max)" />
          <View style={{ height: 1, backgroundColor: 'rgba(255,255,255,0.05)', marginVertical: 8 }} />
          <SettingItem icon="log-out-outline" title="Keluar Sesi (Logout)" onPress={logout} isDestructive />
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  header: { marginTop: 64, marginBottom: 24, paddingHorizontal: 4 },
  headerTitle: { fontSize: 32, fontWeight: '800', color: colors.white, letterSpacing: -0.5 },
  
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    marginBottom: 32,
  },
  avatarContainer: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(59,130,246,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.primary,
  },
  avatarText: { fontSize: 28, fontWeight: '800', color: colors.primary },
  infoContainer: { marginLeft: 20, flex: 1 },
  nameText: { fontSize: 22, fontWeight: '700', color: colors.white, marginBottom: 4, letterSpacing: -0.3 },
  emailText: { fontSize: 13, color: colors.textSecondary, marginBottom: 8, fontWeight: '500' },
  roleBadge: { backgroundColor: colors.primary, alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  roleText: { color: colors.white, fontSize: 10, fontWeight: '800', letterSpacing: 1 },
  
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 13, fontWeight: '700', color: colors.textSecondary, marginBottom: 12, paddingHorizontal: 12, textTransform: 'uppercase', letterSpacing: 1.2 },
  cardGroup: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 24,
    padding: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  settingItem: { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 16 },
  iconBox: { width: 44, height: 44, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.05)', justifyContent: 'center', alignItems: 'center' },
  settingTextContainer: { flex: 1, marginLeft: 16 },
  settingTitle: { fontSize: 16, fontWeight: '700', color: colors.white, marginBottom: 2 },
  settingSubtitle: { fontSize: 13, color: colors.textSecondary, fontWeight: '500' },
});
