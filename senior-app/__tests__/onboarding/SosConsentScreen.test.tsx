import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import SosConsentScreen from '../../src/app/onboarding/SosConsentScreen';

// Mock the services
jest.mock('../../src/app/services/notifications', () => ({
  notificationService: {
    initialize: jest.fn(),
    requestPermission: jest.fn(),
  },
}));

jest.mock('../../src/app/services/location', () => ({
  locationService: {
    initialize: jest.fn(),
    requestPermission: jest.fn(),
  },
}));

// Mock the permission functions
jest.mock('../../src/app/lib/permissions/media', () => ({
  requestNotifications: jest.fn(),
  requestLocation: jest.fn(),
  openOSSettings: jest.fn(),
}));

// Mock i18n
jest.mock('../../src/app/i18n', () => ({
  t: (key: string) => {
    const translations: Record<string, string> = {
      'onb.sosConsent.title': 'Emergency SOS Setup',
      'onb.sosConsent.body': 'To send emergency alerts, we need permission to send notifications and access your location.',
      'onb.sosConsent.notifications': 'Notifications: Send emergency alerts to your family',
      'onb.sosConsent.location': 'Location: Include your location in emergency alerts (optional)',
      'onb.sosConsent.privacy': 'Your data is only used for emergency alerts and is not shared publicly.',
      'onb.sosConsent.ctaAllow': 'Allow All',
      'onb.sosConsent.ctaSkip': 'Skip for Now',
      'onb.sosConsent.learnMore': 'Learn how to enable later',
      'onb.tts.play': 'Read aloud',
    };
    return translations[key] || key;
  },
}));

// Mock TTS
jest.mock('../../src/app/lib/accessibility/tts', () => ({
  speak: jest.fn(),
}));

describe('SosConsentScreen', () => {
  const mockNavigation = {
    navigate: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly', () => {
    const { getByText } = render(<SosConsentScreen navigation={mockNavigation} />);
    
    expect(getByText('Emergency SOS Setup')).toBeTruthy();
    expect(getByText('To send emergency alerts, we need permission to send notifications and access your location.')).toBeTruthy();
    expect(getByText('Allow All')).toBeTruthy();
    expect(getByText('Skip for Now')).toBeTruthy();
  });

  it('shows permission explanations', () => {
    const { getByText } = render(<SosConsentScreen navigation={mockNavigation} />);
    
    expect(getByText('Notifications: Send emergency alerts to your family')).toBeTruthy();
    expect(getByText('Location: Include your location in emergency alerts (optional)')).toBeTruthy();
  });

  it('handles allow all button press', async () => {
    const { requestNotifications, requestLocation } = require('../../src/app/lib/permissions/media');
    
    requestNotifications.mockResolvedValue('granted');
    requestLocation.mockResolvedValue('granted');
    
    const { getByText } = render(<SosConsentScreen navigation={mockNavigation} />);
    
    const allowButton = getByText('Allow All');
    fireEvent.press(allowButton);
    
    await waitFor(() => {
      expect(requestNotifications).toHaveBeenCalled();
      expect(requestLocation).toHaveBeenCalled();
      expect(mockNavigation.navigate).toHaveBeenCalledWith('FamilyLink');
    });
  });

  it('handles skip button press', () => {
    const { getByText } = render(<SosConsentScreen navigation={mockNavigation} />);
    
    const skipButton = getByText('Skip for Now');
    fireEvent.press(skipButton);
    
    expect(mockNavigation.navigate).toHaveBeenCalledWith('FamilyLink');
  });

  it('shows loading state when requesting permissions', async () => {
    const { requestNotifications, requestLocation } = require('../../src/app/lib/permissions/media');
    
    // Make the promises hang
    requestNotifications.mockImplementation(() => new Promise(() => {}));
    requestLocation.mockImplementation(() => new Promise(() => {}));
    
    const { getByText } = render(<SosConsentScreen navigation={mockNavigation} />);
    
    const allowButton = getByText('Allow All');
    fireEvent.press(allowButton);
    
    // Should show loading state
    expect(getByText('Requesting...')).toBeTruthy();
  });

  it('handles permission denial gracefully', async () => {
    const { requestNotifications, requestLocation } = require('../../src/app/lib/permissions/media');
    
    requestNotifications.mockResolvedValue('denied');
    requestLocation.mockResolvedValue('granted');
    
    const { getByText } = render(<SosConsentScreen navigation={mockNavigation} />);
    
    const allowButton = getByText('Allow All');
    fireEvent.press(allowButton);
    
    await waitFor(() => {
      expect(mockNavigation.navigate).toHaveBeenCalledWith('FamilyLink');
    });
  });

  it('shows TTS button', () => {
    const { getByText } = render(<SosConsentScreen navigation={mockNavigation} />);
    
    expect(getByText('Read aloud')).toBeTruthy();
  });

  it('calls speak when TTS button is pressed', () => {
    const { speak } = require('../../src/app/lib/accessibility/tts');
    
    const { getByText } = render(<SosConsentScreen navigation={mockNavigation} />);
    
    const ttsButton = getByText('Read aloud');
    fireEvent.press(ttsButton);
    
    expect(speak).toHaveBeenCalledWith('Emergency SOS Setup');
  });
});
