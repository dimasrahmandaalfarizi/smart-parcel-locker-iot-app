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
  
  // Ambil role secara uppercase berdasarkan JWT dari database (ADMIN / COURIER / USER)
  const role = userInfo?.role?.toUpperCase() || 'USER';
  
  const [showCourierQR, setShowCourierQR] = useState(false);
  const [courierToken, setCourierToken] = useState('');
  
  // State API Data
  const [lockers, setLockers] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const fetchLockers = async () => {
    try {
      // Memanggil method GET /api/lockers sesuai breafingApi.md
      const response = await api.get('/lockers');
      const dataLoker = response.data?.data || response.data || [];
      setLockers(dataLoker);
    } catch (error) {
      console.error('Gagal mengambil data loker (Pastikan Server Backend Menyala):', error);
    }
  };

  // Setiap kali Admin membuka halaman ini, tarik data asli dari backend!
  useFocusEffect(
    useCallback(() => {
      if (role === 'ADMIN') {
        fetchLockers();
      }
    }, [role])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    if (role === 'ADMIN') {
      await fetchLockers();
    }
    setRefreshing(false);
  };

  const renderUserDashboard = () => (
    <View>
      <Text style={styles.sectionTitle}>Paket Aktif Anda</Text>
      <PackageCard 
        trackingNumber="RESI-ASLI-12345"
        status="stored"
        lockerNumber="Locker #01"
        onPress={() => navigation.navigate('OpenLocker', { lockerId: '1' })}
      />
    </View>
  );

  const renderCourierDashboard = () => (
    <View>
      <View style={styles.courierBanner}>
        <Text style={styles.bannerText}>Siap Mengirim Paket?</Text>
        <Button 
          title="Scan Untuk Drop Paket" 
          onPress={() => navigation.navigate('Scan')} 
        />
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
            setCourierToken(`COURIER-LOGIN-${Date.now()}`); // Nanti backend bisa memvalidasi kode rahasia ini
            setShowCourierQR(true);
          }} 
        />
      </View>

      <Text style={styles.sectionTitle}>Status Hardware Loker (Live)</Text>
      <View style={styles.grid}>
        {lockers.length === 0 ? (
           <Text style={globalStyles.bodySmall}>Belum ada data! (Server mati atau database kosong).</Text>
        ) : (
           // Render kartu dinamis langsung dari database Prisma/MySQL!
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
            <Text style={[globalStyles.bodySmall, { textAlign: 'center' }]}>Kode ini berfungsi sebagai akses fisik Kurir untuk mesin ini.</Text>
            
            <View style={styles.qrContainer}>
              <QRCode value={courierToken} size={200} />
            </View>
            
            <Button 
              title="Tutup Panel" 
              variant="ghost" 
              onPress={() => setShowCourierQR(false)} 
              style={{ width: '100%' }} 
            />
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 24,
  },
  logoutBtn: {
    height: 36,
    paddingHorizontal: 16,
    marginVertical: 0,
  },
  scroll: {
    paddingBottom: 110, // Memberikan ruang untuk Tab Bar melayang di bawah
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 16,
    marginTop: 12,
  },
  courierBanner: {
    backgroundColor: colors.surfaceHighlight,
    padding: 20,
    borderRadius: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: colors.border,
  },
  bannerText: {
    fontSize: 16,
    color: colors.textPrimary,
    fontWeight: '500',
    marginBottom: 16,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  modalBg: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalCard: {
    backgroundColor: colors.surface,
    padding: 24,
    borderRadius: 20,
    alignItems: 'center',
    width: '100%',
    borderWidth: 1,
    borderColor: colors.border,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.white,
    marginBottom: 8,
  },
  qrContainer: {
    marginVertical: 24,
    padding: 16,
    backgroundColor: colors.white,
    borderRadius: 12,
  }
});
