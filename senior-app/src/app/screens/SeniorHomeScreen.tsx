import React, { useState, useEffect } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors, spacing, typography } from '../theme/colors';
import { t } from '../i18n';
import { ttsService } from '../services/tts';
import { featureFlags, FeatureFlag } from '../flags/featureFlags';
import { logEvent } from '../telemetry/logEvent';

type Props = {
  navigation: any;
};

export default function SeniorHomeScreen({ navigation }: Props) {
  const [flags, setFlags] = useState<Record<FeatureFlag, boolean>>({
    CALL_ENABLED: true,
    SOS_ENABLED: true,
    PHOTOS_ENABLED: true,
    TELEMETRY_ENABLED: true,
  });
  const [tapCount, setTapCount] = useState(0);
  const [voiceCommandsEnabled, setVoiceCommandsEnabled] = useState(true);

  useEffect(() => {
    loadFlags();
    initializeTTS();
    loadVoiceCommandsSetting();
  }, []);

  // Refresh flags when screen comes into focus (e.g., returning from settings)
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadFlags();
      loadVoiceCommandsSetting();
    });
    return unsubscribe;
  }, [navigation]);

  const loadFlags = async () => {
    await featureFlags.initialize();
    setFlags(featureFlags.getAllFlags());
  };

  const initializeTTS = async () => {
    try {
      await ttsService.initialize();
      console.log('🔊 TTS initialized in SeniorHomeScreen');
    } catch (error) {
      console.error('🔊 Failed to initialize TTS in SeniorHomeScreen:', error);
    }
  };

  const loadVoiceCommandsSetting = async () => {
    try {
      const enabled = await AsyncStorage.getItem('voice_commands_enabled');
      setVoiceCommandsEnabled(enabled !== 'false'); // Default to true
    } catch (error) {
      console.error('Failed to load voice commands setting:', error);
    }
  };

  const title = t('home.title') || 'FamilyBridge';
  
  // Debug logging
  console.log('SeniorHomeScreen render:', { title, flags });
  
  const handleCall = async () => {
    if (!flags.CALL_ENABLED) return;
    await logEvent('call_open');
    await ttsService.speak(t('home.call'));
    navigation.navigate('Call');
  };

  const handleSOS = async () => {
    if (!flags.SOS_ENABLED) return;
    await logEvent('sos_send_attempt');
    await ttsService.speak(t('home.sos'));
    navigation.navigate('SOS');
  };

  const handlePhotos = async () => {
    if (!flags.PHOTOS_ENABLED) return;
    await logEvent('photos_open');
    await ttsService.speak(t('home.photos'));
    navigation.navigate('Photos');
  };

  const readTitle = () => {
    ttsService.speak(title);
  };

  const handleTitlePress = () => {
    setTapCount(prev => {
      const newCount = prev + 1;
      if (newCount >= 3) {
        setTapCount(0);
        navigation.navigate('Settings');
      }
      return newCount;
    });
    
    // Reset tap count after 2 seconds
    setTimeout(() => setTapCount(0), 2000);
  };

  const handleVoiceCommands = async () => {
    if (!voiceCommandsEnabled) return;
    await logEvent('voice_commands_open');
    await ttsService.speak(t('home.voiceCommands') || 'Voice Commands');
    navigation.navigate('Voice');
  };


  return (
    <View style={styles.container}>
      {/* Header with TTS and Voice Commands */}
      <View style={styles.header}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={title}
          onPress={handleTitlePress}
          style={styles.titleContainer}
        >
          <Text 
            accessibilityRole="header" 
            style={styles.title}
          >
            {title || 'FamilyBridge'}
          </Text>
        </Pressable>
        <View style={styles.headerButtons}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('home.tts.readTitle')}
            onPress={readTitle}
            style={styles.headerButton}
          >
            <Text style={styles.headerButtonText}>
              {t('home.tts.readTitle') || 'Read Title'}
            </Text>
          </Pressable>
          {voiceCommandsEnabled && (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t('home.voiceCommands') || 'Voice Commands'}
              onPress={handleVoiceCommands}
              style={[styles.headerButton, styles.voiceButton]}
            >
              <Text style={styles.headerButtonText}>🎤</Text>
            </Pressable>
          )}
        </View>
      </View>

      {/* Main Action Grid */}
      <View style={styles.grid}>
        {/* Call Button - Only show if enabled */}
        {flags.CALL_ENABLED && (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('home.call')}
            onPress={handleCall}
            style={[styles.actionTile, styles.callTile]}
          >
            <Text style={styles.tileIcon}>📞</Text>
            <Text style={styles.tileLabel}>
              {t('home.call')}
            </Text>
          </Pressable>
        )}

        {/* SOS Button - Only show if enabled */}
        {flags.SOS_ENABLED && (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('home.sos')}
            onPress={handleSOS}
            style={[styles.actionTile, styles.sosTile]}
          >
            <Text style={styles.tileIcon}>🚨</Text>
            <Text style={styles.tileLabel}>
              {t('home.sos')}
            </Text>
          </Pressable>
        )}

        {/* Photos Button - Only show if enabled */}
        {flags.PHOTOS_ENABLED && (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('home.photos')}
            onPress={handlePhotos}
            style={[styles.actionTile, styles.photosTile]}
          >
            <Text style={styles.tileIcon}>📷</Text>
            <Text style={styles.tileLabel}>
              {t('home.photos')}
            </Text>
          </Pressable>
        )}

        {/* Show message if all features are disabled */}
        {!flags.CALL_ENABLED && !flags.SOS_ENABLED && !flags.PHOTOS_ENABLED && (
          <View style={styles.noFeaturesContainer}>
            <Text style={styles.noFeaturesIcon}>⚙️</Text>
            <Text style={styles.noFeaturesText}>
              {t('home.noFeatures')}
            </Text>
            <Text style={styles.noFeaturesHint}>
              {t('home.noFeaturesHint')}
            </Text>
          </View>
        )}
      </View>

      {/* Hint Text */}
      <View style={styles.hintContainer}>
        <Text style={styles.hint}>
          {t('home.hint')}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.highContrastBg,
    paddingHorizontal: spacing.l,
    paddingTop: spacing.xl,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xl,
    paddingHorizontal: spacing.m,
  },
  titleContainer: {
    marginBottom: spacing.l,
  },
  title: {
    color: colors.text,
    textAlign: 'center',
    fontSize: 36,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  headerButtons: {
    flexDirection: 'row',
    gap: spacing.m,
    alignItems: 'center',
  },
  headerButton: {
    paddingVertical: spacing.s,
    paddingHorizontal: spacing.m,
    backgroundColor: colors.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
  voiceButton: {
    backgroundColor: colors.primary,
  },
  headerButtonText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '500',
  },
  grid: {
    flex: 1,
    justifyContent: 'space-evenly',
    alignItems: 'center',
    paddingVertical: spacing.l,
    maxWidth: 400,
    alignSelf: 'center',
    width: '100%',
  },
  actionTile: {
    width: '100%',
    maxWidth: 280,
    height: 120,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.l,
    paddingHorizontal: spacing.m,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  callTile: {
    backgroundColor: colors.primary,
  },
  sosTile: {
    backgroundColor: colors.danger,
  },
  photosTile: {
    backgroundColor: colors.success,
  },
  tileIcon: {
    fontSize: 40,
    marginBottom: spacing.s,
  },
  tileLabel: {
    color: colors.text,
    textAlign: 'center',
    fontWeight: '700',
    fontSize: 20,
    letterSpacing: 0.5,
  },
  hintContainer: {
    paddingHorizontal: spacing.l,
    paddingBottom: spacing.xl,
    alignItems: 'center',
  },
  hint: {
    color: colors.mutedText,
    textAlign: 'center',
    fontSize: 16,
    lineHeight: 22,
    maxWidth: 320,
  },
  noFeaturesContainer: {
    alignItems: 'center',
    padding: spacing.xl,
    backgroundColor: colors.surface,
    borderRadius: 20,
    width: '100%',
    maxWidth: 300,
  },
  noFeaturesIcon: {
    fontSize: 48,
    marginBottom: spacing.m,
  },
  noFeaturesText: {
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.s,
    fontSize: 18,
    fontWeight: '600',
  },
  noFeaturesHint: {
    color: colors.mutedText,
    textAlign: 'center',
    fontSize: 14,
  },
});
