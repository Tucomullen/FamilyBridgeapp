import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import Breadcrumbs from '../../../src/app/components/nav/Breadcrumbs';
import { useUIScale } from '../../../src/app/hooks/useUIScale';

// Mock the useUIScale hook
jest.mock('../../../src/app/hooks/useUIScale');
const mockUseUIScale = useUIScale as jest.MockedFunction<typeof useUIScale>;

// Mock i18n
jest.mock('../../../src/app/i18n', () => ({
  t: jest.fn((key: string) => key),
}));

const defaultUIScaleProps = {
  scale: 'medium' as const,
  contrast: 'normal' as const,
  theme: {
    fontSize: {
      small: 14,
      medium: 18,
      large: 22,
      xlarge: 24,
      xxlarge: 28,
    },
    lineHeight: {
      small: 20,
      medium: 25,
      large: 31,
      xlarge: 34,
      xxlarge: 39,
    },
    spacing: {
      xs: 4,
      sm: 8,
      md: 12,
      lg: 16,
      xl: 24,
      xxl: 32,
    },
    button: {
      height: {
        small: 48,
        medium: 56,
        large: 64,
      },
      padding: {
        horizontal: 16,
        vertical: 12,
      },
      borderRadius: 8,
    },
    touchTarget: {
      minSize: 48,
      recommended: 56,
    },
    colors: {
      normal: {
        primary: '#007AFF',
        secondary: '#5856D6',
        text: '#000000',
        textSecondary: '#666666',
        background: '#FFFFFF',
        surface: '#F8F9FA',
        button: '#007AFF',
        buttonText: '#FFFFFF',
        border: '#E1E5E9',
        success: '#34C759',
        warning: '#FF9500',
        error: '#FF3B30',
      },
      high: {
        primary: '#0000FF',
        secondary: '#000080',
        text: '#000000',
        textSecondary: '#000000',
        background: '#FFFFFF',
        surface: '#FFFFFF',
        button: '#0000FF',
        buttonText: '#FFFFFF',
        border: '#000000',
        success: '#000000',
        warning: '#000000',
        error: '#000000',
      },
    },
  },
  setScale: jest.fn(),
  toggleContrast: jest.fn(),
  isHighContrast: false,
  getScaleDisplayName: jest.fn(),
  getContrastDisplayName: jest.fn(),
};

