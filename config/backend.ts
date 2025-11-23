/**
 * Backend URL Configuration
 * Automatically handles different environments:
 * - Android Emulator: 10.0.2.2 (maps to host machine's localhost)
 * - iOS Simulator: localhost
 * - Physical Device: Actual local network IP
 * - Production: Deployed backend URL
 */

import { Platform } from 'react-native';

export interface BackendConfig {
  url: string;
  description: string;
  isEmulator: boolean;
}

/**
 * Get backend configuration based on environment
 */
export const getBackendConfig = (): BackendConfig => {
  // Check if running in development mode
  const isDevelopment = __DEV__;
  
  // Environment variables (from .env)
  const PRODUCTION_URL = process.env.EXPO_PUBLIC_PRODUCTION_URL || 'https://iot-backend-uy96.onrender.com';
  const LOCAL_IP = process.env.EXPO_PUBLIC_LOCAL_URL || 'http://192.168.0.115:3000';
  
  // For production builds
  if (!isDevelopment) {
    return {
      url: PRODUCTION_URL,
      description: 'Production Server',
      isEmulator: false,
    };
  }
  
  // Development mode: Check platform
  if (Platform.OS === 'android') {
    // Android Emulator uses special IP
    return {
      url: 'http://10.0.2.2:3000',
      description: 'Android Emulator → Host Machine',
      isEmulator: true,
    };
  }
  
  if (Platform.OS === 'ios') {
    // iOS Simulator can use localhost directly
    return {
      url: 'http://localhost:3000',
      description: 'iOS Simulator → Host Machine',
      isEmulator: true,
    };
  }
  
  // Default to local IP (for physical devices or unknown platforms)
  return {
    url: LOCAL_IP,
    description: 'Physical Device → Local Network',
    isEmulator: false,
  };
};

/**
 * Validate if a URL is accessible
 */
export const validateBackendUrl = async (url: string): Promise<boolean> => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    
    const response = await fetch(`${url}/status`, {
      method: 'GET',
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);
    return response.ok;
  } catch (error) {
    console.error('Backend validation failed:', error);
    return false;
  }
};

/**
 * Get WebSocket URL from HTTP URL
 */
export const getWebSocketUrl = (httpUrl: string, endpoint: string = '/ws'): string => {
  try {
    const url = new URL(httpUrl);
    const protocol = url.protocol === 'https:' ? 'wss:' : 'ws:';
    return `${protocol}//${url.host}${endpoint}`;
  } catch (error) {
    // Fallback for invalid URLs
    if (httpUrl.startsWith('http://')) {
      return httpUrl.replace('http://', 'ws://') + endpoint;
    } else if (httpUrl.startsWith('https://')) {
      return httpUrl.replace('https://', 'wss://') + endpoint;
    }
    return `ws://${httpUrl}${endpoint}`;
  }
};

// Export default configuration
export const BACKEND_CONFIG = getBackendConfig();

// Log configuration on import (helpful for debugging)
if (__DEV__) {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📡 Backend Configuration');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('Environment:', BACKEND_CONFIG.description);
  console.log('URL:', BACKEND_CONFIG.url);
  console.log('Platform:', Platform.OS);
  console.log('Emulator:', BACKEND_CONFIG.isEmulator);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
}

