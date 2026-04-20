import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import ForgotPasswordScreen from '../screens/auth/ForgotPasswordScreen';
import VerifyOTPScreen from '../screens/auth/VerifyOTPScreen';
import ResetPasswordScreen from '../screens/auth/ResetPasswordScreen';
import TabNavigator from './TabNavigator';
import AuditLogScreen from '../screens/admin/AuditLogScreen';
import AdminAnalyticsScreen from '../screens/admin/AdminAnalyticsScreen';
import AdminUsersScreen from '../screens/admin/AdminUsersScreen';
import PackageDetailScreen from '../screens/user/PackageDetailScreen';
import PackageHistoryScreen from '../screens/user/PackageHistoryScreen';
import PaymentHistoryScreen from '../screens/user/PaymentHistoryScreen';
import NotificationScreen from '../screens/user/NotificationScreen';
import ScanScreen from '../screens/courier/ScanScreen';
import OpenLockerScreen from '../screens/user/OpenLockerScreen';
import LockerKioskScreen from '../screens/admin/LockerKioskScreen';
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
        <>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
          <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
          <Stack.Screen name="VerifyOTP" component={VerifyOTPScreen} />
          <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
          {/* Routing Scanner Untuk Login Kurir Tanpa Auth */}
          <Stack.Screen name="ScanLogin" component={ScanScreen} initialParams={{ mode: 'login' }} />
          <Stack.Screen name="LockerKiosk" component={LockerKioskScreen} />
        </>
      ) : (
        <>
          <Stack.Screen name="MainTabs" component={TabNavigator} />
          <Stack.Screen name="PackageDetail" component={PackageDetailScreen} />
          <Stack.Screen name="PackageHistory" component={PackageHistoryScreen} />
          <Stack.Screen name="PaymentHistory" component={PaymentHistoryScreen} />
          <Stack.Screen name="Notifications" component={NotificationScreen} />
          <Stack.Screen name="AuditLog" component={AuditLogScreen} />
          <Stack.Screen name="AdminAnalytics" component={AdminAnalyticsScreen} />
          <Stack.Screen name="AdminUsers" component={AdminUsersScreen} />
          {/* Routing Scanner Untuk Kurir Memindai Paket */}
          <Stack.Screen name="Scan" component={ScanScreen} initialParams={{ mode: 'package' }} />
          <Stack.Screen name="OpenLocker" component={OpenLockerScreen} />
        </>
      )}
    </Stack.Navigator>
  );
}
