import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { globalStyles } from '../../styles/globalStyles';
import { colors } from '../../styles/colors';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import StatusBadge from '../../components/locker/StatusBadge';
import api from '../../services/api';

export default function PackageDetailScreen({ navigation, route }) {
  const [isProcessing, setIsProcessing] = useState(false);

  const packageData = route?.params?.packageData || {};
  const trackingNumber = packageData.trackingCode || packageData.trackingNumber || 'Tidak Diketahui';

  const handleAmbilPaket = async () => {
    setIsProcessing(true);
    try {
      const response = await api.post('/packages/pickup', {
        trackingCode: trackingNumber
      });
      
      const successMsg = `Pintu Loker Berhasil Terbuka secara Hardware! 🔓\n\nSilakan ambil paket Anda sekarang. (Response: ${JSON.stringify(response.data)})`;
      if (typeof window !== 'undefined' && window.alert) window.alert(successMsg);
      navigation.navigate('Beranda');
      
    } catch (error) {
       console.error('Koneksi ke backend port 3000 gagal saat mengambil paket:', error);
       
       const errData = error.response?.data;
       
       // Integrasi Evaluasi Frontend Fase 2: Menangani error code khusus UNPAID_PENALTY
       if (errData?.errorCode === 'UNPAID_PENALTY') {
           const penaltyMsg = `${errData.message}\n\nTotal Denda Keterlambatan: Rp ${errData.fee?.toLocaleString('id-ID')}`;
           
           if (typeof window !== 'undefined' && window.confirm) {
               // Fallback alert dialog untuk lingkungan Web Scanner
               const wantToPay = window.confirm(`AKSES LOKER TERKUNCI 🚨\n\n${penaltyMsg}\n\nApakah Anda ingin membayar sekarang?`);
               if(wantToPay) {
                   window.alert('Memanggil integrasi Payment Gateway Midtrans di POST /api/payments/create...');
               }
           } else {
               Alert.alert(
                  'Akses Loker Terkunci 🚨', 
                  penaltyMsg,
                  [
                    { text: 'Bayar Sekarang', onPress: () => { alert('Memanggil Midtrans di /api/payments/create...') } },
                    { text: 'Batal', style: 'cancel' }
                  ]
               );
           }
       } else {
           const genericError = errData?.message || 'Server gagal mengeksekusi perintah Hardware MQTT.';
           if (typeof window !== 'undefined' && window.alert) window.alert(genericError);
           else Alert.alert('Terjadi Kesalahan', genericError);
       }
    }
    setIsProcessing(false);
  };

  return (
    <ScrollView style={globalStyles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={26} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Detail Info Pelacakan</Text>
        <View style={{ width: 40 }} />
      </View>

      <Card style={styles.mainCard}>
        <View style={globalStyles.spaceBetween}>
          <View>
            <Text style={styles.label}>Nomor Resi</Text>
            <Text style={styles.valueLarge}>{trackingNumber}</Text>
          </View>
          <StatusBadge status={packageData.status?.toLowerCase() || "stored"} />
        </View>

        <View style={styles.divider} />

        <View style={styles.infoRow}>
          <View style={styles.infoCol}>
            <Text style={styles.label}>Lokasi Mesin</Text>
            <View style={globalStyles.row}>
              <Ionicons name="cube-outline" size={16} color={colors.primary} style={{ marginRight: 6 }} />
              <Text style={styles.value}>{packageData.lockerNumber || `Loker #${packageData.lockerId || 'X'}`}</Text>
            </View>
          </View>
          <View style={styles.infoCol}>
            <Text style={styles.label}>Kapasitas Pintu</Text>
            <Text style={styles.value}>{packageData.size || '-'}</Text>
          </View>
        </View>

        <View style={styles.divider} />

        {packageData.isPaid === false && (
          <View style={{ marginBottom: 16 }}>
            <Text style={[styles.label, {color: '#EF4444'}]}>Status Pembayaran</Text>
            <Text style={[styles.value, { color: '#EF4444', fontWeight: 'bold' }]}>Tertunggak (Masa Inap &gt; 48 Jam)</Text>
          </View>
        )}

      </Card>

      <View style={styles.actionContainer}>
        <Text style={[globalStyles.bodySmall, { textAlign: 'center', marginBottom: 16 }]}>
          PEMBERITAHUAN: Saat ditekna, aplikasi mengirim perintah ke Server Node.js, dan Server akan mentransmisikan sinyal *buka pintu selenoide* ke perangkat IoT Loker via **MQTT**.
        </Text>
        
        {isProcessing ? (
           <ActivityIndicator size="large" color={colors.primary} />
        ) : (
           <Button 
             title={packageData.isPaid === false ? "Bayar Denda & Buka Pintu" : "Buka Pintu Loker Sekarang"} 
             onPress={handleAmbilPaket} 
             style={{ width: '100%', backgroundColor: packageData.isPaid === false ? '#EF4444' : colors.primary }}
           />
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 48, marginBottom: 24 },
  headerTitle: { fontSize: 20, fontWeight: '700', color: colors.textPrimary },
  backBtn: { width: 40, height: 40, justifyContent: 'center', alignItems: 'flex-start' },
  mainCard: { padding: 24 },
  label: { fontSize: 12, color: colors.textSecondary, marginBottom: 4, textTransform: 'uppercase', letterSpacing: 0.8, fontWeight: '700' },
  valueLarge: { fontSize: 20, fontWeight: '800', color: colors.textPrimary, marginTop: 4 },
  value: { fontSize: 16, color: colors.textPrimary, fontWeight: '600' },
  divider: { height: 1, backgroundColor: colors.border, marginVertical: 20 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between' },
  infoCol: { flex: 1 },
  actionContainer: { marginTop: 32, alignItems: 'center' }
});
