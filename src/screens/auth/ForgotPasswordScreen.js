import React, { useState } from 'react';
import { View, Text, Alert } from 'react-native';
import { globalStyles } from '../../styles/globalStyles';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import api from '../../services/api';

export default function ForgotPasswordScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleRequestOTP = async () => {
    if (!email) return;
    setIsLoading(true);
    try {
      await api.post('/auth/forgot-password', { email });
      if (typeof window !== 'undefined' && window.alert) window.alert('Sukses! Cek alamat email Anda sekarang.');
      else Alert.alert('Terkirim', 'Kode OTP 6 angka telah dikirim ke email Anda.');
      
      navigation.navigate('VerifyOTP', { email });
    } catch (error) {
      const msg = error.response?.data?.message || 'Terjadi kesalahan server.';
      if (typeof window !== 'undefined' && window.alert) window.alert(`Gagal: ${msg}`);
      else Alert.alert('Gagal', msg);
    }
    setIsLoading(false);
  };

  return (
    <View style={[globalStyles.container, globalStyles.center]}>
      <Card style={{ width: '100%', alignItems: 'center' }}>
        <Text style={[globalStyles.title, { textAlign: 'center' }]}>Lupa Password?</Text>
        <Text style={[globalStyles.bodySmall, { textAlign: 'center', marginBottom: 24, marginTop: 8 }]}>
          Jangan panik. Masukkan alamat email akun Anda, dan kami akan mengirimkan OTP pemulihan via GMail.
        </Text>
        <View style={{ width: '100%' }}>
          <Input label="Email Terdaftar" placeholder="contoh@mail.com" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
          <Button title="Kirim Kode via Email" onPress={handleRequestOTP} isLoading={isLoading} style={{ marginTop: 12 }} />
          <Button title="Kembali ke Login" variant="ghost" onPress={() => navigation.goBack()} style={{ marginTop: 12 }} />
        </View>
      </Card>
    </View>
  );
}
