import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { AuthContext } from './AuthContext';
import { BASE_URL } from '../services/api';

// Ekstrak root URL dari BASE_URL (menghapus '/api' di ujungnya)
const SOCKET_URL = BASE_URL.replace(/\/api\/?$/, '');

export const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const { userInfo } = useContext(AuthContext);

  useEffect(() => {
    // Hanya terhubung jika pengguna telah login
    if (userInfo && userInfo.token) {
      const newSocket = io(SOCKET_URL, {
        auth: {
          token: userInfo.token
        },
        transports: ['websocket'], // Memaksa penggunaan websocket murni untuk kinerja
      });
      
      newSocket.on('connect', () => {
        console.log('Socket connected to backend:', newSocket.id);
      });

      newSocket.on('disconnect', () => {
        console.log('Socket disconnected');
      });
      
      setSocket(newSocket);

      return () => {
        newSocket.disconnect();
      };
    } else if (socket) {
      socket.disconnect();
      setSocket(null);
    }
  }, [userInfo]); // Bergantung pada userInfo, jadi akan putus/sambung saat login/logout

  return (
    <SocketContext.Provider value={{ socket }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  return useContext(SocketContext);
};
