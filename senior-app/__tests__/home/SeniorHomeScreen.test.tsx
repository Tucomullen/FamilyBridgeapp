import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import SeniorHomeScreen from '../../src/app/screens/SeniorHomeScreen';

const mockNavigation = {
  navigate: jest.fn(),
  goBack: jest.fn(),
};

describe('SeniorHomeScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders title and 3 action buttons', () => {
    const { getAllByRole, getByText } = render(
      <SeniorHomeScreen navigation={mockNavigation} />
    );

    // Check for header
    expect(getByText(/FamilyBridge/i)).toBeTruthy();

    // Check for 3 action buttons
    const buttons = getAllByRole('button');
    expect(buttons).toHaveLength(4); // 3 action buttons + 1 TTS button

    // Check for specific button labels (using Spanish as default)
    expect(getByText(/Llamar|Call/i)).toBeTruthy();
    expect(getByText(/SOS/i)).toBeTruthy();
    expect(getByText(/Fotos|Photos/i)).toBeTruthy();
  });

  it('navigates to Call screen when Call button is pressed', () => {
    const { getByRole } = render(
      <SeniorHomeScreen navigation={mockNavigation} />
    );

    const callButton = getByRole('button', { name: /Llamar|Call/i });
    fireEvent.press(callButton);

    expect(mockNavigation.navigate).toHaveBeenCalledWith('Call');
  });

  it('navigates to SOS screen when SOS button is pressed', () => {
    const { getByRole } = render(
      <SeniorHomeScreen navigation={mockNavigation} />
    );

    const sosButton = getByRole('button', { name: /SOS/i });
    fireEvent.press(sosButton);

    expect(mockNavigation.navigate).toHaveBeenCalledWith('SOS');
  });

  it('navigates to Photos screen when Photos button is pressed', () => {
    const { getByRole } = render(
      <SeniorHomeScreen navigation={mockNavigation} />
    );

    const photosButton = getByRole('button', { name: /Fotos|Photos/i });
    fireEvent.press(photosButton);

    expect(mockNavigation.navigate).toHaveBeenCalledWith('Photos');
  });

  it('has accessible buttons with proper roles and labels', () => {
    const { getByRole } = render(
      <SeniorHomeScreen navigation={mockNavigation} />
    );

    // Check that all buttons have proper accessibility roles
    const callButton = getByRole('button', { name: /Llamar|Call/i });
    const sosButton = getByRole('button', { name: /SOS/i });
    const photosButton = getByRole('button', { name: /Fotos|Photos/i });

    expect(callButton).toBeTruthy();
    expect(sosButton).toBeTruthy();
    expect(photosButton).toBeTruthy();
  });
});
