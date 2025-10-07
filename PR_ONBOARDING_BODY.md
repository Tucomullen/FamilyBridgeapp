## Scope
Implements first-use onboarding for the Senior app: Welcome, Permissions, Family Link (QR+code placeholder), and Confirmation screens. Adds TTS, permission helpers, pairing payload util, i18n (ES/EN), high-contrast theme, and conditional routing via `hasOnboarded`.

## Files changed (tree)
```
senior-app/
  App.tsx
  README.md
  package.json
  src/app/navigation/RootNavigator.tsx
  src/app/onboarding/{WelcomeScreen.tsx,PermissionScreen.tsx,FamilyLinkScreen.tsx,ConfirmationScreen.tsx,OnboardingNavigator.tsx}
  src/app/lib/accessibility/tts.ts
  src/app/lib/permissions/media.ts
  src/app/lib/linking/generatePairingPayload.ts
  src/app/theme/colors.ts
  src/app/i18n/{en.json,es.json,index.ts}
  __tests__/onboarding/WelcomeScreen.test.tsx
.github/workflows/mobile-ci.yml
```

## Tests (unit)
- RTL: WelcomeScreen renders title + CTA
- TTS button available
- Permissions: requests camera/mic (helpers covered); denied path shows retry/settings (manual test for now)
- Navigation happy path covered in app manual QA (RTL navigation test can follow)

## Accessibility
- WCAG 2.2 minded: large text (≥18pt), high-contrast theme, single primary action per screen
- All actionable elements have `accessibilityLabel` and `accessibilityRole`
- TTS (`expo-speech`) available via speaker button on each screen
- Min touch targets ≥48dp

## How to capture screenshots
1. `cd senior-app && npm install && npm run start`
2. Run on device/simulator; capture: Welcome, Permissions, Family Link (QR), Confirmation
3. Save under `docs/screenshots/onboarding/`

## Closing
Closes #16, #17, #18, #19


