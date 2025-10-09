# FamilyBridge Senior App — Onboarding & Home

## Run locally

```bash
# from repo root
cd senior-app
npm install
npm run start
# press i / a to run on iOS/Android, or use Expo Go
```

## Real WebRTC Calls (iOS-first)

### Prerequisites
- iOS device or simulator
- Node.js for signaling server
- Docker (optional, for TURN server)

### Quick Start

1. **Start Signaling Server**:
```bash
cd services/signaling
npm install
npm run dev
# Server runs on http://localhost:3001
```

2. **Start TURN Server (Optional)**:
```bash
cd ops/coturn
docker-compose up -d
# TURN server runs on localhost:3478
```

3. **Run Mobile App**:
```bash
cd senior-app
npm run start
# Use Expo Go for basic testing
# Use Dev Client for full WebRTC features
```

### iOS Dev Client for WebRTC

WebRTC requires native modules that may not work in Expo Go. Use Dev Client:

```bash
# Build and run on iOS device
cd senior-app
npx expo prebuild
npx expo run:ios

# Or run on device
npm run dev-client
```

### Testing Calls

1. **Single Device Test**: Call screen auto-starts in test room
2. **Two Device Test**: 
   - Run app on two devices/simulators
   - Both join same room (e.g., "test-room")
   - Video and audio should work bidirectionally

### ICE Server Configuration

Default STUN servers (no auth required):
- `stun:stun.l.google.com:19302`
- `stun:stun1.l.google.com:19302`
- `stun:stun2.l.google.com:19302`

For TURN server (with local coturn):
- `turn:localhost:3478` (username: test, password: testpass)

### Manual Test Plan

1. ✅ Run signaling server (`npm run dev` in services/signaling)
2. ✅ Run mobile app on two devices
3. ✅ Start call → both see video + hear audio
4. ✅ Hang up works
5. ✅ Logs show call_start → call_end events
6. ✅ Call quality indicators visible
7. ✅ Mute/unmute works
8. ✅ Camera switch works

## SOS Alpha (Phase 2) — Emergency Alert System

### Overview
SOS alpha provides a simple, reliable emergency alert flow for iOS-first that requests notification & location permissions, sends a push alert in dev, and attaches last-known location WITH CONSENT.

### Features
- **Permissions & Consent**: Clear consent step in onboarding flow (Spanish/English)
- **Dev Notifications**: Expo Notifications for development testing
- **Location Support**: Coarse location attachment (while-in-use only)
- **Confirmation Flow**: Large modal confirmation before sending alert
- **Dev Tools**: In-app notifications log for testing
- **Accessibility**: 48pt+ target, AA contrast, VoiceOver labels

### Quick Start

1. **Grant Permissions in Onboarding**:
   - Allow Notifications (for emergency alerts)
   - Allow Location (for location in alerts, optional)

2. **Test SOS Flow**:
   - Press SOS button on Senior Home
   - Confirm intent in modal
   - See dev notification appear
   - Check Dev Notifications log (dev builds only)

3. **View Dev Notifications Log**:
   - In dev builds, access via SOS screen
   - See all received emergency alerts
   - Test notification sending
   - Clear log for fresh testing

### Manual Test Plan

1. ✅ **Onboarding**: Grant notifications + location permissions
2. ✅ **SOS Button**: Press SOS → see confirmation modal
3. ✅ **Send Alert**: Confirm → see success/failure UI
4. ✅ **Dev Log**: Check notifications received in dev log
5. ✅ **Location**: Verify location attached to alerts (if permission granted)
6. ✅ **Permissions Denied**: Test graceful handling when permissions denied
7. ✅ **Accessibility**: Test with VoiceOver, large text, high contrast

### Configuration

Environment variables (create `.env` from `.env.example`):
```bash
EXPO_USE_DEV_NOTIFICATIONS=true
NOTIFICATIONS_PROVIDER=expo
EXPO_PROJECT_ID=your-expo-project-id
DEBUG_SOS_FLOW=true
LOG_SOS_EVENTS=true
```

