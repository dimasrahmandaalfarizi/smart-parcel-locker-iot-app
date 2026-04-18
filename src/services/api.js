import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Alamat IP Komputer Anda saat ini agar bisa diakses lancar dari HP Asli (Expo Go)
export const BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://192.168.18.22:3000/api';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000, // Timeout 10 detik
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor: Secara ajaib menyelipkan Header Otorisasi JWT ke setiap pemanggilan API yang keluar
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (token) {
        // Format Authorization persis seperti instruksi breafingApi.md
        config.headers.Authorization = `Bearer ${token}`; 
      }
    } catch (error) {
      console.error('Error saat menyuntikkan token dari AsyncStorage:', error);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
