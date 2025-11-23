# Quick Reference Card

## 🎯 Backend URLs

| Device | URL | When to Use |
|--------|-----|-------------|
| **Android Emulator** | `http://10.0.2.2:3000` | Testing in Android Studio emulator |
| **Physical Device** | `http://192.168.0.115:3000` | Real phone on same WiFi as computer |
| **iOS Simulator** | `http://localhost:3000` | Testing in Xcode simulator |

## 🔍 Find Your Computer's IP

```bash
# Windows
ipconfig
# Look for: IPv4 Address ... 192.168.0.115

# Mac/Linux
ifconfig
# Look for: inet 192.168.0.115

# Or
hostname -I
```

## 🚀 Quick Start Commands

```bash
# 1. Start Backend
cd /path/to/backend
npm start

# 2. Start React Native
npx expo start

# 3. Run on Android Emulator
# Press 'a' in terminal

# 4. Run on Physical Device
# Scan QR code with Expo Go
```

## 📱 App Settings

### For Emulator:
1. Open Settings (⚙️)
2. Tap "📱 Android Emulator"
3. Test Connection ✅
4. Save

### For Physical Device:
1. Open Settings (⚙️)
2. Tap "📲 Physical Device"
3. **Or** manually enter: `http://YOUR_IP:3000`
4. Test Connection ✅
5. Save

## 🚗 Car Controls

1. Tap car icon (🚗)
2. Tap "Connect"
3. Wait for ESP32 ✅ status
4. Use direction buttons:
   - Hold to move
   - Release to stop

## 🐛 Troubleshooting

### ❌ "Unable to connect"

**Emulator:**
- Use: `http://10.0.2.2:3000`
- NOT: `localhost` or `192.168.x.x`

**Physical Device:**
- Use: Your computer's IP
- Phone + Computer on SAME WiFi
- Test in browser first: `http://192.168.0.115:3000/status`

### ❌ "No video appearing"

1. Check backend running: `npm start`
2. Check ESP32-CAM Serial Monitor: "✅ Connected"
3. Wait 5-10 seconds for connection

### ❌ "Car not responding"

1. Check car panel: ESP32 should be 🟢
2. Wait 6 seconds (status polls every 3s)
3. Check Serial Monitor: "✅ Connected to Car WebSocket"
4. Try disconnect/reconnect

## 📊 Status Indicators

| Symbol | Meaning |
|--------|---------|
| 🟢 | Connected |
| 🔴 | Disconnected |
| 🟡 | Connecting |
| WS | WebSocket (App ↔ Backend) |
| ESP32 | Device (ESP32 ↔ Backend) |

## 🔧 Test Backend

```bash
# Test backend is running
curl http://localhost:3000/status

# Test car status
curl http://localhost:3000/car/status

# Test car command
curl -X POST http://localhost:3000/car/control \
  -H "Content-Type: application/json" \
  -d '{"command":"stop","speed":0}'
```

## ⚠️ Common Mistakes

| ❌ Wrong | ✅ Correct |
|---------|-----------|
| `localhost:3000` (emulator) | `10.0.2.2:3000` |
| `10.0.2.2:3000` (physical) | `192.168.0.115:3000` |
| Phone on 5GHz WiFi | Phone on 2.4GHz WiFi |
| Different WiFi networks | Same WiFi network |

## 📚 Full Documentation

- **Complete Setup**: `SETUP_GUIDE.md`
- **Car Control**: `CAR_CONTROL_DOCUMENTATION.md`
- **API Reference**: `apidoc.md`
- **Services**: `services/README.md`

---

**🎉 That's all you need to know!**

