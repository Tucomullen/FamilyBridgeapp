import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import WelcomeScreen from '../../src/app/onboarding/WelcomeScreen';

describe('WelcomeScreen', () => {
  it('renders title and CTA', () => {
    const { getByA11yRole, getByText } = render(<WelcomeScreen navigation={{ navigate: jest.fn() }} />);
    expect(getByA11yRole('header')).toBeTruthy();
    expect(getByText(/Start|Comenzar/i)).toBeTruthy();
  });
});


