import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { colors, spacing, typography } from '../theme/colors';
import { t } from '../i18n';
import { speak } from '../lib/accessibility/tts';

type Props = { onDone: () => void };

export default function ConfirmationScreen({ onDone }: Props) {
  const title = t('onb.done.title');
  return (
    <View style={{ flex: 1, backgroundColor: colors.highContrastBg, padding: spacing.l, alignItems: 'center', justifyContent: 'center' }}>
      <Text accessibilityRole="header" style={[typography.h1, { color: colors.text, textAlign: 'center', marginBottom: spacing.l }]}>
        {title}
      </Text>
      <Text style={[typography.body, { color: colors.mutedText, textAlign: 'center', marginBottom: spacing.xl }]}>
        {t('onb.done.body')}
      </Text>

      <Pressable accessibilityRole="button" accessibilityLabel={t('onb.tts.play')} onPress={() => speak(title)} style={{ marginBottom: spacing.l, padding: spacing.m, backgroundColor: colors.surface, borderRadius: 8 }}>
        <Text style={[typography.body, { color: colors.text }]}>{t('onb.tts.play')}</Text>
      </Pressable>

      <Pressable accessibilityRole="button" accessibilityLabel={t('onb.done.ctaHome')} onPress={onDone} style={{ minWidth: 220, alignItems: 'center', paddingVertical: spacing.l, backgroundColor: colors.primary, borderRadius: 12 }}>
        <Text style={[typography.button, { color: colors.text }]}>{t('onb.done.ctaHome')}</Text>
      </Pressable>
    </View>
  );
}


