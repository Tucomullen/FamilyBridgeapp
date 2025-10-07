import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import CallScreen from '../../src/app/screens/CallScreen';

// Mock the telemetry module
jest.mock('../../src/app/telemetry/logEvent', () => ({
  logEvent: jest.fn(),
}));

// Mock timers
jest.useFakeTimers();

const mockNavigation = {
  goBack: jest.fn(),
};

describe('CallScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.clearAllTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
  });

  it('renders initial state', () => {
    const { getByText } = render(
      <CallScreen navigation={mockNavigation} />
    );

    expect(getByText(/Llamar|Call/i)).toBeTruthy();
    expect(getByText(/Funcionalidad de llamada próximamente|Call functionality coming soon/i)).toBeTruthy();
  });

  it('starts call and transitions through states', async () => {
    const { getByText } = render(
      <CallScreen navigation={mockNavigation} />
    );

    const startButton = getByText(/Iniciar Llamada|Start Call/i);
    
    await act(async () => {
      fireEvent.press(startButton);
    });

    // Should show dialing state
    expect(getByText(/Marcando|Dialing/i)).toBeTruthy();

    // Fast forward to connecting state
    await act(async () => {
      jest.advanceTimersByTime(2000);
    });
    expect(getByText(/Conectando|Connecting/i)).toBeTruthy();

    // Fast forward to in call state
    await act(async () => {
      jest.advanceTimersByTime(2000);
    });
    expect(getByText(/En Llamada|In Call/i)).toBeTruthy();

    // Fast forward to auto-end
    await act(async () => {
      jest.advanceTimersByTime(12000);
    });
    expect(getByText(/Llamada Finalizada|Call Ended/i)).toBeTruthy();
  });

  it('allows manual call ending', async () => {
    const { getByText } = render(
      <CallScreen navigation={mockNavigation} />
    );

    const startButton = getByText(/Iniciar Llamada|Start Call/i);
    
    await act(async () => {
      fireEvent.press(startButton);
    });

    // Fast forward to in call state
    await act(async () => {
      jest.advanceTimersByTime(4000);
    });
    expect(getByText(/En Llamada|In Call/i)).toBeTruthy();

    const endButton = getByText(/Finalizar Llamada|End Call/i);
    
    await act(async () => {
      fireEvent.press(endButton);
    });

    expect(getByText(/Llamada Finalizada|Call Ended/i)).toBeTruthy();
  });

  it('shows reset button after call ends', async () => {
    const { getByText } = render(
      <CallScreen navigation={mockNavigation} />
    );

    const startButton = getByText(/Iniciar Llamada|Start Call/i);
    
    await act(async () => {
      fireEvent.press(startButton);
    });

    // Fast forward to auto-end
    await act(async () => {
      jest.advanceTimersByTime(15000);
    });
    expect(getByText(/Llamada Finalizada|Call Ended/i)).toBeTruthy();
    expect(getByText(/Reset/i)).toBeTruthy();
  });

  it('resets call state', async () => {
    const { getByText } = render(
      <CallScreen navigation={mockNavigation} />
    );

    const startButton = getByText(/Iniciar Llamada|Start Call/i);
    
    await act(async () => {
      fireEvent.press(startButton);
    });

    // Fast forward to auto-end
    await act(async () => {
      jest.advanceTimersByTime(15000);
    });
    
    const resetButton = getByText(/Reset/i);
    
    await act(async () => {
      fireEvent.press(resetButton);
    });

    expect(getByText(/Funcionalidad de llamada próximamente|Call functionality coming soon/i)).toBeTruthy();
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
