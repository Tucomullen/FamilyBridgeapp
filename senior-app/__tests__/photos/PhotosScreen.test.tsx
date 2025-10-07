import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import PhotosScreen from '../../src/app/screens/PhotosScreen';

// Mock the telemetry module
jest.mock('../../src/app/telemetry/logEvent', () => ({
  logEvent: jest.fn(),
}));

const mockNavigation = {
  goBack: jest.fn(),
};

describe('PhotosScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders initial state with first photo', () => {
    const { getByText } = render(
      <PhotosScreen navigation={mockNavigation} />
    );

    expect(getByText(/Fotos|Photos/i)).toBeTruthy();
    expect(getByText(/Familia en Navidad/i)).toBeTruthy();
    expect(getByText(/1 de 6/i)).toBeTruthy();
  });

  it('cycles through photos with Next button', () => {
    const { getByText } = render(
      <PhotosScreen navigation={mockNavigation} />
    );

    // Start with first photo
    expect(getByText(/Familia en Navidad/i)).toBeTruthy();
    expect(getByText(/1 de 6/i)).toBeTruthy();

    const nextButton = getByText(/Siguiente|Next/i);
    fireEvent.press(nextButton);

    // Should show second photo
    expect(getByText(/Cumpleaños de María/i)).toBeTruthy();
    expect(getByText(/2 de 6/i)).toBeTruthy();
  });

  it('wraps around to first photo after last', () => {
    const { getByText } = render(
      <PhotosScreen navigation={mockNavigation} />
    );

    const nextButton = getByText(/Siguiente|Next/i);

    // Go through all photos
    for (let i = 0; i < 6; i++) {
      fireEvent.press(nextButton);
    }

    // Should be back to first photo
    expect(getByText(/Familia en Navidad/i)).toBeTruthy();
    expect(getByText(/1 de 6/i)).toBeTruthy();
  });

  it('allows direct photo selection via thumbnails', () => {
    const { getByText } = render(
      <PhotosScreen navigation={mockNavigation} />
    );

    // Start with first photo
    expect(getByText(/Familia en Navidad/i)).toBeTruthy();

    // Find and press the third thumbnail (index 2)
    const thumbnails = getByText(/🏖️/);
    fireEvent.press(thumbnails);

    // Should show third photo
    expect(getByText(/Vacaciones en la playa/i)).toBeTruthy();
    expect(getByText(/3 de 6/i)).toBeTruthy();
  });

  it('shows correct counter for each photo', () => {
    const { getByText } = render(
      <PhotosScreen navigation={mockNavigation} />
    );

    const nextButton = getByText(/Siguiente|Next/i);

    // Test counter for first few photos
    expect(getByText(/1 de 6/i)).toBeTruthy();

    fireEvent.press(nextButton);
    expect(getByText(/2 de 6/i)).toBeTruthy();

    fireEvent.press(nextButton);
    expect(getByText(/3 de 6/i)).toBeTruthy();
  });

  it('navigates back', () => {
    const { getByText } = render(
      <PhotosScreen navigation={mockNavigation} />
    );

    const backButton = getByText(/Atrás|Back/i);
    fireEvent.press(backButton);

    expect(mockNavigation.goBack).toHaveBeenCalled();
  });

  it('has accessible thumbnails', () => {
    const { getByLabelText } = render(
      <PhotosScreen navigation={mockNavigation} />
    );

    // Check that thumbnails have proper accessibility labels
    expect(getByLabelText(/Ver Familia en Navidad/i)).toBeTruthy();
    expect(getByLabelText(/Ver Cumpleaños de María/i)).toBeTruthy();
  });
});
