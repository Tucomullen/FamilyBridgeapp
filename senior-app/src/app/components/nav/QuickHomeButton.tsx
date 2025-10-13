import React from 'react';
import { View, Pressable, Text, StyleSheet } from 'react-native';
import { useUIScale } from '../../hooks/useUIScale';
import { navigationService } from '../../services/navigation/NavigationService';
import { ttsService } from '../../services/tts';
import { t } from '../../i18n';

interface QuickHomeButtonProps {
  visible?: boolean;
  position?: 'top' | 'bottom';
}

export default function QuickHomeButton({ 
  visible = true, 
  position = 'top' 
}: QuickHomeButtonProps) {
  const { theme, isHighContrast } = useUIScale();
  const [isOnHome, setIsOnHome] = React.useState(navigationService.isOnHome());

  React.useEffect(() => {
    const unsubscribe = navigationService.observe(() => {
      setIsOnHome(navigationService.isOnHome());
    });

    return unsubscribe;
  }, []);

  const handlePress = async () => {
    try {
      // Check if already on home
      if (isOnHome) {
        // Gentle feedback for already being home
        try {
          await ttsService.speak(t('nav.alreadyAtHome') || 'Ya estás en inicio');
        } catch (error) {
          console.warn('TTS not available:', error);
        }
        return;
      }

      // Navigate to home
      navigationService.resetToHome();
      
      // TTS feedback
      try {
        await ttsService.speak(t('nav.goingHome') || 'Volviendo a inicio');
      } catch (error) {
        console.warn('TTS not available:', error);
      }
    } catch (error) {
      console.error('🧭 QuickHomeButton error:', error);
    }
  };

  // Don't show on home screen
  if (!visible || isOnHome) {
    return null;
  }

  const dynamicStyles = StyleSheet.create({
    container: {
      position: 'absolute',
      [position]: 0,
      left: 0,
      right: 0,
      zIndex: 1000,
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
      backgroundColor: isHighContrast 
        ? theme.colors.high.background 
        : theme.colors.normal.background,
      borderBottomWidth: position === 'top' ? 1 : 0,
      borderTopWidth: position === 'bottom' ? 1 : 0,
      borderColor: isHighContrast 
        ? theme.colors.high.border 
        : theme.colors.normal.border,
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: position === 'top' ? 2 : -2,
      },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 4,
    },
    button: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: isHighContrast 
        ? theme.colors.high.primary 
        : theme.colors.normal.primary,
      borderRadius: theme.button.borderRadius,
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.md,
      minHeight: theme.touchTarget.recommended,
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.2,
      shadowRadius: 4,
      elevation: 4,
    },
    buttonPressed: {
      backgroundColor: isHighContrast 
        ? theme.colors.high.secondary 
        : theme.colors.normal.secondary,
      transform: [{ scale: 0.98 }],
    },
    icon: {
      fontSize: theme.fontSize.large,
      marginRight: theme.spacing.sm,
    },
    label: {
      fontSize: theme.fontSize.medium,
      fontWeight: '700',
      color: isHighContrast 
        ? theme.colors.high.buttonText 
        : theme.colors.normal.buttonText,
      textAlign: 'center',
    },
  });

  return (
    <View style={dynamicStyles.container}>
      <Pressable
        style={({ pressed }) => [
          dynamicStyles.button,
          pressed && dynamicStyles.buttonPressed,
        ]}
        onPress={handlePress}
        accessibilityRole="button"
        accessibilityLabel={t('nav.home') || 'Inicio'}
        accessibilityHint={t('nav.homeHint') || 'Toca para volver a la pantalla principal'}
      >
        <Text style={dynamicStyles.icon}>🏠</Text>
        <Text style={dynamicStyles.label}>
          {t('nav.home') || 'Inicio'}
        </Text>
      </Pressable>
    </View>
  );
}
