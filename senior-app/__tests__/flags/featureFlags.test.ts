import AsyncStorage from '@react-native-async-storage/async-storage';
import { featureFlags, DEFAULT_FLAGS } from '../../src/app/flags/featureFlags';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
}));

describe('FeatureFlags', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset the singleton instance
    (featureFlags as any).initialized = false;
    (featureFlags as any).flags = { ...DEFAULT_FLAGS };
  });

  it('initializes with default flags', async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
    
    await featureFlags.initialize();
    
    expect(featureFlags.isEnabled('CALL_ENABLED')).toBe(true);
    expect(featureFlags.isEnabled('SOS_ENABLED')).toBe(true);
    expect(featureFlags.isEnabled('PHOTOS_ENABLED')).toBe(true);
    expect(featureFlags.isEnabled('TELEMETRY_ENABLED')).toBe(true);
  });

  it('loads stored flags from AsyncStorage', async () => {
    const storedFlags = {
      CALL_ENABLED: false,
      SOS_ENABLED: true,
      PHOTOS_ENABLED: false,
      TELEMETRY_ENABLED: true,
    };
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(storedFlags));
    
    await featureFlags.initialize();
    
    expect(featureFlags.isEnabled('CALL_ENABLED')).toBe(false);
    expect(featureFlags.isEnabled('SOS_ENABLED')).toBe(true);
    expect(featureFlags.isEnabled('PHOTOS_ENABLED')).toBe(false);
    expect(featureFlags.isEnabled('TELEMETRY_ENABLED')).toBe(true);
  });

  it('sets and persists flag changes', async () => {
    await featureFlags.initialize();
    
    await featureFlags.setFlag('CALL_ENABLED', false);
    
    expect(featureFlags.isEnabled('CALL_ENABLED')).toBe(false);
    expect(AsyncStorage.setItem).toHaveBeenCalledWith(
      'featureFlags',
      JSON.stringify({
        ...DEFAULT_FLAGS,
        CALL_ENABLED: false,
      })
    );
  });

  it('returns all flags', async () => {
    await featureFlags.initialize();
    
    const allFlags = featureFlags.getAllFlags();
    
    expect(allFlags).toEqual(DEFAULT_FLAGS);
  });

  it('resets to defaults', async () => {
    await featureFlags.initialize();
    await featureFlags.setFlag('CALL_ENABLED', false);
    
    await featureFlags.resetToDefaults();
    
    expect(featureFlags.isEnabled('CALL_ENABLED')).toBe(true);
    expect(AsyncStorage.setItem).toHaveBeenCalledWith(
      'featureFlags',
      JSON.stringify(DEFAULT_FLAGS)
    );
  });

  it('handles AsyncStorage errors gracefully', async () => {
    (AsyncStorage.getItem as jest.Mock).mockRejectedValue(new Error('Storage error'));
    
    await featureFlags.initialize();
    
    // Should still work with defaults
    expect(featureFlags.isEnabled('CALL_ENABLED')).toBe(true);
  });
});
