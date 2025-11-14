import { MaterialIcons } from '@expo/vector-icons';
import { Image as ExpoImage } from 'expo-image';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native';
import { cameraSocket } from '../services/cameraSocket';

interface SocketCameraStreamProps {
  backendUrl: string;
  onError?: () => void;
  onConnected?: () => void;
}

export const SocketCameraStream: React.FC<SocketCameraStreamProps> = ({ 
  backendUrl, 
  onError,
  onConnected,
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [frameData, setFrameData] = useState<string | null>(null);
  const [fps, setFps] = useState(0);
  const [isConnected, setIsConnected] = useState(false);
  const frameCountRef = useRef(0);
  const lastFpsCheck = useRef(Date.now());
  const mountedRef = useRef(true);
  const socketInitialized = useRef(false);

  useEffect(() => {
    if (socketInitialized.current) return; // Prevent reconnection loop
    socketInitialized.current = true;
    mountedRef.current = true;
    
    connectSocket();

    // FPS Calculator
    const fpsInterval = setInterval(() => {
      if (!mountedRef.current) return;
      
      const now = Date.now();
      const elapsed = (now - lastFpsCheck.current) / 1000;
      if (elapsed > 0) {
        setFps(Math.round(frameCountRef.current / elapsed));
      }
      frameCountRef.current = 0;
      lastFpsCheck.current = now;
    }, 1000);

    return () => {
      mountedRef.current = false;
      socketInitialized.current = false;
      clearInterval(fpsInterval);
      cameraSocket.disconnect();
    };
  }, []); // Empty dependency - only run once!

  const connectSocket = () => {
    try {
      setIsLoading(true);
      setHasError(false);

      cameraSocket.connect(backendUrl);

      // Connected event
      cameraSocket.on('connected', (connected: boolean) => {
        if (!mountedRef.current) return;
        
        setIsConnected(connected);
        if (connected) {
          setIsLoading(false);
          setHasError(false);
          onConnected?.();
          console.log('✅ Camera stream connected');
        } else {
          setIsLoading(true);
        }
      });

      // Frame received event
      cameraSocket.on('frame', (data: { image: string; timestamp: number }) => {
        if (!mountedRef.current) return;
        
        setFrameData(`data:image/jpeg;base64,${data.image}`);
        frameCountRef.current++;
        
        if (isLoading) {
          setIsLoading(false);
        }
      });

      // Status event
      cameraSocket.on('status', (status: any) => {
        if (!mountedRef.current) return;
        console.log('📊 Backend status:', status);
      });

      // Error event
      cameraSocket.on('error', (error: any) => {
        if (!mountedRef.current) return;
        
        console.error('❌ Socket error:', error);
        setHasError(true);
        setIsLoading(false);
        onError?.();
      });

    } catch (error) {
      console.error('Failed to connect socket:', error);
      setHasError(true);
      setIsLoading(false);
      onError?.();
    }
  };

  const retryConnection = () => {
    setHasError(false);
    setIsLoading(true);
    cameraSocket.disconnect();
    setTimeout(() => connectSocket(), 500);
  };

  if (hasError) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-900 rounded-3xl p-8">
        <MaterialIcons name="error-outline" size={64} color="#EF4444" />
        <Text className="text-white text-xl font-bold mt-4">Connection Lost</Text>
        <Text className="text-gray-400 text-center mt-2 mb-6">
          Unable to connect to backend server. Check if the server is running.
        </Text>
        <TouchableOpacity
          onPress={retryConnection}
          className="bg-blue-600 px-8 py-4 rounded-2xl active:opacity-80"
        >
          <Text className="text-white font-semibold text-lg">Retry Connection</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (isLoading || !frameData) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-900 rounded-3xl">
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text className="text-white mt-4 text-lg">Connecting to backend...</Text>
        <Text className="text-gray-500 mt-2 text-sm">{backendUrl}</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-black rounded-3xl overflow-hidden">
      {/* Video Stream - Using expo-image for smooth rendering */}
      <View className="flex-1 items-center justify-center bg-black">
        <ExpoImage
          source={{ uri: frameData || undefined }}
          style={{ 
            width: '100%', 
            height: '100%',
          }}
          contentFit="contain"
          transition={0}
          cachePolicy="memory"
        />
      </View>
      
      {/* Top Overlay - Connection Status & FPS */}
      <View className="absolute top-0 left-0 right-0 p-4">
        <View className="flex-row justify-between items-start">
          {/* Live Indicator */}
          <View className="bg-red-600 px-3 py-2 rounded-full flex-row items-center">
            <View className="w-2 h-2 rounded-full bg-white mr-2" />
            <Text className="text-white font-bold text-xs tracking-wider">
              ● LIVE
            </Text>
          </View>
          
          {/* FPS Counter */}
          <View className="bg-black/70 backdrop-blur px-3 py-2 rounded-full border border-white/20">
            <Text className="text-white font-mono font-bold text-sm">{fps} FPS</Text>
          </View>
        </View>
      </View>

      {/* Bottom Overlay - Stream Info */}
      <View className="absolute bottom-0 left-0 right-0 p-4">
        <View 
          className="bg-gradient-to-t from-black/80 to-transparent px-4 py-3 rounded-2xl backdrop-blur"
          style={{
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
          }}
        >
          <View className="flex-row items-center justify-between">
            {/* Stream Type Badge */}
            <View className="flex-row items-center">
              <MaterialIcons name="videocam" size={20} color="#3B82F6" />
              <Text className="text-white font-semibold text-sm ml-2">ESP32-CAM Stream</Text>
            </View>
            
            {/* Socket.IO Badge */}
            <View className="flex-row items-center bg-blue-600/30 px-3 py-1.5 rounded-full border border-blue-500/50">
              <MaterialIcons name="flash-on" size={14} color="#60A5FA" />
              <Text className="text-blue-300 font-semibold text-xs ml-1">Socket.IO</Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
};

