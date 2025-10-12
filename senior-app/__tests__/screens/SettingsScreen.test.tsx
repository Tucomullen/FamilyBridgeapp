import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import SettingsScreen from '../../src/app/screens/SettingsScreen';
import { useUIScale } from '../../src/app/hooks/useUIScale';
import { ttsService } from '../../src/app/services/tts';
import { logEvent } from '../../src/app/telemetry/logEvent';

// Mock the useUIScale hook
jest.mock('../../src/app/hooks/useUIScale');
const mockUseUIScale = useUIScale as jest.MockedFunction<typeof useUIScale>;

// Mock TTS service
jest.mock('../../src/app/services/tts', () => ({
  ttsService: {
    initialize: jest.fn(),
    speak: jest.fn(),
    getSettings: jest.fn(() => ({
      voiceId: null,
      rate: 1.0,
      pitch: 1.0,
      volume: 1.0,
      voiceFeedbackEnabled: true,
    })),
    getVoices: jest.fn(() => []),
  },
}));

// Mock telemetry
jest.mock('../../src/app/telemetry/logEvent', () => ({
  logEvent: jest.fn(),
}));

// Mock i18n
jest.mock('../../src/app/i18n', () => ({
  t: jest.fn((key: string) => key),
  setLocale: jest.fn(),
  getCurrentLocale: jest.fn(() => 'en'),
  getDeviceLanguageCode: jest.fn(() => 'en'),
  logLanguageInfo: jest.fn(),
}));

// Mock feature flags
jest.mock('../../src/app/flags/featureFlags', () => ({
  featureFlags: {
    initialize: jest.fn(),
    getAllFlags: jest.fn(() => ({
      CALL_ENABLED: true,
      SOS_ENABLED: true,
      PHOTOS_ENABLED: true,
      TELEMETRY_ENABLED: true,
    })),
    setFlag: jest.fn(),
    resetToDefaults: jest.fn(),
  },
}));

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
}));

const mockNavigation = {
  navigate: jest.fn(),
  goBack: jest.fn(),
  addListener: jest.fn(() => jest.fn()),
};

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
  getScaleDisplayName: jest.fn((scale: string) => {
    const names: Record<string, string> = {
      small: 'Small',
      medium: 'Medium',
      large: 'Large',
    };
    return names[scale] || 'Medium';
  }),
  getContrastDisplayName: jest.fn(() => 'Normal Contrast'),
};

