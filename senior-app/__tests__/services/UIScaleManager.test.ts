import { uiScaleManager, UIScale, ContrastMode } from '../../src/app/services/UIScaleManager';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
}));

// Mock EventEmitter
jest.mock('events', () => {
  return {
    EventEmitter: jest.fn().mockImplementation(() => ({
      on: jest.fn(),
      off: jest.fn(),
      emit: jest.fn(),
    })),
  };
});

describe('UIScaleManager', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset singleton instance
    (uiScaleManager as any).isInitialized = false;
  });

  describe('Initialization', () => {
    test('should initialize with default values', async () => {
      const { AsyncStorage } = require('@react-native-async-storage/async-storage');
      AsyncStorage.getItem.mockResolvedValue(null);

      await uiScaleManager.initialize();

      expect(uiScaleManager.getCurrentScale()).toBe('medium');
      expect(uiScaleManager.getCurrentContrast()).toBe('normal');
    });

    test('should load saved configuration', async () => {
      const { AsyncStorage } = require('@react-native-async-storage/async-storage');
      const savedConfig = {
        scale: 'large',
        contrast: 'high',
      };
      AsyncStorage.getItem.mockResolvedValue(JSON.stringify(savedConfig));

      await uiScaleManager.initialize();

      expect(uiScaleManager.getCurrentScale()).toBe('large');
      expect(uiScaleManager.getCurrentContrast()).toBe('high');
    });

    test('should handle initialization errors gracefully', async () => {
      const { AsyncStorage } = require('@react-native-async-storage/async-storage');
      AsyncStorage.getItem.mockRejectedValue(new Error('Storage error'));

      await uiScaleManager.initialize();

      expect(uiScaleManager.getCurrentScale()).toBe('medium');
      expect(uiScaleManager.getCurrentContrast()).toBe('normal');
    });
  });

  describe('Scale Management', () => {
    beforeEach(async () => {
      const { AsyncStorage } = require('@react-native-async-storage/async-storage');
      AsyncStorage.getItem.mockResolvedValue(null);
      await uiScaleManager.initialize();
    });

    test('should set scale and persist to storage', async () => {
      const { AsyncStorage } = require('@react-native-async-storage/async-storage');
      const emitSpy = jest.spyOn(uiScaleManager as any, 'emit');

      await uiScaleManager.setScale('large');

      expect(uiScaleManager.getCurrentScale()).toBe('large');
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        'ui_scale_config',
        JSON.stringify({ scale: 'large', contrast: 'normal' })
      );
      expect(emitSpy).toHaveBeenCalledWith('scaleChanged', 'large');
    });

    test('should handle scale setting errors', async () => {
      const { AsyncStorage } = require('@react-native-async-storage/async-storage');
      AsyncStorage.setItem.mockRejectedValue(new Error('Storage error'));

      await uiScaleManager.setScale('small');

      expect(uiScaleManager.getCurrentScale()).toBe('small');
    });

    test('should get scale display names', () => {
      expect(uiScaleManager.getScaleDisplayName('small', 'en')).toBe('Small');
      expect(uiScaleManager.getScaleDisplayName('medium', 'en')).toBe('Medium');
      expect(uiScaleManager.getScaleDisplayName('large', 'en')).toBe('Large');
      expect(uiScaleManager.getScaleDisplayName('small', 'es')).toBe('Pequeño');
      expect(uiScaleManager.getScaleDisplayName('medium', 'es')).toBe('Medio');
      expect(uiScaleManager.getScaleDisplayName('large', 'es')).toBe('Grande');
    });
  });

  describe('Contrast Management', () => {
    beforeEach(async () => {
      const { AsyncStorage } = require('@react-native-async-storage/async-storage');
      AsyncStorage.getItem.mockResolvedValue(null);
      await uiScaleManager.initialize();
    });

    test('should toggle contrast and persist to storage', async () => {
      const { AsyncStorage } = require('@react-native-async-storage/async-storage');
      const emitSpy = jest.spyOn(uiScaleManager as any, 'emit');

      await uiScaleManager.toggleContrast();

      expect(uiScaleManager.getCurrentContrast()).toBe('high');
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        'ui_scale_config',
        JSON.stringify({ scale: 'medium', contrast: 'high' })
      );
      expect(emitSpy).toHaveBeenCalledWith('contrastChanged', 'high');
    });

    test('should toggle back to normal contrast', async () => {
      await uiScaleManager.toggleContrast(); // Set to high
      await uiScaleManager.toggleContrast(); // Toggle back

      expect(uiScaleManager.getCurrentContrast()).toBe('normal');
    });

    test('should get contrast display names', () => {
      expect(uiScaleManager.getContrastDisplayName('en')).toBe('Normal Contrast');
      expect(uiScaleManager.getContrastDisplayName('es')).toBe('Contraste Normal');

      uiScaleManager.toggleContrast();
      expect(uiScaleManager.getContrastDisplayName('en')).toBe('High Contrast');
      expect(uiScaleManager.getContrastDisplayName('es')).toBe('Alto Contraste');
    });
  });

  describe('Scale Values', () => {
    beforeEach(async () => {
      const { AsyncStorage } = require('@react-native-async-storage/async-storage');
      AsyncStorage.getItem.mockResolvedValue(null);
      await uiScaleManager.initialize();
    });

    test('should return correct scale values', () => {
      const scaleValues = uiScaleManager.getScaleValues();

      expect(scaleValues.fontSize.small).toBe(14);
      expect(scaleValues.fontSize.medium).toBe(18);
      expect(scaleValues.fontSize.large).toBe(22);
      expect(scaleValues.buttonHeight.small).toBe(48);
      expect(scaleValues.buttonHeight.medium).toBe(56);
      expect(scaleValues.buttonHeight.large).toBe(64);
    });

    test('should return current scale-specific values', () => {
      expect(uiScaleManager.getCurrentFontSize()).toBe(18); // medium
      expect(uiScaleManager.getCurrentButtonHeight()).toBe(56); // medium
      expect(uiScaleManager.getCurrentPadding()).toBe(12); // medium
      expect(uiScaleManager.getCurrentMargin()).toBe(8); // medium

      uiScaleManager.setScale('large');
      expect(uiScaleManager.getCurrentFontSize()).toBe(22); // large
      expect(uiScaleManager.getCurrentButtonHeight()).toBe(64); // large
    });

    test('should return scale multiplier', () => {
      expect(uiScaleManager.getScaleMultiplier()).toBe(1.0); // medium

      uiScaleManager.setScale('small');
      expect(uiScaleManager.getScaleMultiplier()).toBe(0.8);

      uiScaleManager.setScale('large');
      expect(uiScaleManager.getScaleMultiplier()).toBe(1.2);
    });
  });

  describe('Contrast Colors', () => {
    beforeEach(async () => {
      const { AsyncStorage } = require('@react-native-async-storage/async-storage');
      AsyncStorage.getItem.mockResolvedValue(null);
      await uiScaleManager.initialize();
    });

    test('should return contrast colors', () => {
      const contrastColors = uiScaleManager.getContrastColors();

      expect(contrastColors.normal.primary).toBe('#007AFF');
      expect(contrastColors.high.primary).toBe('#0000FF');
    });

    test('should return current colors based on contrast mode', () => {
      const normalColors = uiScaleManager.getCurrentColors();
      expect(normalColors.primary).toBe('#007AFF');

      uiScaleManager.toggleContrast();
      const highColors = uiScaleManager.getCurrentColors();
      expect(highColors.primary).toBe('#0000FF');
    });
  });

  describe('Accessibility', () => {
    beforeEach(async () => {
      const { AsyncStorage } = require('@react-native-async-storage/async-storage');
      AsyncStorage.getItem.mockResolvedValue(null);
      await uiScaleManager.initialize();
    });

    test('should return accessible touch target size', () => {
      const touchTarget = uiScaleManager.getAccessibleTouchTarget();
      expect(touchTarget).toBeGreaterThanOrEqual(48);
    });

    test('should check if high contrast is enabled', () => {
      expect(uiScaleManager.isHighContrast()).toBe(false);

      uiScaleManager.toggleContrast();
      expect(uiScaleManager.isHighContrast()).toBe(true);
    });
  });

  describe('Reset Functionality', () => {
    beforeEach(async () => {
      const { AsyncStorage } = require('@react-native-async-storage/async-storage');
      AsyncStorage.getItem.mockResolvedValue(null);
      await uiScaleManager.initialize();
    });

    test('should reset to defaults', async () => {
      const { AsyncStorage } = require('@react-native-async-storage/async-storage');
      const emitSpy = jest.spyOn(uiScaleManager as any, 'emit');

      // Set some values first
      await uiScaleManager.setScale('large');
      await uiScaleManager.toggleContrast();

      // Reset to defaults
      await uiScaleManager.resetToDefaults();

      expect(uiScaleManager.getCurrentScale()).toBe('medium');
      expect(uiScaleManager.getCurrentContrast()).toBe('normal');
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        'ui_scale_config',
        JSON.stringify({ scale: 'medium', contrast: 'normal' })
      );
      expect(emitSpy).toHaveBeenCalledWith('scaleChanged', 'medium');
      expect(emitSpy).toHaveBeenCalledWith('contrastChanged', 'normal');
    });
  });

  describe('Error Handling', () => {
    test('should handle storage errors gracefully', async () => {
      const { AsyncStorage } = require('@react-native-async-storage/async-storage');
      AsyncStorage.getItem.mockRejectedValue(new Error('Storage error'));
      AsyncStorage.setItem.mockRejectedValue(new Error('Storage error'));

      await uiScaleManager.initialize();
      await uiScaleManager.setScale('large');
      await uiScaleManager.toggleContrast();

      // Should not throw errors
      expect(uiScaleManager.getCurrentScale()).toBe('large');
      expect(uiScaleManager.getCurrentContrast()).toBe('high');
    });
  });
});
