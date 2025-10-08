let speaking = false;
let lastText = '';
let lastAt = 0;

// Fallback implementation for expo-speech that works in Expo Go
function getSpeechModule() {
  try {
    // Try to use expo-speech if available (in development builds)
    if (typeof require !== 'undefined') {
      return require('expo-speech');
    }
  } catch (e) {
    // expo-speech not available, use fallback
  }
  return null;
}

export function speak(text: string) {
  const now = Date.now();
  if (text === lastText && now - lastAt < 800) return; // debounce
  lastText = text;
  lastAt = now;
  stop();
  
  const Speech = getSpeechModule();
  if (Speech) {
    // Use real TTS if available
    Speech.speak(text, { language: 'es-ES', rate: 0.95, pitch: 1.0 });
    speaking = true;
  } else {
    // Fallback: just log to console for debugging
    console.log('🔊 TTS (fallback):', text);
    speaking = true;
    // Simulate TTS duration
    setTimeout(() => {
      speaking = false;
    }, Math.max(1000, text.length * 50));
  }
}

export function stop() {
  const Speech = getSpeechModule();
  if (Speech && speaking) {
    Speech.stop();
  }
  speaking = false;
}


