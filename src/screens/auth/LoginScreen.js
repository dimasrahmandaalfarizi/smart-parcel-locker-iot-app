import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { globalStyles } from '../../styles/globalStyles';
import { colors } from '../../styles/colors';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import { useAuth } from '../../hooks/useAuth';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, isLoading } = useAuth(); // Terkoneksi ke Server sungguhan

  const handleLogin = () => {
    if (!email || !password) {
      alert('Harap isi alamat email dan password Anda secara lengkap!');
      return;
    }
    // Eksekusi fungsi login (POST /api/auth/login)
    login(email, password);
  };

  return (
    <View style={[globalStyles.container, globalStyles.center]}>
      <Card style={{ width: '100%', alignItems: 'center' }}>
        <Text style={[globalStyles.title, { textAlign: 'center', marginBottom: 4 }]}>
          Smart Locker
        </Text>
        <Text style={[globalStyles.subtitle, { textAlign: 'center', marginBottom: 32 }]}>
          Masuk untuk tersambung ke jaringan mesin IoT
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
            label="Password Spesifik"
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

          <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 10, marginTop: 24, marginBottom: 16 }}>
            <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')}>
               <Text style={{ color: colors.textSecondary, fontWeight: 'bold' }}>Lupa Password?</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
               <Text style={{ color: colors.primary, fontWeight: 'bold' }}>Buat Akun Baru</Text>
            </TouchableOpacity>
          </View>
          
          <View style={{ height: 1, backgroundColor: colors.border, marginVertical: 16 }} />

          <Button 
            title="Scan QR (Sebagai Kurir Kemitraan)" 
            variant="outline"
            onPress={() => navigation.navigate('ScanLogin')} 
            style={{ marginTop: 4 }}
          />
        </View>
      </Card>
    </View>
  );
}
