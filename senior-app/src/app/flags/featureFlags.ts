import AsyncStorage from '@react-native-async-storage/async-storage';

export type FeatureFlag = 'CALL_ENABLED' | 'SOS_ENABLED' | 'PHOTOS_ENABLED' | 'TELEMETRY_ENABLED';

export const DEFAULT_FLAGS: Record<FeatureFlag, boolean> = {
  CALL_ENABLED: true,
  SOS_ENABLED: true,
  PHOTOS_ENABLED: true,
  TELEMETRY_ENABLED: true,
};

class FeatureFlagManager {
  private flags: Record<FeatureFlag, boolean> = { ...DEFAULT_FLAGS };
  private initialized = false;

  async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      const stored = await AsyncStorage.getItem('featureFlags');
      if (stored) {
        const parsed = JSON.parse(stored);
        this.flags = { ...DEFAULT_FLAGS, ...parsed };
      }
    } catch (error) {
      console.warn('Failed to load feature flags, using defaults:', error);
    }

    this.initialized = true;
  }

  isEnabled(flag: FeatureFlag): boolean {
    return this.flags[flag] ?? DEFAULT_FLAGS[flag];
  }

  async setFlag(flag: FeatureFlag, enabled: boolean): Promise<void> {
    this.flags[flag] = enabled;
    
    try {
      await AsyncStorage.setItem('featureFlags', JSON.stringify(this.flags));
    } catch (error) {
      console.warn('Failed to save feature flags:', error);
    }
  }

  getAllFlags(): Record<FeatureFlag, boolean> {
    return { ...this.flags };
  }

  async resetToDefaults(): Promise<void> {
    this.flags = { ...DEFAULT_FLAGS };
    
    try {
      await AsyncStorage.setItem('featureFlags', JSON.stringify(this.flags));
    } catch (error) {
      console.warn('Failed to reset feature flags:', error);
    }
  }
}

export const featureFlags = new FeatureFlagManager();
