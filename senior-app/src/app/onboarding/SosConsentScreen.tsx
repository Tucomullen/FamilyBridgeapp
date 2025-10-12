import React, { useState } from 'react';
import { View, Text, Pressable, Linking } from 'react-native';
import { colors, spacing, typography } from '../theme/colors';
import { t } from '../i18n';
import { speak } from '../lib/accessibility/tts';
import { requestNotifications, requestLocation, openOSSettings, PermissionState } from '../lib/permissions/media';

export default function SosConsentScreen({ navigation }: any) {
  const [state, setState] = useState<{
    notifications: PermissionState | null;
    location: PermissionState | null;
    isRequesting: boolean;
  }>({
    notifications: null,
    location: null,
    isRequesting: false,
  });

  async function allowAll() {
    setState(prev => ({ ...prev, isRequesting: true }));
    
    try {
      console.log('🔐 Starting SOS permission requests...');
      
      // Request both permissions
      const [notifications, location] = await Promise.all([
        requestNotifications(),
        requestLocation(),
      ]);
      
      console.log('🔐 SOS Permission results:', { notifications, location });
      
      setState({
        notifications,
        location,
        isRequesting: false,
      });
      
      // Navigate to next step regardless of permission status
      // User can enable later through settings
      navigation.navigate('FamilyLink');
    } catch (error) {
      console.error('🔐 SOS Permission error:', error);
      setState(prev => ({ ...prev, isRequesting: false }));
    }
  }

  async function skip() {
    console.log('🔐 Skipping SOS permissions, navigating to FamilyLink');
    navigation.navigate('FamilyLink');
  }

  const hasAnyPermission = state.notifications === 'granted' || state.location === 'granted';
  const hasAnyDenied = state.notifications === 'denied' || state.location === 'denied';

  return (
    <View style={{ 
      flex: 1, 
      backgroundColor: colors.highContrastBg, 
      padding: spacing.l, 
      alignItems: 'center', 
      justifyContent: 'center' 
    }}>
      <Text 
        accessibilityRole="header" 
        style={[typography.h1, { color: colors.text, textAlign: 'center', marginBottom: spacing.l }]}
      >
        {t('onb.sosConsent.title')}
      </Text>
      
      <Text 
        style={[typography.body, { color: colors.mutedText, textAlign: 'center', marginBottom: spacing.xl, lineHeight: 24 }]}
      >
        {t('onb.sosConsent.body')}
      </Text>

      {/* Permission explanations */}
      <View style={{ marginBottom: spacing.xl, width: '100%', maxWidth: 400 }}>
        <View style={{ 
          flexDirection: 'row', 
          alignItems: 'center', 
          marginBottom: spacing.m,
          padding: spacing.m,
          backgroundColor: colors.surface,
          borderRadius: 8
        }}>
          <Text style={{ fontSize: 24, marginRight: spacing.m }}>🔔</Text>
          <Text style={[typography.body, { color: colors.text, flex: 1 }]}>
            {t('onb.sosConsent.notifications')}
          </Text>
        </View>
        
        <View style={{ 
          flexDirection: 'row', 
          alignItems: 'center', 
          marginBottom: spacing.m,
          padding: spacing.m,
          backgroundColor: colors.surface,
          borderRadius: 8
        }}>
          <Text style={{ fontSize: 24, marginRight: spacing.m }}>📍</Text>
          <Text style={[typography.body, { color: colors.text, flex: 1 }]}>
            {t('onb.sosConsent.location')}
          </Text>
        </View>
      </View>

      {/* Privacy note */}
      <Text 
        style={[typography.body, { 
          color: colors.mutedText, 
          textAlign: 'center', 
          marginBottom: spacing.xl,
          fontSize: 14,
          fontStyle: 'italic'
        }]}
      >
        {t('onb.sosConsent.privacy')}
      </Text>

      {/* TTS Button */}
      <Pressable 
        accessibilityRole="button" 
        accessibilityLabel={t('onb.tts.play')} 
        onPress={() => speak(t('onb.sosConsent.title'))} 
        style={{ 
          marginBottom: spacing.l, 
          padding: spacing.m, 
          backgroundColor: colors.surface, 
          borderRadius: 8 
        }}
      >
        <Text style={[typography.body, { color: colors.text }]}>
          {t('onb.tts.play')}
        </Text>
      </Pressable>

      {/* Action buttons */}
      <View style={{ width: '100%', maxWidth: 300 }}>
        <Pressable 
          accessibilityRole="button" 
          accessibilityLabel={t('onb.sosConsent.ctaAllow')} 
          onPress={allowAll} 
          disabled={state.isRequesting}
          style={{ 
            minWidth: 220, 
            alignItems: 'center', 
            paddingVertical: spacing.l, 
            backgroundColor: state.isRequesting ? colors.mutedText : colors.primary, 
            borderRadius: 12,
            marginBottom: spacing.m
          }}
        >
          <Text style={[typography.button, { color: colors.text }]}>
            {state.isRequesting ? 'Requesting...' : t('onb.sosConsent.ctaAllow')}
          </Text>
        </Pressable>

        <Pressable 
          accessibilityRole="button" 
          accessibilityLabel={t('onb.sosConsent.ctaSkip')} 
          onPress={skip}
          disabled={state.isRequesting}
          style={{ 
            minWidth: 220, 
            alignItems: 'center', 
            paddingVertical: spacing.m, 
            backgroundColor: 'transparent',
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: 12
          }}
        >
          <Text style={[typography.button, { color: colors.text }]}>
            {t('onb.sosConsent.ctaSkip')}
          </Text>
        </Pressable>
      </View>

      {/* Permission status feedback */}
      {state.notifications !== null && state.location !== null && (
        <View style={{ marginTop: spacing.xl, alignItems: 'center' }}>
          {hasAnyPermission && (
            <Text style={[typography.body, { color: colors.success, marginBottom: spacing.s }]}>
              ✅ Some permissions granted
            </Text>
          )}
          
          {hasAnyDenied && (
            <View style={{ alignItems: 'center' }}>
              <Text style={[typography.body, { color: colors.text, marginBottom: spacing.m }]}>
                Some permissions were denied
              </Text>
              <Pressable 
                onPress={openOSSettings} 
                style={{ padding: spacing.m }} 
                accessibilityRole="button" 
                accessibilityLabel="Open Settings"
              >
                <Text style={[typography.body, { color: colors.primary }]}>
                  {t('onb.sosConsent.learnMore')}
                </Text>
              </Pressable>
            </View>
          )}
        </View>
      )}
    </View>
  );
}
