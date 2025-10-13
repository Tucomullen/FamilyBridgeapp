import React from 'react';
import { View, Pressable, Text, StyleSheet } from 'react-native';
import { useUIScale } from '../../hooks/useUIScale';
import { navigationService } from '../../services/navigation/NavigationService';
import { ttsService } from '../../services/tts';
import { t } from '../../i18n';
import Breadcrumbs from './Breadcrumbs';
import QuickHomeButton from './QuickHomeButton';

interface NavigationHeaderProps {
  showBack?: boolean;
  showBreadcrumbs?: boolean;
  showQuickHome?: boolean;
  title?: string;
  onBackPress?: () => void;
}

export default function NavigationHeader({
  showBack = true,
  showBreadcrumbs = true,
  showQuickHome = true,
  title,
  onBackPress,
}: NavigationHeaderProps) {
  const { theme, isHighContrast } = useUIScale();
  const [breadcrumbTrail, setBreadcrumbTrail] = React.useState(
    navigationService.getBreadcrumbTrail()
  );
  const [canGoBack, setCanGoBack] = React.useState(
    navigationService.canGoBack()
  );

  React.useEffect(() => {
    const unsubscribe = navigationService.observe(() => {
      setBreadcrumbTrail(navigationService.getBreadcrumbTrail());
      setCanGoBack(navigationService.canGoBack());
    });

    return unsubscribe;
  }, []);

  const handleBackPress = async () => {
    try {
      if (onBackPress) {
        onBackPress();
      } else {
        // Default back behavior
        navigationService.goBack();
      }

      // TTS feedback
      try {
        await ttsService.speak(t('nav.goingBack') || 'Volviendo atrás');
      } catch (error) {
        console.warn('TTS not available:', error);
      }
    } catch (error) {
      console.error('🧭 Back press error:', error);
    }
  };

  const dynamicStyles = StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
      backgroundColor: isHighContrast 
        ? theme.colors.high.background 
        : theme.colors.normal.background,
      borderBottomWidth: 1,
      borderBottomColor: isHighContrast 
        ? theme.colors.high.border 
        : theme.colors.normal.border,
      minHeight: theme.touchTarget.recommended,
    },
    leftSection: {
      flexDirection: 'row',
      alignItems: 'center',
      minWidth: 80,
    },
    centerSection: {
      flex: 1,
      alignItems: 'center',
      paddingHorizontal: theme.spacing.sm,
    },
    rightSection: {
      flexDirection: 'row',
      alignItems: 'center',
      minWidth: 80,
      justifyContent: 'flex-end',
    },
    backButton: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: theme.spacing.xs,
      borderRadius: theme.button.borderRadius,
      minHeight: theme.touchTarget.minSize,
      justifyContent: 'center',
    },
    backButtonPressed: {
      backgroundColor: isHighContrast 
        ? theme.colors.high.surface 
        : theme.colors.normal.surface,
    },
    backIcon: {
      fontSize: theme.fontSize.large,
      color: isHighContrast 
        ? theme.colors.high.primary 
        : theme.colors.normal.primary,
      marginRight: theme.spacing.xs,
    },
    backLabel: {
      fontSize: theme.fontSize.medium,
      fontWeight: '600',
      color: isHighContrast 
        ? theme.colors.high.primary 
        : theme.colors.normal.primary,
    },
    title: {
      fontSize: theme.fontSize.large,
      fontWeight: '700',
      color: isHighContrast 
        ? theme.colors.high.text 
        : theme.colors.normal.text,
      textAlign: 'center',
    },
    breadcrumbsContainer: {
      flex: 1,
    },
  });

  return (
    <View style={dynamicStyles.container}>
      {/* Left Section - Back Button */}
      <View style={dynamicStyles.leftSection}>
        {showBack && canGoBack && (
          <Pressable
            style={({ pressed }) => [
              dynamicStyles.backButton,
              pressed && dynamicStyles.backButtonPressed,
            ]}
            onPress={handleBackPress}
            accessibilityRole="button"
            accessibilityLabel={t('nav.back') || 'Volver'}
            accessibilityHint={t('nav.backHint') || 'Toca para volver a la pantalla anterior'}
          >
            <Text style={dynamicStyles.backIcon}>↑</Text>
            <Text style={dynamicStyles.backLabel}>
              {t('nav.back') || 'Volver'}
            </Text>
          </Pressable>
        )}
      </View>

      {/* Center Section - Breadcrumbs or Title */}
      <View style={dynamicStyles.centerSection}>
        {showBreadcrumbs ? (
          <View style={dynamicStyles.breadcrumbsContainer}>
            <Breadcrumbs trail={breadcrumbTrail} />
          </View>
        ) : title ? (
          <Text 
            style={dynamicStyles.title}
            accessibilityRole="header"
          >
            {title}
          </Text>
        ) : null}
      </View>

      {/* Right Section - Quick Home Button */}
      <View style={dynamicStyles.rightSection}>
        {showQuickHome && (
          <QuickHomeButton 
            visible={true}
            position="top"
          />
        )}
      </View>
    </View>
  );
}
