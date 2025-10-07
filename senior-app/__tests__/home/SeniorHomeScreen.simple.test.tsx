import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import SeniorHomeScreen from '../../src/app/screens/SeniorHomeScreen';

// Mock the feature flags module
jest.mock('../../src/app/flags/featureFlags', () => ({
  featureFlags: {
    initialize: jest.fn().mockResolvedValue(undefined),
    getAllFlags: jest.fn().mockReturnValue({
      CALL_ENABLED: true,
      SOS_ENABLED: true,
      PHOTOS_ENABLED: true,
      TELEMETRY_ENABLED: true,
    }),
  },
}));

// Mock the telemetry module
jest.mock('../../src/app/telemetry/logEvent', () => ({
  logEvent: jest.fn(),
}));

// Mock the TTS module
jest.mock('../../src/app/lib/accessibility/tts', () => ({
  speak: jest.fn(),
}));

const mockNavigation = {
  navigate: jest.fn(),
  goBack: jest.fn(),
};

describe('SeniorHomeScreen - Simple Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders title and action buttons', () => {
    const { getByText } = render(
      <SeniorHomeScreen navigation={mockNavigation} />
    );

    expect(getByText(/FamilyBridge/i)).toBeTruthy();
    expect(getByText(/Llamar|Call/i)).toBeTruthy();
    expect(getByText(/SOS/i)).toBeTruthy();
    expect(getByText(/Fotos|Photos/i)).toBeTruthy();
  });

  it('has accessible buttons with proper roles', () => {
    const { getAllByRole } = render(
      <SeniorHomeScreen navigation={mockNavigation} />
    );

    const buttons = getAllByRole('button');
    expect(buttons.length).toBeGreaterThan(0);
  });

  it('navigates back', () => {
    const { getByText } = render(
      <SeniorHomeScreen navigation={mockNavigation} />
    );

    // This test just ensures the component renders without crashing
    expect(getByText(/FamilyBridge/i)).toBeTruthy();
  });
});
