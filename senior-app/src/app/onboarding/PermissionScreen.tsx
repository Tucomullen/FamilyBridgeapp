import React, { useState } from 'react';
import { View, Text, Pressable, Linking } from 'react-native';
import { colors, spacing, typography } from '../theme/colors';
import { t } from '../i18n';
import { speak } from '../lib/accessibility/tts';
import { requestCamera, requestMicrophone, openOSSettings, PermissionState } from '../lib/permissions/media';

export default function PermissionScreen({ navigation }: any) {
  const [state, setState] = useState<PermissionState | null>(null);

  async function allow() {
    console.log('🔐 Starting permission request...');
    const cam = await requestCamera();
    const mic = await requestMicrophone();
    console.log('🔐 Permission results:', { camera: cam, microphone: mic });
    
    if (cam === 'granted' && mic === 'granted') {
      console.log('✅ All permissions granted, navigating to SOS consent');
      navigation.navigate('SosConsent');
    } else {
      console.log('❌ Some permissions denied:', { camera: cam, microphone: mic });
      setState('denied');
    }
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.highContrastBg, padding: spacing.l, alignItems: 'center', justifyContent: 'center' }}>
      <Text accessibilityRole="header" style={[typography.h1, { color: colors.text, textAlign: 'center', marginBottom: spacing.l }]}>
        {t('onb.perms.title')}
      </Text>
      <Text style={[typography.body, { color: colors.mutedText, textAlign: 'center', marginBottom: spacing.xl }]}>
        {t('onb.perms.body')}
      </Text>

      <Pressable accessibilityRole="button" accessibilityLabel={t('onb.tts.play')} onPress={() => speak(t('onb.perms.title'))} style={{ marginBottom: spacing.l, padding: spacing.m, backgroundColor: colors.surface, borderRadius: 8 }}>
        <Text style={[typography.body, { color: colors.text }]}>{t('onb.tts.play')}</Text>
      </Pressable>

      <Pressable accessibilityRole="button" accessibilityLabel={t('onb.perms.ctaAllow')} onPress={allow} style={{ minWidth: 220, alignItems: 'center', paddingVertical: spacing.l, backgroundColor: colors.primary, borderRadius: 12 }}>
        <Text style={[typography.button, { color: colors.text }]}>{t('onb.perms.ctaAllow')}</Text>
      </Pressable>

      {state === 'denied' && (
        <View style={{ marginTop: spacing.xl, alignItems: 'center' }}>
          <Text style={[typography.body, { color: colors.text, marginBottom: spacing.m }]}>Permission denied</Text>
          <Pressable onPress={allow} style={{ padding: spacing.m }} accessibilityRole="button" accessibilityLabel="Retry">
            <Text style={[typography.body, { color: colors.primary }]}>Retry</Text>
          </Pressable>
          <Pressable onPress={openOSSettings} style={{ padding: spacing.m }} accessibilityRole="button" accessibilityLabel="Open Settings">
            <Text style={[typography.body, { color: colors.primary }]}>Open Settings</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}


