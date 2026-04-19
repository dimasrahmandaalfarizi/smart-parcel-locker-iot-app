import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
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
  const [selectedRole, setSelectedRole] = useState('USER');
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
        role: selectedRole
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

          <Text style={styles.roleLabel}>Mendaftar Sebagai:</Text>
          <View style={styles.roleContainer}>
             <TouchableOpacity 
                style={[styles.roleBtn, selectedRole === 'USER' && styles.roleBtnActive]}
                onPress={() => setSelectedRole('USER')}
             >
                <Ionicons name="person" size={16} color={selectedRole === 'USER' ? colors.primary : colors.textSecondary} style={{marginRight: 6}} />
                <Text style={[styles.roleText, selectedRole === 'USER' && {color: colors.primary, fontWeight: 'bold'}]}>Penerima Loker</Text>
             </TouchableOpacity>

             <TouchableOpacity 
                style={[styles.roleBtn, selectedRole === 'COURIER' && styles.roleBtnActive]}
                onPress={() => setSelectedRole('COURIER')}
             >
                <Ionicons name="bicycle" size={18} color={selectedRole === 'COURIER' ? colors.primary : colors.textSecondary} style={{marginRight: 6}} />
                <Text style={[styles.roleText, selectedRole === 'COURIER' && {color: colors.primary, fontWeight: 'bold'}]}>Petugas Kurir</Text>
             </TouchableOpacity>
          </View>
          
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

const styles = StyleSheet.create({
  roleLabel: { fontSize: 13, color: colors.textSecondary, marginBottom: 8, marginTop: 4, fontWeight: '600' },
  roleContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  roleBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 12, borderWidth: 1, borderColor: colors.border, borderRadius: 12, marginHorizontal: 4, backgroundColor: 'rgba(255,255,255,0.02)' },
  roleBtnActive: { borderColor: colors.primary, backgroundColor: 'rgba(59,130,246,0.1)' },
  roleText: { color: colors.textSecondary, fontSize: 13, fontWeight: '500' }
});
