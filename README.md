# FarmSense AI: Advanced Agricultural Intelligence System 🌿🚀

**FarmSense AI** is a production-grade, end-to-end smart farming ecosystem designed to bridge the gap between traditional agriculture and modern AI-driven insights. It combines real-time IoT monitoring, automated irrigation control, and advanced crop visualization analysis into a seamless experience.

![Dashboard Preview](https://via.placeholder.com/1200x600/013a20/ffffff?text=FarmSense+AI+Ecosystem+Overview)

---

## 🏗️ System Architecture

The ecosystem consists of three main pillars:

### 1. 📱 Mobile Application (React Native / Expo)
A sleek, user-centric mobile interface for farmers to monitor their land from anywhere.
- **AI Crop Analysis**: Real-time visualization using NVIDIA-powered AI models to detect crop health issues.
- **Dynamic Recommendations**: Personalized farming advice based on live sensor data.
- **Interactive Chat**: Context-aware AI assistant to deep-dive into farm metrics.
- **Secure Auth**: Production-ready Firebase authentication system.

### 2. 🖥️ Admin Control Center (React / Vite)
A professional web-based dashboard for large-scale farm management and platform oversight.
- **Unified Monitoring**: Track total users, active ESP32 modules, and system-wide health.
- **Real-time Activity Log**: Monitor irrigation events, health scans, and security attempts.
- **Device Management**: Remote visibility into ESP32 status and performance.
- **Security Hub**: Tracking and logging unauthorized access attempts.

### 3. 🤖 IoT Firmware (ESP32 / Arduino)
The "brain" on the ground that handles physical automation and data collection.
- **OLED Interface**: Local joystick-driven UI for manual pump overrides and status checks.
- **Hybrid Control**: Seamless switching between Manual, Auto (sensor-based), and Cloud (remote) modes.
- **Non-Blocking WiFi**: Robust connectivity with automatic heartbeat synchronization to Firebase.

---

## 🛠️ Technology Stack

| Component | Technologies |
|-----------|--------------|
| **Frontend** | React, React Native, Expo, Lucide Icons |
| **Styling** | Vanilla CSS (Premium Glassmorphism & Animations) |
| **Backend** | Node.js (Vite Dev Server) |
| **Database** | Firebase Realtime Database |
| **Hardware** | ESP32, OLED (SSD1306), DHT11, Soil Moisture Sensors |
| **AI/ML** | NVIDIA Vision Models Integration |

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- Expo CLI
- Arduino IDE (for ESP32)
- Firebase Project Credentials

### Installation

#### 1. Clone the repository
```bash
git clone https://github.com/CodeCrafter3-0-3/FarmSense_AI.git
cd FarmSense_AI
```

#### 2. Setup Admin Panel
```bash
cd admin-panel
npm install
npm run dev
```

#### 3. Setup Mobile App
```bash
npm install
npx expo start
```

---

## 🔒 Security & Performance
- **Custom Hashing**: Shared authentication logic between Web and Mobile for seamless cross-platform login.
- **Optimized Persistence**: Real-time data sync with minimal latency using Firebase.
- **Premium Design System**: Custom-built CSS variables for ultra-responsive and "wow" factor aesthetics.

---

## 👥 Contributors
Developed with ❤️ by the FarmSense AI Team.

---

*“Empowering farmers with the intelligence of tomorrow, today.”*
