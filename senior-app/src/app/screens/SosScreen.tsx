import React, { useState, useEffect } from 'react';
import { View, Text, Pressable, Modal, Alert, Vibration } from 'react-native';
import { colors, spacing, typography } from '../theme/colors';
import { t } from '../i18n';
import { logEvent } from '../telemetry/logEvent';
import { notificationService, NotificationPayload } from '../services/notifications';
import { locationService } from '../services/location';
import { ttsService } from '../services/tts';
import { v4 as uuidv4 } from 'uuid';

type Props = {
  navigation: any;
};

type SosState = 'idle' | 'confirming' | 'sending' | 'sent' | 'failed';

export default function SosScreen({ navigation }: Props) {
  const [sosState, setSosState] = useState<SosState>('idle');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [deviceId] = useState(() => uuidv4());

  useEffect(() => {
    // Initialize services
    const initServices = async () => {
      try {
        await notificationService.initialize();
        await locationService.initialize();
        await ttsService.initialize();
        console.log('🚨 SOS Screen: Services initialized');
      } catch (error) {
        console.error('🚨 SOS Screen: Failed to initialize services:', error);
      }
    };

    initServices();
  }, []);

  const handleSosPress = async () => {
    setSosState('confirming');
    setShowConfirmModal(true);
    await ttsService.speak('SOS activado');
  };

  const sendAlert = async () => {
    setSosState('sending');
    setShowConfirmModal(false);
    
    try {
      await logEvent('sos_requested', { locationAttached: false });
      
      // Get location (with timeout)
      let location = null;
      try {
        location = await Promise.race([
          locationService.getLastKnownLocation(),
          new Promise<null>((_, reject) => 
            setTimeout(() => reject(new Error('Location timeout')), 3000)
          )
        ]);
      } catch (error) {
        console.log('🚨 SOS: Location not available:', error);
      }

      // Prepare payload
      const payload: NotificationPayload = {
        deviceId,
        pushToken: notificationService.getPushToken() || undefined,
        location,
        timestamp: Date.now()
      };

      console.log('🚨 SOS: Sending alert with payload:', {
        deviceId: payload.deviceId,
        hasToken: !!payload.pushToken,
        hasLocation: !!payload.location,
        timestamp: payload.timestamp
      });

      // Send notification
      const success = await notificationService.sendDevNotification(payload);
      
      if (success) {
        setSosState('sent');
        await logEvent('sos_sent', { 
          locationAttached: !!location,
          hasToken: !!payload.pushToken 
        });
        
        // Haptic feedback
        if (Vibration.vibrate) {
          Vibration.vibrate([0, 500, 200, 500]); // Success pattern
        }
        
        // Speak confirmation
        await ttsService.speak('Alerta de emergencia enviada');
      } else {
        setSosState('failed');
        await logEvent('sos_failed', { 
          locationAttached: !!location,
          hasToken: !!payload.pushToken 
        });
        
        // Speak error
        await ttsService.speak('Error al enviar alerta');
      }
    } catch (error) {
      console.error('🚨 SOS: Failed to send alert:', error);
      setSosState('failed');
      await logEvent('sos_failed', { locationAttached: false });
    }
  };

  const retryAlert = async () => {
    setSosState('idle');
    handleSosPress();
  };

  const resetAlert = () => {
    setSosState('idle');
  };

  const cancelAlert = () => {
    setSosState('idle');
    setShowConfirmModal(false);
  };

  const getStatusText = () => {
    switch (sosState) {
      case 'idle': return t('sos.placeholder');
      case 'confirming': return 'Confirming...';
      case 'sending': return t('sos.status.sending');
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
          onPress={handleSosPress}
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

      {/* Dev Notifications Link (only in dev) */}
      {__DEV__ && (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="View Dev Notifications"
          onPress={() => navigation.navigate('DevNotifications')}
          style={{
            padding: spacing.m,
            backgroundColor: colors.surface,
            borderRadius: 8,
            minWidth: 120,
            alignItems: 'center',
            marginTop: spacing.m,
          }}
        >
          <Text style={[typography.body, { color: colors.mutedText, fontSize: 12 }]}>
            Dev Notifications
          </Text>
        </Pressable>
      )}

      {/* Confirmation Modal */}
      <Modal
        visible={showConfirmModal}
        transparent={true}
        animationType="fade"
        onRequestClose={cancelAlert}
      >
        <View style={{
          flex: 1,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          justifyContent: 'center',
          alignItems: 'center',
          padding: spacing.l,
        }}>
          <View style={{
            backgroundColor: colors.highContrastBg,
            borderRadius: 16,
            padding: spacing.xl,
            width: '100%',
            maxWidth: 400,
            alignItems: 'center',
          }}>
            <Text 
              accessibilityRole="header"
              style={[typography.h2, { color: colors.text, textAlign: 'center', marginBottom: spacing.l }]}
            >
              {t('sos.confirm.title')}
            </Text>
            
            <Text 
              style={[typography.body, { color: colors.mutedText, textAlign: 'center', marginBottom: spacing.xl, lineHeight: 24 }]}
            >
              {t('sos.confirm.body')}
            </Text>

            <View style={{ flexDirection: 'row', width: '100%', gap: spacing.m }}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={t('sos.confirm.ctaCancel')}
                onPress={cancelAlert}
                style={{
                  flex: 1,
                  padding: spacing.l,
                  backgroundColor: colors.surface,
                  borderRadius: 12,
                  alignItems: 'center',
                }}
              >
                <Text style={[typography.button, { color: colors.text }]}>
                  {t('sos.confirm.ctaCancel')}
                </Text>
              </Pressable>

              <Pressable
                accessibilityRole="button"
                accessibilityLabel={t('sos.confirm.ctaSend')}
                onPress={sendAlert}
                style={{
                  flex: 1,
                  padding: spacing.l,
                  backgroundColor: colors.danger,
                  borderRadius: 12,
                  alignItems: 'center',
                }}
              >
                <Text style={[typography.button, { color: colors.text }]}>
                  {t('sos.confirm.ctaSend')}
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
