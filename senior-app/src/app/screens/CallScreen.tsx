import React, { useState, useEffect } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { RTCView } from 'react-native-webrtc';
import { colors, spacing, typography } from '../theme/colors';
import { t } from '../i18n';
import { useCall } from '../hooks/useCall';
import { CallState, CallQuality } from '../types/call';
import { ttsService } from '../services/tts';

type Props = {
  navigation: any;
};

export default function CallScreen({ navigation }: Props) {
  const {
    state: callState,
    quality,
    stats,
    isMuted,
    startCall,
    endCall,
    toggleMute,
    switchCamera,
    getLocalStream,
    getRemoteStream,
  } = useCall();

  const [roomId] = useState('test-room'); // For testing

  useEffect(() => {
    // Initialize TTS
    const initTTS = async () => {
      try {
        await ttsService.initialize();
        console.log('🔊 TTS initialized in CallScreen');
      } catch (error) {
        console.error('🔊 Failed to initialize TTS in CallScreen:', error);
      }
    };
    
    initTTS();
    
    // Auto-start call for testing
    startCall(roomId, true);
  }, [roomId, startCall]);

  const getStateText = () => {
    switch (callState) {
      case 'idle': return t('call.placeholder');
      case 'connecting': return t('call.state.connecting');
      case 'inCall': return t('call.state.inCall');
      case 'ended': return t('call.state.ended');
      case 'error': return 'Call Error';
      default: return '';
    }
  };

  const getQualityColor = () => {
    switch (quality) {
      case 'good': return colors.success;
      case 'fair': return colors.warning;
      case 'poor': return colors.danger;
      default: return colors.mutedText;
    }
  };

  const getQualityText = () => {
    switch (quality) {
      case 'good': return 'Good';
      case 'fair': return 'Fair';
      case 'poor': return 'Poor';
      default: return '';
    }
  };

  const localStream = getLocalStream();
  const remoteStream = getRemoteStream();

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text 
          accessibilityRole="header"
          style={[typography.h1, styles.title]}
        >
          {t('call.title')}
        </Text>
        
        {/* Status and Quality */}
        <View style={styles.statusContainer}>
          <Text style={[typography.h3, styles.statusText]}>
            {getStateText()}
          </Text>
          {callState === 'inCall' && (
            <View style={styles.qualityContainer}>
              <View style={[styles.qualityDot, { backgroundColor: getQualityColor() }]} />
              <Text style={[typography.body, { color: getQualityColor() }]}>
                {getQualityText()}
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* Video Views */}
      <View style={styles.videoContainer}>
        {/* Remote Video */}
        {remoteStream ? (
          <RTCView
            style={styles.remoteVideo}
            streamURL={remoteStream.toURL()}
            mirror={false}
          />
        ) : (
          <View style={[styles.remoteVideo, styles.placeholderVideo]}>
            <Text style={[typography.h2, styles.placeholderText]}>
              Waiting for remote video...
            </Text>
          </View>
        )}

        {/* Local Video (Picture-in-Picture) */}
        {localStream && callState === 'inCall' && (
          <RTCView
            style={styles.localVideo}
            streamURL={localStream.toURL()}
            mirror={true}
          />
        )}
      </View>

      {/* Call Controls */}
      <View style={styles.controlsContainer}>
        {callState === 'inCall' && (
          <>
            {/* Mute Button */}
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={isMuted ? 'Unmute' : 'Mute'}
              onPress={async () => {
                toggleMute();
                await ttsService.speak(isMuted ? 'Micrófono activado' : 'Micrófono silenciado');
              }}
              style={[styles.controlButton, isMuted && styles.controlButtonActive]}
            >
              <Text style={[typography.h2, styles.controlButtonText]}>
                {isMuted ? '🔇' : '🎤'}
              </Text>
            </Pressable>

            {/* Switch Camera Button */}
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Switch Camera"
              onPress={async () => {
                switchCamera();
                await ttsService.speak('Cámara cambiada');
              }}
              style={styles.controlButton}
            >
              <Text style={[typography.h2, styles.controlButtonText]}>
                🔄
              </Text>
            </Pressable>
          </>
        )}

        {/* End Call Button */}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="End Call"
          onPress={async () => {
            endCall();
            await ttsService.speak('Llamada finalizada');
          }}
          style={[styles.controlButton, styles.endCallButton]}
        >
          <Text style={[typography.h2, styles.controlButtonText]}>
            📞
          </Text>
        </Pressable>
      </View>

      {/* Back Button */}
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t('common.back')}
        onPress={() => navigation.goBack()}
        style={styles.backButton}
      >
        <Text style={[typography.button, styles.backButtonText]}>
          {t('common.back')}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.highContrastBg,
  },
  header: {
    padding: spacing.l,
    alignItems: 'center',
  },
  title: {
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.m,
  },
  statusContainer: {
    alignItems: 'center',
  },
  statusText: {
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.s,
  },
  qualityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.s,
  },
  qualityDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  videoContainer: {
    flex: 1,
    position: 'relative',
  },
  remoteVideo: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  placeholderVideo: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    color: colors.mutedText,
    textAlign: 'center',
  },
  localVideo: {
    position: 'absolute',
    top: spacing.l,
    right: spacing.l,
    width: 120,
    height: 160,
    backgroundColor: colors.surface,
    borderRadius: 8,
  },
  controlsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.l,
    gap: spacing.l,
  },
  controlButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.border,
  },
  controlButtonActive: {
    backgroundColor: colors.danger,
  },
  endCallButton: {
    backgroundColor: colors.danger,
  },
  controlButtonText: {
    fontSize: 24,
  },
  backButton: {
    padding: spacing.l,
    backgroundColor: colors.surface,
    margin: spacing.l,
    borderRadius: 12,
    alignItems: 'center',
  },
  backButtonText: {
    color: colors.text,
  },
});