describe('Breadcrumbs', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseUIScale.mockReturnValue(defaultUIScaleProps);
  });

  describe('Single Item', () => {
    test('should render single breadcrumb item', () => {
      const trail = [
        { label: 'Inicio', screen: 'Home' }
      ];

      const { getByText } = render(<Breadcrumbs trail={trail} />);

      expect(getByText('Inicio')).toBeTruthy();
    });

    test('should not show separator for single item', () => {
      const trail = [
        { label: 'Inicio', screen: 'Home' }
      ];

      const { queryByText } = render(<Breadcrumbs trail={trail} />);

      expect(queryByText('›')).toBeNull();
    });
  });

  describe('Two Items', () => {
    test('should render two breadcrumb items with separator', () => {
      const trail = [
        { label: 'Inicio', screen: 'Home', onPress: jest.fn() },
        { label: 'Fotos', screen: 'Photos' }
      ];

      const { getByText } = render(<Breadcrumbs trail={trail} />);

      expect(getByText('Inicio')).toBeTruthy();
      expect(getByText('Fotos')).toBeTruthy();
      expect(getByText('›')).toBeTruthy();
    });

    test('should make first item clickable when onPress provided', () => {
      const onPress = jest.fn();
      const trail = [
        { label: 'Inicio', screen: 'Home', onPress },
        { label: 'Fotos', screen: 'Photos' }
      ];

      const { getByText } = render(<Breadcrumbs trail={trail} />);

      const clickableItem = getByText('Inicio');
      fireEvent.press(clickableItem);

      expect(onPress).toHaveBeenCalled();
    });

    test('should not make second item clickable', () => {
      const onPress = jest.fn();
      const trail = [
        { label: 'Inicio', screen: 'Home', onPress },
        { label: 'Fotos', screen: 'Photos' }
      ];

      const { getByText } = render(<Breadcrumbs trail={trail} />);

      const nonClickableItem = getByText('Fotos');
      fireEvent.press(nonClickableItem);

      expect(onPress).not.toHaveBeenCalled();
    });
  });

  describe('Truncation', () => {
    test('should truncate when more than max levels', () => {
      const trail = [
        { label: 'Inicio', screen: 'Home', onPress: jest.fn() },
        { label: 'Fotos', screen: 'Photos', onPress: jest.fn() },
        { label: 'Ajustes', screen: 'Settings' }
      ];

      const { getByText, queryByText } = render(
        <Breadcrumbs trail={trail} maxLevels={2} />
      );

      expect(getByText('…')).toBeTruthy();
      expect(getByText('Fotos')).toBeTruthy();
      expect(getByText('Ajustes')).toBeTruthy();
      expect(queryByText('Inicio')).toBeNull();
    });

    test('should show ellipsis for truncated items', () => {
      const trail = [
        { label: 'Inicio', screen: 'Home', onPress: jest.fn() },
        { label: 'Fotos', screen: 'Photos', onPress: jest.fn() },
        { label: 'Ajustes', screen: 'Settings' }
      ];

      const { getByText } = render(
        <Breadcrumbs trail={trail} maxLevels={2} />
      );

      expect(getByText('…')).toBeTruthy();
    });
  });

  describe('Accessibility', () => {
    test('should have correct accessibility roles', () => {
      const trail = [
        { label: 'Inicio', screen: 'Home', onPress: jest.fn() },
        { label: 'Fotos', screen: 'Photos' }
      ];

      const { getByLabelText } = render(<Breadcrumbs trail={trail} />);

      expect(getByLabelText('nav.back Inicio')).toBeTruthy();
      expect(getByLabelText('nav.youAreHere Fotos')).toBeTruthy();
    });

    test('should have correct accessibility roles for single item', () => {
      const trail = [
        { label: 'Inicio', screen: 'Home' }
      ];

      const { getByLabelText } = render(<Breadcrumbs trail={trail} />);

      expect(getByLabelText('nav.youAreHere Inicio')).toBeTruthy();
    });
  });

  describe('Empty Trail', () => {
    test('should render nothing for empty trail', () => {
      const { queryByText } = render(<Breadcrumbs trail={[]} />);

      expect(queryByText('Inicio')).toBeNull();
    });
  });

  describe('High Contrast Mode', () => {
    test('should use high contrast colors when enabled', () => {
      mockUseUIScale.mockReturnValue({
        ...defaultUIScaleProps,
        isHighContrast: true,
      });

      const trail = [
        { label: 'Inicio', screen: 'Home', onPress: jest.fn() },
        { label: 'Fotos', screen: 'Photos' }
      ];

      const { getByText } = render(<Breadcrumbs trail={trail} />);

      const clickableItem = getByText('Inicio');
      expect(clickableItem).toBeTruthy();
    });
  });

  describe('Custom Max Levels', () => {
    test('should respect custom max levels', () => {
      const trail = [
        { label: 'A', screen: 'A', onPress: jest.fn() },
        { label: 'B', screen: 'B', onPress: jest.fn() },
        { label: 'C', screen: 'C', onPress: jest.fn() },
        { label: 'D', screen: 'D' }
      ];

      const { getByText, queryByText } = render(
        <Breadcrumbs trail={trail} maxLevels={1} />
      );

      expect(getByText('D')).toBeTruthy();
      expect(queryByText('A')).toBeNull();
      expect(queryByText('B')).toBeNull();
      expect(queryByText('C')).toBeNull();
    });
  });
});