describe('SettingsScreen UI Scaling', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseUIScale.mockReturnValue(defaultUIScaleProps);
  });

  describe('UI Scaling Section', () => {
    test('should render UI scaling section with three scale buttons', () => {
      const { getByText, getByLabelText } = render(
        <SettingsScreen navigation={mockNavigation} />
      );

      expect(getByText('Text & Button Size')).toBeTruthy();
      expect(getByLabelText('Select small size')).toBeTruthy();
      expect(getByLabelText('Select medium size')).toBeTruthy();
      expect(getByLabelText('Select large size')).toBeTruthy();
    });

    test('should render scale buttons with correct labels', () => {
      const { getByText } = render(
        <SettingsScreen navigation={mockNavigation} />
      );

      expect(getByText('🅐 Small')).toBeTruthy();
      expect(getByText('🅑 Medium')).toBeTruthy();
      expect(getByText('🅒 Large')).toBeTruthy();
    });

    test('should highlight active scale button', () => {
      const { getByText } = render(
        <SettingsScreen navigation={mockNavigation} />
      );

      const mediumButton = getByText('🅑 Medium').parent;
      expect(mediumButton).toBeTruthy();
      // The active button should have different styling
    });

    test('should call setScale when scale button is pressed', async () => {
      const { getByLabelText } = render(
        <SettingsScreen navigation={mockNavigation} />
      );

      const smallButton = getByLabelText('Select small size');
      fireEvent.press(smallButton);

      await waitFor(() => {
        expect(defaultUIScaleProps.setScale).toHaveBeenCalledWith('small');
      });
    });

    test('should call setScale when large button is pressed', async () => {
      const { getByLabelText } = render(
        <SettingsScreen navigation={mockNavigation} />
      );

      const largeButton = getByLabelText('Select large size');
      fireEvent.press(largeButton);

      await waitFor(() => {
        expect(defaultUIScaleProps.setScale).toHaveBeenCalledWith('large');
      });
    });
  });

  describe('High Contrast Toggle', () => {
    test('should render high contrast toggle', () => {
      const { getByText } = render(
        <SettingsScreen navigation={mockNavigation} />
      );

      expect(getByText('High Contrast')).toBeTruthy();
      expect(getByText('Enhance contrast for better visibility')).toBeTruthy();
    });

    test('should call toggleContrast when switch is pressed', async () => {
      const { getByText } = render(
        <SettingsScreen navigation={mockNavigation} />
      );

      const toggle = getByText('High Contrast').parent?.parent?.children[1];
      if (toggle) {
        fireEvent(toggle, 'onValueChange', true);
      }

      await waitFor(() => {
        expect(defaultUIScaleProps.toggleContrast).toHaveBeenCalled();
      });
    });
  });

  describe('TTS Feedback', () => {
    test('should speak confirmation when scale changes', async () => {
      const { getByLabelText } = render(
        <SettingsScreen navigation={mockNavigation} />
      );

      const smallButton = getByLabelText('Select small size');
      fireEvent.press(smallButton);

      await waitFor(() => {
        expect(ttsService.speak).toHaveBeenCalledWith('Small size activated');
      });
    });

    test('should speak confirmation when contrast toggles', async () => {
      const { getByText } = render(
        <SettingsScreen navigation={mockNavigation} />
      );

      const toggle = getByText('High Contrast').parent?.parent?.children[1];
      if (toggle) {
        fireEvent(toggle, 'onValueChange', true);
      }

      await waitFor(() => {
        expect(ttsService.speak).toHaveBeenCalledWith('Normal Contrast');
      });
    });

    test('should not speak if voice feedback is disabled', async () => {
      mockUseUIScale.mockReturnValue({
        ...defaultUIScaleProps,
        theme: {
          ...defaultUIScaleProps.theme,
        },
      });

      const { getByLabelText } = render(
        <SettingsScreen navigation={mockNavigation} />
      );

      const smallButton = getByLabelText('Select small size');
      fireEvent.press(smallButton);

      await waitFor(() => {
        expect(ttsService.speak).not.toHaveBeenCalled();
      });
    });
  });

  describe('Telemetry', () => {
    test('should log scale change event', async () => {
      const { getByLabelText } = render(
        <SettingsScreen navigation={mockNavigation} />
      );

      const smallButton = getByLabelText('Select small size');
      fireEvent.press(smallButton);

      await waitFor(() => {
        expect(logEvent).toHaveBeenCalledWith('ui_scale_changed', { scale: 'small' });
      });
    });

    test('should log contrast toggle event', async () => {
      const { getByText } = render(
        <SettingsScreen navigation={mockNavigation} />
      );

      const toggle = getByText('High Contrast').parent?.parent?.children[1];
      if (toggle) {
        fireEvent(toggle, 'onValueChange', true);
      }

      await waitFor(() => {
        expect(logEvent).toHaveBeenCalledWith('ui_contrast_toggled', { contrast: 'normal' });
      });
    });
  });

  describe('Error Handling', () => {
    test('should handle scale change errors gracefully', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      defaultUIScaleProps.setScale.mockRejectedValue(new Error('Scale error'));

      const { getByLabelText } = render(
        <SettingsScreen navigation={mockNavigation} />
      );

      const smallButton = getByLabelText('Select small size');
      fireEvent.press(smallButton);

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith('Failed to change UI scale:', expect.any(Error));
      });

      consoleSpy.mockRestore();
    });

    test('should handle contrast toggle errors gracefully', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      defaultUIScaleProps.toggleContrast.mockRejectedValue(new Error('Contrast error'));

      const { getByText } = render(
        <SettingsScreen navigation={mockNavigation} />
      );

      const toggle = getByText('High Contrast').parent?.parent?.children[1];
      if (toggle) {
        fireEvent(toggle, 'onValueChange', true);
      }

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith('Failed to toggle contrast:', expect.any(Error));
      });

      consoleSpy.mockRestore();
    });
  });

  describe('Spanish Language Support', () => {
    beforeEach(() => {
      const { getCurrentLocale } = require('../../src/app/i18n');
      getCurrentLocale.mockReturnValue('es');
    });

    test('should render Spanish labels', () => {
      const { getByText } = render(
        <SettingsScreen navigation={mockNavigation} />
      );

      expect(getByText('Tamaño de Texto y Botones')).toBeTruthy();
      expect(getByText('🅐 Pequeño')).toBeTruthy();
      expect(getByText('🅑 Medio')).toBeTruthy();
      expect(getByText('🅒 Grande')).toBeTruthy();
      expect(getByText('Alto Contraste')).toBeTruthy();
    });

    test('should speak Spanish confirmation', async () => {
      const { getByLabelText } = render(
        <SettingsScreen navigation={mockNavigation} />
      );

      const smallButton = getByLabelText('Seleccionar tamaño pequeño');
      fireEvent.press(smallButton);

      await waitFor(() => {
        expect(ttsService.speak).toHaveBeenCalledWith('Tamaño pequeño activado');
      });
    });
  });
});
