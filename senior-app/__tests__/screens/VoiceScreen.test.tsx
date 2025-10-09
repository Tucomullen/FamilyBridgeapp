import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import VoiceScreen from '../../src/app/screens/VoiceScreen';

// Mock navigation
const mockNavigation = {
  navigate: jest.fn(),
  goBack: jest.fn(),
};

// Mock voice command service
jest.mock('../../src/app/services/voice/VoiceCommandService', () => ({
  voiceCommandService: {
    on: jest.fn(),
    removeAllListeners: jest.fn(),
    startListening: jest.fn(),
    stopListening: jest.fn(),
    isCurrentlyListening: jest.fn(() => false),
  },
}));

// Mock TTS service
jest.mock('../../src/app/services/tts', () => ({
  ttsService: {
    speak: jest.fn(),
    isVoiceFeedbackEnabled: jest.fn(() => true),
  },
}));

// Mock i18n
jest.mock('../../src/app/i18n', () => ({
  t: jest.fn((key) => {
    const translations = {
      'common.locale': 'en',
      'home.voiceCommands': 'Voice Commands',
    };
    return translations[key] || key;
  }),
}));

describe('VoiceScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders correctly', () => {
    const { getByText } = render(<VoiceScreen navigation={mockNavigation} />);
    
    expect(getByText('Voice Commands')).toBeTruthy();
    expect(getByText('Tap the button and say what you need')).toBeTruthy();
    expect(getByText('🎤 Speak')).toBeTruthy();
  });

  test('shows example phrases', () => {
    const { getByText } = render(<VoiceScreen navigation={mockNavigation} />);
    
    expect(getByText('Examples:')).toBeTruthy();
    expect(getByText('• Call Ana')).toBeTruthy();
    expect(getByText('• Show photos')).toBeTruthy();
    expect(getByText('• Emergency')).toBeTruthy();
  });

  test('handles speak button press', async () => {
    const { voiceCommandService } = require('../../src/app/services/voice/VoiceCommandService');
    const { ttsService } = require('../../src/app/services/tts');
    
    voiceCommandService.startListening.mockResolvedValue(undefined);
    ttsService.speak.mockResolvedValue(undefined);

    const { getByText } = render(<VoiceScreen navigation={mockNavigation} />);
    const speakButton = getByText('🎤 Speak');
    
    fireEvent.press(speakButton);
    
    await waitFor(() => {
      expect(ttsService.speak).toHaveBeenCalledWith('I\'m listening...');
      expect(voiceCommandService.startListening).toHaveBeenCalledWith({
        language: 'en-US',
        timeout: 8000
      });
    });
  });

  test('handles voice recognition result', async () => {
    const { voiceCommandService } = require('../../src/app/services/voice/VoiceCommandService');
    const { ttsService } = require('../../src/app/services/tts');
    
    // Mock the event listener
    let resultCallback: (event: any) => void;
    voiceCommandService.on.mockImplementation((event: string, callback: (event: any) => void) => {
      if (event === 'result') {
        resultCallback = callback;
      }
    });

    ttsService.speak.mockResolvedValue(undefined);
    voiceCommandService.startListening.mockResolvedValue(undefined);

    const { getByText } = render(<VoiceScreen navigation={mockNavigation} />);
    const speakButton = getByText('🎤 Speak');
    
    fireEvent.press(speakButton);
    
    // Simulate voice result
    if (resultCallback!) {
      resultCallback({
        type: 'result',
        data: { transcript: 'call john', confidence: 0.9 }
      });
    }
    
    await waitFor(() => {
      expect(ttsService.speak).toHaveBeenCalledWith('Calling john...');
      expect(mockNavigation.navigate).toHaveBeenCalledWith('Call', { contactName: 'john' });
    });
  });

  test('handles voice recognition error', async () => {
    const { voiceCommandService } = require('../../src/app/services/voice/VoiceCommandService');
    const { ttsService } = require('../../src/app/services/tts');
    
    // Mock the event listener
    let errorCallback: (event: any) => void;
    voiceCommandService.on.mockImplementation((event: string, callback: (event: any) => void) => {
      if (event === 'error') {
        errorCallback = callback;
      }
    });

    ttsService.speak.mockResolvedValue(undefined);
    voiceCommandService.startListening.mockResolvedValue(undefined);

    const { getByText } = render(<VoiceScreen navigation={mockNavigation} />);
    const speakButton = getByText('🎤 Speak');
    
    fireEvent.press(speakButton);
    
    // Simulate voice error
    if (errorCallback!) {
      errorCallback({
        type: 'error',
        data: { error: 'Recognition failed' }
      });
    }
    
    await waitFor(() => {
      expect(ttsService.speak).toHaveBeenCalledWith('There was an error. Please try again.');
    });
  });

  test('handles voice recognition timeout', async () => {
    const { voiceCommandService } = require('../../src/app/services/voice/VoiceCommandService');
    const { ttsService } = require('../../src/app/services/tts');
    
    // Mock the event listener
    let timeoutCallback: (event: any) => void;
    voiceCommandService.on.mockImplementation((event: string, callback: (event: any) => void) => {
      if (event === 'timeout') {
        timeoutCallback = callback;
      }
    });

    ttsService.speak.mockResolvedValue(undefined);
    voiceCommandService.startListening.mockResolvedValue(undefined);

    const { getByText } = render(<VoiceScreen navigation={mockNavigation} />);
    const speakButton = getByText('🎤 Speak');
    
    fireEvent.press(speakButton);
    
    // Simulate timeout
    if (timeoutCallback!) {
      timeoutCallback({ type: 'timeout' });
    }
    
    await waitFor(() => {
      expect(ttsService.speak).toHaveBeenCalledWith('I didn\'t understand. Tap the button to try again.');
    });
  });

  test('shows result when voice is recognized', async () => {
    const { voiceCommandService } = require('../../src/app/services/voice/VoiceCommandService');
    const { ttsService } = require('../../src/app/services/tts');
    
    // Mock the event listener
    let resultCallback: (event: any) => void;
    voiceCommandService.on.mockImplementation((event: string, callback: (event: any) => void) => {
      if (event === 'result') {
        resultCallback = callback;
      }
    });

    ttsService.speak.mockResolvedValue(undefined);
    voiceCommandService.startListening.mockResolvedValue(undefined);

    const { getByText } = render(<VoiceScreen navigation={mockNavigation} />);
    const speakButton = getByText('🎤 Speak');
    
    fireEvent.press(speakButton);
    
    // Simulate voice result
    if (resultCallback!) {
      resultCallback({
        type: 'result',
        data: { transcript: 'show photos', confidence: 0.9 }
      });
    }
    
    await waitFor(() => {
      expect(getByText('You said:')).toBeTruthy();
      expect(getByText('"show photos"')).toBeTruthy();
      expect(getByText('Action: PHOTOS')).toBeTruthy();
    });
  });

  test('cleans up listeners on unmount', () => {
    const { voiceCommandService } = require('../../src/app/services/voice/VoiceCommandService');
    
    const { unmount } = render(<VoiceScreen navigation={mockNavigation} />);
    unmount();
    
    expect(voiceCommandService.removeAllListeners).toHaveBeenCalled();
  });
});
