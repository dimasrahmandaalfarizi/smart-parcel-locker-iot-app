import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { globalStyles } from '../../styles/globalStyles';
import { colors } from '../../styles/colors';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import StatusBadge from '../../components/locker/StatusBadge';
import api from '../../services/api';

export default function PackageDetailScreen({ navigation, route }) {
  const [isProcessing, setIsProcessing] = useState(false);

  // Secara struktur ini adalah mock UI fallback-nya, namun sudah disambung dengan Axios aslinya di bawah
  const packageData = route?.params?.packageData || {
    id: 1,
    trackingNumber: 'RESI-ASLI-12345',
    status: 'IN_LOCKER', // Status menyesuaikan struktur database (breafingApi.md)
    lockerNumber: 'Loker #01',
    courierName: 'Kemitraan Jasa Ekspedisi (Kurir)',
    dropDate: 'Hari ini',
    size: 'Medium (M)',
  };

  const handleAmbilPaket = async () => {
    setIsProcessing(true);
    try {
      // Memanggil method POST /api/packages/pickup menggunakan tracking code
      const response = await api.post('/packages/pickup', {
        trackingCode: packageData.trackingNumber
      });
      
      const successMsg = `Pintu Loker Berhasil Terbuka secara Hardware! 🔓\n\nSilakan ambil paket Anda sekarang. (Response: ${JSON.stringify(response.data)})`;
      
      if (typeof window !== 'undefined' && window.alert) {
         window.alert(successMsg);
         navigation.navigate('Beranda');
      } else {
         alert(successMsg);
         navigation.navigate('Beranda');
      }
    } catch (error) {
       console.error('Koneksi ke backend port 3000 gagal saat mengambil paket:', error);
       alert(error.response?.data?.message || 'Komputer server (Backend) sepertinya belum menyala, perintah Hardware gagal dieksekusi.');
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
            <Text style={styles.valueLarge}>{packageData.trackingNumber}</Text>
          </View>
          <StatusBadge status="stored" />
        </View>

        <View style={styles.divider} />

        <View style={styles.infoRow}>
          <View style={styles.infoCol}>
            <Text style={styles.label}>Lokasi Mesin</Text>
            <View style={globalStyles.row}>
              <Ionicons name="cube-outline" size={16} color={colors.primary} style={{ marginRight: 6 }} />
              <Text style={styles.value}>{packageData.lockerNumber}</Text>
            </View>
          </View>
          <View style={styles.infoCol}>
            <Text style={styles.label}>Kapasitas Pintu</Text>
            <Text style={styles.value}>{packageData.size}</Text>
          </View>
        </View>

        <View style={styles.divider} />

        <Text style={styles.label}>Kurir Pengantar</Text>
        <Text style={[styles.value, { marginBottom: 16 }]}>{packageData.courierName}</Text>

        <Text style={styles.label}>Waktu Tiba (Disimpan Kurir)</Text>
        <Text style={[styles.value, { marginBottom: 16 }]}>{packageData.dropDate}</Text>
      </Card>

      {/* Interaksi Langsung dengan Database API - Internet Of Things */}
      <View style={styles.actionContainer}>
        <Text style={[globalStyles.bodySmall, { textAlign: 'center', marginBottom: 16 }]}>
          PEMBERITAHUAN: Saat Anda menekan tombol di bawah, aplikasi ini akan menembak perintah `POST /api/packages/pickup` ke Server Komputer Node.js, dan Server akan mentransmisikan sinyal *buka selenoide pintu* ke Loker via **Protokol MQTT**.
        </Text>
        
        {isProcessing ? (
           // Efek loading biru mutar premium
           <ActivityIndicator size="large" color={colors.primary} />
        ) : (
           <Button 
             title="Buka Pintu Loker Sekarang" 
             onPress={handleAmbilPaket} 
             style={{ width: '100%' }}
           />
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 48,
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  backBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  mainCard: {
    padding: 24,
  },
  label: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    fontWeight: '700',
  },
  valueLarge: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.textPrimary,
    marginTop: 4,
  },
  value: {
    fontSize: 16,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 20,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  infoCol: {
    flex: 1,
  },
  actionContainer: {
    marginTop: 32,
    alignItems: 'center',
  }
});
