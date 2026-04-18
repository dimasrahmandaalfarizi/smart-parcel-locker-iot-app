import React, { useState } from 'react';
import { View, Text, Alert } from 'react-native';
import { globalStyles } from '../../styles/globalStyles';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import api from '../../services/api';

export default function ResetPasswordScreen({ navigation, route }) {
  const email = route?.params?.email || '';
  const otp = route?.params?.otp || '';
  const [newPassword, setNewPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleReset = async () => {
    if (!newPassword || newPassword.length < 6) {
      if (typeof window !== 'undefined' && window.alert) window.alert('Minimal 6 karakter huruf.');
      else Alert.alert('Lemah', 'Password minimal 6 karakter.');
      return;
    }
    setIsLoading(true);
    try {
      await api.post('/auth/reset-password', { email, otp, newPassword });
      
      const resMsg = 'Brilian! Kunci keamanan Anda sukes diubah. Silakan masuk (Login) kembali.';
      if (typeof window !== 'undefined' && window.alert) {
         window.alert(resMsg);
         navigation.navigate('Login');
      } else {
         Alert.alert('Sukses Diubah', resMsg, [
            { text: 'Masuk Sekarang', onPress: () => navigation.navigate('Login') }
         ]);
      }
    } catch (error) {
      const msg = error.response?.data?.message || 'Server gagal memecahkan kriptografi password.';
      if (typeof window !== 'undefined' && window.alert) window.alert(msg);
      else Alert.alert('Network Error', msg);
    }
    setIsLoading(false);
  };

  return (
    <View style={[globalStyles.container, globalStyles.center]}>
      <Card style={{ width: '100%', alignItems: 'center' }}>
        <Text style={[globalStyles.title, { textAlign: 'center' }]}>Pintu Baru</Text>
        <Text style={[globalStyles.bodySmall, { textAlign: 'center', marginBottom: 24, marginTop: 8 }]}>
          Silakan ukirkan kunci kata sandi terbaru yang tak mudah diterka oleh siapapun untuk akun {email}.
        </Text>
        <View style={{ width: '100%' }}>
          <Input label="Kata Sandi / Password Baru" placeholder="Ketik kuat (Min. 6 Char)" value={newPassword} onChangeText={setNewPassword} secureTextEntry />
          <Button title="Simpan Sandi Permanen" onPress={handleReset} isLoading={isLoading} style={{ marginTop: 12 }} />
        </View>
      </Card>
    </View>
  );
}
