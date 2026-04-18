import React, { useState } from 'react';
import { View, Text } from 'react-native';
import { globalStyles } from '../../styles/globalStyles';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import { useAuth } from '../../hooks/useAuth';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, isLoading } = useAuth(); // Sekarang terkoneksi ke Server sungguhan

  const handleLogin = () => {
    if (!email || !password) {
      alert('Harap isi alamat email dan password Anda secara lengkap!');
      return;
    }
    // Eksekusi fungsi login asli ke server (POST /api/auth/login)
    login(email, password);
  };

  return (
    <View style={[globalStyles.container, globalStyles.center]}>
      <Card style={{ width: '100%', alignItems: 'center' }}>
        <Text style={[globalStyles.title, { textAlign: 'center', marginBottom: 4 }]}>
          Smart Locker
        </Text>
        <Text style={[globalStyles.subtitle, { textAlign: 'center', marginBottom: 32 }]}>
          Masuk untuk tersambung ke jaringan IoT Loker
        </Text>
        
        <View style={{ width: '100%' }}>
          <Input 
            label="Alamat Email"
            placeholder="admin@locker.com"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <Input 
            label="Password Aman"
            placeholder="••••••••"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />
          
          <Button 
            title="Akses Sistem Sekarang" 
            onPress={handleLogin} 
            isLoading={isLoading}
            style={{ marginTop: 8 }}
          />
          
          <Button 
            title="Scan QR (Sebagai Kurir Ekspedisi)" 
            variant="outline"
            onPress={() => navigation.navigate('ScanLogin')} 
            style={{ marginTop: 4 }}
          />

          <Button 
            title="Tampilkan Layar QR Mesin Loker" 
            variant="ghost"
            onPress={() => navigation.navigate('LockerKiosk')} 
            style={{ marginTop: 12 }}
          />
        </View>
      </Card>
    </View>
  );
}
