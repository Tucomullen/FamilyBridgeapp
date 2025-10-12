import React, { useMemo } from 'react';
import { View, Text, Pressable } from 'react-native';
import { colors, spacing, typography } from '../theme/colors';
import { t } from '../i18n';
import { speak } from '../lib/accessibility/tts';
import { generatePairingPayload } from '../lib/linking/generatePairingPayload';

export default function FamilyLinkScreen({ navigation }: any) {
  const payload = useMemo(() => generatePairingPayload(), []);
  const qrValue = JSON.stringify({ pairingId: payload.pairingId, code: payload.code });

  return (
    <View style={{ flex: 1, backgroundColor: colors.highContrastBg, padding: spacing.l, alignItems: 'center', justifyContent: 'center' }}>
      <Text accessibilityRole="header" style={[typography.h1, { color: colors.text, textAlign: 'center', marginBottom: spacing.l }]}>
        {t('onb.link.title')}
      </Text>
      <Text style={[typography.body, { color: colors.mutedText, textAlign: 'center', marginBottom: spacing.l }]}>
        {t('onb.link.body')}
      </Text>

      <Pressable accessibilityRole="button" accessibilityLabel={t('onb.tts.play')} onPress={() => speak(t('onb.link.title'))} style={{ marginBottom: spacing.l, padding: spacing.m, backgroundColor: colors.surface, borderRadius: 8 }}>
        <Text style={[typography.body, { color: colors.text }]}>{t('onb.tts.play')}</Text>
      </Pressable>

      {/* Simple text-based pairing code display instead of QR code */}
      <View accessibilityLabel="Pairing Information" accessible style={{ backgroundColor: colors.surface, padding: spacing.l, borderRadius: 12, marginBottom: spacing.l, alignItems: 'center' }}>
        <Text style={[typography.h3, { color: colors.text, marginBottom: spacing.m, textAlign: 'center' }]}>
          {t('onb.link.codeLabel')}
        </Text>
        <Text style={[typography.h1, { color: colors.primary, fontFamily: 'monospace', letterSpacing: 2, textAlign: 'center' }]}>
          {payload.code}
        </Text>
        <Text style={[typography.body, { color: colors.mutedText, marginTop: spacing.s, textAlign: 'center', fontSize: 12 }]}>
          Share this code with your family
        </Text>
      </View>

      <Pressable accessibilityRole="button" accessibilityLabel="Continue" onPress={() => navigation.navigate('Confirmation')} style={{ minWidth: 220, alignItems: 'center', paddingVertical: spacing.l, backgroundColor: colors.primary, borderRadius: 12 }}>
        <Text style={[typography.button, { color: colors.text }]}>Continue</Text>
      </Pressable>
    </View>
  );
}


