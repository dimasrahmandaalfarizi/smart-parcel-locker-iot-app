import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Modal } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { globalStyles } from '../../styles/globalStyles';
import { colors } from '../../styles/colors';
import { useAuth } from '../../hooks/useAuth';
import Button from '../../components/common/Button';
import PackageCard from '../../components/package/PackageCard';
import LockerCard from '../../components/locker/LockerCard';

export default function HomeScreen({ navigation }) {
  const { userInfo, logout } = useAuth();
  
  const role = userInfo?.role || 'user';
  const [showCourierQR, setShowCourierQR] = useState(false);
  const [courierToken, setCourierToken] = useState('');

  const renderUserDashboard = () => (
    <View>
      <Text style={styles.sectionTitle}>Paket Aktif Anda</Text>
      <PackageCard 
        trackingNumber="RESI-123456789"
        status="stored"
        lockerNumber="Locker #04"
        onPress={() => navigation.navigate('OpenLocker', { lockerId: 'LOKER-04' })}
      />
      <Text style={styles.sectionTitle}>Riwayat</Text>
      <PackageCard 
        trackingNumber="RESI-987654321"
        status="picked_up"
        lockerNumber="Locker #02"
        onPress={() => navigation.navigate('PackageDetail')}
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
      <Text style={styles.sectionTitle}>Riwayat Drop Hari Ini</Text>
      <PackageCard 
        trackingNumber="RESI-555555"
        status="stored"
        lockerNumber="Locker #07"
      />
    </View>
  );

  const renderAdminDashboard = () => (
    <View>
      <View style={styles.courierBanner}>
        <Text style={styles.bannerText}>Akses Login Kurir</Text>
        <Button 
          title="Generate QR Login" 
          variant="outline"
          onPress={() => {
            setCourierToken(`COURIER-LOGIN-${Date.now()}`);
            setShowCourierQR(true);
          }} 
        />
      </View>

      <Text style={styles.sectionTitle}>Status Loker (Live)</Text>
      <View style={styles.grid}>
        <LockerCard lockerNumber="01" status="available" />
        <LockerCard lockerNumber="02" status="occupied" />
        <LockerCard lockerNumber="03" status="maintenance" />
        <LockerCard lockerNumber="04" status="occupied" />
      </View>

      {/* Modal untuk memunculkan (generate) QR Code Kurir */}
      <Modal visible={showCourierQR} animationType="fade" transparent>
        <View style={styles.modalBg}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>QR Akses Kurir</Text>
            <Text style={[globalStyles.bodySmall, { textAlign: 'center' }]}>Kurir akan men-scan layar ini untuk login ke sistem mesin ini.</Text>
            
            <View style={styles.qrContainer}>
              <QRCode value={courierToken} size={200} />
            </View>
            
            <Button 
              title="Tutup QR" 
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
          <Text style={[globalStyles.title, { marginBottom: 2 }]}>Dashboard</Text>
          <Text style={globalStyles.bodySmall}>
            Halo, <Text style={{ color: colors.primary, fontWeight: 'bold' }}>{userInfo?.username}</Text> ({role})
          </Text>
        </View>
        <Button title="Keluar" variant="outline" onPress={logout} style={styles.logoutBtn} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {role === 'admin' && renderAdminDashboard()}
        {role === 'courier' && renderCourierDashboard()}
        {role === 'user' && renderUserDashboard()}
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
    paddingBottom: 40,
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
