import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView, TouchableOpacity, Alert, KeyboardAvoidingView, Platform, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { globalStyles } from '../../styles/globalStyles';
import { colors } from '../../styles/colors';
import Button from '../../components/common/Button';
import api from '../../services/api';

export default function SupportTicketScreen({ navigation, route }) {
  // Biarkan parameter default trackingCode masuk jika rute berasal dari halaman Detail
  const initialPackage = route.params?.trackingCode || '';
  
  const [packageId, setPackageId] = useState(initialPackage);
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (description.trim().length < 10) {
      Alert.alert('Gagal', 'Mohon jelaskan kendala Anda (minimal 10 karakter).');
      return;
    }
    
    setIsSubmitting(true);
    try {
      await api.post('/support/ticket', { packageId, description, photoUrl: '' });
      
      const msg = 'Laporan Anda telah diterima sistem dan tim teknisi sedang memeriksanya. Anda akan menerima Notifikasi statusnya segera.';
      if (typeof window !== 'undefined' && window.alert) window.alert(msg);
      else Alert.alert('Laporan Terkirim 🎧', msg);
      
      navigation.goBack();
    } catch (e) {
      console.log('Error mengirim laporan:', e);
      Alert.alert('Gagal Terkirim', 'Silakan coba beberapa saat lagi.');
    }
    setIsSubmitting(false);
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{flex: 1}}>
      <ScrollView style={globalStyles.container} contentContainerStyle={{ paddingBottom: 80 }}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={26} color={colors.white} />
          </TouchableOpacity>
          <Text style={styles.title}>Layanan Bantuan</Text>
          <View style={{ width: 40 }} />
        </View>

        <View style={styles.heroBox}>
          <View style={styles.heroIconBox}>
             <Ionicons name="headset" size={40} color={colors.primary} />
          </View>
          <Text style={styles.heroTitle}>Ada kendala di mesin loker?</Text>
          <Text style={styles.heroDesc}>Laporkan pintu macet, pembayaran error, atau barang tertinggal. Tim teknisi akan langsung melakukan *Force-Trigger* (tarik remote) jika Anda butuh.</Text>
        </View>

        <View style={styles.formContainer}>
          <Text style={styles.label}>Nomor Resi / Kode Paket (Opsional)</Text>
          <View style={styles.inputWrapper}>
             <Ionicons name="cube-outline" size={20} color={colors.textSecondary} />
             <TextInput
               style={styles.input}
               placeholder="Contoh: JNE-9912001"
               placeholderTextColor="rgba(255,255,255,0.2)"
               value={packageId}
               onChangeText={setPackageId}
             />
          </View>

          <Text style={styles.label}>Jelaskan Detail Kendala <Text style={{color: '#EF4444'}}>*</Text></Text>
          <View style={[styles.inputWrapper, { height: 140, alignItems: 'flex-start', paddingVertical: 14 }]}>
             <TextInput
               style={[styles.input, { height: '100%', textAlignVertical: 'top', marginTop: -4 }]}
               placeholder="Loker nomor 07 terkunci padahal sudah saya bayar dendanya..."
               placeholderTextColor="rgba(255,255,255,0.2)"
               multiline
               numberOfLines={5}
               value={description}
               onChangeText={setDescription}
             />
          </View>
          
          <Button 
            title="Kirim Laporan" 
            onPress={handleSubmit} 
            isLoading={isSubmitting} 
            style={{marginTop: 32}}
          />
          <Text style={styles.footerNote}>Jam operasional IT Bantuan: 24 Jam Non-Stop.</Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 56, marginBottom: 24 },
  title: { fontSize: 20, fontWeight: '800', color: colors.white },
  backBtn: { width: 40, height: 40, justifyContent: 'center' },

  heroBox: { backgroundColor: 'rgba(59,130,246,0.1)', padding: 24, borderRadius: 24, borderWidth: 1, borderColor: 'rgba(59,130,246,0.2)', marginBottom: 32, alignItems: 'center' },
  heroIconBox: { width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(59,130,246,0.2)', justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  heroTitle: { fontSize: 18, color: colors.white, fontWeight: '800', marginBottom: 8 },
  heroDesc: { fontSize: 13, color: colors.textSecondary, textAlign: 'center', lineHeight: 20 },

  formContainer: { backgroundColor: 'rgba(255,255,255,0.03)', padding: 24, borderRadius: 32, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  label: { fontSize: 13, fontWeight: '700', color: colors.white, marginBottom: 10, letterSpacing: 0.5 },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 16, paddingHorizontal: 16, height: 56, marginBottom: 24, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  input: { flex: 1, marginLeft: 12, color: colors.white, fontSize: 15, fontWeight: '600' },
  
  footerNote: { fontSize: 11, color: colors.textSecondary, textAlign: 'center', marginTop: 16, fontWeight: '500' }
});
