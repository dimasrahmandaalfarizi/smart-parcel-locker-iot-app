import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../styles/colors';
import { useAuth } from '../hooks/useAuth';

import HomeScreen from '../screens/user/HomeScreen';

// Dummy component untuk layar Profil
function ProfileScreen() { 
  return (
    <View style={{flex: 1, backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center'}}>
      <Text style={{color: colors.white, fontSize: 18, fontWeight: 'bold'}}>Pengaturan Profil</Text>
      <Text style={{color: colors.textSecondary, marginTop: 8}}>Akan dikembangkan lebih lanjut.</Text>
    </View>
  ); 
}

const CustomCenterButton = ({ children, onPress }) => (
  <TouchableOpacity
    style={styles.customButtonContainer}
    onPress={onPress}
    activeOpacity={0.8}
  >
    <View style={styles.customButton}>
      {children}
    </View>
  </TouchableOpacity>
);

const Tab = createBottomTabNavigator();

export default function TabNavigator({ navigation }) {
  const { userInfo } = useAuth();
  const role = userInfo?.role || 'user';

  // Logika khusus: Tombol tengah langsung memicu Screen aksi penting (tanpa merubah tab list)
  const handleCenterAction = () => {
    if (role === 'courier') {
      navigation.navigate('Scan'); // Kurir -> Kamera Scanner
    } else {
      navigation.navigate('OpenLocker', { lockerId: 'AKSES-CEPAT' }); // User -> QR Generator
    }
  };

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false, // Menghilangkan tulisan di setiap tab agar lebih clean
        tabBarStyle: {
          position: 'absolute',
          bottom: 24,
          left: 24,
          right: 24,
          elevation: 0,
          backgroundColor: 'rgba(30, 30, 30, 0.98)', // Glassmorphism solid dark
          borderRadius: 24, // Melengkung ekstrem ala kapsul
          height: 68,
          borderTopWidth: 0, // Tanpa batas garis atas standar
          ...styles.shadow
        },
      }}
    >
      <Tab.Screen 
        name="Beranda" 
        component={HomeScreen} 
        options={{
          tabBarIcon: ({ focused }) => (
            <Ionicons name={focused ? 'home' : 'home-outline'} size={24} color={focused ? colors.primary : colors.textSecondary} />
          ),
        }}
      />

      <Tab.Screen 
        name="Action" 
        component={View} 
        listeners={{
          tabPress: e => {
            // Mencegah perpindahan tab kosong dan memicu aksi dinamis di layar tengah
            e.preventDefault();
          },
        }}
        options={{
          tabBarIcon: ({ focused }) => (
            <Ionicons 
              name={role === 'courier' ? 'scan' : 'key'} 
              size={28} 
              color={colors.white} 
            />
          ),
          tabBarButton: (props) => (
            <CustomCenterButton {...props} onPress={handleCenterAction} />
          )
        }}
      />

      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen} 
        options={{
          tabBarIcon: ({ focused }) => (
            <Ionicons name={focused ? 'person' : 'person-outline'} size={24} color={focused ? colors.primary : colors.textSecondary} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  shadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 8
  },
  customButtonContainer: {
    top: -20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  customButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 8,
    borderWidth: 4,
    borderColor: '#121212', // Background color untuk efek bolong/memotong tab
  }
});
