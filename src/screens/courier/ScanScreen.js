import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { globalStyles } from '../../styles/globalStyles';
import { colors } from '../../styles/colors';
import Button from '../../components/common/Button';
import { useAuth } from '../../hooks/useAuth';

export default function ScanScreen({ navigation, route }) {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const { login } = useAuth();
  
  // mode bisa 'login' (untuk Auth) atau 'package' (untuk Kurir menscan paket)
  const mode = route?.params?.mode || 'package';

  if (!permission) {
    return <View style={globalStyles.center}><ActivityIndicator size="large" color={colors.primary} /></View>;
  }

  if (!permission.granted) {
    return (
      <View style={[globalStyles.container, globalStyles.center]}>
        <Text style={[globalStyles.title, { textAlign: 'center', marginBottom: 12 }]}>Akses Kamera Diperlukan</Text>
        <Text style={[globalStyles.body, { textAlign: 'center', marginBottom: 32 }]}>
          Aplikasi butuh izin untuk menggunakan kamera agar dapat memindai QR Code.
        </Text>
        <Button title="Beri Izin Kamera" onPress={requestPermission} style={{ width: '100%' }} />
        <Button title="Kembali" variant="ghost" onPress={() => navigation.goBack()} style={{ width: '100%', marginTop: 8 }} />
      </View>
    );
  }

  const handleBarCodeScanned = ({ type, data }) => {
    setScanned(true);
    
    if (mode === 'login') {
      // Ingat, ini logika Mock dummy:
      alert(`QR ID Kurir Terdeteksi!\n\nSedang mengotentikasi Kurir...`);
      // Langsung pura-pura login sebagai kurir pake context kita
      login('kurir', 'qr-secret-key-123');
    } else {
      alert(`Resi / Pintu Loker Terdeteksi!\nData Barcode: ${data}`);
      setTimeout(() => {
        navigation.goBack();
      }, 1500);
    }
  };

  return (
    <View style={styles.container}>
      <CameraView
        style={StyleSheet.absoluteFillObject}
        facing="back"
        barcodeScannerSettings={{
          barcodeTypes: ["qr", "ean13", "ean8", "code128"],
        }}
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
      >
        <View style={styles.overlay}>
          <View style={styles.header}>
            <Text style={styles.title}>
              {mode === 'login' ? 'Scan QR ID Kurir' : 'Scan Resi Paket'}
            </Text>
            <Text style={styles.subtitle}>
              Posisikan QR atau Barcode di area kotak
            </Text>
          </View>

          <View style={styles.scanAreaContainer}>
            <View style={styles.scanArea} />
          </View>

          <View style={styles.footer}>
            {scanned && (
              <Button 
                title="Tap Di Sini Untuk Scan Ulang" 
                onPress={() => setScanned(false)} 
                style={{ width: '100%', marginBottom: 12 }} 
              />
            )}
            <Button 
              title="Batalkan & Kembali" 
              variant="outline" 
              onPress={() => navigation.goBack()} 
              style={{ width: '100%', backgroundColor: colors.surface }} 
            />
          </View>
        </View>
      </CameraView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.black,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)', // Gelap sedikit agar UI text terlihat
    justifyContent: 'space-between',
    padding: 24,
  },
  header: {
    alignItems: 'center',
    marginTop: 60,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.white,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: '#D1D5DB', // Lebih terang dari textSecondary
  },
  scanAreaContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanArea: {
    width: 250,
    height: 250,
    borderWidth: 2,
    borderColor: colors.primary,
    backgroundColor: 'transparent',
    borderRadius: 24,
  },
  footer: {
    paddingBottom: 24,
  }
});
