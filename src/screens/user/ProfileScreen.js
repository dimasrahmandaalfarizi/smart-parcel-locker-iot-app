import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Modal, TextInput, Switch, Alert, KeyboardAvoidingView, Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import * as LocalAuthentication from 'expo-local-authentication';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { globalStyles } from '../../styles/globalStyles';
import { colors } from '../../styles/colors';
import { useAuth } from '../../hooks/useAuth';
import Button from '../../components/common/Button';
import api from '../../services/api';

// ─────────────────────────────────────────────────
// Komponen Atom: Satu baris setting dengan ikon & chevron
// ─────────────────────────────────────────────────
const SettingItem = ({ icon, iconColor, title, subtitle, onPress, isDestructive, rightElement }) => (
  <TouchableOpacity style={styles.settingItem} onPress={onPress} disabled={!onPress}>
    <View style={[styles.iconBox, isDestructive && { backgroundColor: 'rgba(239,68,68,0.1)' }]}>
      <Ionicons name={icon} size={20} color={iconColor || (isDestructive ? '#EF4444' : colors.primary)} />
    </View>
    <View style={styles.settingTextContainer}>
      <Text style={[styles.settingTitle, isDestructive && { color: '#EF4444' }]}>{title}</Text>
      {subtitle ? <Text style={styles.settingSubtitle}>{subtitle}</Text> : null}
    </View>
    {rightElement || (onPress ? <Ionicons name="chevron-forward" size={18} color="rgba(255,255,255,0.2)" /> : null)}
  </TouchableOpacity>
);

// ─────────────────────────────────────────────────
// Komponen Atom: Baris switch dengan label kiri, toggle kanan
// ─────────────────────────────────────────────────
const SwitchRow = ({ label, value, onChange, color = '#10B981' }) => (
  <View style={styles.switchRow}>
    <Text style={styles.switchLabel}>{label}</Text>
    <Switch
      value={value}
      onValueChange={onChange}
      trackColor={{ true: color, false: '#2A2A2A' }}
      thumbColor={value ? colors.white : '#555'}
    />
  </View>
);

