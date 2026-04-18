import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [userToken, setUserToken] = useState(null);
  const [userInfo, setUserInfo] = useState(null);

  const login = async (username, password) => {
    setIsLoading(true);
    // MOCK LOGIN LOGIC: Pura-pura menghubungi backend/API
    setTimeout(async () => {
      let role = 'user';
      if (username.toLowerCase() === 'admin') role = 'admin';
      if (username.toLowerCase() === 'kurir') role = 'courier';

      const dummyToken = 'dummy-jwt-token-12345';
      const dummyUser = { username, role };

      setUserToken(dummyToken);
      setUserInfo(dummyUser);
      
      // Simpan di memori lokal agar tetap login jika app direfresh
      await AsyncStorage.setItem('userToken', dummyToken);
      await AsyncStorage.setItem('userInfo', JSON.stringify(dummyUser));
      
      setIsLoading(false);
    }, 1500); // Simulasi delay loading internet 1.5 detik
  };

  const logout = async () => {
    setIsLoading(true);
    setUserToken(null);
    setUserInfo(null);
    await AsyncStorage.removeItem('userToken');
    await AsyncStorage.removeItem('userInfo');
    setIsLoading(false);
  };

  const checkLoginSystem = async () => {
    try {
      setIsLoading(true);
      let token = await AsyncStorage.getItem('userToken');
      let info = await AsyncStorage.getItem('userInfo');
      if (token) {
        setUserToken(token);
        setUserInfo(JSON.parse(info));
      }
    } catch (e) {
      console.log('Gagal mengecek sesi token', e);
    }
    setIsLoading(false);
  };

  // Cek otomatis apakah user sudah pernah login sebelumnya saat aplikasi baru dibuka
  useEffect(() => {
    checkLoginSystem();
  }, []);

  return (
    <AuthContext.Provider value={{ login, logout, isLoading, userToken, userInfo }}>
      {children}
    </AuthContext.Provider>
  );
};
