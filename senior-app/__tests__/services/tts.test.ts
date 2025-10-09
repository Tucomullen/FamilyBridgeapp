import { ttsService } from '../../src/app/services/tts';

// Mock expo-speech
jest.mock('expo-speech', () => ({
  getAvailableVoicesAsync: jest.fn(() => Promise.resolve([
    {
      identifier: 'voice-1',
      name: 'Test Voice 1',
      language: 'es-ES',
      quality: 'enhanced',
      isDefault: true,
    },
    {
      identifier: 'voice-2',
      name: 'Test Voice 2',
      language: 'en-US',
      quality: 'default',
      isDefault: false,
    },
  ])),
  speakAsync: jest.fn(() => Promise.resolve()),
  pauseAsync: jest.fn(() => Promise.resolve()),
  resumeAsync: jest.fn(() => Promise.resolve()),
  stopAsync: jest.fn(() => Promise.resolve()),
}));

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(() => Promise.resolve(null)),
  setItem: jest.fn(() => Promise.resolve()),
  removeItem: jest.fn(() => Promise.resolve()),
}));

// Mock i18n
jest.mock('../../src/app/i18n', () => ({
  getCurrentLocale: jest.fn(() => 'es'),
}));

describe('TTSService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should initialize successfully', async () => {
    await ttsService.initialize();
    
    const voices = ttsService.getVoices();
    expect(voices).toHaveLength(2);
    expect(voices[0].name).toBe('Test Voice 1');
    expect(voices[1].name).toBe('Test Voice 2');
  });

  it('should speak text with default settings', async () => {
    await ttsService.initialize();
    
    const speakAsync = require('expo-speech').speakAsync;
    await ttsService.speak('Hello world');
    
    expect(speakAsync).toHaveBeenCalledWith(
      expect.objectContaining({
        text: 'Hello world',
        rate: 1.0,
        pitch: 1.0,
        volume: 1.0,
      })
    );
  });

  it('should speak text with custom options', async () => {
    await ttsService.initialize();
    
    const speakAsync = require('expo-speech').speakAsync;
    await ttsService.speak('Hello world', {
      rate: 1.5,
      pitch: 1.2,
      volume: 0.8,
    });
    
    expect(speakAsync).toHaveBeenCalledWith(
      expect.objectContaining({
        text: 'Hello world',
        rate: 1.5,
        pitch: 1.2,
        volume: 0.8,
      })
    );
  });

  it('should pause speech', async () => {
    await ttsService.initialize();
    
    const pauseAsync = require('expo-speech').pauseAsync;
    await ttsService.pause();
    
    expect(pauseAsync).toHaveBeenCalled();
  });

  it('should resume speech', async () => {
    await ttsService.initialize();
    
    const resumeAsync = require('expo-speech').resumeAsync;
    await ttsService.resume();
    
    expect(resumeAsync).toHaveBeenCalled();
  });

  it('should stop speech', async () => {
    await ttsService.initialize();
    
    const stopAsync = require('expo-speech').stopAsync;
    await ttsService.stop();
    
    expect(stopAsync).toHaveBeenCalled();
  });

  it('should set voice', async () => {
    await ttsService.initialize();
    
    await ttsService.setVoice('voice-2');
    
    const currentVoice = ttsService.getCurrentVoice();
    expect(currentVoice?.id).toBe('voice-2');
    expect(currentVoice?.name).toBe('Test Voice 2');
  });

  it('should set rate', async () => {
    await ttsService.initialize();
    
    await ttsService.setRate(1.5);
    
    const settings = ttsService.getSettings();
    expect(settings.rate).toBe(1.5);
  });

  it('should set pitch', async () => {
    await ttsService.initialize();
    
    await ttsService.setPitch(1.2);
    
    const settings = ttsService.getSettings();
    expect(settings.pitch).toBe(1.2);
  });

  it('should set volume', async () => {
    await ttsService.initialize();
    
    await ttsService.setVolume(0.8);
    
    const settings = ttsService.getSettings();
    expect(settings.volume).toBe(0.8);
  });

  it('should toggle voice feedback', async () => {
    await ttsService.initialize();
    
    await ttsService.setVoiceFeedbackEnabled(false);
    
    const settings = ttsService.getSettings();
    expect(settings.voiceFeedbackEnabled).toBe(false);
    
    await ttsService.setVoiceFeedbackEnabled(true);
    
    const updatedSettings = ttsService.getSettings();
    expect(updatedSettings.voiceFeedbackEnabled).toBe(true);
  });

  it('should not speak when voice feedback is disabled', async () => {
    await ttsService.initialize();
    await ttsService.setVoiceFeedbackEnabled(false);
    
    const speakAsync = require('expo-speech').speakAsync;
    await ttsService.speak('Hello world');
    
    expect(speakAsync).not.toHaveBeenCalled();
  });

  it('should test voice', async () => {
    await ttsService.initialize();
    
    const speakAsync = require('expo-speech').speakAsync;
    await ttsService.testVoice();
    
    expect(speakAsync).toHaveBeenCalledWith(
      expect.objectContaining({
        text: 'Hola, soy tu asistente FamilyBridge. ¿Cómo estás hoy?',
      })
    );
  });

  it('should handle speak errors gracefully', async () => {
    await ttsService.initialize();
    
    const speakAsync = require('expo-speech').speakAsync;
    speakAsync.mockRejectedValueOnce(new Error('TTS Error'));
    
    // Should not throw
    await expect(ttsService.speak('Hello world')).resolves.not.toThrow();
  });

  it('should disable voice feedback after max errors', async () => {
    await ttsService.initialize();
    
    const speakAsync = require('expo-speech').speakAsync;
    speakAsync.mockRejectedValue(new Error('TTS Error'));
    
    // Trigger multiple errors
    for (let i = 0; i < 4; i++) {
      await ttsService.speak('Hello world');
    }
    
    const settings = ttsService.getSettings();
    expect(settings.voiceFeedbackEnabled).toBe(false);
  });

  it('should reset to defaults', async () => {
    await ttsService.initialize();
    
    // Change some settings
    await ttsService.setRate(1.5);
    await ttsService.setPitch(1.2);
    await ttsService.setVoiceFeedbackEnabled(false);
    
    // Reset to defaults
    await ttsService.resetToDefaults();
    
    const settings = ttsService.getSettings();
    expect(settings.rate).toBe(1.0);
    expect(settings.pitch).toBe(1.0);
    expect(settings.volume).toBe(1.0);
    expect(settings.voiceFeedbackEnabled).toBe(true);
  });

  it('should clamp rate values', async () => {
    await ttsService.initialize();
    
    await ttsService.setRate(3.0); // Above max
    expect(ttsService.getSettings().rate).toBe(2.0);
    
    await ttsService.setRate(0.05); // Below min
    expect(ttsService.getSettings().rate).toBe(0.1);
  });

  it('should clamp pitch values', async () => {
    await ttsService.initialize();
    
    await ttsService.setPitch(3.0); // Above max
    expect(ttsService.getSettings().pitch).toBe(2.0);
    
    await ttsService.setPitch(0.05); // Below min
    expect(ttsService.getSettings().pitch).toBe(0.1);
  });

  it('should clamp volume values', async () => {
    await ttsService.initialize();
    
    await ttsService.setVolume(1.5); // Above max
    expect(ttsService.getSettings().volume).toBe(1.0);
    
    await ttsService.setVolume(-0.1); // Below min
    expect(ttsService.getSettings().volume).toBe(0.0);
  });

  it('should return correct speaking state', async () => {
    await ttsService.initialize();
    
    expect(ttsService.isCurrentlySpeaking()).toBe(false);
    expect(ttsService.isCurrentlyPaused()).toBe(false);
  });

  it('should return correct voice feedback state', async () => {
    await ttsService.initialize();
    
    expect(ttsService.isVoiceFeedbackEnabled()).toBe(true);
    
    await ttsService.setVoiceFeedbackEnabled(false);
    expect(ttsService.isVoiceFeedbackEnabled()).toBe(false);
  });
});



