import { voiceCommandService } from '../../../src/app/services/voice/VoiceCommandService';

// Mock @react-native-voice/voice
jest.mock('@react-native-voice/voice', () => ({
  start: jest.fn(),
  stop: jest.fn(),
  isAvailable: jest.fn(),
  onSpeechStart: jest.fn(),
  onSpeechEnd: jest.fn(),
  onSpeechResults: jest.fn(),
  onSpeechError: jest.fn(),
}));

// Mock i18n
jest.mock('../../../src/app/i18n', () => ({
  getCurrentLocale: jest.fn(() => 'en'),
}));

describe('VoiceCommandService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset the service state
    voiceCommandService.destroy();
  });

  describe('Event System', () => {
    test('should register and emit events', (done) => {
      const mockListener = jest.fn();
      
      voiceCommandService.on('test', mockListener);
      voiceCommandService.emit('test', { data: 'test' });
      
      setTimeout(() => {
        expect(mockListener).toHaveBeenCalledWith({
          type: 'test',
          data: { data: 'test' }
        });
        done();
      }, 0);
    });

    test('should remove all listeners', () => {
      const mockListener = jest.fn();
      
      voiceCommandService.on('test', mockListener);
      voiceCommandService.removeAllListeners();
      voiceCommandService.emit('test', { data: 'test' });
      
      expect(mockListener).not.toHaveBeenCalled();
    });
  });

  describe('State Management', () => {
    test('should track listening state', () => {
      expect(voiceCommandService.isCurrentlyListening()).toBe(false);
    });

    test('should track current language', () => {
      expect(voiceCommandService.getCurrentLanguage()).toBe('en-US');
    });
  });

  describe('Error Handling', () => {
    test('should handle permission denied error', async () => {
      const { Voice } = require('@react-native-voice/voice');
      Voice.isAvailable.mockResolvedValue(false);

      await expect(voiceCommandService.startListening()).rejects.toThrow('Microphone permission denied');
    });

    test('should handle voice recognition errors', async () => {
      const { Voice } = require('@react-native-voice/voice');
      Voice.isAvailable.mockResolvedValue(true);
      Voice.start.mockRejectedValue(new Error('Voice recognition failed'));

      await expect(voiceCommandService.startListening()).rejects.toThrow('Voice recognition failed');
    });
  });

  describe('Timeout Handling', () => {
    test('should set up timeout correctly', async () => {
      const { Voice } = require('@react-native-voice/voice');
      Voice.isAvailable.mockResolvedValue(true);
      Voice.start.mockResolvedValue(undefined);

      const timeoutSpy = jest.spyOn(globalThis, 'setTimeout');
      
      await voiceCommandService.startListening({ timeout: 5000 });
      
      expect(timeoutSpy).toHaveBeenCalledWith(expect.any(Function), 5000);
      
      timeoutSpy.mockRestore();
    });

    test('should clear timeout when stopping', async () => {
      const { Voice } = require('@react-native-voice/voice');
      Voice.isAvailable.mockResolvedValue(true);
      Voice.start.mockResolvedValue(undefined);
      Voice.stop.mockResolvedValue(undefined);

      const clearTimeoutSpy = jest.spyOn(globalThis, 'clearTimeout');
      
      await voiceCommandService.startListening();
      await voiceCommandService.stopListening();
      
      expect(clearTimeoutSpy).toHaveBeenCalled();
      
      clearTimeoutSpy.mockRestore();
    });
  });

  describe('Language Detection', () => {
    test('should use provided language', async () => {
      const { Voice } = require('@react-native-voice/voice');
      Voice.isAvailable.mockResolvedValue(true);
      Voice.start.mockResolvedValue(undefined);

      await voiceCommandService.startListening({ language: 'es-ES' });
      
      expect(Voice.start).toHaveBeenCalledWith('es-ES');
    });

    test('should use device language as default', async () => {
      const { Voice } = require('@react-native-voice/voice');
      const { getCurrentLocale } = require('../../../src/app/i18n');
      
      getCurrentLocale.mockReturnValue('es');
      Voice.isAvailable.mockResolvedValue(true);
      Voice.start.mockResolvedValue(undefined);

      await voiceCommandService.startListening();
      
      expect(Voice.start).toHaveBeenCalledWith('es-ES');
    });
  });

  describe('Multiple Sessions', () => {
    test('should stop previous session when starting new one', async () => {
      const { Voice } = require('@react-native-voice/voice');
      Voice.isAvailable.mockResolvedValue(true);
      Voice.start.mockResolvedValue(undefined);
      Voice.stop.mockResolvedValue(undefined);

      // Start first session
      await voiceCommandService.startListening();
      expect(voiceCommandService.isCurrentlyListening()).toBe(true);

      // Start second session
      await voiceCommandService.startListening();
      
      expect(Voice.stop).toHaveBeenCalled();
    });
  });
});
