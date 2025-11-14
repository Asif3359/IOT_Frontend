import { io, Socket } from 'socket.io-client';

class CameraSocketService {
  private socket: Socket | null = null;
  private listeners: Map<string, Function[]> = new Map();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  connect(backendUrl: string) {
    if (this.socket?.connected) {
      console.log('🔌 Already connected to socket');
      return this.socket;
    }

    console.log(`🔌 Connecting to: ${backendUrl}`);
    
    this.socket = io(backendUrl, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: this.maxReconnectAttempts,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 10000,
    });

    this.setupListeners();
    return this.socket;
  }

  private setupListeners() {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('✅ Socket connected');
      this.reconnectAttempts = 0;
      this.emit('connected', true);
    });

    this.socket.on('disconnect', (reason) => {
      console.log('❌ Socket disconnected:', reason);
      this.emit('connected', false);
    });

    this.socket.on('connect_error', (error) => {
      console.error('🚨 Socket connection error:', error.message);
      this.reconnectAttempts++;
      
      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        console.error('❌ Max reconnection attempts reached');
      }
      
      this.emit('error', error);
    });

    this.socket.on('frame', (data: { image: string; timestamp: number }) => {
      this.emit('frame', data);
    });

    this.socket.on('status', (status) => {
      this.emit('status', status);
    });
  }

  on(event: string, callback: Function) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)?.push(callback);
  }

  off(event: string, callback?: Function) {
    if (!callback) {
      this.listeners.delete(event);
    } else {
      const callbacks = this.listeners.get(event);
      if (callbacks) {
        const index = callbacks.indexOf(callback);
        if (index > -1) {
          callbacks.splice(index, 1);
        }
      }
    }
  }

  private emit(event: string, data: any) {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.forEach(callback => callback(data));
    }
  }

  requestFrame() {
    if (this.socket?.connected) {
      this.socket.emit('requestFrame');
    }
  }

  capture(callback: (result: any) => void) {
    if (this.socket?.connected) {
      this.socket.emit('capture', callback);
    } else {
      callback({ success: false, error: 'Socket not connected' });
    }
  }

  disconnect() {
    if (this.socket) {
      console.log('🔌 Disconnecting socket...');
      this.socket.disconnect();
      this.socket = null;
    }
    this.listeners.clear();
    this.reconnectAttempts = 0;
  }

  isConnected(): boolean {
    return this.socket?.connected || false;
  }

  getSocket(): Socket | null {
    return this.socket;
  }
}

export const cameraSocket = new CameraSocketService();

