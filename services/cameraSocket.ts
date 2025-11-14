class CameraSocketService {
  private socket: WebSocket | null = null;
  private listeners: Map<string, Function[]> = new Map();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectTimeout: ReturnType<typeof setTimeout> | null = null;
  private reconnectDelay = 2000; // 2 seconds
  private wsUrl: string = '';

  /**
   * Convert HTTP/HTTPS URL to WebSocket URL
   */
  private convertToWebSocketUrl(backendUrl: string): string {
    try {
      const url = new URL(backendUrl);
      const protocol = url.protocol === 'https:' ? 'wss:' : 'ws:';
      return `${protocol}//${url.host}/ws`;
    } catch (error) {
      // If URL parsing fails, try simple string replacement
      if (backendUrl.startsWith('http://')) {
        return backendUrl.replace('http://', 'ws://') + '/ws';
      } else if (backendUrl.startsWith('https://')) {
        return backendUrl.replace('https://', 'wss://') + '/ws';
      } else if (backendUrl.startsWith('ws://') || backendUrl.startsWith('wss://')) {
        // Already a WebSocket URL, just ensure /ws path
        return backendUrl.endsWith('/ws') ? backendUrl : backendUrl + '/ws';
      }
      // Default to ws://
      return `ws://${backendUrl}/ws`;
    }
  }

  connect(backendUrl: string) {
    if (this.socket?.readyState === WebSocket.OPEN) {
      console.log('🔌 Already connected to WebSocket');
      return this.socket;
    }

    // Convert HTTP URL to WebSocket URL
    this.wsUrl = this.convertToWebSocketUrl(backendUrl);
    console.log(`🔌 Connecting to: ${this.wsUrl}`);

    this.connectWebSocket();
    return this.socket;
  }

  private connectWebSocket() {
    try {
      // Close existing connection if any
      if (this.socket) {
        this.socket.close();
        this.socket = null;
      }

      const ws = new WebSocket(this.wsUrl);
      this.socket = ws;

      ws.onopen = () => {
        console.log('✅ WebSocket connected');
        this.reconnectAttempts = 0;
        
        // Clear any pending reconnection
        if (this.reconnectTimeout) {
          clearTimeout(this.reconnectTimeout);
          this.reconnectTimeout = null;
        }
        
        this.emit('connected', true);
      };

      ws.onmessage = (event) => {
        try {
          // Server sends JSON messages with a type field
          const message = JSON.parse(event.data);
          
          if (message.type === 'frame') {
            // Frame data with base64 image
            this.emit('frame', {
              image: message.image,
              timestamp: message.timestamp || Date.now()
            });
          } else if (message.type === 'status') {
            // ESP32 status update
            this.emit('status', message.data);
          } else {
            console.log('📨 Unknown message type:', message.type);
          }
        } catch (error) {
          console.error('❌ Failed to parse WebSocket message:', error);
        }
      };

      ws.onerror = (error) => {
        console.error('🚨 WebSocket error:', error);
        this.emit('error', error);
      };

      ws.onclose = (event) => {
        console.log('❌ WebSocket disconnected', event.code, event.reason);
        this.emit('connected', false);
        
        // Auto-reconnect if not manually closed
        if (event.code !== 1000) { // Not a normal closure
          this.scheduleReconnect();
        }
      };
    } catch (error) {
      console.error('❌ Failed to create WebSocket:', error);
      this.emit('error', error);
      this.scheduleReconnect();
    }
  }

  private scheduleReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('❌ Max reconnection attempts reached');
      this.emit('error', new Error('Max reconnection attempts reached'));
      return;
    }

    this.reconnectAttempts++;
    console.log(`🔄 Reconnecting... (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
    
    // Clear any existing timeout
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
    }
    
    this.reconnectTimeout = setTimeout(() => {
      this.connectWebSocket();
    }, this.reconnectDelay);
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
    if (this.isConnected()) {
      // Send request frame message via WebSocket
      const message = JSON.stringify({ type: 'requestFrame' });
      this.socket?.send(message);
    }
  }

  capture(callback: (result: any) => void) {
    if (this.isConnected()) {
      // Send capture request via WebSocket
      const message = JSON.stringify({ type: 'capture' });
      this.socket?.send(message);
      
      // Note: WebSocket doesn't support callbacks like Socket.IO
      // The server should respond with a message that can be handled via the 'status' or 'frame' event
      // For now, we'll return a pending response
      callback({ success: true, pending: true, message: 'Capture request sent' });
    } else {
      callback({ success: false, error: 'WebSocket not connected' });
    }
  }

  disconnect() {
    if (this.socket) {
      console.log('🔌 Disconnecting WebSocket...');
      
      // Clear reconnection timeout
      if (this.reconnectTimeout) {
        clearTimeout(this.reconnectTimeout);
        this.reconnectTimeout = null;
      }
      
      // Close with normal closure code (1000) to prevent auto-reconnect
      this.socket.close(1000, 'Manual disconnect');
      this.socket = null;
    }
    this.listeners.clear();
    this.reconnectAttempts = 0;
  }

  isConnected(): boolean {
    return this.socket?.readyState === WebSocket.OPEN;
  }

  getSocket(): WebSocket | null {
    return this.socket;
  }
}

export const cameraSocket = new CameraSocketService();

