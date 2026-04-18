import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { globalStyles } from '../../styles/globalStyles';
import { colors } from '../../styles/colors';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import StatusBadge from '../../components/locker/StatusBadge';

export default function PackageDetailScreen({ navigation, route }) {
  // Data mockup (Dalam arsitektur aslinya ini akan di-fetch berdasarkan ID yang dipencet di Dashboard)
  const packageData = route?.params?.packageData || {
    trackingNumber: 'RESI-987654321',
    status: 'picked_up', // bisa diubah ke 'stored' untuk testing
    lockerNumber: 'Loker #02',
    courierName: 'Budi Santoso (Jalur Cepat)',
    dropDate: '18 April 2026, 10:30',
    pickupDate: '18 April 2026, 14:15',
    size: 'Medium (M)',
  };

  return (
    <ScrollView style={globalStyles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => navigation.goBack()} 
          style={styles.backBtn}
        >
          <Ionicons name="arrow-back" size={26} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Detail Info Paket</Text>
        <View style={{ width: 40 }} /> {/* Pendorong agar teks pas di tengah (Spacer) */}
      </View>

      <Card style={styles.mainCard}>
        <View style={globalStyles.spaceBetween}>
          <View>
            <Text style={styles.label}>Nomor Resi / Pelacakan</Text>
            <Text style={styles.valueLarge}>{packageData.trackingNumber}</Text>
          </View>
          <StatusBadge status={packageData.status} />
        </View>

        <View style={styles.divider} />

        <View style={styles.infoRow}>
          <View style={styles.infoCol}>
            <Text style={styles.label}>Lokasi</Text>
            <View style={globalStyles.row}>
              <Ionicons name="cube-outline" size={16} color={colors.primary} style={{ marginRight: 6 }} />
              <Text style={styles.value}>{packageData.lockerNumber}</Text>
            </View>
          </View>
          <View style={styles.infoCol}>
            <Text style={styles.label}>Kapasitas Loker</Text>
            <Text style={styles.value}>{packageData.size}</Text>
          </View>
        </View>

        <View style={styles.divider} />

        <Text style={styles.label}>Kurir Pengantar</Text>
        <Text style={[styles.value, { marginBottom: 16 }]}>{packageData.courierName}</Text>

        <Text style={styles.label}>Waktu Tiba (Drop)</Text>
        <Text style={[styles.value, { marginBottom: 16 }]}>{packageData.dropDate}</Text>

        {packageData.status === 'picked_up' && (
          <View>
            <Text style={styles.label}>Waktu Diambil (Pick Up)</Text>
            <Text style={styles.value}>{packageData.pickupDate}</Text>
          </View>
        )}
      </Card>

      {/* Tampilkan Tombol Interaksi Buka Pintu jika paket masih ada (status: stored) */}
      {packageData.status === 'stored' && (
        <View style={styles.actionContainer}>
          <Text style={[globalStyles.bodySmall, { textAlign: 'center', marginBottom: 16 }]}>
            Paket Anda sudah tiba 📦 dan aman di dalam loker stasiun. Silakan tekan tombol di bawah ini untuk mengakses opsi verifikasi pembukaannya.
          </Text>
          <Button 
            title="Buka Pintu Loker Sekarang" 
            onPress={() => navigation.navigate('OpenLocker', { lockerId: packageData.lockerNumber })} 
            style={{ width: '100%' }}
          />
        </View>
      )}

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
