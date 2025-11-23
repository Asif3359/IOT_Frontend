# CropGuardian - Complete Setup Guide

Step-by-step guide for running your ESP32 IoT Hub on both Android Emulator and Physical Device.

---

## 📱 Quick Start

### For Android Emulator

```bash
# 1. Start your backend server
cd /path/to/backend
npm start

# 2. In Settings, use:
Backend URL: http://10.0.2.2:3000

# 3. Run the app
npx expo start
# Press 'a' for Android emulator
```

### For Physical Android Device

```bash
# 1. Find your computer's IP address
# Windows:
ipconfig
# Look for: IPv4 Address (e.g., 192.168.0.115)

# Mac/Linux:
ifconfig
# Look for: inet (e.g., 192.168.0.115)

# 2. In Settings, use:
Backend URL: http://YOUR_IP:3000  # e.g., http://192.168.0.115:3000

# 3. Make sure phone and computer are on SAME WiFi!

# 4. Run the app
npx expo start
# Scan QR code with Expo Go app
```

---

## 🌐 Understanding IP Addresses

### Why Different IPs?

| Device | IP Address | Why? |
|--------|------------|------|
| **Android Emulator** | `10.0.2.2:3000` | Special IP that maps to your computer's localhost |
| **Physical Device** | `192.168.0.115:3000` | Your computer's actual IP on the local network |
| **iOS Simulator** | `localhost:3000` | Can directly access localhost |

### The Android Emulator Network

Android emulator runs in a virtual machine with its own network:

```
┌─────────────────────────────────┐
│   Your Computer                 │
│   Real IP: 192.168.0.115        │
│                                 │
│   Backend Server: localhost:3000│
└─────────────────────────────────┘
         ↑
         │
    ┌────┴────────────────┐
    │  Android Emulator   │
    │  IP: 10.0.2.15      │
    │                     │
    │  10.0.2.2 → Maps to │
    │  host's localhost   │
    └─────────────────────┘
```

Special IPs in Android Emulator:
- `10.0.2.2` - Your computer's localhost (USE THIS!)
- `10.0.2.15` - Emulator's own IP
- `10.0.2.1` - Virtual router
- `127.0.0.1` - ❌ Emulator's loopback (NOT your computer)

---

## 🚀 Step-by-Step Setup

### 1. Backend Setup

```bash
# Navigate to backend directory
cd /path/to/your/backend

# Install dependencies (first time only)
npm install

# Start the server
npm start

# You should see:
# 🚀 Server running on port 3000
# 🌐 HTTP: http://localhost:3000
# 🌐 HTTP (network): http://192.168.0.115:3000
# 📡 WebSocket Endpoints:
#    📷 Camera:  ws://192.168.0.115:3000/ws/camera
#    🚗 Car:     ws://192.168.0.115:3000/ws/car
```

### 2. ESP32 Devices Setup

#### ESP32-CAM

```cpp
// Update in your Arduino code:
const char* ssid = "YOUR_WIFI_SSID";
const char* password = "YOUR_WIFI_PASSWORD";
const char* serverHost = "192.168.0.115";  // Your computer's IP
const uint16_t serverPort = 3000;
const char* serverPath = "/ws/camera";
```

Upload to ESP32-CAM and check Serial Monitor:
```
📷 ESP32-CAM Starting...
✅ WiFi Connected! IP: 192.168.0.106
✅ Camera WebSocket CONNECTED to: /ws/camera
✅ Frames sent: 30 (size: 4562 bytes)
```

#### ESP32 Car

```cpp
// Update in your Arduino code:
const char* ssid = "YOUR_WIFI_SSID";
const char* password = "YOUR_WIFI_PASSWORD";
const char* serverHost = "192.168.0.115";  // Your computer's IP
const uint16_t serverPort = 3000;
const char* serverPath = "/ws/car";
```

Upload to ESP32 Car and check Serial Monitor:
```
🚗 ESP32 Car Starting...
✅ WiFi Connected! IP: 192.168.0.102
✅ Connected to Car WebSocket server
📤 Sent car identification message
```

