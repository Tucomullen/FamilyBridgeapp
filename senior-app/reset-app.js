// Simple script to reset the app for testing onboarding
const AsyncStorage = require('@react-native-async-storage/async-storage');

async function resetApp() {
  try {
    console.log('🔄 Resetting app...');
    await AsyncStorage.removeItem('hasOnboarded');
    console.log('✅ App reset complete - onboarding will show on next launch');
  } catch (error) {
    console.error('❌ Error resetting app:', error);
  }
}

resetApp();
