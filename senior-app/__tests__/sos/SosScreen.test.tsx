import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import SosScreen from '../../src/app/screens/SosScreen';

// Mock the telemetry module
jest.mock('../../src/app/telemetry/logEvent', () => ({
  logEvent: jest.fn(),
}));

// Mock Math.random for predictable test results
const mockMath = Object.create(global.Math);
mockMath.random = jest.fn();
global.Math = mockMath;

// Mock timers
jest.useFakeTimers();

const mockNavigation = {
  goBack: jest.fn(),
};

describe('SosScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.clearAllTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
  });

  it('renders initial state', () => {
    const { getByText } = render(
      <SosScreen navigation={mockNavigation} />
    );

    expect(getByText(/SOS/i)).toBeTruthy();
    expect(getByText(/Funcionalidad de emergencia próximamente|Emergency functionality coming soon/i)).toBeTruthy();
  });

  it('sends alert successfully', async () => {
    // Mock successful send (85% chance)
    mockMath.random.mockReturnValue(0.8);

    const { getByText } = render(
      <SosScreen navigation={mockNavigation} />
    );

    const sendButton = getByText(/Enviar Alerta|Send Alert/i);
    fireEvent.press(sendButton);

    // Should show sending state
    expect(getByText(/Enviando alerta|Sending/i)).toBeTruthy();

    // Fast forward to completion
    jest.advanceTimersByTime(2000);

    await waitFor(() => {
      expect(getByText(/Alerta enviada a la familia|Alert sent to family/i)).toBeTruthy();
    });
  });

  it('handles send failure and shows retry', async () => {
    // Mock failure (15% chance)
    mockMath.random.mockReturnValue(0.1);

    const { getByText } = render(
      <SosScreen navigation={mockNavigation} />
    );

    const sendButton = getByText(/Enviar Alerta|Send Alert/i);
    fireEvent.press(sendButton);

    // Fast forward to completion
    jest.advanceTimersByTime(2000);

    await waitFor(() => {
      expect(getByText(/Error al enviar|Send failed/i)).toBeTruthy();
      expect(getByText(/Reintentar|Try Again/i)).toBeTruthy();
    });
  });

  it('retries after failure', async () => {
    // Mock failure first, then success
    mockMath.random
      .mockReturnValueOnce(0.1) // First call fails
      .mockReturnValueOnce(0.8); // Retry succeeds

    const { getByText } = render(
      <SosScreen navigation={mockNavigation} />
    );

    const sendButton = getByText(/Enviar Alerta|Send Alert/i);
    fireEvent.press(sendButton);

    // Fast forward to failure
    jest.advanceTimersByTime(2000);

    await waitFor(() => {
      expect(getByText(/Error al enviar|Send failed/i)).toBeTruthy();
    });

    const retryButton = getByText(/Reintentar|Try Again/i);
    fireEvent.press(retryButton);

    // Should show sending again
    expect(getByText(/Enviando alerta|Sending/i)).toBeTruthy();

    // Fast forward to success
    jest.advanceTimersByTime(2000);

    await waitFor(() => {
      expect(getByText(/Alerta enviada a la familia|Alert sent to family/i)).toBeTruthy();
    });
  });

  it('shows reset button after completion', async () => {
    mockMath.random.mockReturnValue(0.8);

    const { getByText } = render(
      <SosScreen navigation={mockNavigation} />
    );

    const sendButton = getByText(/Enviar Alerta|Send Alert/i);
    fireEvent.press(sendButton);

    jest.advanceTimersByTime(2000);

    await waitFor(() => {
      expect(getByText(/Reset/i)).toBeTruthy();
    });
  });

  it('resets alert state', async () => {
    mockMath.random.mockReturnValue(0.8);

    const { getByText } = render(
      <SosScreen navigation={mockNavigation} />
    );

    const sendButton = getByText(/Enviar Alerta|Send Alert/i);
    fireEvent.press(sendButton);

    jest.advanceTimersByTime(2000);

    await waitFor(() => {
      expect(getByText(/Alerta enviada a la familia|Alert sent to family/i)).toBeTruthy();
    });

    const resetButton = getByText(/Reset/i);
    fireEvent.press(resetButton);

    expect(getByText(/Funcionalidad de emergencia próximamente|Emergency functionality coming soon/i)).toBeTruthy();
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
