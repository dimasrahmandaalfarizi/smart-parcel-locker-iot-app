import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Alert, Dimensions, ActivityIndicator } from 'react-native';
import { Camera, CameraView } from 'expo-camera';
import { globalStyles } from '../../styles/globalStyles';
import { colors } from '../../styles/colors';
import Button from '../../components/common/Button';
import { useAuth } from '../../hooks/useAuth';
import api from '../../services/api';

const { width } = Dimensions.get('window');
const SCANNER_SIZE = width * 0.75;

export default function ScanScreen({ navigation, route }) {
  const [hasPermission, setHasPermission] = useState(null);
  const [scanned, setScanned] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const { login } = useAuth();

  const mode = route?.params?.mode || 'package';

  useEffect(() => {
    const getCameraPermissions = async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    };
    getCameraPermissions();
  }, []);

  const handleBarCodeScanned = async ({ type, data }) => {
    if (scanned || isProcessing) return;
    setScanned(true);

    if (mode === 'login') {
      if (data.includes('COURIER-LOGIN')) {
        // Mode Simulasi Login QR Kurir 
        login('kurir@locker.com', '123456'); 
      } else {
        alert('QR Tidak Valid! Gunakan QR khusus dari Layar Mesin Loker.');
        setTimeout(() => setScanned(false), 2000);
      }
    } else {
      setIsProcessing(true);
      try {
        // Eksekusi API sesuai instruksi breafingApi.md
        const response = await api.post('/packages/drop', { 
          trackingCode: data, 
          size: 'medium'
        });
        
        // Khusus untuk menangani pemberitahuan di lingkungan Web (Expo Local Server)
        const pesanBerhasil = `Loker Terbuka secara IoT! Silakan masukkan paket.\n(Respon Database: ${JSON.stringify(response.data)})`;

        if (typeof window !== 'undefined' && window.alert) {
           window.alert(pesanBerhasil);
           navigation.goBack();
        } else {
           Alert.alert('Sukses Buka Loker!', pesanBerhasil, [
             { text: 'Lanjut', onPress: () => navigation.goBack() }
           ]);
        }
      } catch (error) {
        console.error('API Error /packages/drop:', error);
        const errMsg = error.response?.data?.message || 'Gagal tersambung ke backend port 3000.';
        
        if (typeof window !== 'undefined' && window.alert) {
          window.alert(errMsg);
        } else {
          Alert.alert('Gagal Menyimpan Paket', errMsg);
        }
        setScanned(false);
        setIsProcessing(false);
      }
    }
  };

  if (hasPermission === null) {
    return <View style={globalStyles.container}><Text style={globalStyles.body}>Meminta izin kamera...</Text></View>;
  }
  if (hasPermission === false) {
    return <View style={globalStyles.container}><Text style={globalStyles.body}>Akses kamera ditolak oleh browser/sistem.</Text></View>;
  }

  return (
    <View style={globalStyles.container}>
      <Text style={[globalStyles.title, { marginTop: 40, textAlign: 'center' }]}>
        {mode === 'login' ? 'Pemindai Akses Kurir (Kiosk)' : 'Scan Barcode / QR Resi Paket'}
      </Text>
      
      <View style={styles.cameraContainer}>
         <CameraView 
            style={StyleSheet.absoluteFillObject}
            onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
            barcodeScannerSettings={{
               barcodeTypes: ['qr', 'ean13', 'code128', 'code39'],
            }}
         />
        <View style={styles.overlayContainer}>
           <View style={styles.scanFrame} />
        </View>
      </View>

      <Text style={[globalStyles.bodySmall, { textAlign: 'center', marginTop: 24, paddingHorizontal: 20 }]}>
        {isProcessing ? 'Mengirim perintah buka laci ke IoT...' : 'Arahkan kamera ke Barcode / QR Code hingga masuk kotak hijau.'}
      </Text>
      
      {isProcessing && <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 20 }} />}

      <View style={{ marginTop: 'auto', marginBottom: 40 }}>
        {scanned && !isProcessing && (
           <Button title="Scan Ulang (Tap)" onPress={() => setScanned(false)} variant="outline" style={{ marginBottom: 12 }} />
        )}
        <Button title="Batal & Kembali" variant="ghost" onPress={() => navigation.goBack()} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  cameraContainer: {
    width: SCANNER_SIZE,
    height: SCANNER_SIZE,
    borderRadius: 24,
    overflow: 'hidden',
    alignSelf: 'center',
    marginTop: 40,
    backgroundColor: '#000',
  },
  overlayContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanFrame: {
    width: 200,
    height: 200,
    borderWidth: 3,
    borderColor: 'rgba(59, 130, 246, 0.7)', // Kotak pindaian biru hologram
    borderRadius: 16,
    backgroundColor: 'transparent',
  }
});
