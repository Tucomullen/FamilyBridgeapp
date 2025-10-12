import es from './es.json';
import en from './en.json';

export type Locale = 'es' | 'en';

// Type declarations for global objects
declare const navigator: any;
declare const global: any;

const dictionaries = { es, en } as const;

// Get device language - fallback implementation for Expo Go
function getDeviceLanguage(): Locale {
  try {
    // Use browser/system language detection
    if (typeof navigator !== 'undefined' && navigator.language) {
      const browserLang = navigator.language.split('-')[0];
      return browserLang === 'es' ? 'es' : 'en';
    }
    
    // Default fallback
    return 'en';
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

  // Test Spanish detection (simulate browser language)
  const originalNavigator = global.navigator;
  (global as any).navigator = { language: 'es-ES' };
  const spanishTest = getDeviceLanguage();
  console.log('  Spanish test:', spanishTest === 'es' ? '✅ PASS' : '❌ FAIL');

  // Test English detection
  (global as any).navigator = { language: 'en-US' };
  const englishTest = getDeviceLanguage();
  console.log('  English test:', englishTest === 'en' ? '✅ PASS' : '❌ FAIL');

  // Test fallback
  (global as any).navigator = { language: 'fr-FR' };
  const fallbackTest = getDeviceLanguage();
  console.log('  Fallback test:', fallbackTest === 'en' ? '✅ PASS' : '❌ FAIL');

  // Restore original navigator
  (global as any).navigator = originalNavigator;
}

// Debug function to log language detection
export function logLanguageInfo() {
  try {
    let deviceLocale = 'unknown';
    
    // Get device locale from navigator language
    if (typeof navigator !== 'undefined' && navigator.language) {
      deviceLocale = navigator.language;
    }
    
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


