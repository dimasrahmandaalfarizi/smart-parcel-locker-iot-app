import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { globalStyles } from '../../styles/globalStyles';
import { colors } from '../../styles/colors';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';

export default function OpenLockerScreen({ navigation, route }) {
  // Misalnya menerima ID Loker dari parameter halaman Home
  const lockerId = route?.params?.lockerId || 'LOKER-01';
  
  // Data rahasia/token sementara untuk membuka pintu loker fisik (nanti di-generate API backend)
  const [qrData, setQrData] = useState(`OPEN-${lockerId}-${Date.now()}`);

  const handleRefreshQR = () => {
    // Generate ulang QR code dengan token waktu baru agar lebih aman (Anti Replay-Attack)
    setQrData(`OPEN-${lockerId}-${Date.now()}`);
  };

  return (
    <View style={globalStyles.container}>
      <Text style={[globalStyles.title, { marginTop: 40, textAlign: 'center' }]}>Akses Loker</Text>
      <Text style={[globalStyles.body, { textAlign: 'center', marginBottom: 20 }]}>
        Tunjukkan QR Code ini ke layar pemindai (scanner) di mesin loker fisik untuk membuka pintu Anda.
      </Text>
      
      <Card style={styles.qrCard}>
        <View style={styles.qrContainer}>
          <QRCode
            value={qrData}
            size={220}
            color={colors.black}
            backgroundColor={colors.white}
          />
        </View>
        <Text style={styles.qrText}>Loker: {lockerId}</Text>
      </Card>

      <View style={styles.footer}>
        <Button 
          title="Perbarui QR Code" 
          variant="outline" 
          onPress={handleRefreshQR} 
          style={{ marginBottom: 12 }} 
        />
        <Button 
          title="Tutup & Kembali" 
          variant="ghost" 
          onPress={() => navigation.goBack()} 
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  qrCard: {
    alignItems: 'center',
    paddingVertical: 32,
    backgroundColor: colors.white, // Layar putih penuh di sekitar QR agar mudah dibaca scanner optic fisik
    borderWidth: 0, // Hilangkan border karena sudah putih
  },
  qrContainer: {
    padding: 16,
    backgroundColor: '#fff',
  },
  qrText: {
    marginTop: 24,
    fontSize: 20,
    fontWeight: '800',
    color: colors.black,
    letterSpacing: 2,
  },
  footer: {
    marginTop: 'auto',
    marginBottom: 40,
  }
});
