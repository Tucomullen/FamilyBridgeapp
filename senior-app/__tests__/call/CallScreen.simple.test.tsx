import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import CallScreen from '../../src/app/screens/CallScreen';

// Mock the telemetry module
jest.mock('../../src/app/telemetry/logEvent', () => ({
  logEvent: jest.fn(),
}));

const mockNavigation = {
  goBack: jest.fn(),
};

describe('CallScreen - Simple Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders initial state', () => {
    const { getByText } = render(
      <CallScreen navigation={mockNavigation} />
    );

    expect(getByText(/Llamar|Call/i)).toBeTruthy();
    expect(getByText(/Funcionalidad de llamada próximamente|Call functionality coming soon/i)).toBeTruthy();
  });

  it('shows start button initially', () => {
    const { getByText } = render(
      <CallScreen navigation={mockNavigation} />
    );

    expect(getByText(/Iniciar Llamada|Start Call/i)).toBeTruthy();
  });

  it('navigates back', () => {
    const { getByText } = render(
      <CallScreen navigation={mockNavigation} />
    );

    const backButton = getByText(/Atrás|Back/i);
    fireEvent.press(backButton);

    expect(mockNavigation.goBack).toHaveBeenCalled();
  });
});
