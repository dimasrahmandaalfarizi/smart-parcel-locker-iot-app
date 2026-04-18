import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { globalStyles } from '../../styles/globalStyles';
import { colors } from '../../styles/colors';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';

export default function LockerKioskScreen({ navigation }) {
  // Token unik yang berubah setiap 30 detik untuk keamanan kurir
  const [courierLoginToken, setCourierToken] = useState(`COURIER-LOGIN-${Date.now()}`);

  useEffect(() => {
    // Simulasi penggantian token rotasi (Dynamic QR) untuk menghindari pemalsuan foto QR
    const interval = setInterval(() => {
      setCourierToken(`COURIER-LOGIN-${Date.now()}`);
    }, 15000); 
    return () => clearInterval(interval);
  }, []);

  return (
    <View style={[globalStyles.container, styles.kioskContainer]}>
      <Text style={styles.kioskTitle}>SMART LOCKER IOT</Text>
      <Text style={styles.kioskSubtitle}>LOKER STASIUN KELAPA GADING (#04)</Text>
      
      <Card style={styles.qrCard}>
        <Text style={globalStyles.title}>Akses Kurir</Text>
        <Text style={[globalStyles.body, { textAlign: 'center', marginBottom: 32 }]}>
          Silakan buka Aplikasi Kurir Anda, tekan "Scan QR", lalu arahkan ke layar ini.
        </Text>
        
        <View style={styles.qrContainer}>
          <QRCode
            value={courierLoginToken}
            size={280}
            color={colors.black}
            backgroundColor={colors.white}
          />
        </View>

        <Text style={styles.timerText}>Token keamanan diperbarui secara otomatis.</Text>
      </Card>

      <Button 
        title="Tutup Mode Mesin Cerdas" 
        variant="ghost" 
        onPress={() => navigation.goBack()} 
        style={styles.exitBtn}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  kioskContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#09090B', // Lebih gelap
    paddingHorizontal: 16,
  },
  kioskTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: colors.primary,
    letterSpacing: 2,
    marginBottom: 4,
    textAlign: 'center',
  },
  kioskSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    letterSpacing: 1,
    marginBottom: 40,
    textAlign: 'center',
  },
  qrCard: {
    width: '100%',
    maxWidth: 420,
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 24,
    backgroundColor: colors.surfaceHighlight,
    borderWidth: 1,
    borderColor: colors.border,
  },
  qrContainer: {
    padding: 24,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },
  timerText: {
    marginTop: 24,
    fontSize: 13,
    color: colors.primary,
    fontWeight: '600',
    opacity: 0.8,
  },
  exitBtn: {
    position: 'absolute',
    bottom: 30,
  }
});
