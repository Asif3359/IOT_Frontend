import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';

interface CameraContextType {
  backendUrl: string;
  setBackendUrl: (url: string) => void;
  isProduction: boolean;
  setIsProduction: (value: boolean) => void;
  isConnected: boolean;
  checkConnection: () => Promise<boolean>;
}

const CameraContext = createContext<CameraContextType | undefined>(undefined);

// Environment variables from .env
const PRODUCTION_URL = process.env.EXPO_PUBLIC_PRODUCTION_URL || 'https://iot-backend-uy96.onrender.com';
const LOCAL_URL = process.env.EXPO_PUBLIC_LOCAL_URL || 'http://192.168.0.115:3000';

// Default to LOCAL_URL (physical device only)
const getDefaultBackendUrl = (): string => {
  return LOCAL_URL;
};

export const CameraProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [backendUrl, setBackendUrlState] = useState<string>(getDefaultBackendUrl());
  const [isProduction, setIsProductionState] = useState<boolean>(false);
  const [isConnected, setIsConnected] = useState<boolean>(false);

  // Load saved settings from storage
  useEffect(() => {
    loadSavedSettings();
  }, []);

  const loadSavedSettings = async () => {
    try {
      const savedBackendUrl = await AsyncStorage.getItem('backend_url');
      const savedIsProduction = await AsyncStorage.getItem('is_production');
      
      if (savedBackendUrl) {
        setBackendUrlState(savedBackendUrl);
      }
      
      if (savedIsProduction !== null) {
        setIsProductionState(savedIsProduction === 'true');
        // If production mode is enabled, use production URL
        if (savedIsProduction === 'true') {
          setBackendUrlState(PRODUCTION_URL);
        }
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
  };

  const setBackendUrl = async (url: string) => {
    setBackendUrlState(url);
    try {
      await AsyncStorage.setItem('backend_url', url);
    } catch (error) {
      console.error('Failed to save backend URL:', error);
    }
  };

  const setIsProduction = async (value: boolean) => {
    setIsProductionState(value);
    try {
      await AsyncStorage.setItem('is_production', value.toString());
      
      // Auto-update URL when switching modes
      if (value) {
        setBackendUrlState(PRODUCTION_URL);
      } else {
        setBackendUrlState(getDefaultBackendUrl());
      }
    } catch (error) {
      console.error('Failed to save production mode:', error);
    }
  };

  const checkConnection = async (): Promise<boolean> => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const response = await fetch(backendUrl, {
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      const connected = response.ok;
      setIsConnected(connected);
      return connected;
    } catch (error) {
      setIsConnected(false);
      return false;
    }
  };

  return (
    <CameraContext.Provider
      value={{
        backendUrl,
        setBackendUrl,
        isProduction,
        setIsProduction,
        isConnected,
        checkConnection,
      }}
    >
      {children}
    </CameraContext.Provider>
  );
};

export const useCamera = () => {
  const context = useContext(CameraContext);
  if (!context) {
    throw new Error('useCamera must be used within CameraProvider');
  }
  return context;
};
