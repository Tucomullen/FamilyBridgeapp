import React, { useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { colors, spacing, typography } from '../theme/colors';
import { t } from '../i18n';
import { logEvent } from '../telemetry/logEvent';

type Props = {
  navigation: any;
};

type SosState = 'idle' | 'sending' | 'sent' | 'failed';

export default function SosScreen({ navigation }: Props) {
  const [sosState, setSosState] = useState<SosState>('idle');

  const sendAlert = async () => {
    setSosState('sending');
    await logEvent('sos_send_attempt');
    
    // Simulate network delay
    setTimeout(() => {
      // Random 10-20% chance of failure
      const isSuccess = Math.random() > 0.15;
      
      if (isSuccess) {
        setSosState('sent');
        logEvent('sos_sent');
      } else {
        setSosState('failed');
        logEvent('sos_retry');
      }
    }, 2000);
  };

  const retryAlert = async () => {
    setSosState('idle');
    await sendAlert();
  };

  const resetAlert = () => {
    setSosState('idle');
  };

  const getStatusText = () => {
    switch (sosState) {
      case 'idle': return t('sos.placeholder');
      case 'sending': return 'Enviando alerta...';
      case 'sent': return t('sos.status.sent');
      case 'failed': return t('sos.status.failed');
      default: return '';
    }
  };

  const getStatusColor = () => {
    switch (sosState) {
      case 'sent': return colors.success;
      case 'failed': return colors.danger;
      default: return colors.text;
    }
  };

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
        {t('sos.title')}
      </Text>
      
      <Text 
        style={[typography.h2, { 
          color: getStatusColor(), 
          textAlign: 'center', 
          marginBottom: spacing.xl,
          minHeight: 60,
        }]}
      >
        {getStatusText()}
      </Text>

      {sosState === 'idle' && (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('sos.cta.send')}
          onPress={sendAlert}
          style={{
            padding: spacing.xl,
            backgroundColor: colors.danger,
            borderRadius: 12,
            minWidth: 200,
            alignItems: 'center',
            marginBottom: spacing.l,
          }}
        >
          <Text style={[typography.button, { color: colors.text }]}>
            {t('sos.cta.send')}
          </Text>
        </Pressable>
      )}

      {sosState === 'sending' && (
        <View style={{
          padding: spacing.xl,
          backgroundColor: colors.surface,
          borderRadius: 12,
          minWidth: 200,
          alignItems: 'center',
          marginBottom: spacing.l,
        }}>
          <Text style={[typography.button, { color: colors.text }]}>
            Enviando...
          </Text>
        </View>
      )}

      {sosState === 'failed' && (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('sos.cta.retry')}
          onPress={retryAlert}
          style={{
            padding: spacing.xl,
            backgroundColor: colors.danger,
            borderRadius: 12,
            minWidth: 200,
            alignItems: 'center',
            marginBottom: spacing.l,
          }}
        >
          <Text style={[typography.button, { color: colors.text }]}>
            {t('sos.cta.retry')}
          </Text>
        </Pressable>
      )}

      {(sosState === 'sent' || sosState === 'failed') && (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Reset"
          onPress={resetAlert}
          style={{
            padding: spacing.m,
            backgroundColor: colors.surface,
            borderRadius: 8,
            minWidth: 120,
            alignItems: 'center',
            marginBottom: spacing.l,
          }}
        >
          <Text style={[typography.body, { color: colors.text }]}>
            Reset
          </Text>
        </Pressable>
      )}

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t('common.back')}
        onPress={() => navigation.goBack()}
        style={{
          padding: spacing.l,
          backgroundColor: colors.surface,
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
