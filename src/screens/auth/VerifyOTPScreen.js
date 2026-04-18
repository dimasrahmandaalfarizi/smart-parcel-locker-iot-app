import React, { useState } from 'react';
import { View, Text, Alert } from 'react-native';
import { globalStyles } from '../../styles/globalStyles';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import api from '../../services/api';

export default function VerifyOTPScreen({ navigation, route }) {
  const email = route?.params?.email || '';
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleVerify = async () => {
    if (!otp) return;
    setIsLoading(true);
    try {
      // POST API Node.js sesuai dokumen
      await api.post('/auth/verify-otp', { email, otp });
      navigation.navigate('ResetPassword', { email, otp });
    } catch (error) {
      const msg = error.response?.data?.message || 'Kode OTP tidak cocok atau sudah expired.';
      if (typeof window !== 'undefined' && window.alert) window.alert(`Penolakan: ${msg}`);
      else Alert.alert('Kode Salah', msg);
    }
    setIsLoading(false);
  };

  return (
    <View style={[globalStyles.container, globalStyles.center]}>
      <Card style={{ width: '100%', alignItems: 'center' }}>
        <Text style={[globalStyles.title, { textAlign: 'center' }]}>Cek Kotak Masuk</Text>
        <Text style={[globalStyles.bodySmall, { textAlign: 'center', marginBottom: 24, marginTop: 8 }]}>
          Silahkan input ke-6 digit angka rahasia OTP yang baru saja dilesatkan ke surel {email}.
        </Text>
        <View style={{ width: '100%' }}>
          <Input label="Kode OTP (6 Angka)" placeholder="• • • • • •" value={otp} onChangeText={setOtp} keyboardType="numeric" maxLength={6} />
          <Button title="Verifikasi Kepemilikan" onPress={handleVerify} isLoading={isLoading} style={{ marginTop: 12 }} />
          <Button title="Ubah Email" variant="ghost" onPress={() => navigation.goBack()} style={{ marginTop: 12 }} />
        </View>
      </Card>
    </View>
  );
}
