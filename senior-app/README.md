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

## Home Screen Features
- **Call**: One-touch calling (placeholder)
- **SOS**: Emergency alert (placeholder) 
- **Photos**: Family photo gallery (placeholder)
- **Accessibility**: Large buttons (160x160dp), TTS support, high contrast
- **TTS**: Tap speaker icon to read screen title

## Dependencies
- expo-speech (TTS)
- expo-camera (camera permission)
- expo-av (microphone permission)
- react-native-qrcode-svg (QR placeholder)
- @react-navigation (navigation)

## Screenshots
Create `docs/screenshots/` and capture:
- **Onboarding**: welcome.png, permissions.png, family-link.png, confirmation.png
- **Home**: home-main.png, home-call.png, home-sos.png, home-photos.png

## Tests
```bash
cd senior-app
npm test
```


