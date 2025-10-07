import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import SettingsScreen from '../../src/app/screens/SettingsScreen';

// Mock the feature flags module
jest.mock('../../src/app/flags/featureFlags', () => ({
  featureFlags: {
    initialize: jest.fn(),
    getAllFlags: jest.fn(),
    setFlag: jest.fn(),
    resetToDefaults: jest.fn(),
  },
}));

// Mock the telemetry module
jest.mock('../../src/app/telemetry/logEvent', () => ({
  logEvent: jest.fn(),
}));

import { featureFlags } from '../../src/app/flags/featureFlags';

const mockNavigation = {
  goBack: jest.fn(),
};

describe('SettingsScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (featureFlags.getAllFlags as jest.Mock).mockReturnValue({
      CALL_ENABLED: true,
      SOS_ENABLED: true,
      PHOTOS_ENABLED: true,
      TELEMETRY_ENABLED: true,
    });
  });

  it('renders settings screen with all toggles', () => {
    const { getByText } = render(
      <SettingsScreen navigation={mockNavigation} />
    );

    expect(getByText(/Configuración|Settings/i)).toBeTruthy();
    expect(getByText(/Características|Features/i)).toBeTruthy();
    expect(getByText(/Llamadas|Calls/i)).toBeTruthy();
    expect(getByText(/SOS/i)).toBeTruthy();
    expect(getByText(/Fotos|Photos/i)).toBeTruthy();
    expect(getByText(/Telemetría|Telemetry/i)).toBeTruthy();
  });

  it('toggles a flag when switch is pressed', async () => {
    const { getByText } = render(
      <SettingsScreen navigation={mockNavigation} />
    );

    // Find the call toggle (first switch)
    const callToggle = getByText(/Llamadas|Calls/i).parent?.parent?.children[1];
    if (callToggle) {
      fireEvent(callToggle, 'onValueChange', false);
    }

    await waitFor(() => {
      expect(featureFlags.setFlag).toHaveBeenCalledWith('CALL_ENABLED', false);
    });
  });

  it('resets to defaults when reset button is pressed', async () => {
    const { getByText } = render(
      <SettingsScreen navigation={mockNavigation} />
    );

    const resetButton = getByText(/Restablecer|Reset/i);
    fireEvent.press(resetButton);

    await waitFor(() => {
      expect(featureFlags.resetToDefaults).toHaveBeenCalled();
    });
  });

  it('navigates back', () => {
    const { getByText } = render(
      <SettingsScreen navigation={mockNavigation} />
    );

    const backButton = getByText(/Atrás|Back/i);
    fireEvent.press(backButton);

    expect(mockNavigation.goBack).toHaveBeenCalled();
  });

  it('loads flags on mount', async () => {
    render(
      <SettingsScreen navigation={mockNavigation} />
    );

    await waitFor(() => {
      expect(featureFlags.initialize).toHaveBeenCalled();
      expect(featureFlags.getAllFlags).toHaveBeenCalled();
    });
  });
});