### Privacy & Security (Alpha)
- **Dev Only**: Tokens not shared publicly
- **No Background Tracking**: Location only when app is active
- **Consent Required**: Clear explanation of data usage
- **No PII in Telemetry**: Only boolean flags for location/token presence

### Future Work
- **APNs Production**: Server-side fan-out, escalation rules
- **SMS Fallback**: Twilio integration for critical alerts
- **Background Location**: For continuous emergency monitoring
- **Family Notifications**: Real push to family members

## App Flow (Phase 1 + 2)
- **First launch**: Onboarding flow (Welcome → Permissions → **SOS Consent** → Family Link → Confirmation)
- **After onboarding**: Senior Home with 3 main actions (Call, SOS, Photos)
- Toggled by `hasOnboarded` in AsyncStorage

## Testing Home Screen
To test the home screen without going through onboarding:
```bash
# Reset onboarding flag
cd senior-app
npx expo start
# In the app, clear AsyncStorage or reinstall to reset onboarding
```

## Feature Flags & Settings
- **Access Settings**: Triple-tap the "FamilyBridge" title on home screen
- **Toggle Features**: Use switches to enable/disable Call, SOS, Photos, Telemetry
- **Reset**: Use "Reset" button to restore all flags to defaults
- **Persistence**: All settings are saved to AsyncStorage

## Mock Flows
- **Call**: Auto-timeout after 10-15 seconds, manual end available
- **SOS**: 85% success rate, retry on failure
- **Photos**: 6 sample photos with emoji thumbnails, cycling navigation

## Home Screen Features
- **Call**: Mock call flow with state machine (dialing → connecting → inCall → ended)
- **SOS**: Mock emergency alert with retry logic (10-20% failure rate)
- **Photos**: Mock photo gallery with 6 sample photos and cycling
- **Feature Flags**: Runtime toggles for all features via Settings
- **Settings**: Triple-tap title to access developer settings
- **Telemetry**: Optional event logging (can be disabled)
- **Accessibility**: Large buttons (160x160dp), TTS support, high contrast
- **TTS**: Tap speaker icon to read screen title

## Dependencies
- **expo-speech** (TTS)
- **expo-camera** (camera permission)
- **expo-av** (microphone permission)
- **expo-notifications** (push notifications for SOS)
- **expo-location** (location services for SOS)
- **react-native-qrcode-svg** (QR code generation)
- **@react-navigation** (navigation)
- **@react-native-async-storage/async-storage** (persistent storage)
- **uuid** (unique ID generation)

## Screenshots
Create `docs/screenshots/` and capture:
- **Onboarding**: welcome.png, permissions.png, family-link.png, confirmation.png
- **Home**: home-main.png, home-call.png, home-sos.png, home-photos.png
- **Settings**: settings-main.png
- **Call Flow**: call-dialing.png, call-in-call.png, call-ended.png
- **SOS Flow**: sos-sent.png, sos-failed.png
- **Photos Flow**: photos-gallery.png

## Tests
Run all tests with coverage:
```bash
cd senior-app
npm test
```

Run tests in watch mode:
```bash
cd senior-app
npm test -- --watch
```

Run tests with coverage report:
```bash
cd senior-app
npm test -- --coverage
```

## Project Structure
```
senior-app/
├── src/app/
│   ├── flags/          # Feature flags system
│   ├── i18n/           # Internationalization (ES/EN)
│   ├── lib/            # Utilities (TTS, permissions, linking)
│   ├── navigation/     # Navigation setup
│   ├── onboarding/     # Onboarding flow
│   ├── screens/        # Main screens (Home, Call, SOS, Photos, Settings)
│   ├── telemetry/      # Event logging
│   └── theme/          # Design tokens (colors, typography, spacing)
└── __tests__/          # Test files
```

## Health Check
See [Health Check Report](../docs/healthcheck_report.md) for detailed system status, test coverage, and dependency audit.

## Code Quality
- **Test Coverage**: 79.14% (statements)
- **TypeScript**: 100% type-safe (no errors)
- **Test Suites**: 9 passed, 9 total
- **Tests**: 40 passed, 40 total


