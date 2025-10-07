# FamilyBridge Senior App — Onboarding & Home

## Run locally

```bash
# from repo root
cd senior-app
npm install
npm run start
# press i / a to run on iOS/Android, or use Expo Go
```

## App Flow (Phase 1)
- **First launch**: Onboarding flow (Welcome → Permissions → Family Link → Confirmation)
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


