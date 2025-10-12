import AsyncStorage from '@react-native-async-storage/async-storage';

export type UIScale = 'small' | 'medium' | 'large';
export type ContrastMode = 'normal' | 'high';

export interface UIScaleConfig {
  scale: UIScale;
  contrast: ContrastMode;
}

export interface ScaleValues {
  fontSize: {
    small: number;
    medium: number;
    large: number;
  };
  buttonHeight: {
    small: number;
    medium: number;
    large: number;
  };
  padding: {
    small: number;
    medium: number;
    large: number;
  };
  margin: {
    small: number;
    medium: number;
    large: number;
  };
}

export interface ContrastColors {
  normal: {
    primary: string;
    secondary: string;
    text: string;
    background: string;
    button: string;
    buttonText: string;
  };
  high: {
    primary: string;
    secondary: string;
    text: string;
    background: string;
    button: string;
    buttonText: string;
  };
}

class UIScaleManager {
  private listeners: { [key: string]: Function[] } = {};
  private static instance: UIScaleManager;
  private currentScale: UIScale = 'medium';
  private currentContrast: ContrastMode = 'normal';
  private isInitialized = false;

  // Scale configuration values
  private scaleValues: ScaleValues = {
    fontSize: {
      small: 14,
      medium: 18,
      large: 22,
    },
    buttonHeight: {
      small: 48,
      medium: 56,
      large: 64,
    },
    padding: {
      small: 8,
      medium: 12,
      large: 16,
    },
    margin: {
      small: 4,
      medium: 8,
      large: 12,
    },
  };

  // Contrast color schemes
  private contrastColors: ContrastColors = {
    normal: {
      primary: '#007AFF',
      secondary: '#5856D6',
      text: '#000000',
      background: '#FFFFFF',
      button: '#007AFF',
      buttonText: '#FFFFFF',
    },
    high: {
      primary: '#0000FF',
      secondary: '#000080',
      text: '#000000',
      background: '#FFFFFF',
      button: '#0000FF',
      buttonText: '#FFFFFF',
    },
  };

  private constructor() {}

  public on(event: string, listener: Function): void {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(listener);
  }

  public off(event: string, listener: Function): void {
    if (!this.listeners[event]) return;
    this.listeners[event] = this.listeners[event].filter(l => l !== listener);
  }

  public emit(event: string, ...args: any[]): void {
    if (!this.listeners[event]) return;
    this.listeners[event].forEach(listener => listener(...args));
  }

  public static getInstance(): UIScaleManager {
    if (!UIScaleManager.instance) {
      UIScaleManager.instance = new UIScaleManager();
    }
    return UIScaleManager.instance;
  }

