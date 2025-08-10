# 💕 Love Connect - Dating & Social App

> **A beautiful, feature-rich React Native dating and social connection app with real-time messaging, video calls, and innovative walkie-talkie functionality.**

[![React Native](https://img.shields.io/badge/React%20Native-0.80.2-blue.svg)](https://reactnative.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0.4-blue.svg)](https://www.typescriptlang.org/)
[![Firebase](https://img.shields.io/badge/Firebase-Latest-orange.svg)](https://firebase.google.com/)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)

## 🌟 Features Overview

### 🔐 **Authentication & Security**
- **Email/Password Authentication** with real-time validation
- **Phone Number OTP** verification
- **Biometric Login** (Touch ID / Face ID)
- **Firebase Auth Integration** with automatic session management
- **End-to-End Encryption** for all messages and calls
- **Remember Me** functionality with secure token storage

### 💬 **Real-Time Messaging**
- **Instant Messaging** with delivery receipts and read indicators
- **Rich Media Support**: Images, documents, GIFs, stickers, emojis
- **Voice Messages** with waveform visualization
- **Message Reactions** and emoji responses
- **Reply to Messages** with threading
- **Message Forwarding** to multiple chats
- **Typing Indicators** to show when someone is typing
- **Message Editing & Deletion** with edit history
- **Pin Important Messages**
- **Search Messages** across all conversations

### 📞 **Video & Audio Calls**
- **HD Video Calls** with WebRTC integration
- **Crystal Clear Audio** calls with noise reduction
- **Call History** with detailed logs
- **Group Video Calls** support
- **Screen Sharing** capabilities
- **Call Recording** (where legally permitted)
- **Mute/Unmute Controls** for audio and video
- **Camera Switching** (front/back camera)
- **Call Notifications** with incoming call screens

### 📻 **Walkie-Talkie Innovation**
- **Push-to-Talk** real-time voice streaming
- **Channel-based Communication** with multiple room support
- **24-Hour Auto-Delete** messages for privacy
- **Waveform Visualization** during recording
- **Voice Settings**: Noise reduction, auto-gain control, echo suppression
- **Recent Messages List** with replay functionality
- **Pin Important Voice Messages**
- **Multiple Channels**: General, Love Birds, Date Night, Coffee Talk

### 🗺️ **Location & Discovery**
- **Swipeable Cards** with smooth animations
- **Distance-Based Matching** with customizable radius
- **Live Location Sharing** with friends
- **Location Privacy Controls** (exact/approximate location)
- **Map Integration** for shared locations
- **Nearby Users Discovery**
- **Geofencing** for location-based notifications

### 📸 **Media & Photos**
- **Camera Integration** with real-time capture
- **Photo Gallery** selection with multiple photos
- **Image Compression** for optimal performance
- **Firebase Storage** for secure cloud storage
- **Photo Verification** badges for authentic profiles
- **Image Editing** tools (crop, filter, adjust)
- **Thumbnail Generation** for faster loading

### 🎨 **User Experience**
- **Beautiful Light/Dark Themes** with Love Red accent
- **Smooth Animations** and micro-interactions
- **Responsive Design** for all screen sizes
- **Gesture Controls** (swipe, pinch, long press)
- **Haptic Feedback** for enhanced interactions
- **Accessibility Support** with screen readers
- **Offline Mode** with intelligent sync

### 🔔 **Notifications**
- **Push Notifications** for messages, calls, matches
- **Smart Notification Grouping**
- **Customizable Notification Settings**
- **In-App Notifications** with sound and vibration
- **Activity Indicators** for unread content

## 🚀 **Getting Started**

### **Prerequisites**
```bash
# Required software
Node.js >= 18.x
React Native CLI >= 19.x
Android Studio (for Android development)
Xcode (for iOS development)
CocoaPods (for iOS dependencies)
```

### **Installation**

1. **Clone the repository**
   ```bash
   git clone https://github.com/jangidp318/LoveConnect.git
   cd LoveConnect
   ```

2. **Install dependencies**
   ```bash
   npm install
   cd ios && pod install && cd .. # For iOS only
   ```

3. **Firebase Setup**
   - Create a new Firebase project at [Firebase Console](https://console.firebase.google.com/)
   - Enable Authentication, Firestore, Storage, and Messaging
   - Download `google-services.json` (Android) and `GoogleService-Info.plist` (iOS)
   - Place them in the appropriate directories:
     - Android: `android/app/google-services.json`
     - iOS: `ios/LoveConnect/GoogleService-Info.plist`

4. **Environment Configuration**
   ```bash
   # Update Firebase configuration in src/config/firebase.ts
   # Replace with your Firebase project credentials
   ```

5. **Run the app**
   ```bash
   # iOS
   npm run ios
   
   # Android
   npm run android
   
   # Start Metro bundler
   npm start
   ```

## 📱 **App Screens & Features**

### **Authentication Flow**
- **Welcome Screen** - Beautiful onboarding experience
- **Login Screen** - Email/password with biometric option
- **Signup Screen** - Account creation with validation
- **OTP Verification** - Phone number verification
- **Forgot Password** - Email-based password reset

### **Main Application**
- **Discovery** - Swipeable user cards with matching
- **Chats** - Message list with real-time updates
- **Chat Room** - Individual conversation with rich features
- **Video Call** - Full-screen video calling interface
- **Audio Call** - Optimized audio calling screen
- **Walkie-Talkie** - Push-to-talk communication
- **Profile** - User profile management
- **Settings** - App preferences and privacy controls

## 🎨 **Design System**

### **Color Palette**
```typescript
// Light Theme
const lightTheme = {
  primary: '#E91E63',      // Love Red
  background: '#FFFFFF',   // Pure White
  surface: '#F8F9FA',     // Light Gray
  text: '#000000',        // Black
  textSecondary: '#666666' // Dark Gray
};

// Dark Theme
const darkTheme = {
  primary: '#E91E63',      // Love Red
  background: '#000000',   // Pure Black
  surface: '#121212',     // Dark Surface
  text: '#FFFFFF',        // White
  textSecondary: '#AAAAAA' // Light Gray
};
```

### **Typography Scale**
- **H1**: 28px - Page titles
- **H2**: 24px - Section headers
- **H3**: 20px - Card titles
- **Body**: 16px - Main content
- **Caption**: 12px - Helper text

### **Spacing System**
- **XS**: 4px
- **SM**: 8px
- **MD**: 16px (Base unit)
- **LG**: 24px
- **XL**: 32px
- **XXL**: 48px

## 🔧 **Configuration**

### **Firebase Configuration**
```typescript
// src/config/firebase.ts
export const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "your-app-id"
};
```

## 🚀 **Deployment**

### **Build for Production**
```bash
# iOS Release Build
cd ios && xcodebuild -workspace LoveConnect.xcworkspace -scheme LoveConnect -configuration Release

# Android Release Build
cd android && ./gradlew assembleRelease
```

### **App Store Submission**
1. **iOS App Store**
   - Archive build in Xcode
   - Upload to App Store Connect
   - Submit for review

2. **Google Play Store**
   - Generate signed APK/AAB
   - Upload to Play Console
   - Submit for review

## 🔒 **Security Features**

### **Data Protection**
- **End-to-End Encryption** for messages
- **Secure Token Storage** with Keychain/Keystore
- **Certificate Pinning** for API security
- **Data Encryption at Rest** in Firebase

### **Privacy Controls**
- **Location Privacy Settings**
- **Message Auto-Delete Options**
- **Block and Report Users**
- **Data Export/Deletion Rights**

## 🤝 **Contributing**

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### **Development Workflow**
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new features
5. Ensure all tests pass
6. Submit a pull request

## 📄 **License**

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 **Acknowledgments**

- **React Native Team** - Amazing cross-platform framework
- **Firebase Team** - Comprehensive backend services
- **WebRTC Community** - Real-time communication technology
- **Open Source Contributors** - Various libraries and tools

## 📞 **Support**

For support and questions:
- 📧 Email: support@loveconnect.app
- 🐛 Issues: [GitHub Issues](https://github.com/jangidp318/LoveConnect/issues)
- 📖 Documentation: [Wiki](https://github.com/jangidp318/LoveConnect/wiki)

---

**Made with ❤️ for connecting hearts worldwide**

> *Love Connect - Where Every Connection Begins* 💕
