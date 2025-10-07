import * as Speech from 'expo-speech';

let speaking = false;
let lastText = '';
let lastAt = 0;

export function speak(text: string) {
  const now = Date.now();
  if (text === lastText && now - lastAt < 800) return; // debounce
  lastText = text;
  lastAt = now;
  stop();
  Speech.speak(text, { language: 'es-ES', rate: 0.95, pitch: 1.0 });
  speaking = true;
}

export function stop() {
  if (speaking) Speech.stop();
  speaking = false;
}


