import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';
import api from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [userToken, setUserToken] = useState(null);
  const [userInfo, setUserInfo] = useState(null);

  const login = async (email, password) => {
    setIsLoading(true);
    try {
      // Memanggil Real Backend API (Sesuai breafingApi.md: POST /api/auth/login)
      const response = await api.post('/auth/login', { email, password });
      
      const resData = response.data;
      // Berdasarkan skema, backend mengembalikan JWT token 
      const token = resData.token;
      
      // Jika resData memiliki object user, atau menggunakan email & role dari JSON langsung
      const user = resData.user || { email: email, role: resData.role || 'USER', name: resData.name || email.split('@')[0] };

      if (!token) {
        throw new Error('Token tidak terdeteksi dari respon server backend.');
      }

      setUserToken(token);
      setUserInfo(user);
      
      await AsyncStorage.setItem('userToken', token);
      await AsyncStorage.setItem('userInfo', JSON.stringify(user));
      
    } catch (error) {
      console.error('Login Gagal:', error);
      const errorMsg = error.response?.data?.message || 'Server backend mungkin belum dinyalakan atau kombinasi password salah.';
      
      // Mengatasi alert untuk web fallback
      if (typeof window !== 'undefined' && window.alert) {
        window.alert(`Login Gagal: ${errorMsg}\n(Pastikan backend menyala di port 3000!)`);
      } else {
        Alert.alert('Gagal Masuk', errorMsg);
      }
    }
    setIsLoading(false);
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
      if (token && info) {
        setUserToken(token);
        setUserInfo(JSON.parse(info));
      }
    } catch (e) {
      console.log('Gagal memulihkan sesi', e);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    checkLoginSystem();
  }, []);

  return (
    <AuthContext.Provider value={{ login, logout, isLoading, userToken, userInfo }}>
      {children}
    </AuthContext.Provider>
  );
};
