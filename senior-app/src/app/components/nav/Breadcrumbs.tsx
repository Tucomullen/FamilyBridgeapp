import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useUIScale } from '../../hooks/useUIScale';
import { t } from '../../i18n';

export interface BreadcrumbItem {
  label: string;
  screen: string;
  onPress?: () => void;
}

interface BreadcrumbsProps {
  trail: BreadcrumbItem[];
  maxLevels?: number;
}

export default function Breadcrumbs({ trail, maxLevels = 2 }: BreadcrumbsProps) {
  const { theme, isHighContrast } = useUIScale();
  
  // Limit to max levels
  const displayTrail = trail.slice(-maxLevels);
  
  // If we have more than max levels, show "..." for the first item
  const shouldTruncate = trail.length > maxLevels;
  
  const dynamicStyles = StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
      minHeight: theme.touchTarget.recommended,
    },
    breadcrumb: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
      justifyContent: 'center',
    },
    item: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    clickableItem: {
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: theme.spacing.xs,
      borderRadius: theme.button.borderRadius,
      minHeight: theme.touchTarget.minSize,
      justifyContent: 'center',
    },
    clickableItemPressed: {
      backgroundColor: isHighContrast 
        ? theme.colors.high.surface 
        : theme.colors.normal.surface,
    },
    label: {
      fontSize: theme.fontSize.medium,
      fontWeight: '600',
      color: isHighContrast 
        ? theme.colors.high.text 
        : theme.colors.normal.text,
      textAlign: 'center',
    },
    clickableLabel: {
      color: isHighContrast 
        ? theme.colors.high.primary 
        : theme.colors.normal.primary,
    },
    separator: {
      fontSize: theme.fontSize.medium,
      color: isHighContrast 
        ? theme.colors.high.textSecondary 
        : theme.colors.normal.textSecondary,
      marginHorizontal: theme.spacing.sm,
      fontWeight: '500',
    },
    truncation: {
      fontSize: theme.fontSize.medium,
      color: isHighContrast 
        ? theme.colors.high.textSecondary 
        : theme.colors.normal.textSecondary,
      marginRight: theme.spacing.sm,
    },
  });

  if (displayTrail.length === 0) {
    return null;
  }

  if (displayTrail.length === 1) {
    const item = displayTrail[0];
    return (
      <View style={dynamicStyles.container}>
        <View style={dynamicStyles.breadcrumb}>
          <Text 
            style={[dynamicStyles.label, dynamicStyles.clickableLabel]}
            accessibilityRole="header"
            accessibilityLabel={`${t('nav.youAreHere')} ${item.label}`}
          >
            {item.label}
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={dynamicStyles.container}>
      <View style={dynamicStyles.breadcrumb}>
        {shouldTruncate && (
          <Text style={dynamicStyles.truncation}>…</Text>
        )}
        
        {displayTrail.map((item, index) => (
          <React.Fragment key={`${item.screen}-${index}`}>
            {index > 0 && (
              <Text style={dynamicStyles.separator}>›</Text>
            )}
            
            {item.onPress ? (
              <Pressable
                style={({ pressed }) => [
                  dynamicStyles.clickableItem,
                  pressed && dynamicStyles.clickableItemPressed,
                ]}
                onPress={item.onPress}
                accessibilityRole="button"
                accessibilityLabel={`${t('nav.back')} ${item.label}`}
              >
                <Text style={[dynamicStyles.label, dynamicStyles.clickableLabel]}>
                  {item.label}
                </Text>
              </Pressable>
            ) : (
              <View style={dynamicStyles.item}>
                <Text 
                  style={dynamicStyles.label}
                  accessibilityRole="header"
                  accessibilityLabel={`${t('nav.youAreHere')} ${item.label}`}
                >
                  {item.label}
                </Text>
              </View>
            )}
          </React.Fragment>
        ))}
      </View>
    </View>
  );
}
