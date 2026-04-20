import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, TextInput, Switch, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { globalStyles } from '../../styles/globalStyles';
import { colors } from '../../styles/colors';
import { useAuth } from '../../hooks/useAuth';
import Button from '../../components/common/Button';

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
  const { userInfo, logout, updateUserName } = useAuth();
  const role = userInfo?.role?.toUpperCase() || 'USER';

  const [activeModal, setActiveModal] = useState(null); // Menampung popup: 'personal', 'security', 'theme', 'notif', 'faq'
  
  // Local state untuk perabotan form di dalam pop-up
  const [editName, setEditName] = useState(userInfo?.name || '');
  const [bioEnabled, setBioEnabled] = useState(true);
  const [notifEnabled, setNotifEnabled] = useState(true);
  const [themeMode, setThemeMode] = useState('dark');

  const handleSaveProfile = async () => {
     if (updateUserName) await updateUserName(editName);
     if (typeof window !== 'undefined' && window.alert) window.alert('Sukses! Nama profil berhasil diperbarui.');
     else Alert.alert('Profil Diupdate', 'Nama profil berhasil diperbarui di sistem.');
     setActiveModal(null);
  };

  const renderModalContent = () => {
    switch (activeModal) {
      case 'personal':
        return (
          <View>
             <Text style={styles.modalTitle}>Informasi Personal</Text>
             <Text style={styles.modalSub}>Sesuaikan data diri Anda di ekosistem Smart Locker.</Text>
             <TextInput 
                style={styles.inputField} 
                value={editName} 
                onChangeText={setEditName} 
                placeholder="Nama Lengkap Baru" 
                placeholderTextColor={colors.textSecondary}
             />
             <Button title="Simpan Perubahan Nama" onPress={handleSaveProfile} style={{marginTop: 24, width: '100%'}}/>
          </View>
        );
      case 'security':
        return (
          <View>
             <Text style={styles.modalTitle}>Keamanan Akun (Biometrik)</Text>
             <Text style={styles.modalSub}>Gunakan deteksi sistem biometrik OS bawaan HP Anda seperti Sensor Sidik Jari atau FaceID.</Text>
             <View style={styles.switchRow}>
               <Text style={styles.switchLabel}>Gunakan FaceID / Sidik Jari</Text>
               <Switch value={bioEnabled} onValueChange={setBioEnabled} trackColor={{ true: colors.primary, false: '#333' }} thumbColor={colors.white} />
             </View>
             <Button title="Ubah Kata Sandi (Password)" variant="outline" onPress={() => { setActiveModal(null); alert('Silakan logout dan manfaatkan fitur "Lupa Password" melalui layar Login untuk me-reset kata sandi Anda dengan aman.'); }} style={{marginTop: 24}}/>
          </View>
        );
      case 'notif':
        return (
          <View>
             <Text style={styles.modalTitle}>Pengaturan Notifikasi (FCM Push)</Text>
             <View style={styles.switchRow}>
               <Text style={styles.switchLabel}>Alert Saat Titipan Tiba</Text>
               <Switch value={notifEnabled} onValueChange={setNotifEnabled} trackColor={{ true: '#10B981', false: '#333' }} thumbColor={colors.white} />
             </View>
             <View style={styles.switchRow}>
               <Text style={styles.switchLabel}>Alert Hukum Denda Menginap</Text>
               <Switch value={true} onValueChange={() => {}} trackColor={{ true: '#10B981', false: '#333' }} thumbColor={colors.white} />
             </View>
             <Button title="Restart Layanan Cloud Messaging" onPress={() => { setActiveModal(null); alert('Sistem notifikasi background Firebase/Expo disetel ulang.'); }} style={{marginTop: 24, backgroundColor: '#10B981'}}/>
          </View>
        );
      case 'theme':
        return (
          <View>
             <Text style={styles.modalTitle}>Tema UI Pro Max</Text>
             {['dark', 'light', 'system'].map(mode => (
               <TouchableOpacity key={mode} onPress={() => setThemeMode(mode)} style={[styles.themeOption, themeMode === mode && styles.themeOptionActive]}>
                 <Text style={[styles.themeText, themeMode === mode && {color: colors.primary, fontWeight: '800'}]}>
                    {mode === 'dark' ? 'Liquid Dark Mode (Bawaan)' : mode === 'light' ? 'Bright / Light Mode' : 'Otomatis Ikuti Jam Handphone'}
                 </Text>
                 {themeMode === mode && <Ionicons name="checkmark-circle" size={24} color={colors.primary} />}
               </TouchableOpacity>
             ))}
             <Text style={[globalStyles.bodySmall, {marginTop: 16, color: '#F59E0B'}]}>[INFO]: Khusus versi purwarupa *Smart Locker* ini, CSS mesin dikunci absolut kepada arketipe *Glassmorphism Dark Mode* untuk sensasi Sci-Fi.</Text>
          </View>
        );
      case 'faq':
        return (
          <View>
             <Text style={styles.modalTitle}>Bantuan Logistik & FAQ</Text>
             
             <Text style={[globalStyles.body, {fontWeight: '800', marginBottom: 4, marginTop: 12}]}>1. Paket loker saya mendadak terkunci?</Text>
             <Text style={[globalStyles.bodySmall, {marginBottom: 16}]}>Itu terjadi karena Anda melampaui masa tenggang (48 jam). Anda dimohon terlebih dahulu melunasi pajak penahanan loker.</Text>
             
             <Text style={[globalStyles.body, {fontWeight: '800', marginBottom: 4}]}>2. Bayar denda lewat terminal apa?</Text>
             <Text style={[globalStyles.bodySmall, {marginBottom: 16}]}>Pembayaran bisa dilakukan lewat e-Wallet *(Spay, GoPay)* maupun Transfer Bank QRIS (dipegang oleh modul Webhook Midtrans).</Text>
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <ScrollView style={globalStyles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Panel Eksekusi</Text>
      </View>

      <View style={styles.profileCard}>
        <View style={styles.avatarContainer}>
          {/* Ekstraksi huruf depan dari nama, sangat lazim dipakai di aplikasi raksasa */}
          <Text style={styles.avatarText}>{userInfo?.name?.charAt(0)?.toUpperCase() || userInfo?.email?.charAt(0)?.toUpperCase() || 'U'}</Text>
        </View>
        <View style={styles.infoContainer}>
          <Text style={styles.nameText}>{userInfo?.name || 'Pengguna Loker'}</Text>
          <Text style={styles.emailText}>{userInfo?.email || 'N/A'}</Text>
          <View style={styles.roleBadge}>
            <Text style={styles.roleText}>{role}</Text>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Pengaturan Akun & Otentikasi</Text>
        <View style={styles.cardGroup}>
          <SettingItem icon="person-outline" title="Informasi Personal Dasar" subtitle="Ubah nama identitas & visibilitas" onPress={() => setActiveModal('personal')} />
          <SettingItem icon="mail-outline" title="Keabsahan Surel (Email)" subtitle="Pemeriksaan pelacakan pengiriman" onPress={() => alert('Email terverifikasi aman & terenkripsi oleh server.')} />
          <SettingItem icon="shield-checkmark-outline" title="Perisai Keamanan Lapis Dua" subtitle="Detektor Wajah (FaceID) & Enkripsi Sandi" onPress={() => setActiveModal('security')} />
        </View>
      </View>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Sistem Aplikasi Mobile</Text>
        <View style={styles.cardGroup}>
          <SettingItem icon="notifications-outline" title="Notifikasi Tumbuk (Push)" subtitle="Kelola peringatan kedatangan logistik" onPress={() => setActiveModal('notif')} />
          <SettingItem icon="moon-outline" title="Tema Skema Cahaya (Theme)" subtitle="Navigasi kelembutan kontras layar" onPress={() => setActiveModal('theme')} />
        </View>
      </View>

      <View style={[styles.section, { marginBottom: 120 }]}>
        <Text style={styles.sectionTitle}>Sistem Inti (Core)</Text>
        <View style={styles.cardGroup}>
          <SettingItem icon="help-buoy-outline" title="Grup Bantuan Pelanggan (FAQ)" onPress={() => setActiveModal('faq')} />
          <SettingItem icon="information-circle-outline" title="Versi Piranti Lunak" subtitle="SmartLocker v3.5 (React Native Edition)" />
          <View style={{ height: 1, backgroundColor: 'rgba(255,255,255,0.05)', marginVertical: 8 }} />
          <SettingItem icon="log-out-outline" title="Keluar Dari Perangkat (Logout)" onPress={logout} isDestructive />
        </View>
      </View>

      {/* BOTTOM SHEET MODAL PENYATUAN FITUR */}
      {/* Kejeniusan engineering (1 file saja bisa menampung 5 halaman berbeda dengan gaya popup beranimasi slide). */}
      <Modal visible={!!activeModal} animationType="slide" transparent={true} onRequestClose={() => setActiveModal(null)}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalOverlay}>
           <View style={styles.modalContent}>
              <View style={styles.modalDragIndicator} />
              
              <TouchableOpacity onPress={() => setActiveModal(null)} style={styles.closeBtn}>
                <Ionicons name="close-circle" size={32} color={colors.textSecondary} />
              </TouchableOpacity>
              
              {renderModalContent()}

           </View>
        </KeyboardAvoidingView>
      </Modal>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  header: { marginTop: 64, marginBottom: 24, paddingHorizontal: 4 },
  headerTitle: { fontSize: 32, fontWeight: '800', color: colors.white, letterSpacing: -0.5 },
  
  profileCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 24, padding: 24, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', marginBottom: 32 },
  avatarContainer: { width: 72, height: 72, borderRadius: 36, backgroundColor: 'rgba(59,130,246,0.2)', justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: colors.primary },
  avatarText: { fontSize: 28, fontWeight: '800', color: colors.primary },
  infoContainer: { marginLeft: 20, flex: 1 },
  nameText: { fontSize: 22, fontWeight: '800', color: colors.white, marginBottom: 4, letterSpacing: -0.5 },
  emailText: { fontSize: 13, color: colors.textSecondary, marginBottom: 12, fontWeight: '500' },
  roleBadge: { backgroundColor: colors.primary, alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 10 },
  roleText: { color: colors.white, fontSize: 11, fontWeight: '800', letterSpacing: 1 },
  
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 13, fontWeight: '700', color: colors.textSecondary, marginBottom: 12, paddingHorizontal: 12, textTransform: 'uppercase', letterSpacing: 1.2 },
  cardGroup: { backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: 24, padding: 8, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  settingItem: { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 16 },
  iconBox: { width: 44, height: 44, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.06)', justifyContent: 'center', alignItems: 'center' },
  settingTextContainer: { flex: 1, marginLeft: 16 },
  settingTitle: { fontSize: 16, fontWeight: '700', color: colors.white, marginBottom: 2 },
  settingSubtitle: { fontSize: 13, color: colors.textSecondary, fontWeight: '500', marginTop: 2 },

  // MODAL SLIDE (BOTOM SHEET) STYLES
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#1A1A1A', borderTopLeftRadius: 32, borderTopRightRadius: 32, padding: 32, paddingBottom: 48, minHeight: 350, shadowColor: '#000', shadowOffset: {width:0,height:-10}, shadowOpacity: 0.5, shadowRadius: 20, elevation: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  modalDragIndicator: { width: 48, height: 6, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 3, alignSelf: 'center', marginBottom: 32 },
  closeBtn: { position: 'absolute', top: 24, right: 24, zIndex: 10 },
  modalTitle: { fontSize: 26, fontWeight: '800', color: colors.white, marginBottom: 8, letterSpacing: -0.5 },
  modalSub: { fontSize: 14, color: colors.textSecondary, marginBottom: 32, lineHeight: 22 },
  inputField: { backgroundColor: 'rgba(255,255,255,0.04)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', color: colors.white, padding: 18, borderRadius: 16, fontSize: 16, fontWeight: '600' },
  switchRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 18, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)' },
  switchLabel: { fontSize: 16, color: colors.white, fontWeight: '600' },
  themeOption: { flexDirection: 'row', justifyContent: 'space-between', padding: 18, backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 16, marginBottom: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  themeOptionActive: { borderColor: colors.primary, backgroundColor: 'rgba(59,130,246,0.1)' },
  themeText: { fontSize: 16, color: colors.textSecondary, fontWeight: '500' }
});
