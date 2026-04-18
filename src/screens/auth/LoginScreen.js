import React, { useState } from 'react';
import { View, Text } from 'react-native';
import { globalStyles } from '../../styles/globalStyles';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import { useAuth } from '../../hooks/useAuth';

export default function LoginScreen({ navigation }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const { login, isLoading } = useAuth(); // Ambil fungsi login dari Context Dummy

  const handleLogin = () => {
    if (!username || !password) {
      alert('Harap isi username dan password');
      return;
    }
    // Eksekusi fungsi login
    login(username, password);
  };

  return (
    <View style={[globalStyles.container, globalStyles.center]}>
      <Card style={{ width: '100%', alignItems: 'center' }}>
        <Text style={[globalStyles.title, { textAlign: 'center', marginBottom: 4 }]}>
          Smart Locker
        </Text>
        <Text style={[globalStyles.subtitle, { textAlign: 'center', marginBottom: 32 }]}>
          Login untuk mengakses paket atau memonitor loker IoT
        </Text>
        
        <View style={{ width: '100%' }}>
          <Input 
            label="Username / Email"
            placeholder="Coba ketik 'admin' atau 'kurir'"
            value={username}
            onChangeText={setUsername}
          />
          <Input 
            label="Password"
            placeholder="Ketik password sembarang..."
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />
          
          <Button 
            title="Masuk Aplikasi" 
            onPress={handleLogin} 
            isLoading={isLoading}
            style={{ marginTop: 8 }}
          />
          
          <Button 
            title="Scan QR (Sebagai Kurir)" 
            variant="outline"
            onPress={() => navigation.navigate('ScanLogin')} 
            style={{ marginTop: 4 }}
          />
        </View>
      </Card>
    </View>
  );
}
