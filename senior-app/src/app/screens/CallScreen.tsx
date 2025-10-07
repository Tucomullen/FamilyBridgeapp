import React, { useState, useEffect } from 'react';
import { View, Text, Pressable } from 'react-native';
import { colors, spacing, typography } from '../theme/colors';
import { t } from '../i18n';
import { logEvent } from '../telemetry/logEvent';

type Props = {
  navigation: any;
};

type CallState = 'idle' | 'dialing' | 'connecting' | 'inCall' | 'ended';

export default function CallScreen({ navigation }: Props) {
  const [callState, setCallState] = useState<CallState>('idle');
  const [timeoutId, setTimeoutId] = useState<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [timeoutId]);

  const startCall = async () => {
    setCallState('dialing');
    await logEvent('call_start');
    
    // Simulate dialing
    const dialingTimeout = setTimeout(() => {
      setCallState('connecting');
      logEvent('call_state_change', { state: 'connecting' });
      
      // Simulate connecting
      const connectingTimeout = setTimeout(() => {
        setCallState('inCall');
        logEvent('call_state_change', { state: 'inCall' });
        
                // Auto-end call after 10-15 seconds
                const callTimeout = setTimeout(() => {
                  setCallState('ended');
                  logEvent('call_state_change', { state: 'ended' });
                  logEvent('call_end');
                }, __DEV__ ? 10000 : Math.random() * 5000 + 10000); // Fixed 10s in dev, 10-15s in prod
        
        setTimeoutId(callTimeout);
      }, 2000);
      
      setTimeoutId(connectingTimeout);
    }, 2000);
    
    setTimeoutId(dialingTimeout);
  };

  const endCall = async () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    setCallState('ended');
    await logEvent('call_state_change', { state: 'ended' });
    await logEvent('call_end');
  };

  const resetCall = () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    setCallState('idle');
  };

  const getStateText = () => {
    switch (callState) {
      case 'idle': return t('call.placeholder');
      case 'dialing': return t('call.state.dialing');
      case 'connecting': return t('call.state.connecting');
      case 'inCall': return t('call.state.inCall');
      case 'ended': return t('call.state.ended');
      default: return '';
    }
  };

  const getButtonText = () => {
    switch (callState) {
      case 'idle': return t('call.cta.start');
      case 'inCall': return t('call.cta.end');
      case 'ended': return t('call.cta.start');
      default: return t('call.cta.end');
    }
  };

  const handleButtonPress = () => {
    switch (callState) {
      case 'idle':
      case 'ended':
        startCall();
        break;
      case 'dialing':
      case 'connecting':
      case 'inCall':
        endCall();
        break;
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
        {t('call.title')}
      </Text>
      
      <Text 
        style={[typography.h2, { 
          color: callState === 'ended' ? colors.mutedText : colors.text, 
          textAlign: 'center', 
          marginBottom: spacing.xl,
          minHeight: 60,
        }]}
      >
        {getStateText()}
      </Text>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={getButtonText()}
        onPress={handleButtonPress}
        style={{
          padding: spacing.xl,
          backgroundColor: callState === 'inCall' ? colors.danger : colors.primary,
          borderRadius: 12,
          minWidth: 200,
          alignItems: 'center',
          marginBottom: spacing.l,
        }}
      >
        <Text style={[typography.button, { color: colors.text }]}>
          {getButtonText()}
        </Text>
      </Pressable>

      {callState === 'ended' && (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Reset"
          onPress={resetCall}
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