  /**
   * Initialize the UI Scale Manager
   * Loads saved preferences from AsyncStorage
   */
  public async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      const savedConfig = await AsyncStorage.getItem('ui_scale_config');
      if (savedConfig) {
        const config: UIScaleConfig = JSON.parse(savedConfig);
        this.currentScale = config.scale || 'medium';
        this.currentContrast = config.contrast || 'normal';
      }
      this.isInitialized = true;
      console.log('🎨 UIScaleManager initialized:', { scale: this.currentScale, contrast: this.currentContrast });
    } catch (error) {
      console.error('🎨 Failed to initialize UIScaleManager:', error);
      this.currentScale = 'medium';
      this.currentContrast = 'normal';
      this.isInitialized = true;
    }
  }

  /**
   * Get the current UI scale
   */
  public getCurrentScale(): UIScale {
    return this.currentScale;
  }

  /**
   * Set the UI scale and persist to storage
   */
  public async setScale(scale: UIScale): Promise<void> {
    try {
      this.currentScale = scale;
      await this.saveConfig();
      this.emit('scaleChanged', scale);
      console.log('🎨 UI scale changed to:', scale);
    } catch (error) {
      console.error('🎨 Failed to set UI scale:', error);
    }
  }

  /**
   * Get the current contrast mode
   */
  public getCurrentContrast(): ContrastMode {
    return this.currentContrast;
  }

  /**
   * Toggle contrast mode and persist to storage
   */
  public async toggleContrast(): Promise<void> {
    try {
      this.currentContrast = this.currentContrast === 'normal' ? 'high' : 'normal';
      await this.saveConfig();
      this.emit('contrastChanged', this.currentContrast);
      console.log('🎨 Contrast mode changed to:', this.currentContrast);
    } catch (error) {
      console.error('🎨 Failed to toggle contrast:', error);
    }
  }

  /**
   * Get scale-specific values
   */
  public getScaleValues(): ScaleValues {
    return this.scaleValues;
  }

  /**
   * Get current scale-specific font size
   */
  public getCurrentFontSize(): number {
    return this.scaleValues.fontSize[this.currentScale];
  }

  /**
   * Get current scale-specific button height
   */
  public getCurrentButtonHeight(): number {
    return this.scaleValues.buttonHeight[this.currentScale];
  }

  /**
   * Get current scale-specific padding
   */
  public getCurrentPadding(): number {
    return this.scaleValues.padding[this.currentScale];
  }

  /**
   * Get current scale-specific margin
   */
  public getCurrentMargin(): number {
    return this.scaleValues.margin[this.currentScale];
  }

  /**
   * Get contrast-specific colors
   */
  public getContrastColors(): ContrastColors {
    return this.contrastColors;
  }

  /**
   * Get current contrast colors
   */
  public getCurrentColors() {
    return this.contrastColors[this.currentContrast];
  }

  /**
   * Get scale multiplier (1.0 for medium, 0.8 for small, 1.2 for large)
   */
  public getScaleMultiplier(): number {
    switch (this.currentScale) {
      case 'small':
        return 0.8;
      case 'medium':
        return 1.0;
      case 'large':
        return 1.2;
      default:
        return 1.0;
    }
  }

  /**
   * Check if high contrast is enabled
   */
  public isHighContrast(): boolean {
    return this.currentContrast === 'high';
  }

  /**
   * Get accessibility-friendly touch target size (minimum 48px)
   */
  public getAccessibleTouchTarget(): number {
    const baseSize = this.getCurrentButtonHeight();
    return Math.max(baseSize, 48);
  }

  /**
   * Save current configuration to AsyncStorage
   */
  private async saveConfig(): Promise<void> {
    try {
      const config: UIScaleConfig = {
        scale: this.currentScale,
        contrast: this.currentContrast,
      };
      await AsyncStorage.setItem('ui_scale_config', JSON.stringify(config));
    } catch (error) {
      console.error('🎨 Failed to save UI scale config:', error);
    }
  }

  /**
   * Reset to default settings
   */
  public async resetToDefaults(): Promise<void> {
    try {
      this.currentScale = 'medium';
      this.currentContrast = 'normal';
      await this.saveConfig();
      this.emit('scaleChanged', this.currentScale);
      this.emit('contrastChanged', this.currentContrast);
      console.log('🎨 UI scale reset to defaults');
    } catch (error) {
      console.error('🎨 Failed to reset UI scale:', error);
    }
  }

  /**
   * Get scale display name for UI
   */
  public getScaleDisplayName(scale: UIScale, language: 'en' | 'es' = 'en'): string {
    if (language === 'es') {
      switch (scale) {
        case 'small':
          return 'Pequeño';
        case 'medium':
          return 'Medio';
        case 'large':
          return 'Grande';
        default:
          return 'Medio';
      }
    } else {
      switch (scale) {
        case 'small':
          return 'Small';
        case 'medium':
          return 'Medium';
        case 'large':
          return 'Large';
        default:
          return 'Medium';
      }
    }
  }

  /**
   * Get contrast display name for UI
   */
  public getContrastDisplayName(language: 'en' | 'es' = 'en'): string {
    if (language === 'es') {
      return this.currentContrast === 'high' ? 'Alto Contraste' : 'Contraste Normal';
    } else {
      return this.currentContrast === 'high' ? 'High Contrast' : 'Normal Contrast';
    }
  }
}

// Export singleton instance
export const uiScaleManager = UIScaleManager.getInstance();
