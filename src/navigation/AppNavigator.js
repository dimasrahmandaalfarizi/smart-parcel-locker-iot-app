import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from '../screens/auth/LoginScreen';
import HomeScreen from '../screens/user/HomeScreen';
import PackageDetailScreen from '../screens/user/PackageDetailScreen';
import ScanScreen from '../screens/courier/ScanScreen';
import OpenLockerScreen from '../screens/user/OpenLockerScreen';
import { useAuth } from '../hooks/useAuth';
import { colors } from '../styles/colors';
import { globalStyles } from '../styles/globalStyles';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  const { userToken, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={[globalStyles.container, globalStyles.center]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ 
      headerShown: false,
      contentStyle: { backgroundColor: colors.background }
    }}>
      {userToken == null ? (
        <Stack.Screen name="Login" component={LoginScreen} />
      ) : (
        <>
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="PackageDetail" component={PackageDetailScreen} />
          <Stack.Screen name="Scan" component={ScanScreen} />
          <Stack.Screen name="OpenLocker" component={OpenLockerScreen} />
        </>
      )}
    </Stack.Navigator>
  );
}