### 3. React Native App Setup

#### Option A: Android Emulator

1. **Open Settings in App** (⚙️ icon in top-right)

2. **Configure Backend URL:**
   - Tap "📱 Android Emulator" quick select button
   - Or manually enter: `http://10.0.2.2:3000`

3. **Test Connection:**
   - Tap "Test Connection" button
   - Should show "Backend Connected!" ✅

4. **Save and Close Settings**

5. **Verify Connections:**
   - Top status should show: Camera: Connected
   - Camera stream should appear
   - Tap car icon (🚗) to open car controls
   - Tap "Connect" in car control panel
   - Status should show: WS ✅ | ESP32 ✅

#### Option B: Physical Device

1. **Ensure Same WiFi Network:**
   - Phone WiFi: Same network as computer
   - Computer WiFi: Same network as ESP32 devices

2. **Open Settings in App** (⚙️ icon)

3. **Configure Backend URL:**
   - Tap "📲 Physical Device" quick select button
   - Or manually enter your computer's IP: `http://192.168.0.115:3000`

4. **Test Connection:**
   - Tap "Test Connection" button
   - Should show "Backend Connected!" ✅

5. **Save and Close Settings**

6. **Verify Connections:**
   - Camera stream should appear
   - Car controls should work

---

## 🎮 Using the App

### Camera Features

1. **Live Stream:**
   - Automatic WebSocket streaming
   - ~10 FPS from ESP32-CAM
   - Shows FPS counter and LIVE indicator

2. **Capture & Analyze:**
   - Tap "Capture" button
   - Image saved to backend
   - AI analyzes for plant diseases
   - Results show:
     - Plant type
     - Disease detected
     - Confidence level
     - Severity
     - Recommended actions

### Car Control Features

1. **Open Car Controls:**
   - Tap car icon (🚗) in bottom panel

2. **Connect to Car:**
   - Tap "Connect" button
   - Wait for "ESP32 ✅" status

3. **Control the Car:**
   - **↑ Forward** - Hold to move forward
   - **↓ Backward** - Hold to move backward
   - **← Left** - Hold to turn left
   - **→ Right** - Hold to turn right
   - **■ Stop** - Immediate stop

4. **Adjust Speed:**
   - Use +/- buttons
   - Or tap the number to type directly
   - Range: 0-255 (PWM value)

5. **Release to Stop:**
   - All direction buttons auto-stop when released
   - Safety feature to prevent runaway

---

## 🔧 Troubleshooting

### Camera Not Showing

**Symptoms:**
- "Connecting to backend..." forever
- Or "Camera Offline" message

**Solutions:**

1. **Check Backend:**
   ```bash
   # Backend must be running
   npm start
   ```

2. **Check ESP32-CAM:**
   - Open Serial Monitor (115200 baud)
   - Should show "✅ Camera WebSocket CONNECTED"
   - If not, check WiFi credentials and server IP

3. **Check App URL:**
   - Android Emulator: `http://10.0.2.2:3000`
   - Physical Device: `http://YOUR_COMPUTER_IP:3000`

4. **Test Backend:**
   ```bash
   # From your computer:
   curl http://localhost:3000/status
   
   # From physical device browser:
   http://192.168.0.115:3000/status
   ```

### Car Controls Not Appearing

**Symptoms:**
- Car control panel shows "Waiting for ESP32 car..."
- Or direction buttons are disabled

**Solutions:**

1. **Check Connection Status:**
   - WS indicator should be green ✅
   - ESP32 indicator should be green ✅

2. **Wait for Status Poll:**
   - App polls status every 3 seconds
   - Wait up to 6 seconds after connecting

3. **Check ESP32 Car:**
   - Open Serial Monitor
   - Should show "✅ Connected to Car WebSocket server"

4. **Manual Check:**
   ```bash
   curl http://localhost:3000/car/status
   # Should show: "connected": true
   ```

