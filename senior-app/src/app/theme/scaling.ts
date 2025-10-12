import { UIScale, ContrastMode, ScaleValues, ContrastColors } from '../services/UIScaleManager';

// Re-export types for convenience
export type { UIScale, ContrastMode, ScaleValues, ContrastColors };

export interface ScaledTheme {
  // Typography
  fontSize: {
    small: number;
    medium: number;
    large: number;
    xlarge: number;
    xxlarge: number;
  };
  lineHeight: {
    small: number;
    medium: number;
    large: number;
    xlarge: number;
    xxlarge: number;
  };
  
  // Spacing
  spacing: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
    xxl: number;
  };
  
  // Button dimensions
  button: {
    height: {
      small: number;
      medium: number;
      large: number;
    };
    padding: {
      horizontal: number;
      vertical: number;
    };
    borderRadius: number;
  };
  
  // Touch targets
  touchTarget: {
    minSize: number;
    recommended: number;
  };
  
  // Colors (contrast-aware)
  colors: {
    normal: {
      primary: string;
      secondary: string;
      text: string;
      textSecondary: string;
      background: string;
      surface: string;
      button: string;
      buttonText: string;
      border: string;
      success: string;
      warning: string;
      error: string;
    };
    high: {
      primary: string;
      secondary: string;
      text: string;
      textSecondary: string;
      background: string;
      surface: string;
      button: string;
      buttonText: string;
      border: string;
      success: string;
      warning: string;
      error: string;
    };
  };
}

// Base scale values
const baseScaleValues: ScaleValues = {
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

// Base contrast colors (WCAG AA compliant)
const baseContrastColors: ContrastColors = {
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

/**
 * Create scaled theme based on current UI scale and contrast mode
 */
export function createScaledTheme(scale: UIScale, contrast: ContrastMode): ScaledTheme {
  const scaleMultiplier = getScaleMultiplier(scale);
  const colors = baseContrastColors[contrast];
  
  return {
    fontSize: {
      small: Math.round(baseScaleValues.fontSize.small * scaleMultiplier),
      medium: Math.round(baseScaleValues.fontSize.medium * scaleMultiplier),
      large: Math.round(baseScaleValues.fontSize.large * scaleMultiplier),
      xlarge: Math.round(24 * scaleMultiplier),
      xxlarge: Math.round(28 * scaleMultiplier),
    },
    lineHeight: {
      small: Math.round(baseScaleValues.fontSize.small * scaleMultiplier * 1.4),
      medium: Math.round(baseScaleValues.fontSize.medium * scaleMultiplier * 1.4),
      large: Math.round(baseScaleValues.fontSize.large * scaleMultiplier * 1.4),
      xlarge: Math.round(24 * scaleMultiplier * 1.4),
      xxlarge: Math.round(28 * scaleMultiplier * 1.4),
    },
    spacing: {
      xs: Math.round(4 * scaleMultiplier),
      sm: Math.round(8 * scaleMultiplier),
      md: Math.round(12 * scaleMultiplier),
      lg: Math.round(16 * scaleMultiplier),
      xl: Math.round(24 * scaleMultiplier),
      xxl: Math.round(32 * scaleMultiplier),
    },
    button: {
      height: {
        small: Math.max(48, Math.round(baseScaleValues.buttonHeight.small * scaleMultiplier)),
        medium: Math.max(48, Math.round(baseScaleValues.buttonHeight.medium * scaleMultiplier)),
        large: Math.max(48, Math.round(baseScaleValues.buttonHeight.large * scaleMultiplier)),
      },
      padding: {
        horizontal: Math.round(16 * scaleMultiplier),
        vertical: Math.round(12 * scaleMultiplier),
      },
      borderRadius: Math.round(8 * scaleMultiplier),
    },
    touchTarget: {
      minSize: 48, // WCAG minimum
      recommended: Math.max(48, Math.round(56 * scaleMultiplier)),
    },
    colors: {
      normal: {
        primary: colors.primary,
        secondary: colors.secondary,
        text: colors.text,
        textSecondary: '#666666',
        background: colors.background,
        surface: '#F8F9FA',
        button: colors.button,
        buttonText: colors.buttonText,
        border: '#E1E5E9',
        success: '#34C759',
        warning: '#FF9500',
        error: '#FF3B30',
      },
      high: {
        primary: colors.primary,
        secondary: colors.secondary,
        text: colors.text,
        textSecondary: '#000000',
        background: colors.background,
        surface: '#FFFFFF',
        button: colors.button,
        buttonText: colors.buttonText,
        border: '#000000',
        success: '#000000',
        warning: '#000000',
        error: '#000000',
      },
    },
  };
}

/**
 * Get scale multiplier for calculations
 */
function getScaleMultiplier(scale: UIScale): number {
  switch (scale) {
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
 * Get responsive font size based on scale
 */
export function getResponsiveFontSize(scale: UIScale, baseSize: number): number {
  return Math.round(baseSize * getScaleMultiplier(scale));
}

/**
 * Get responsive spacing based on scale
 */
export function getResponsiveSpacing(scale: UIScale, baseSpacing: number): number {
  return Math.round(baseSpacing * getScaleMultiplier(scale));
}

/**
 * Get responsive button height ensuring minimum touch target
 */
export function getResponsiveButtonHeight(scale: UIScale, baseHeight: number): number {
  const scaledHeight = Math.round(baseHeight * getScaleMultiplier(scale));
  return Math.max(48, scaledHeight); // Ensure minimum 48px touch target
}

/**
 * Check if current scale is high contrast
 */
export function isHighContrast(contrast: ContrastMode): boolean {
  return contrast === 'high';
}

/**
 * Get accessibility-friendly color based on contrast mode
 */
export function getAccessibleColor(
  color: string,
  contrast: ContrastMode,
  fallback: string = '#000000'
): string {
  if (contrast === 'high') {
    // In high contrast mode, use high contrast colors
    return fallback;
  }
  return color;
}

/**
 * Get scale display name for UI
 */
export function getScaleDisplayName(scale: UIScale, language: 'en' | 'es' = 'en'): string {
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
export function getContrastDisplayName(contrast: ContrastMode, language: 'en' | 'es' = 'en'): string {
  if (language === 'es') {
    return contrast === 'high' ? 'Alto Contraste' : 'Contraste Normal';
  } else {
    return contrast === 'high' ? 'High Contrast' : 'Normal Contrast';
  }
}

/**
 * Default theme for fallback
 */
export const defaultScaledTheme = createScaledTheme('medium', 'normal');
