import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import SosScreen from '../../src/app/screens/SosScreen';

// Mock the telemetry module
jest.mock('../../src/app/telemetry/logEvent', () => ({
  logEvent: jest.fn(),
}));

const mockNavigation = {
  goBack: jest.fn(),
};

describe('SosScreen - Simple Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders initial state', () => {
    const { getByText } = render(
      <SosScreen navigation={mockNavigation} />
    );

    expect(getByText(/SOS/i)).toBeTruthy();
    expect(getByText(/Funcionalidad de emergencia próximamente|Emergency functionality coming soon/i)).toBeTruthy();
  });

  it('shows send alert button initially', () => {
    const { getByText } = render(
      <SosScreen navigation={mockNavigation} />
    );

    expect(getByText(/Enviar Alerta|Send Alert/i)).toBeTruthy();
  });

  it('navigates back', () => {
    const { getByText } = render(
      <SosScreen navigation={mockNavigation} />
    );

    const backButton = getByText(/Atrás|Back/i);
    fireEvent.press(backButton);

    expect(mockNavigation.goBack).toHaveBeenCalled();
  });
});
