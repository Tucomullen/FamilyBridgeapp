import * as Localization from 'expo-localization';
import es from './es.json';
import en from './en.json';

export type Locale = 'es' | 'en';

const dictionaries = { es, en } as const;

// Get device language using Expo Localization
function getDeviceLanguage(): Locale {
  try {
    // Get the device's locale (e.g., 'en-US', 'es-ES', 'en', 'es')
    const deviceLocale = Localization.getLocales()[0]?.languageCode || 'en';
    
    // Return supported locale or fallback to English
    return deviceLocale === 'es' ? 'es' : 'en';
  } catch (error) {
    console.warn('Failed to get device language, falling back to English:', error);
    return 'en';
  }
}

let current: Locale = getDeviceLanguage();

export function t(path: string): string {
  const parts = path.split('.');
  let node: any = dictionaries[current];
  for (const p of parts) {
    node = node?.[p];
    if (!node) return path;
  }
  return typeof node === 'string' ? node : path;
}

export function setLocale(locale: Locale) {
  current = locale;
}

export function getCurrentLocale(): Locale {
  return current;
}

export function getDeviceLanguageCode(): string {
  return getDeviceLanguage();
}

// Test function to verify language detection
export function testLanguageDetection() {
  console.log('🧪 Testing Language Detection:');

  // Test Spanish detection
  const originalGetLocales = Localization.getLocales;
  (Localization as any).getLocales = () => [{ languageCode: 'es' }];
  const spanishTest = getDeviceLanguage();
  console.log('  Spanish test:', spanishTest === 'es' ? '✅ PASS' : '❌ FAIL');

  // Test English detection
  (Localization as any).getLocales = () => [{ languageCode: 'en' }];
  const englishTest = getDeviceLanguage();
  console.log('  English test:', englishTest === 'en' ? '✅ PASS' : '❌ FAIL');

  // Test fallback
  (Localization as any).getLocales = () => [{ languageCode: 'fr' }];
  const fallbackTest = getDeviceLanguage();
  console.log('  Fallback test:', fallbackTest === 'en' ? '✅ PASS' : '❌ FAIL');

  // Restore original function
  (Localization as any).getLocales = originalGetLocales;
}

// Debug function to log language detection
export function logLanguageInfo() {
  try {
    const deviceLocale = Localization.getLocales()[0]?.languageCode || 'unknown';
    const detectedLanguage = getDeviceLanguage();
    console.log('🌍 Language Detection:', {
      deviceLocale,
      detectedLanguage,
      currentLocale: current,
      supportedLocales: Object.keys(dictionaries)
    });
    
    // Test translation to verify it's working
    console.log('📱 Sample Translation Test:', {
      welcomeTitle: t('onb.welcome.title'),
      homeTitle: t('home.title'),
      settingsTitle: t('settings.title')
    });
  } catch (error) {
    console.warn('Failed to log language info:', error);
  }
}