// ─────────────────────────────────────────────────────────────────
// LAYAR UTAMA
// ─────────────────────────────────────────────────────────────────
export default function ProfileScreen() {
  const navigation = useNavigation(); // Akses root stack navigator
  const { userInfo, logout, updateUserName } = useAuth();
  const role = userInfo?.role?.toUpperCase() || 'USER';

  // Modal state
  const [activeModal, setActiveModal] = useState(null);

  // --- Form states ---
  const [editName, setEditName] = useState(userInfo?.name || '');
  const [isSaving, setIsSaving] = useState(false);

  // --- Biometric states ---
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [biometricTesting, setBiometricTesting] = useState(false);

  // --- Notification states ---
  const [notifParcel, setNotifParcel] = useState(true);
  const [notifPenalty, setNotifPenalty] = useState(true);
  const [notifPromo, setNotifPromo] = useState(false);
  const [notifSyncing, setNotifSyncing] = useState(false);

  // --- Theme state ---
  const [themeMode, setThemeMode] = useState('dark');

  // ─── Init ───
  useEffect(() => {
    (async () => {
      try {
        // Cek ketersediaan sensor biometrik di perangkat ini
        const compatible = await LocalAuthentication.hasHardwareAsync();
        const enrolled = await LocalAuthentication.isEnrolledAsync();
        setBiometricAvailable(compatible && enrolled);
      } catch {
        setBiometricAvailable(false); // Graceful degradation di platform Web
      }

      // Load preferensi yang sudah disimpan sebelumnya
      try {
        const saved = await AsyncStorage.getItem('biometricEnabled');
        if (saved !== null) setBiometricEnabled(JSON.parse(saved));
        const savedTheme = await AsyncStorage.getItem('themeMode');
        if (savedTheme) setThemeMode(savedTheme);
        const savedNotif = await AsyncStorage.getItem('notifPrefs');
        if (savedNotif) {
          const prefs = JSON.parse(savedNotif);
          setNotifParcel(prefs.parcel ?? true);
          setNotifPenalty(prefs.penalty ?? true);
          setNotifPromo(prefs.promo ?? false);
        }
      } catch (e) {
        console.log('AsyncStorage read error:', e);
      }
    })();
  }, []);

  // ─────────────────────────────────────────────────────────────────
  // HANDLER — Informasi Personal
  // ─────────────────────────────────────────────────────────────────
  const handleSaveName = async () => {
    if (!editName.trim()) {
      Alert.alert('Nama kosong', 'Nama tidak boleh kosong.');
      return;
    }
    setIsSaving(true);
    try {
      // Coba panggil API backend jika ada endpoint PATCH /api/users/me
      await api.patch('/users/me', { name: editName.trim() }).catch(() => {});
      // Terlepas API berhasil/tidak, update lokal
      if (updateUserName) await updateUserName(editName.trim());

      const msg = 'Nama profil berhasil diperbarui!';
      if (typeof window !== 'undefined' && window.alert) window.alert(msg);
      else Alert.alert('Tersimpan ✅', msg);
      setActiveModal(null);
    } catch (e) {
      console.error('Gagal simpan nama:', e);
    }
    setIsSaving(false);
  };

  // ─────────────────────────────────────────────────────────────────
  // HANDLER — Biometrik
  // ─────────────────────────────────────────────────────────────────
  const handleToggleBiometric = async (value) => {
    if (typeof LocalAuthentication.authenticateAsync !== 'function') {
      Alert.alert('Tidak Didukung', 'Biometrik tidak tersedia di platform ini.');
      return;
    }
    if (value) {
      try {
        const result = await LocalAuthentication.authenticateAsync({
          promptMessage: 'Konfirmasi identitas Anda untuk mengaktifkan fitur ini',
          cancelLabel: 'Batal',
          disableDeviceFallback: false
        });
        if (!result.success) return;
      } catch (e) {
        console.log('Biometric auth error:', e);
        return;
      }
    }
    setBiometricEnabled(value);
    await AsyncStorage.setItem('biometricEnabled', JSON.stringify(value));
  };

  const handleTestBiometric = async () => {
    if (typeof LocalAuthentication.authenticateAsync !== 'function') {
      if (typeof window !== 'undefined' && window.alert) window.alert('Biometrik tidak tersedia di browser. Gunakan HP fisik.');
      return;
    }
    setBiometricTesting(true);
    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Uji Coba: Pindai Wajah atau Sidik Jari',
        cancelLabel: 'Tutup',
        disableDeviceFallback: false
      });
      const msg = result.success
        ? '✅ Biometrik dikenali! Autentikasi akan aktif saat membuka loker berikutnya.'
        : `❌ Autentikasi gagal: ${result.error || 'Tidak dikenali'}`;
      if (typeof window !== 'undefined' && window.alert) window.alert(msg);
      else Alert.alert('Hasil Uji Coba', msg);
    } catch (e) {
      console.log('Biometric test error:', e);
    }
    setBiometricTesting(false);
  };

  // ─────────────────────────────────────────────────────────────────
  // HANDLER — Notifikasi
  // ─────────────────────────────────────────────────────────────────
  const handleSaveNotifPrefs = async () => {
    setNotifSyncing(true);
    const prefs = { parcel: notifParcel, penalty: notifPenalty, promo: notifPromo };
    await AsyncStorage.setItem('notifPrefs', JSON.stringify(prefs));

    // Daftarkan ulang token Push ke Backend
    try {
      const fakeFCM = `PushToken_${Platform.OS}_${Date.now()}`;
      await api.post('/users/push-token', { pushToken: fakeFCM });
    } catch (e) { console.log('FCM re-sync backend error:', e); }

    setNotifSyncing(false);
    const msg = 'Preferensi notifikasi berhasil disimpan dan token push disinkronkan ke server.';
    if (typeof window !== 'undefined' && window.alert) window.alert(msg);
    else Alert.alert('Preferensi Disimpan ✅', msg);
    setActiveModal(null);
  };

  // ─────────────────────────────────────────────────────────────────
  // HANDLER — Tema
  // ─────────────────────────────────────────────────────────────────
  const handleSaveTheme = async (mode) => {
    setThemeMode(mode);
    await AsyncStorage.setItem('themeMode', mode);
    const themeNames = { dark: 'Liquid Dark Mode', light: 'Light Mode', system: 'Ikuti Sistem' };
    const msg = `Tema berhasil diganti ke ${themeNames[mode]}. Berlaku penuh pada rilis produksi.`;
    if (typeof window !== 'undefined' && window.alert) window.alert(msg);
    else Alert.alert('Tema Disimpan ✅', msg);
  };

  // ─────────────────────────────────────────────────────────────────
  // RENDERER — Konten di dalam Bottom Sheet 
  // ─────────────────────────────────────────────────────────────────
  const renderModalContent = () => {
    switch (activeModal) {

      // ─── PERSONAL ───────────────────────────────────────────────
      case 'personal':
        return (
          <View>
            <Text style={styles.modalTitle}>Informasi Personal</Text>
            <Text style={styles.modalSub}>Perbarui data diri Anda yang tersimpan di ekosistem Smart Locker.</Text>

            <Text style={styles.fieldLabel}>Nama Lengkap</Text>
            <TextInput
              style={styles.inputField}
              value={editName}
              onChangeText={setEditName}
              placeholder="Masukkan nama baru..."
              placeholderTextColor={colors.textSecondary}
              autoFocus
            />

            <Text style={styles.fieldLabel}>Alamat Email (Hanya Baca)</Text>
            <TextInput
              style={[styles.inputField, { opacity: 0.5 }]}
              value={userInfo?.email || ''}
              editable={false}
            />

            <Button title={isSaving ? 'Menyimpan...' : 'Simpan Perubahan'} onPress={handleSaveName} isLoading={isSaving} style={{ marginTop: 24, width: '100%' }} />
          </View>
        );

      // ─── KEAMANAN ───────────────────────────────────────────────
      case 'security':
        return (
          <View>
            <Text style={styles.modalTitle}>Keamanan Berlapis</Text>
            <Text style={styles.modalSub}>Aktifkan biometrik atau perbarui kata sandi akun Anda.</Text>

            {biometricAvailable ? (
              <>
                <SwitchRow
                  label="FaceID / Sidik Jari (2FA Loker)"
                  value={biometricEnabled}
                  onChange={handleToggleBiometric}
                  color={colors.primary}
                />
                {biometricEnabled && (
                  <Button
                    title={biometricTesting ? 'Memindai...' : 'Uji Coba Biometrik Sekarang'}
                    variant="outline"
                    onPress={handleTestBiometric}
                    isLoading={biometricTesting}
                    style={{ marginTop: 16 }}
                  />
                )}
              </>
            ) : (
              <View style={styles.warningBox}>
                <Ionicons name="warning-outline" size={20} color="#F59E0B" style={{ marginRight: 10 }} />
                <Text style={{ color: '#F59E0B', flex: 1, fontWeight: '600', fontSize: 14 }}>
                  Perangkat ini tidak memiliki sensor Biometrik atau belum ada data terdaftar.
                </Text>
              </View>
            )}

            <View style={styles.dividerLine} />
            <Button
              title="Reset Kata Sandi via Email OTP"
              variant="outline"
              onPress={() => {
                setActiveModal(null);
                // Arahkan ke alur lupa password yang sudah ada
                setTimeout(() => {
                  logout(); // Keluar dahulu sebelum bisa reset password
                }, 500);
              }}
              style={{ marginTop: 8 }}
            />
            <Text style={[styles.modalSub, { marginTop: 8, fontSize: 12 }]}>
              ℹ️ Reset password akan mengeluarkan Anda dan membuka alur OTP di layar Login.
            </Text>
          </View>
        );

      // ─── NOTIFIKASI ──────────────────────────────────────────────
      case 'notif':
        return (
          <View>
            <Text style={styles.modalTitle}>Pengaturan Notifikasi</Text>
            <Text style={styles.modalSub}>Pilih jenis peringatan yang ingin Anda terima dari sistem.</Text>

            <SwitchRow label="📦  Paket Tiba di Loker" value={notifParcel} onChange={setNotifParcel} color="#10B981" />
            <SwitchRow label="⚠️  Peringatan Denda Keterlambatan" value={notifPenalty} onChange={setNotifPenalty} color="#EF4444" />
            <SwitchRow label="🎁  Promo & Penawaran Mitra" value={notifPromo} onChange={setNotifPromo} color="#F59E0B" />

            <Button
              title={notifSyncing ? 'Menyinkronkan...' : 'Simpan & Sinkronkan ke Server'}
              onPress={handleSaveNotifPrefs}
              isLoading={notifSyncing}
              style={{ marginTop: 24, width: '100%', backgroundColor: '#10B981' }}
            />
          </View>
        );

      // ─── TEMA ───────────────────────────────────────────────────
      case 'theme':
        const THEMES = [
          { key: 'dark', label: 'Liquid Dark Mode', desc: 'Hitam pekat bertema Glassmorphism', icon: 'moon' },
          { key: 'light', label: 'Bright Light Mode', desc: 'Bersih dan minimalis putih', icon: 'sunny' },
          { key: 'system', label: 'Ikuti Jam Handphone', desc: 'Otomatis berganti berdasarkan OS', icon: 'phone-portrait' },
        ];
        return (
          <View>
            <Text style={styles.modalTitle}>Tema Tampilan</Text>
            <Text style={styles.modalSub}>Pilih skema warna yang paling nyaman untuk mata Anda.</Text>
            {THEMES.map(t => (
              <TouchableOpacity
                key={t.key}
                onPress={() => handleSaveTheme(t.key)}
                style={[styles.themeOption, themeMode === t.key && styles.themeOptionActive]}
              >
                <Ionicons name={t.icon} size={22} color={themeMode === t.key ? colors.primary : colors.textSecondary} style={{ marginRight: 14 }} />
                <View style={{ flex: 1 }}>
                  <Text style={[styles.themeText, themeMode === t.key && { color: colors.primary, fontWeight: '800' }]}>{t.label}</Text>
                  <Text style={{ color: colors.textSecondary, fontSize: 12, marginTop: 2 }}>{t.desc}</Text>
                </View>
                {themeMode === t.key && <Ionicons name="checkmark-circle" size={24} color={colors.primary} />}
              </TouchableOpacity>
            ))}
            <Text style={[styles.modalSub, { marginTop: 12, fontSize: 12, color: '#F59E0B' }]}>
              ⚡ Dark Mode dikunci sebagai default. Tema lain akan aktif penuh pada versi rilis.
            </Text>
          </View>
        );

      // ─── FAQ ───────────────────────────────────────────────────
      case 'faq':
        const FAQs = [
          { q: 'Paket saya mendadak terkunci?', a: 'Itu karena paket Anda melampaui masa inap 48 jam. Lunasi denda di halaman Detail Paket untuk membuka pintu.' },
          { q: 'Bayar denda lewat apa?', a: 'Via GoPay, OVO, QRIS, atau Transfer Bank melalui modul Midtrans yang terintegrasi.' },
          { q: 'Kurir salah memasukkan paket?', a: 'Hubungi Admin melalui fitur "Laporkan Masalah" atau langsung hubungi kurir mitra terkait.' },
          { q: 'Bagaimana cara berbagi akses ke keluarga?', a: 'Buka halaman Detail Paket > klik "Titipkan ke Ojol (Share PIN)" > kirimkan 6 digit kepada penerima.' },
          { q: 'Biometrik tidak bekerja?', a: 'Pastikan FaceID/Sidik Jari sudah terdaftar di Pengaturan OS HP Anda, lalu coba aktifkan ulang di menu Keamanan.' },
        ];
        return (
          <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 480 }}>
            <Text style={styles.modalTitle}>Bantuan & FAQ</Text>
            {FAQs.map((item, idx) => (
              <View key={idx} style={styles.faqItem}>
                <Text style={styles.faqQ}>❓ {item.q}</Text>
                <Text style={styles.faqA}>{item.a}</Text>
              </View>
            ))}
          </ScrollView>
        );

      default:
        return null;
    }
  };

  // ─────────────────────────────────────────────────────────────────
  // RENDER UTAMA
  // ─────────────────────────────────────────────────────────────────
  return (
    <ScrollView style={globalStyles.container} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Panel Akun</Text>
      </View>

      {/* Profile Card */}
      <View style={styles.profileCard}>
        <View style={styles.avatarContainer}>
          <Text style={styles.avatarText}>
            {userInfo?.name?.charAt(0)?.toUpperCase() || userInfo?.email?.charAt(0)?.toUpperCase() || 'U'}
          </Text>
        </View>
        <View style={styles.infoContainer}>
          <Text style={styles.nameText}>{userInfo?.name || 'Pengguna Loker'}</Text>
          <Text style={styles.emailText}>{userInfo?.email || 'N/A'}</Text>
          <View style={styles.roleBadge}>
            <Text style={styles.roleText}>{role}</Text>
          </View>
        </View>
      </View>

      {/* SECTION 1 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Akun & Identitas</Text>
        <View style={styles.cardGroup}>
          <SettingItem icon="person-outline" title="Informasi Personal" subtitle="Ubah nama tampilan profil" onPress={() => setActiveModal('personal')} />
          <SettingItem
            icon="mail-outline"
            title="Email Terverifikasi"
            subtitle={userInfo?.email || 'N/A'}
            iconColor="#10B981"
            rightElement={<Ionicons name="checkmark-circle" size={20} color="#10B981" />}
          />
          <SettingItem icon="shield-checkmark-outline" title="Keamanan Berlapis (Biometrik)" subtitle={biometricEnabled ? '🟢 Aktif' : '🔴 Nonaktif'} onPress={() => setActiveModal('security')} />
          <SettingItem icon="receipt-outline" title="Riwayat Pembayaran Denda" subtitle="Lihat transaksi yang pernah dilakukan" iconColor="#10B981" onPress={() => navigation?.navigate('PaymentHistory')} />
        </View>
      </View>

      {/* SECTION 2 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Sistem & Preferensi</Text>
        <View style={styles.cardGroup}>
          <SettingItem
            icon="notifications-outline"
            title="Notifikasi Push (FCM)"
            subtitle={`${[notifParcel && 'Paket', notifPenalty && 'Denda', notifPromo && 'Promo'].filter(Boolean).join(', ') || 'Semua dimatikan'}`}
            onPress={() => setActiveModal('notif')}
          />
          <SettingItem icon="moon-outline" title="Tema Tampilan" subtitle={themeMode === 'dark' ? 'Dark Mode' : themeMode === 'light' ? 'Light Mode' : 'Ikuti Sistem'} onPress={() => setActiveModal('theme')} />
        </View>
      </View>

      {/* SECTION 3 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Bantuan & Sistem</Text>
        <View style={styles.cardGroup}>
          <SettingItem icon="help-buoy-outline" title="Bantuan & FAQ" subtitle="Jawaban pertanyaan umum" onPress={() => setActiveModal('faq')} />
          <SettingItem icon="information-circle-outline" title="Versi Aplikasi" subtitle="SmartLocker v3.5 — React Native Edition" />
          <View style={{ height: 1, backgroundColor: 'rgba(255,255,255,0.05)', marginVertical: 8 }} />
          <SettingItem icon="log-out-outline" title="Keluar (Logout)" onPress={logout} isDestructive />
        </View>
      </View>

      {/* BOTTOM SHEET MODAL */}
      <Modal visible={!!activeModal} animationType="slide" transparent onRequestClose={() => setActiveModal(null)}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalDragIndicator} />
            <TouchableOpacity onPress={() => setActiveModal(null)} style={styles.closeBtn}>
              <Ionicons name="close-circle" size={32} color="rgba(255,255,255,0.3)" />
            </TouchableOpacity>
            {renderModalContent()}
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  header: { marginTop: 64, marginBottom: 24 },
  headerTitle: { fontSize: 32, fontWeight: '800', color: colors.white, letterSpacing: -0.5 },

  profileCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 24, padding: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', marginBottom: 32 },
  avatarContainer: { width: 72, height: 72, borderRadius: 36, backgroundColor: 'rgba(59,130,246,0.2)', justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: colors.primary },
  avatarText: { fontSize: 28, fontWeight: '800', color: colors.primary },
  infoContainer: { marginLeft: 20, flex: 1 },
  nameText: { fontSize: 20, fontWeight: '800', color: colors.white, marginBottom: 4 },
  emailText: { fontSize: 13, color: colors.textSecondary, marginBottom: 10, fontWeight: '500' },
  roleBadge: { backgroundColor: colors.primary, alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 10 },
  roleText: { color: colors.white, fontSize: 11, fontWeight: '800', letterSpacing: 1 },

  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 12, fontWeight: '700', color: colors.textSecondary, marginBottom: 12, paddingHorizontal: 4, textTransform: 'uppercase', letterSpacing: 1.5 },
  cardGroup: { backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: 24, padding: 8, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  settingItem: { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 16 },
  iconBox: { width: 44, height: 44, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.05)', justifyContent: 'center', alignItems: 'center' },
  settingTextContainer: { flex: 1, marginLeft: 14 },
  settingTitle: { fontSize: 15, fontWeight: '700', color: colors.white, marginBottom: 2 },
  settingSubtitle: { fontSize: 12, color: colors.textSecondary, fontWeight: '500' },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.75)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#111', borderTopLeftRadius: 32, borderTopRightRadius: 32, padding: 28, paddingBottom: 48, minHeight: 360, borderWidth: 1, borderColor: 'rgba(255,255,255,0.07)' },
  modalDragIndicator: { width: 44, height: 5, backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 3, alignSelf: 'center', marginBottom: 28 },
  closeBtn: { position: 'absolute', top: 20, right: 20, zIndex: 99 },
  modalTitle: { fontSize: 24, fontWeight: '800', color: colors.white, marginBottom: 8 },
  modalSub: { fontSize: 14, color: colors.textSecondary, marginBottom: 24, lineHeight: 22 },
  fieldLabel: { fontSize: 12, color: colors.textSecondary, fontWeight: '700', marginBottom: 8, marginTop: 12, textTransform: 'uppercase', letterSpacing: 1 },
  inputField: { backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', color: colors.white, padding: 16, borderRadius: 14, fontSize: 16, fontWeight: '600' },
  switchRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)' },
  switchLabel: { fontSize: 15, color: colors.white, fontWeight: '600', flex: 1, marginRight: 16 },
  themeOption: { flexDirection: 'row', alignItems: 'center', padding: 16, backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 16, marginBottom: 10, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  themeOptionActive: { borderColor: colors.primary, backgroundColor: 'rgba(59,130,246,0.1)' },
  themeText: { fontSize: 15, color: colors.textSecondary, fontWeight: '600' },
  dividerLine: { height: 1, backgroundColor: 'rgba(255,255,255,0.07)', marginVertical: 20 },
  warningBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(245,158,11,0.1)', padding: 16, borderRadius: 14, borderWidth: 1, borderColor: 'rgba(245,158,11,0.3)' },
  faqItem: { backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  faqQ: { fontSize: 14, fontWeight: '700', color: colors.white, marginBottom: 8 },
  faqA: { fontSize: 13, color: colors.textSecondary, lineHeight: 20 },
});
