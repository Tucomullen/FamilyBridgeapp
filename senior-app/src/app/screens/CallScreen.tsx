import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { colors, spacing, typography } from '../theme/colors';
import { t } from '../i18n';

type Props = {
  navigation: any;
};

export default function CallScreen({ navigation }: Props) {
  return (
    <View style={{
      flex: 1,
      backgroundColor: colors.highContrastBg,
      padding: spacing.l,
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      <Text 
        accessibilityRole="header"
        style={[typography.h1, { color: colors.text, textAlign: 'center', marginBottom: spacing.xl }]}
      >
        {t('call.title')}
      </Text>
      
      <Text style={[typography.body, { color: colors.mutedText, textAlign: 'center', marginBottom: spacing.xl }]}>
        {t('call.placeholder')}
      </Text>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t('common.back')}
        onPress={() => navigation.goBack()}
        style={{
          padding: spacing.l,
          backgroundColor: colors.primary,
          borderRadius: 12,
          minWidth: 120,
          alignItems: 'center',
        }}
      >
        <Text style={[typography.button, { color: colors.text }]}>
          {t('common.back')}
        </Text>
      </Pressable>
    </View>
  );
}
