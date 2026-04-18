import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { globalStyles } from '../../styles/globalStyles';
import { colors } from '../../styles/colors';
import Card from '../../components/common/Card';
import api from '../../services/api';

export default function AuditLogScreen({ navigation }) {
  const [logs, setLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Dipanggil saat Inspector masuk layar
    const fetchLogs = async () => {
      try {
        const response = await api.get('/logs');
        setLogs(response.data?.data || response.data || []);
      } catch (error) {
        console.error('Fetch logs error (Pastikan Endpoint /logs menyala di Express):', error);
      }
      setIsLoading(false);
    };
    fetchLogs();
  }, []);

  return (
    <ScrollView style={globalStyles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={26} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Buku Log Forensik Mesin</Text>
        <View style={{ width: 40 }} />
      </View>

      <Text style={[globalStyles.bodySmall, { marginBottom: 24, paddingHorizontal: 16 }]}>
        Ini adalah modul Audit Trails. Seluruh lalu lintas pintu terbuka & penempatan paket terbaca dengan hitungan mutlak hingga milidetik.
      </Text>

      <View style={{ paddingBottom: 40 }}>
        {isLoading ? (
          <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 40 }} />
        ) : logs.length === 0 ? (
          <Text style={[globalStyles.body, { textAlign: 'center', marginTop: 40 }]}>Jejak keamanan belum ditemukan dari Sensor Loker.</Text>
        ) : (
          logs.map((log, index) => (
            <Card key={index} style={styles.logCard}>
              <View style={styles.logRow}>
                <Ionicons name="hardware-chip-outline" size={20} color={colors.primary} />
                <Text style={styles.logTime}>{log.timestamp || new Date().toLocaleString()}</Text>
              </View>
              <Text style={styles.logAction}>Aksi Keamanan: {log.action}</Text>
              <Text style={styles.logDetail}>Modul Pintu: {log.lockerId}  |  Enkripsi User: {log.userId}</Text>
            </Card>
          ))
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 48, marginBottom: 24 },
  headerTitle: { fontSize: 20, fontWeight: '700', color: colors.textPrimary },
  backBtn: { width: 40, height: 40, justifyContent: 'center' },
  logCard: { marginBottom: 12, padding: 16, backgroundColor: colors.surfaceHighlight },
  logRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  logTime: { marginLeft: 8, color: colors.textSecondary, fontSize: 12, fontWeight: 'bold' },
  logAction: { fontSize: 16, fontWeight: '800', color: colors.textPrimary, marginBottom: 4 },
  logDetail: { fontSize: 14, color: colors.textSecondary }
});
