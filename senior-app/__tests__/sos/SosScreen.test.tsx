import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import SosScreen from '../../src/app/screens/SosScreen';

// Declare global for tests
declare const global: any;

// Mock the telemetry module
jest.mock('../../src/app/telemetry/logEvent', () => ({
  logEvent: jest.fn(),
}));

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
    const { getByText, getByRole } = render(
      <SosScreen navigation={mockNavigation} />
    );

    expect(getByText(/SOS/i)).toBeTruthy();
    expect(getByText(/Funcionalidad de emergencia próximamente|Emergency functionality coming soon/i)).toBeTruthy();
  });

  it('sends alert successfully', async () => {
    const { getByText, getByRole } = render(
      <SosScreen navigation={mockNavigation} />
    );

    const sendButton = getByText(/Enviar Alerta|Send Alert/i);
    
    await act(async () => {
      fireEvent.press(sendButton);
    });

    // Should show sending state
    expect(getByText(/Enviando alerta|Sending/i)).toBeTruthy();

    // Fast forward to completion
    await act(async () => {
      jest.advanceTimersByTime(2000);
    });

    await waitFor(() => {
      expect(getByText(/Alerta enviada a la familia|Alert sent to family/i)).toBeTruthy();
    });
  });

  it('handles send failure and shows retry', async () => {
    // Temporarily override __DEV__ to false to test failure path
    const originalDev = (global as any).__DEV__;
    (global as any).__DEV__ = false;
    
    // Mock Math.random to return failure value
    const originalRandom = Math.random;
    Math.random = jest.fn(() => 0.1); // 15% chance of failure

    const { getByText, getByRole } = render(
      <SosScreen navigation={mockNavigation} />
    );

    const sendButton = getByText(/Enviar Alerta|Send Alert/i);
    
    await act(async () => {
      fireEvent.press(sendButton);
    });

    // Fast forward to completion
    await act(async () => {
      jest.advanceTimersByTime(2000);
    });

    await waitFor(() => {
      expect(getByText(/Error al enviar|Send failed/i)).toBeTruthy();
      expect(getByRole('button', { name: /Reintentar|Try Again/i })).toBeTruthy();
    });

    // Restore original values
    (global as any).__DEV__ = originalDev;
    Math.random = originalRandom;
  });

  it('retries after failure', async () => {
    // Temporarily override __DEV__ to false to test failure path
    const originalDev = (global as any).__DEV__;
    (global as any).__DEV__ = false;
    
    // Mock Math.random to return failure value
    const originalRandom = Math.random;
    Math.random = jest.fn(() => 0.1); // 15% chance of failure

    const { getByText, getByRole } = render(
      <SosScreen navigation={mockNavigation} />
    );

    const sendButton = getByText(/Enviar Alerta|Send Alert/i);
    
    await act(async () => {
      fireEvent.press(sendButton);
    });

    // Fast forward to failure
    await act(async () => {
      jest.advanceTimersByTime(2000);
    });

    await waitFor(() => {
      expect(getByText(/Error al enviar|Send failed/i)).toBeTruthy();
    });

    const retryButton = getByRole('button', { name: /Reintentar|Try Again/i });
    
    await act(async () => {
      fireEvent.press(retryButton);
    });

    // Should show sending again
    expect(getByText(/Enviando alerta|Sending/i)).toBeTruthy();

    // Restore original values
    (global as any).__DEV__ = originalDev;
    Math.random = originalRandom;
  });

  it('shows reset button after completion', async () => {
    const { getByText, getByRole } = render(
      <SosScreen navigation={mockNavigation} />
    );

    const sendButton = getByText(/Enviar Alerta|Send Alert/i);
    
    await act(async () => {
      fireEvent.press(sendButton);
    });

    await act(async () => {
      jest.advanceTimersByTime(2000);
    });

    await waitFor(() => {
      expect(getByText(/Reset/i)).toBeTruthy();
    });
  });

  it('resets alert state', async () => {
    // Ensure we're in dev mode for success path
    const originalDev = (global as any).__DEV__;
    (global as any).__DEV__ = true;

    const { getByText, getByRole } = render(
      <SosScreen navigation={mockNavigation} />
    );

    const sendButton = getByText(/Enviar Alerta|Send Alert/i);
    
    await act(async () => {
      fireEvent.press(sendButton);
    });

    await act(async () => {
      jest.advanceTimersByTime(2000);
    });

    await waitFor(() => {
      expect(getByText(/Alerta enviada a la familia|Alert sent to family/i)).toBeTruthy();
    });

    const resetButton = getByText(/Reset/i);
    
    await act(async () => {
      fireEvent.press(resetButton);
    });

    expect(getByText(/Funcionalidad de emergencia próximamente|Emergency functionality coming soon/i)).toBeTruthy();

    // Restore original value
    (global as any).__DEV__ = originalDev;
  });

  it('navigates back', () => {
    const { getByText, getByRole } = render(
      <SosScreen navigation={mockNavigation} />
    );

    const backButton = getByText(/Atrás|Back/i);
    fireEvent.press(backButton);

    expect(mockNavigation.goBack).toHaveBeenCalled();
  });
});
