import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Alert, TextInput, KeyboardAvoidingView } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { globalStyles } from '../../styles/globalStyles';
import { colors } from '../../styles/colors';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import api from '../../services/api';

export default function LockerKioskScreen({ navigation }) {
  // Token unik kurir yang secara dinamis dirotasi setiap 15 detik (Dynamic QR)
  const [courierLoginToken, setCourierToken] = useState(`COURIER-LOGIN-${Date.now()}`);
  const [pin, setPin] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => setCourierToken(`COURIER-LOGIN-${Date.now()}`), 15000); 
    return () => clearInterval(interval);
  }, []);

  const handleOpenPin = async () => {
    if (pin.length !== 6) {
      if (typeof window !== 'undefined' && window.alert) window.alert('Error: Sistem Kiosk membutuhkan persis 6 angka.');
      else Alert.alert('Format Salah', 'PIN harus terdiri dari 6 angka!');
      return;
    }

    setIsLoading(true);
    try {
      // Mengirim PIN ke API Kiosk tanpa kredensial Auth
      const response = await api.post('/lockers/open-pin', { pin });
      
      const resMsg = `✅ PINTU LOKER SUKSES DIBUKA! 🔓\n\nResi Logistik terkait telah ditandai selasai. PIN OTP sekali-pakai ini telah dimusnahkan secara permanen dari server.\n\nServer Response: ${JSON.stringify(response.data)}`;
      
      if (typeof window !== 'undefined' && window.alert) {
         window.alert(resMsg);
      } else {
         Alert.alert('Sukses Membuka Pint!', resMsg);
      }
      setPin(''); // Bersihkan keyboard layer
    } catch (error) {
      console.error('Gagal Eksekusi PIN di Kiosk:', error);
      const errData = error.response?.data;

      // Logika Pencegatan Khusus
      if (errData?.errorCode === 'UNPAID_PENALTY') {
         if (typeof window !== 'undefined' && window.alert) window.alert('AKSES DITOLAK MESIN!\nPaket ini masih memiliki tunggakan biaya keterlambatan.');
         else Alert.alert('Akses Ditolak', 'Tertahan karena denda keterlambatan belum dilunasi pemilik utama.');
      } else {
         const generalErr = errData?.message || 'PIN yang dimasukkan Salah, Telah Kadaluarsa (Expired), atau IP Kiosk Anda sedang diblokir otomatis 15 Menit akibat sering salah (Rate Limit/Brute Force Block).';
         if (typeof window !== 'undefined' && window.alert) window.alert(`GAGAL!\n${generalErr}`);
         else Alert.alert('Penolakan IoT Loker', generalErr);
      }
    }
    setIsLoading(false);
  };

  return (
    <KeyboardAvoidingView behavior="padding" style={[globalStyles.container, styles.kioskContainer]}>
      <Text style={styles.kioskTitle}>SMART LOCKER KI◘SK</Text>
      <Text style={styles.kioskSubtitle}>MESIN FISIK STASIUN KELAPA GADING (#04)</Text>
      
      {/* Menggunakan grid fleksibel bersisian untuk Panel Kiri (QR Kurir) dan Kanan (PIN Numpad Ojol) */}
      <View style={styles.panelSplitter}>
          
          {/* Panel Kiri: Scanner Dinamik Kurir */}
          <Card style={styles.kioskCard}>
            <Text style={[globalStyles.title, { color: colors.primary, textAlign: 'center' }]}>Area Kurir Kemitraan</Text>
            <Text style={[globalStyles.bodySmall, { textAlign: 'center', marginBottom: 24, marginTop: 4 }]}>
              Buka menu "Scan Loker" pada Aplikasi Kurir Anda, dan arahkan lensa secara utuh ke layar ini.
            </Text>
            
            <View style={styles.qrContainer}>
              <QRCode value={courierLoginToken} size={200} color={colors.black} backgroundColor={colors.white} />
            </View>
            <Text style={styles.timerText}>Tiket Enkripsi QR di-reset setiap 15 detik.</Text>
          </Card>

          {/* Panel Kanan: Numpad Pengambilan PIN Ojek Online */}
          <Card style={styles.kioskCard}>
            <Text style={[globalStyles.title, { color: '#10B981', textAlign: 'center' }]}>Ambil Vakil Titipan</Text>
            <Text style={[globalStyles.bodySmall, { textAlign: 'center', marginBottom: 24, marginTop: 4 }]}>
              Anda Saudara / Driver Gojek? Ketikkan ke-6 kombinasi Nomor PIN rahasia rilis-pintu Anda di bawah ini.
            </Text>
            
            <TextInput 
               style={styles.pinInput}
               keyboardType="number-pad"
               maxLength={6}
               placeholder="******"
               placeholderTextColor="rgba(255,255,255,0.2)"
               value={pin}
               onChangeText={setPin}
               secureTextEntry
               textAlign="center"
               selectionColor="#10B981"
            />
            
            <Button 
               title="VERIFIKASI & BUKA PINTU 🔓" 
               onPress={handleOpenPin}
               isLoading={isLoading}
               style={styles.actionBtn}
            />
            <Text style={[styles.timerText, { color: '#EF4444' }]}>Security 🚨: Salah 5x = Layar Diblokir 15 Menit</Text>
          </Card>
      </View>

      <Button 
        title="Matikan Mode Layar Tablet Kiosk (Kembali Ke Aplikasi Bawaan Debug)" 
        variant="ghost" 
        onPress={() => navigation.goBack()} 
        style={styles.exitBtn}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  kioskContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000000', // Black solid for realistic Kiosk screen
    paddingHorizontal: 24,
  },
  kioskTitle: { fontSize: 32, fontWeight: '900', color: colors.white, letterSpacing: 3, marginBottom: 8, textAlign: 'center' },
  kioskSubtitle: { fontSize: 14, color: colors.textSecondary, letterSpacing: 2, marginBottom: 40, textAlign: 'center', fontWeight: '800' },
  
  panelSplitter: {
    flexDirection: 'row',
    gap: 24,
    width: '100%',
    maxWidth: 960,
    justifyContent: 'center',
    flexWrap: 'wrap' // responsif jika di run pakai HP vertical
  },
  kioskCard: {
    flex: 1,
    minWidth: 320,
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 24,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: 32
  },
  qrContainer: { padding: 16, backgroundColor: '#ffffff', borderRadius: 20 },
  timerText: { marginTop: 24, fontSize: 13, fontWeight: '700', opacity: 0.7, color: colors.textSecondary },
  exitBtn: { marginTop: 40, position: 'relative' },
  
  pinInput: {
    width: '100%',
    height: 85,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderWidth: 2,
    borderColor: 'rgba(16, 185, 129, 0.4)',
    borderRadius: 20,
    color: '#10B981',
    fontSize: 48,
    fontWeight: '900',
    letterSpacing: 10
  },
  actionBtn: { width: '100%', marginTop: 24, backgroundColor: '#10B981', shadowColor: '#10B981' }
});
