import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, StyleSheet, Modal, RefreshControl } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import QRCode from 'react-native-qrcode-svg';
import { globalStyles } from '../../styles/globalStyles';
import { colors } from '../../styles/colors';
import { useAuth } from '../../hooks/useAuth';
import Button from '../../components/common/Button';
import PackageCard from '../../components/package/PackageCard';
import LockerCard from '../../components/locker/LockerCard';
import api from '../../services/api'; 

export default function HomeScreen({ navigation }) {
  const { userInfo, logout } = useAuth();
  const role = userInfo?.role?.toUpperCase() || 'USER';
  
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
      // Sesuai implementasi pada dokumen hasilnya.md
      const response = await api.get('/packages/my-packages');
      setMyPackages(response.data?.data || response.data || []);
    } catch (error) {
      console.error('Gagal mengeksekusi /api/packages/my-packages:', error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      // Membagi penarikan API berdasarkan tingkat Hak Akses
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
      <Text style={styles.sectionTitle}>Paket Aktif Anda</Text>
      {myPackages.length === 0 ? (
         <View style={{ paddingVertical: 40, alignItems: 'center' }}>
            <Text style={[globalStyles.bodySmall, { fontStyle: 'italic', textAlign: 'center' }]}>
              Anda belum memiliki paket yang dititipkan atau sedang tertahan di stasiun loker.
            </Text>
         </View>
      ) : (
         // Menyusun render sesuai dengan bentuk database
         myPackages.map((pkg, index) => (
           <View key={pkg.id || index}>
             {/* Jika paket tertahan karena belum lunas denda (Sesuai hasilnya.md) */}
             {pkg.isPaid === false && (
                <View style={styles.penaltyBadge}>
                  <Text style={styles.penaltyText}>🚨 Menginap &gt; 48 Jam | Denda: Rp {pkg.overtimeFee || 10000}</Text>
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
      <View style={styles.courierBanner}>
        <Text style={styles.bannerText}>Siap Menaruh Paket ke Mesin?</Text>
        <Button title="Scan Untuk Drop Paket" onPress={() => navigation.navigate('Scan')} />
      </View>
    </View>
  );

  const renderAdminDashboard = () => (
    <View>
      <View style={styles.courierBanner}>
        <Text style={styles.bannerText}>Akses Mesin Kiosk (Layar Fisik)</Text>
        <Button 
          title="Generate QR Sinkronisasi Loker" 
          variant="outline"
          onPress={() => {
            setCourierToken(`COURIER-LOGIN-${Date.now()}`); 
            setShowCourierQR(true);
          }} 
        />
      </View>

      <View style={[styles.courierBanner, { marginTop: -8 }]}>
        <Text style={styles.bannerText}>Forensik Keamanan Loker</Text>
        <Button 
          title="Buka Buku Log Mesin IoT" 
          onPress={() => navigation.navigate('AuditLog')} 
          variant="outline"
        />
      </View>

      <Text style={styles.sectionTitle}>Status Hardware Loker (Live Database)</Text>
      <View style={styles.grid}>
        {lockers.length === 0 ? (
           <Text style={globalStyles.bodySmall}>Belum ada data loker dari endpoint /api/lockers.</Text>
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
            <Text style={[globalStyles.bodySmall, { textAlign: 'center' }]}>Kurir akan men-scan layar ini untuk login ke mesin ini.</Text>
            <View style={styles.qrContainer}>
              <QRCode value={courierToken} size={200} />
            </View>
            <Button title="Tutup Panel" variant="ghost" onPress={() => setShowCourierQR(false)} style={{ width: '100%' }} />
          </View>
        </View>
      </Modal>
    </View>
  );

  return (
    <View style={globalStyles.container}>
      <View style={styles.header}>
        <View>
          <Text style={[globalStyles.title, { marginBottom: 2 }]}>Dashboard {role}</Text>
          <Text style={globalStyles.bodySmall}>
            Selamat bekerja, <Text style={{ color: colors.primary, fontWeight: 'bold' }}>{userInfo?.name || userInfo?.email}</Text>
          </Text>
        </View>
        <Button title="Keluar" variant="outline" onPress={logout} style={styles.logoutBtn} />
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
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 40, marginBottom: 24 },
  logoutBtn: { height: 36, paddingHorizontal: 16, marginVertical: 0 },
  scroll: { paddingBottom: 110 },
  sectionTitle: { fontSize: 18, fontWeight: '600', color: colors.textPrimary, marginBottom: 16, marginTop: 12 },
  courierBanner: { backgroundColor: colors.surfaceHighlight, padding: 20, borderRadius: 16, marginBottom: 24, borderWidth: 1, borderColor: colors.border },
  bannerText: { fontSize: 16, color: colors.textPrimary, fontWeight: '500', marginBottom: 16 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  modalBg: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center', alignItems: 'center', padding: 24 },
  modalCard: { backgroundColor: colors.surface, padding: 24, borderRadius: 20, alignItems: 'center', width: '100%', borderWidth: 1, borderColor: colors.border },
  modalTitle: { fontSize: 22, fontWeight: '700', color: colors.white, marginBottom: 8 },
  qrContainer: { marginVertical: 24, padding: 16, backgroundColor: colors.white, borderRadius: 12 },
  penaltyBadge: { backgroundColor: 'rgba(239, 68, 68, 0.1)', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8, marginBottom: 16, borderWidth: 1, borderColor: 'rgba(239, 68, 68, 0.5)' },
  penaltyText: { color: '#EF4444', fontWeight: '800', fontSize: 13 }
});
