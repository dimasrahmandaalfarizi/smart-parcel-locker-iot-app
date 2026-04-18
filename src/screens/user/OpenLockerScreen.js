import React from 'react';
import { View, Text } from 'react-native';
import { globalStyles } from '../../styles/globalStyles';
import Button from '../../components/common/Button';

export default function OpenLockerScreen({ navigation }) {
  return (
    <View style={globalStyles.container}>
      <Text style={[globalStyles.title, { marginTop: 40 }]}>Buka Loker</Text>
      <Button title="Kembali" onPress={() => navigation.goBack()} />
    </View>
  );
}
