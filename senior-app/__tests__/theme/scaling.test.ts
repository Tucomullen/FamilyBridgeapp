import {
  createScaledTheme,
  getResponsiveFontSize,
  getResponsiveSpacing,
  getResponsiveButtonHeight,
  isHighContrast,
  getAccessibleColor,
  getScaleDisplayName,
  getContrastDisplayName,
  defaultScaledTheme,
} from '../../src/app/theme/scaling';
import { UIScale, ContrastMode } from '../../src/app/services/UIScaleManager';

describe('Scaling Theme', () => {
  describe('createScaledTheme', () => {
    test('should create theme with medium scale and normal contrast', () => {
      const theme = createScaledTheme('medium', 'normal');

      expect(theme.fontSize.medium).toBe(18);
      expect(theme.button.height.medium).toBe(56);
      expect(theme.colors.normal.primary).toBe('#007AFF');
      expect(theme.colors.high.primary).toBe('#0000FF');
    });

    test('should create theme with small scale', () => {
      const theme = createScaledTheme('small', 'normal');

      expect(theme.fontSize.small).toBe(11); // 14 * 0.8
      expect(theme.fontSize.medium).toBe(14); // 18 * 0.8
      expect(theme.fontSize.large).toBe(18); // 22 * 0.8
      expect(theme.button.height.small).toBe(48); // max(48, 48 * 0.8)
      expect(theme.button.height.medium).toBe(48); // max(48, 56 * 0.8)
      expect(theme.button.height.large).toBe(51); // max(48, 64 * 0.8)
    });

    test('should create theme with large scale', () => {
      const theme = createScaledTheme('large', 'normal');

      expect(theme.fontSize.small).toBe(17); // 14 * 1.2
      expect(theme.fontSize.medium).toBe(22); // 18 * 1.2
      expect(theme.fontSize.large).toBe(26); // 22 * 1.2
      expect(theme.button.height.small).toBe(58); // max(48, 48 * 1.2)
      expect(theme.button.height.medium).toBe(67); // max(48, 56 * 1.2)
      expect(theme.button.height.large).toBe(77); // max(48, 64 * 1.2)
    });

    test('should create theme with high contrast', () => {
      const theme = createScaledTheme('medium', 'high');

      expect(theme.colors.high.primary).toBe('#0000FF');
      expect(theme.colors.high.text).toBe('#000000');
      expect(theme.colors.high.background).toBe('#FFFFFF');
    });

    test('should ensure minimum touch target size', () => {
      const smallTheme = createScaledTheme('small', 'normal');
      const largeTheme = createScaledTheme('large', 'normal');

      expect(smallTheme.touchTarget.minSize).toBe(48);
      expect(smallTheme.touchTarget.recommended).toBeGreaterThanOrEqual(48);
      expect(largeTheme.touchTarget.minSize).toBe(48);
      expect(largeTheme.touchTarget.recommended).toBeGreaterThanOrEqual(48);
    });
  });

  describe('getResponsiveFontSize', () => {
    test('should return scaled font size', () => {
      expect(getResponsiveFontSize('small', 16)).toBe(13); // 16 * 0.8
      expect(getResponsiveFontSize('medium', 16)).toBe(16); // 16 * 1.0
      expect(getResponsiveFontSize('large', 16)).toBe(19); // 16 * 1.2
    });
  });

  describe('getResponsiveSpacing', () => {
    test('should return scaled spacing', () => {
      expect(getResponsiveSpacing('small', 20)).toBe(16); // 20 * 0.8
      expect(getResponsiveSpacing('medium', 20)).toBe(20); // 20 * 1.0
      expect(getResponsiveSpacing('large', 20)).toBe(24); // 20 * 1.2
    });
  });

  describe('getResponsiveButtonHeight', () => {
    test('should return scaled button height with minimum touch target', () => {
      expect(getResponsiveButtonHeight('small', 40)).toBe(48); // max(48, 40 * 0.8)
      expect(getResponsiveButtonHeight('medium', 40)).toBe(40); // max(48, 40 * 1.0)
      expect(getResponsiveButtonHeight('large', 40)).toBe(48); // max(48, 40 * 1.2)
    });
  });

  describe('isHighContrast', () => {
    test('should return correct contrast status', () => {
      expect(isHighContrast('normal')).toBe(false);
      expect(isHighContrast('high')).toBe(true);
    });
  });

  describe('getAccessibleColor', () => {
    test('should return original color for normal contrast', () => {
      const color = getAccessibleColor('#007AFF', 'normal', '#000000');
      expect(color).toBe('#007AFF');
    });

    test('should return fallback color for high contrast', () => {
      const color = getAccessibleColor('#007AFF', 'high', '#000000');
      expect(color).toBe('#000000');
    });
  });

  describe('getScaleDisplayName', () => {
    test('should return English display names', () => {
      expect(getScaleDisplayName('small', 'en')).toBe('Small');
      expect(getScaleDisplayName('medium', 'en')).toBe('Medium');
      expect(getScaleDisplayName('large', 'en')).toBe('Large');
    });

    test('should return Spanish display names', () => {
      expect(getScaleDisplayName('small', 'es')).toBe('Pequeño');
      expect(getScaleDisplayName('medium', 'es')).toBe('Medio');
      expect(getScaleDisplayName('large', 'es')).toBe('Grande');
    });

    test('should default to English', () => {
      expect(getScaleDisplayName('small')).toBe('Small');
      expect(getScaleDisplayName('medium')).toBe('Medium');
      expect(getScaleDisplayName('large')).toBe('Large');
    });
  });

  describe('getContrastDisplayName', () => {
    test('should return English display names', () => {
      expect(getContrastDisplayName('normal', 'en')).toBe('Normal Contrast');
      expect(getContrastDisplayName('high', 'en')).toBe('High Contrast');
    });

    test('should return Spanish display names', () => {
      expect(getContrastDisplayName('normal', 'es')).toBe('Contraste Normal');
      expect(getContrastDisplayName('high', 'es')).toBe('Alto Contraste');
    });

    test('should default to English', () => {
      expect(getContrastDisplayName('normal')).toBe('Normal Contrast');
      expect(getContrastDisplayName('high')).toBe('High Contrast');
    });
  });

  describe('defaultScaledTheme', () => {
    test('should be a valid theme', () => {
      expect(defaultScaledTheme).toBeDefined();
      expect(defaultScaledTheme.fontSize.medium).toBe(18);
      expect(defaultScaledTheme.button.height.medium).toBe(56);
      expect(defaultScaledTheme.colors.normal.primary).toBe('#007AFF');
    });
  });

  describe('Theme Structure', () => {
    test('should have all required properties', () => {
      const theme = createScaledTheme('medium', 'normal');

      expect(theme.fontSize).toBeDefined();
      expect(theme.lineHeight).toBeDefined();
      expect(theme.spacing).toBeDefined();
      expect(theme.button).toBeDefined();
      expect(theme.touchTarget).toBeDefined();
      expect(theme.colors).toBeDefined();

      // Check fontSize structure
      expect(theme.fontSize.small).toBeDefined();
      expect(theme.fontSize.medium).toBeDefined();
      expect(theme.fontSize.large).toBeDefined();
      expect(theme.fontSize.xlarge).toBeDefined();
      expect(theme.fontSize.xxlarge).toBeDefined();

      // Check spacing structure
      expect(theme.spacing.xs).toBeDefined();
      expect(theme.spacing.sm).toBeDefined();
      expect(theme.spacing.md).toBeDefined();
      expect(theme.spacing.lg).toBeDefined();
      expect(theme.spacing.xl).toBeDefined();
      expect(theme.spacing.xxl).toBeDefined();

      // Check button structure
      expect(theme.button.height.small).toBeDefined();
      expect(theme.button.height.medium).toBeDefined();
      expect(theme.button.height.large).toBeDefined();
      expect(theme.button.padding.horizontal).toBeDefined();
      expect(theme.button.padding.vertical).toBeDefined();
      expect(theme.button.borderRadius).toBeDefined();

      // Check colors structure
      expect(theme.colors.normal).toBeDefined();
      expect(theme.colors.high).toBeDefined();
      expect(theme.colors.normal.primary).toBeDefined();
      expect(theme.colors.normal.text).toBeDefined();
      expect(theme.colors.high.primary).toBeDefined();
      expect(theme.colors.high.text).toBeDefined();
    });
  });
});
