import React, { useContext, useEffect, useState } from 'react';
import { UIScale, ContrastMode, ScaledTheme } from '../theme/scaling';

// Re-export types for convenience
export type { UIScale, ContrastMode };
import { uiScaleManager } from '../services/UIScaleManager';
import { createScaledTheme } from '../theme/scaling';

interface UIScaleContextType {
  scale: UIScale;
  contrast: ContrastMode;
  theme: ScaledTheme;
  setScale: (scale: UIScale) => Promise<void>;
  toggleContrast: () => Promise<void>;
  isHighContrast: boolean;
  getScaleDisplayName: (scale: UIScale) => string;
  getContrastDisplayName: () => string;
}

// Create context
const UIScaleContext = React.createContext<UIScaleContextType | undefined>(undefined);

// Provider component
export function UIScaleProvider({ children }: { children: React.ReactNode }) {
  const [scale, setScaleState] = useState<UIScale>('medium');
  const [contrast, setContrastState] = useState<ContrastMode>('normal');
  const [theme, setTheme] = useState<ScaledTheme>(() => createScaledTheme('medium', 'normal'));

  useEffect(() => {
    // Initialize the scale manager
    const initializeScale = async () => {
      await uiScaleManager.initialize();
      const currentScale = uiScaleManager.getCurrentScale();
      const currentContrast = uiScaleManager.getCurrentContrast();
      
      setScaleState(currentScale);
      setContrastState(currentContrast);
      setTheme(createScaledTheme(currentScale, currentContrast));
    };

    initializeScale();

    // Listen for scale changes
    const handleScaleChange = (newScale: UIScale) => {
      setScaleState(newScale);
      setTheme(createScaledTheme(newScale, contrast));
    };

    // Listen for contrast changes
    const handleContrastChange = (newContrast: ContrastMode) => {
      setContrastState(newContrast);
      setTheme(createScaledTheme(scale, newContrast));
    };

    uiScaleManager.on('scaleChanged', handleScaleChange);
    uiScaleManager.on('contrastChanged', handleContrastChange);

    return () => {
      uiScaleManager.off('scaleChanged', handleScaleChange);
      uiScaleManager.off('contrastChanged', handleContrastChange);
    };
  }, [scale, contrast]);

  const setScale = async (newScale: UIScale) => {
    await uiScaleManager.setScale(newScale);
  };

  const toggleContrast = async () => {
    await uiScaleManager.toggleContrast();
  };

  const getScaleDisplayName = (scaleOption: UIScale) => {
    return uiScaleManager.getScaleDisplayName(scaleOption);
  };

  const getContrastDisplayName = () => {
    return uiScaleManager.getContrastDisplayName();
  };

  const value: UIScaleContextType = {
    scale,
    contrast,
    theme,
    setScale,
    toggleContrast,
    isHighContrast: contrast === 'high',
    getScaleDisplayName,
    getContrastDisplayName,
  };

  return (
    <UIScaleContext.Provider value={value}>
      {children}
    </UIScaleContext.Provider>
  );
}

// Hook to use UI scale context
export function useUIScale(): UIScaleContextType {
  const context = useContext(UIScaleContext);
  if (context === undefined) {
    throw new Error('useUIScale must be used within a UIScaleProvider');
  }
  return context;
}

// Hook for just the theme (lighter weight)
export function useUITheme(): ScaledTheme {
  const { theme } = useUIScale();
  return theme;
}

// Hook for scale-specific values
export function useScaleValues() {
  const { scale, contrast, theme } = useUIScale();
  
  return {
    scale,
    fontSize: theme.fontSize,
    spacing: theme.spacing,
    buttonHeight: theme.button.height,
    touchTarget: theme.touchTarget,
    colors: theme.colors[contrast === 'high' ? 'high' : 'normal'],
  };
}

// Hook for responsive values
export function useResponsiveValue<T>(
  smallValue: T,
  mediumValue: T,
  largeValue: T
): T {
  const { scale } = useUIScale();
  
  switch (scale) {
    case 'small':
      return smallValue;
    case 'medium':
      return mediumValue;
    case 'large':
      return largeValue;
    default:
      return mediumValue;
  }
}

// Hook for responsive font size
export function useResponsiveFontSize(baseSize: number): number {
  const { scale } = useUIScale();
  const multiplier = scale === 'small' ? 0.8 : scale === 'large' ? 1.2 : 1.0;
  return Math.round(baseSize * multiplier);
}

// Hook for responsive spacing
export function useResponsiveSpacing(baseSpacing: number): number {
  const { scale } = useUIScale();
  const multiplier = scale === 'small' ? 0.8 : scale === 'large' ? 1.2 : 1.0;
  return Math.round(baseSpacing * multiplier);
}

// Hook for responsive button height
export function useResponsiveButtonHeight(baseHeight: number): number {
  const { scale } = useUIScale();
  const multiplier = scale === 'small' ? 0.8 : scale === 'large' ? 1.2 : 1.0;
  const scaledHeight = Math.round(baseHeight * multiplier);
  return Math.max(48, scaledHeight); // Ensure minimum 48px touch target
}
