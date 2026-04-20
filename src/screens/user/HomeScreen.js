import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, StyleSheet, Modal, RefreshControl, TouchableOpacity } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import QRCode from 'react-native-qrcode-svg';
import { Ionicons } from '@expo/vector-icons';
import { globalStyles } from '../../styles/globalStyles';
import { colors } from '../../styles/colors';
import { useAuth } from '../../hooks/useAuth';
import Button from '../../components/common/Button';
import PackageCard from '../../components/package/PackageCard';
import LockerCard from '../../components/locker/LockerCard';
import { PackageCardSkeleton, LockerCardSkeleton } from '../../components/common/SkeletonLoader';
import api from '../../services/api'; 

export default function HomeScreen({ navigation }) {
  const { userInfo } = useAuth();
  const role = userInfo?.role?.toUpperCase() || 'USER';
  const firstName = userInfo?.name?.split(' ')[0] || 'Kawan';
  
  const [showCourierQR, setShowCourierQR] = useState(false);
  const [courierToken, setCourierToken] = useState('');
  
  const [lockers, setLockers] = useState([]);
  const [myPackages, setMyPackages] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const fetchLockers = async () => {
    try {
      const response = await api.get('/lockers');
      setLockers(response.data?.data || response.data || []);
    } catch (error) {
      console.error('Gagal mengeksekusi /api/lockers:', error);
    }
  };

  const fetchMyPackages = async () => {
    try {
      const response = await api.get('/packages/my-packages');
      setMyPackages(response.data?.data || response.data || []);
    } catch (error) {
      console.error('Gagal mengeksekusi /api/packages/my-packages:', error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      if (role === 'ADMIN') fetchLockers();
      if (role === 'USER') fetchMyPackages();
    }, [role])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    if (role === 'ADMIN') await fetchLockers();
    if (role === 'USER') await fetchMyPackages();
    setRefreshing(false);
  };

  const renderUserDashboard = () => (
    <View>
      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionTitle}>Paket Aktif di Loker</Text>
        {myPackages.length > 0 && <View style={styles.countBadge}><Text style={styles.countText}>{myPackages.length}</Text></View>}
        <TouchableOpacity style={styles.historyBtn} onPress={() => navigation.navigate('PackageHistory')}>
          <Text style={styles.historyBtnText}>Riwayat</Text>
          <Ionicons name="arrow-forward" size={13} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {!refreshing && myPackages.length === 0 ? (
         <View style={styles.emptyStateBox}>
            <Ionicons name="cube-outline" size={48} color="rgba(255,255,255,0.1)" style={{marginBottom: 12}}/>
            <Text style={[globalStyles.body, { textAlign: 'center', fontWeight: '600' }]}>Belum ada paket tiba.</Text>
            <Text style={[globalStyles.bodySmall, { textAlign: 'center', marginTop: 4 }]}>Kami akan mengirimkan notifikasi saat kurir menaruh paket Anda.</Text>
         </View>
      ) : (
         myPackages.map((pkg, index) => (
           <View key={pkg.id || index}>
             {pkg.isPaid === false && (
                <View style={styles.penaltyBadge}>
                  <Ionicons name="warning-outline" size={16} color="#EF4444" style={{marginRight: 6}} />
                  <Text style={styles.penaltyText}>Terlambat Diambil | Denda: Rp {pkg.overtimeFee || 10000}</Text>
                </View>
             )}
             <PackageCard 
               trackingNumber={pkg.trackingCode || pkg.trackingNumber}
               status={pkg.status?.toLowerCase() || 'stored'}
               lockerNumber={pkg.lockerNumber || `Loker #${pkg.lockerId}`}
               onPress={() => navigation.navigate('PackageDetail', { packageData: pkg })}
             />
           </View>
         ))
      )}
    </View>
  );

  const renderCourierDashboard = () => (
    <View>
      <View style={styles.premiumBanner}>
        <View style={styles.premiumBannerTextCont}>
           <Text style={styles.premiumBannerTitle}>Tugas Ekspedisi</Text>
           <Text style={styles.premiumBannerBody}>Dekatkan barcode paket ke lensa untuk langsung membuka pintu otomatis.</Text>
        </View>
        <Button title="Buka Kamera Scan" onPress={() => navigation.navigate('Scan')} />
      </View>
    </View>
  );

  const renderAdminDashboard = () => (
    <View>
      {/* Analytics shortcut card */}
      <TouchableOpacity style={styles.analyticsCard} onPress={() => navigation.navigate('AdminAnalytics')} activeOpacity={0.8}>
        <View style={{flexDirection: 'row', alignItems: 'center', flex: 1}}>
          <View style={[styles.iconBox, { backgroundColor: 'rgba(139,92,246,0.15)' }]}>
            <Ionicons name="bar-chart-outline" size={22} color="#8B5CF6" />
          </View>
          <View style={{marginLeft: 14}}>
            <Text style={styles.analyticsTitle}>Dashboard Analitik</Text>
            <Text style={styles.analyticsDesc}>Statistik, grafik & performa harian loker</Text>
          </View>
        </View>
        <Ionicons name="arrow-forward" size={20} color="rgba(255,255,255,0.3)" />
      </TouchableOpacity>

      <View style={styles.premiumBanner}>
        <View style={styles.premiumBannerTextCont}>
           <Text style={styles.premiumBannerTitle}>Kiosk Sinkronisasi</Text>
           <Text style={styles.premiumBannerBody}>Pasangkan mesin dengan memindai QR ini dari tablet loker.</Text>
        </View>
        <Button 
          title="Tampilkan Kode QR" 
          variant="outline"
          onPress={() => {
            setCourierToken(`COURIER-LOGIN-${Date.now()}`); 
            setShowCourierQR(true);
          }} 
        />
      </View>

      <TouchableOpacity style={styles.auditCard} onPress={() => navigation.navigate('AuditLog')} activeOpacity={0.8}>
        <View style={{flexDirection: 'row', alignItems: 'center'}}>
           <View style={[styles.iconBox, { backgroundColor: 'rgba(59,130,246,0.15)' }]}>
             <Ionicons name="shield-checkmark-outline" size={24} color={colors.primary} />
           </View>
           <View style={{marginLeft: 16}}>
             <Text style={styles.auditTitle}>Buku Forensik Keamanan</Text>
             <Text style={styles.auditDesc}>Lacak riwayat semua akses pintu secara mutlak.</Text>
           </View>
        </View>
        <Ionicons name="arrow-forward" size={20} color={colors.textSecondary} />
      </TouchableOpacity>

      <Text style={[styles.sectionTitle, {marginTop: 8, marginBottom: 16}]}>Status Perangkat IoT Live</Text>
      <View style={styles.grid}>
        {lockers.length === 0 ? (
           <View style={{flexDirection: 'row', flexWrap: 'wrap', gap: 10}}>
              <LockerCardSkeleton /><LockerCardSkeleton /><LockerCardSkeleton /><LockerCardSkeleton />
           </View>
        ) : (
           lockers.map((loker, index) => (
             <LockerCard 
               key={loker.id || index} 
               lockerNumber={loker.number || loker.id} 
               status={loker.status?.toLowerCase() || 'available'} 
             />
           ))
        )}
      </View>

      <Modal visible={showCourierQR} animationType="fade" transparent>
        <View style={styles.modalBg}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Sistem Kiosk Mesin</Text>
            <Text style={[globalStyles.bodySmall, { textAlign: 'center' }]}>Kurir akan men-scan layar ini untuk masuk sebagai akun mesin ini.</Text>
            <View style={styles.qrContainer}>
              <QRCode value={courierToken} size={220} />
            </View>
            <Button title="Tutup Perangkat" variant="ghost" onPress={() => setShowCourierQR(false)} style={{ width: '100%' }} />
          </View>
        </View>
      </Modal>
    </View>
  );

  return (
    <View style={globalStyles.container}>
      <View style={styles.headerPro}>
        <View>
          <Text style={styles.greetingText}>Halo, <Text style={{ color: colors.white }}>{firstName}!</Text> 👋</Text>
          <Text style={styles.subtitleText}>Terhubung ke Jaringan Pintu Cerdas</Text>
        </View>
        {/* Profile button has been moved to Tab Navigator for cleaner UI */}
        <TouchableOpacity style={styles.notificationBtn}>
           <Ionicons name="notifications-outline" size={24} color={colors.white} />
           <View style={styles.notificationDot} />
        </TouchableOpacity>
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false} 
        contentContainerStyle={styles.scroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
      >
        {role === 'ADMIN' && renderAdminDashboard()}
        {role === 'COURIER' && renderCourierDashboard()}
        {role === 'USER' && renderUserDashboard()}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  headerPro: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 60, marginBottom: 32, paddingHorizontal: 4 },
  greetingText: { fontSize: 26, fontWeight: '800', color: colors.textSecondary, letterSpacing: -0.5, marginBottom: 4 },
  subtitleText: { fontSize: 13, color: colors.textSecondary, fontWeight: '600' },
  notificationBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.06)', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  notificationDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#EF4444', position: 'absolute', top: 12, right: 12, borderWidth: 1.5, borderColor: '#121212' },
  
  scroll: { paddingBottom: 110 },
  sectionHeaderRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16, marginTop: 12, paddingHorizontal: 4 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: colors.white, letterSpacing: -0.3 },
  countBadge: { backgroundColor: 'rgba(255,255,255,0.1)', paddingHorizontal: 10, paddingVertical: 2, borderRadius: 10, marginLeft: 12 },
  countText: { color: colors.white, fontSize: 12, fontWeight: '800' },
  
  emptyStateBox: { backgroundColor: 'rgba(255,255,255,0.02)', padding: 32, borderRadius: 24, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.04)', borderStyle: 'dashed' },
  
  premiumBanner: { backgroundColor: 'rgba(59,130,246,0.1)', padding: 24, borderRadius: 24, marginBottom: 28, borderWidth: 1, borderColor: 'rgba(59,130,246,0.2)' },
  premiumBannerTextCont: { marginBottom: 16 },
  premiumBannerTitle: { fontSize: 20, color: colors.white, fontWeight: '800', marginBottom: 6, letterSpacing: -0.5 },
  premiumBannerBody: { fontSize: 14, color: colors.textSecondary, lineHeight: 20 },
  
  auditCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: 'rgba(255,255,255,0.03)', padding: 16, borderRadius: 20, marginBottom: 32, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  iconBox: { width: 48, height: 48, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  auditTitle: { fontSize: 15, fontWeight: '700', color: colors.white, marginBottom: 4 },
  auditDesc: { fontSize: 12, color: colors.textSecondary },

  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginTop: 16 },
  modalBg: { flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'center', alignItems: 'center', padding: 24 },
  modalCard: { backgroundColor: '#1A1A1A', padding: 32, borderRadius: 32, alignItems: 'center', width: '100%', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  modalTitle: { fontSize: 24, fontWeight: '800', color: colors.white, marginBottom: 12 },
  qrContainer: { marginVertical: 32, padding: 20, backgroundColor: colors.white, borderRadius: 20 },
  
  penaltyBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(239, 68, 68, 0.15)', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 10, marginBottom: 12, borderWidth: 1, borderColor: 'rgba(239, 68, 68, 0.4)' },
  penaltyText: { color: '#FF6B6B', fontWeight: '700', fontSize: 12 },

  // Phase 4 styles
  historyBtn: { flexDirection: 'row', alignItems: 'center', marginLeft: 'auto', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10, backgroundColor: 'rgba(59,130,246,0.1)', borderWidth: 1, borderColor: 'rgba(59,130,246,0.2)' },
  historyBtnText: { color: colors.primary, fontSize: 12, fontWeight: '700', marginRight: 4 },
  analyticsCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: 'rgba(139,92,246,0.06)', padding: 18, borderRadius: 20, marginBottom: 16, borderWidth: 1, borderColor: 'rgba(139,92,246,0.15)' },
  analyticsTitle: { fontSize: 15, fontWeight: '800', color: colors.white, marginBottom: 4 },
  analyticsDesc: { fontSize: 12, color: colors.textSecondary },
});
