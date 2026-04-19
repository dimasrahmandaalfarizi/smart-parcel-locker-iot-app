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
  const [isGenerating, setIsGenerating] = useState(false);
  const [pinData, setPinData] = useState(null); // Menyimpan state kembalian PIN dari server

  const packageData = route?.params?.packageData || {};
  // Gunakan package id atau tracking num sebagai identifier call API
  const trackingNumber = packageData.trackingCode || packageData.trackingNumber || 'Tidak Diketahui';
  const apiId = packageData.id || trackingNumber; // ID Dinamis

  const handleGeneratePin = async () => {
    setIsGenerating(true);
    try {
      // Hantam Endpoint Baru (Phase 3) pada dokumen v3-frontend.md
      const response = await api.post(`/packages/${apiId}/generate-pin`, { 
        durationHours: 2 
      });
      
      const secretRecord = response.data;
      setPinData(secretRecord); // Menampilkan box PIN hijau
      
      const notifMsg = `KODE PIN: ${secretRecord.pin}\n\nBerlaku sampai: ${new Date(secretRecord.expiresAt).toLocaleTimeString()}\nHangus otomatis jika disalahgunakan atau kadaluwarsa.\nSampaikan ke driver Anda!`;
      
      if (typeof window !== 'undefined' && window.alert) window.alert(`Akses Terbuat 🎟️\n\n${notifMsg}`);
      else Alert.alert('Akses Wakilan Terbuat 🎟️', notifMsg);
      
    } catch(err) {
       console.error('Generate PIN gagal:', err);
       const errMsg = err.response?.data?.message || 'Server gagal memproses enkripsi mesin Pin.';
       if (typeof window !== 'undefined' && window.alert) window.alert(`Gagal: ${errMsg}`);
       else Alert.alert('Kegagalan Komunikasi', errMsg);
    }
    setIsGenerating(false);
  };

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
       console.error('Koneksi ke backend port gagal saat mengambil paket:', error);
       const errData = error.response?.data;
       
       if (errData?.errorCode === 'UNPAID_PENALTY') {
           const penaltyMsg = `${errData.message}\n\nTotal Denda Keterlambatan: Rp ${errData.fee?.toLocaleString('id-ID')}`;
           
           if (typeof window !== 'undefined' && window.confirm) {
               const wantToPay = window.confirm(`AKSES LOKER TERKUNCI 🚨\n\n${penaltyMsg}\n\nApakah Anda ingin membayar sekarang?`);
               if(wantToPay) { window.alert('Memanggil integrasi Midtrans...'); }
           } else {
               Alert.alert('Akses Loker Terkunci 🚨', penaltyMsg, [
                 { text: 'Bayar Sekarang', onPress: () => alert('Memanggil webhook Midtrans...') },
                 { text: 'Batal', style: 'cancel' }
               ]);
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
            <Text style={styles.label}>Nomor Resi / Pelacakan</Text>
            <Text style={styles.valueLarge}>{trackingNumber}</Text>
          </View>
          <StatusBadge status={packageData.status?.toLowerCase() || "stored"} />
        </View>

        <View style={styles.divider} />

        <View style={styles.infoRow}>
          <View style={styles.infoCol}>
            <Text style={styles.label}>Titik Loker Stasiun</Text>
            <View style={globalStyles.row}>
              <Ionicons name="cube-outline" size={16} color={colors.primary} style={{ marginRight: 6 }} />
              <Text style={styles.value}>{packageData.lockerNumber || `Kotak Laci #${packageData.lockerId || 'N/A'}`}</Text>
            </View>
          </View>
          <View style={styles.infoCol}>
            <Text style={styles.label}>Kapasitas Volume</Text>
            <Text style={styles.value}>{packageData.size || 'Medium'}</Text>
          </View>
        </View>

        <View style={styles.divider} />

        {/* Munculkan Laporan Tunggakan apabila dideteksi oleh backend */}
        {packageData.isPaid === false && (
          <View style={{ marginBottom: 16 }}>
            <Text style={[styles.label, {color: '#EF4444'}]}>Catatan Hukum Ekspedisi</Text>
            <Text style={[styles.value, { color: '#EF4444', fontWeight: 'bold' }]}>Tertunggak (Masa Inap Melebihi Batas 48 Jam)</Text>
          </View>
        )}
      </Card>

      <View style={styles.actionContainer}>
        
        {/* FITUR PHASE 3: Pemanggilan Token Ojol Sementara */}
        {packageData.isPaid !== false && (
           <Button 
             title="Titipkan ke Ojol (Share Kunci Mesin PIN) ⏱️" 
             onPress={handleGeneratePin}
             isLoading={isGenerating}
             variant="outline"
             style={{ width: '100%', marginBottom: 16, borderColor: '#10B981', backgroundColor: 'rgba(16, 185, 129, 0.05)' }}
           />
        )}

        {isProcessing ? (
           <ActivityIndicator size="large" color={colors.primary} />
        ) : (
           <Button 
             title={packageData.isPaid === false ? "Bayar Lunas Denda & Buka Kendali" : "Hadir Di Depan Loker? Buka Sekarang"} 
             onPress={handleAmbilPaket} 
             style={{ width: '100%', backgroundColor: packageData.isPaid === false ? '#EF4444' : colors.primary }}
           />
        )}
        
        {/* KARTU PREVIEW TOKEN (Hanya nampil ketika diGenerate) */}
        {pinData && (
           <View style={styles.pinDataBox}>
              <Text style={styles.pinDataTitle}>🔑 Nomor Kunci Elektronik: {pinData.pin}</Text>
              <Text style={styles.pinDataSub}>Serahkan angka absolut itu ke wakil Anda untuk dimasukkan pada layar Tablet Loker. Tiket hangus otomatis pada pukul {new Date(pinData.expiresAt).toLocaleTimeString()}</Text>
           </View>
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
  divider: { height: 1, backgroundColor: 'rgba(255,255,255,0.05)', marginVertical: 20 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between' },
  infoCol: { flex: 1 },
  actionContainer: { marginTop: 32, alignItems: 'center' },
  
  pinDataBox: {
    marginTop: 24, 
    padding: 20, 
    backgroundColor: 'rgba(16,185,129,0.1)', 
    borderRadius: 20, 
    borderWidth: 1, 
    borderColor: '#10B981', 
    width: '100%'
  },
  pinDataTitle: { color: '#10B981', fontWeight: '900', textAlign: 'center', fontSize: 18, marginBottom: 8 },
  pinDataSub: { color: '#10B981', fontSize: 12, textAlign: 'center', opacity: 0.8, lineHeight: 18 }
});
