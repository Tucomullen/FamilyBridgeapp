import React from 'react';
import { render } from '@testing-library/react-native';
import WelcomeScreen from '../../src/app/onboarding/WelcomeScreen';

describe('WelcomeScreen', () => {
  it('renders title and CTA', () => {
    const { getByRole, getByText } = render(<WelcomeScreen navigation={{ navigate: jest.fn() }} />);
    // Check for header role
    expect(getByRole('header')).toBeTruthy();
    // Check for start button
    const startBtn = getByRole('button', { name: /start|comenzar/i });
    expect(startBtn).toBeTruthy();
    // Check for TTS button
    const ttsBtn = getByRole('button', { name: /read aloud|leer en voz alta/i });
    expect(ttsBtn).toBeTruthy();
  });
});


