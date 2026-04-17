import React from 'react';
import { View, Text } from 'react-native';
import { globalStyles } from '../../styles/globalStyles';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';

export default function LoginScreen() {
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
            placeholder="Masukkan identitas Anda"
          />
          <Input 
            label="Password"
            placeholder="••••••••"
            secureTextEntry
          />
          
          <Button 
            title="Masuk Aplikasi" 
            onPress={() => console.log('Login Button Pressed')} 
            style={{ marginTop: 8 }}
          />
          
          <Button 
            title="Scan QR (Sebagai Kurir)" 
            variant="outline"
            onPress={() => console.log('Scan Button Pressed')} 
            style={{ marginTop: 4 }}
          />
        </View>
      </Card>
    </View>
  );
}