5. **Restart Car WebSocket:**
   - Tap "Disconnect" in car panel
   - Wait 2 seconds
   - Tap "Connect" again

### Commands Not Working

**Symptoms:**
- Buttons respond but car doesn't move
- No response from car

**Solutions:**

1. **Check Serial Monitor:**
   - Should show "📥 Received: forward" etc.
   - Should show "🚗 Moving: forward"

2. **Check Motor Connections:**
   - Verify wiring according to documentation
   - Check power supply (need 5V 2A minimum)

3. **Check Motor Speed:**
   - Must be > 0 (try 200 for testing)
   - Very low speeds might not move car

4. **Test with REST API:**
   ```bash
   curl -X POST http://localhost:3000/car/control \
     -H "Content-Type: application/json" \
     -d '{"command":"forward","speed":200}'
   ```

### Emulator vs Physical Device Issues

**"Works on emulator but not on phone":**

1. ✅ Check phone is on same WiFi
2. ✅ Use correct IP (not 10.0.2.2)
3. ✅ Check firewall allows port 3000
4. ✅ Test URL in phone browser first

**"Works on phone but not on emulator":**

1. ✅ Use `10.0.2.2` (not `localhost` or `192.168.x.x`)
2. ✅ Backend must be running on computer
3. ✅ Check Android Manifest allows cleartext traffic

---

## 📊 Connection Status Indicators

### Top Status Bar

| Indicator | Meaning |
|-----------|---------|
| 🟢 Connected | Camera WebSocket connected and receiving frames |
| 🟡 Checking... | Connecting to backend |
| 🔴 Disconnected | Not connected to backend |

### Car Control Panel

| Indicator | Meaning |
|-----------|---------|
| WS 🟢 | App connected to backend WebSocket |
| WS 🔴 | App not connected to backend |
| ESP32 🟢 | ESP32 car connected to backend |
| ESP32 🔴 | ESP32 car not connected |

---

## 🎯 Quick Checklist

Before reporting issues:

- [ ] Backend is running (`npm start`)
- [ ] ESP32-CAM showing "Connected" in Serial Monitor
- [ ] ESP32 Car showing "Connected" in Serial Monitor
- [ ] App using correct URL:
  - [ ] Emulator: `10.0.2.2:3000`
  - [ ] Physical: Your computer's IP
- [ ] Phone on same WiFi (for physical device)
- [ ] All devices on 2.4GHz WiFi (ESP32 doesn't support 5GHz)
- [ ] Firewall allows port 3000

---

## 🆘 Still Having Issues?

### Check Backend Logs

```bash
npm start

# Look for:
# ✅ ESP32 CAMERA CONNECTION
# ✅ ESP32 CAR CONNECTION
# ✅ WebSocket upgrade request
```

### Check React Native Logs

```bash
# Android:
npx react-native log-android

# iOS:
npx react-native log-ios

# Look for:
# ✅ Camera WebSocket connected
# ✅ Car WebSocket connected
# ✅ Received car status
```

### Test Individual Components

1. **Test Backend:**
   ```bash
   curl http://localhost:3000/status
   ```

2. **Test Camera API:**
   ```bash
   curl http://localhost:3000/camera/status
   ```

3. **Test Car API:**
   ```bash
   curl http://localhost:3000/car/status
   ```

4. **Test Car Command:**
   ```bash
   curl -X POST http://localhost:3000/car/control \
     -H "Content-Type: application/json" \
     -d '{"command":"stop","speed":0}'
   ```

---

## 📚 Additional Resources

- **Car Control Documentation**: `CAR_CONTROL_DOCUMENTATION.md`
- **API Documentation**: `apidoc.md`
- **Services README**: `services/README.md`

---

**🎉 That's it! You should now have a fully working ESP32 IoT Hub!**

If you followed all steps and it's still not working, double-check the WiFi network is 2.4GHz (not 5GHz) as ESP32 only supports 2.4GHz WiFi.

