# FamilyBridge Senior App — Onboarding

## Run locally

```bash
# from repo root
cd senior-app
npm install
npm run start
# press i / a to run on iOS/Android, or use Expo Go
```

## Onboarding flow (Phase 1)
- Welcome → Permissions → Family Link → Confirmation
- Only shown on first launch; toggled by `hasOnboarded` in AsyncStorage

## Dependencies
- expo-speech (TTS)
- expo-camera (camera permission)
- expo-av (microphone permission)
- react-native-qrcode-svg (QR placeholder)

## Screenshots
Create `docs/screenshots/onboarding/` and capture one per screen:
- welcome.png, permissions.png, family-link.png, confirmation.png

## Tests
```bash
cd senior-app
npm test
```


