# 📱 FamilyBridge iPhone Setup Guide

## Prerequisites

### 1. Install Required Software

#### On your Mac:
```bash
# Install Expo CLI globally (if not already installed)
npm install -g @expo/cli

# Install EAS CLI for building
npm install -g eas-cli
```

#### On your iPhone:
1. **Install Expo Go app** from the App Store
   - Search for "Expo Go" 
   - Install the official Expo Go app by Expo

## 🚀 Quick Start (Development Mode)

### Option 1: Expo Go (Recommended for Testing)

1. **Start the development server:**
   ```bash
   cd /Users/lagg/Desktop/FamilyBridgeapp/senior-app
   npm start
   ```

2. **Connect your iPhone:**
   - Make sure your iPhone and Mac are on the same WiFi network
   - Open Expo Go app on your iPhone
   - Scan the QR code that appears in your terminal/browser

3. **The app will load on your iPhone!** 🎉

### Option 2: iOS Simulator (Mac only)

1. **Start with iOS simulator:**
   ```bash
   cd /Users/lagg/Desktop/FamilyBridgeapp/senior-app
   npm run ios
   ```

## 🔧 Troubleshooting

### If Expo Go doesn't work:

1. **Check network connection:**
   - Ensure both devices are on the same WiFi
   - Try turning WiFi off/on on both devices

2. **Try tunnel mode:**
   ```bash
   npx expo start --tunnel
   ```

3. **Clear Expo Go cache:**
   - In Expo Go app: Settings → Clear cache

### If you get permission errors:

1. **Camera/Microphone permissions:**
   - The app will ask for permissions when you reach the Permission screen
   - Allow camera and microphone access

2. **If permissions are denied:**
   - Go to iPhone Settings → Privacy & Security → Camera/Microphone
   - Find "Expo Go" and enable permissions

## 📱 Testing the App Features

### 1. Onboarding Flow
- **Welcome Screen**: Tap "Comenzar" to start
- **Permissions Screen**: Allow camera and microphone access
- **Family Link Screen**: This is a mock screen (no real pairing yet)
- **Confirmation Screen**: Tap "Finalizar" to complete setup

### 2. Senior Home Screen
- **Call Button**: Tap to test mock call flow
- **SOS Button**: Tap to test emergency alert simulation
- **Photos Button**: Tap to view mock photo gallery
- **Settings Access**: Triple-tap the title to access settings

### 3. Settings Screen
- Toggle feature flags on/off
- Test telemetry logging
- Return to home screen

### 4. Mock Flows
- **Call Flow**: Start → Dialing → Connecting → In Call → Auto-end (10s)
- **SOS Flow**: Send Alert → Success/Failure → Retry option
- **Photos Flow**: Browse sample photos with "Next" button

## 🎯 Key Features to Test

### Accessibility Features
- ✅ Large touch targets (44pt minimum)
- ✅ High contrast colors
- ✅ Text-to-Speech (TTS) - tap speaker icon
- ✅ Screen reader compatibility

### Feature Flags
- ✅ Toggle features on/off in Settings
- ✅ Disabled features show reduced opacity
- ✅ Settings persist between app restarts

### Internationalization
- ✅ App starts in Spanish (default)
- ✅ All UI text is properly translated
- ✅ English translations available

## 🐛 Known Issues & Limitations

1. **Mock Functionality Only**: No real calling, SOS, or photo features
2. **No Backend**: All data is stored locally
3. **TTS Requires Audio**: Make sure iPhone volume is up
4. **Permissions**: Camera/mic permissions required for full experience

## 📊 Performance Notes

- **First Load**: May take 10-15 seconds to compile
- **Hot Reload**: Changes appear instantly after first load
- **Memory**: App uses ~50-100MB RAM
- **Battery**: Normal usage, optimized for seniors

## 🔄 Development Workflow

1. **Make changes** to any `.tsx` file
2. **Save the file** - changes appear automatically
3. **Test on device** - no need to restart
4. **Check console** - errors appear in terminal

## 📞 Support

If you encounter issues:

1. **Check the terminal** for error messages
2. **Restart Expo Go** app on iPhone
3. **Restart development server**: `Ctrl+C` then `npm start`
4. **Clear cache**: `npx expo start --clear`

## 🎉 Success!

Once everything is working, you should see:
- ✅ Onboarding flow with 4 screens
- ✅ Senior home with 3 large buttons
- ✅ Working mock flows for Call, SOS, Photos
- ✅ Settings screen with feature toggles
- ✅ TTS working (tap speaker icon)
- ✅ High contrast, accessible design

**Enjoy testing FamilyBridge v0.1.0!** 🚀
