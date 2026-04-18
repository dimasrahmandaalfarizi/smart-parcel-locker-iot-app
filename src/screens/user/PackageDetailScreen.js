import React from 'react';
import { View, Text } from 'react-native';
import { globalStyles } from '../../styles/globalStyles';
import Button from '../../components/common/Button';

export default function PackageDetailScreen({ navigation }) {
  return (
    <View style={globalStyles.container}>
      <Text style={[globalStyles.title, { marginTop: 40 }]}>Detail Paket</Text>
      <Text style={globalStyles.subtitle}>Segera Datang</Text>
      <Button title="Kembali Ke Beranda" onPress={() => navigation.goBack()} />
    </View>
  );
}
