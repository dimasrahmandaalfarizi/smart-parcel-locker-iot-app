import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { globalStyles } from '../../styles/globalStyles';
import { colors } from '../../styles/colors';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import api from '../../services/api';

export default function RegisterScreen({ navigation }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = async () => {
    if (!name || !email || !password) {
      alert('Harap isi nama, email, dan password Anda secara lengkap!');
      return;
    }
    
    setIsLoading(true);
    try {
      // POST Pendaftaran sesuai breafingApi.md
      const response = await api.post('/auth/register', { 
        name, 
        email, 
        password,
        role: 'USER' // Peran standar untuk pendaftar publik
      });
      
      const successMsg = 'Registrasi akun baru sukses! Silakan login dengan alamat email Anda.';
      if (typeof window !== 'undefined' && window.alert) {
         window.alert(successMsg);
         navigation.goBack(); // Kembali ke halaman Login
      } else {
         Alert.alert('Berhasil Mendaftar', successMsg, [
           { text: 'OK', onPress: () => navigation.goBack() }
         ]);
      }
    } catch (error) {
      console.error('Gagal Registrasi:', error);
      const errorMsg = error.response?.data?.message || 'Gagal berkomunikasi dengan server registrasi.';
      
      if (typeof window !== 'undefined' && window.alert) {
        window.alert(`Pendaftaran Bermasalah: ${errorMsg}`);
      } else {
        Alert.alert('Gagal Daftar', errorMsg);
      }
    }
    setIsLoading(false);
  };

  return (
    <View style={[globalStyles.container, globalStyles.center]}>
      <Card style={{ width: '100%', alignItems: 'center' }}>
        <Text style={[globalStyles.title, { textAlign: 'center', marginBottom: 4 }]}>
          Buat Akun Baru
        </Text>
        <Text style={[globalStyles.subtitle, { textAlign: 'center', marginBottom: 32 }]}>
          Mari mendaftar untuk memesan loker cerdas Anda
        </Text>
        
        <View style={{ width: '100%' }}>
          <Input 
            label="Nama Lengkap"
            placeholder="John Doe"
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
          />
          <Input 
            label="Alamat Email"
            placeholder="johndoe@email.com"
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
            title="Daftar & Buat Akun" 
            onPress={handleRegister} 
            isLoading={isLoading}
            style={{ marginTop: 24 }}
          />

          <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 24 }}>
            <Text style={{ color: colors.textSecondary }}>Sudah punya akun? </Text>
            <TouchableOpacity onPress={() => navigation.goBack()}>
               <Text style={{ color: colors.primary, fontWeight: 'bold' }}>Kembali Masuk</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Card>
    </View>
  );
}
