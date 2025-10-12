import React, { useState, useEffect } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors, spacing, typography } from '../theme/colors';
import { t } from '../i18n';
import { ttsService } from '../services/tts';
import { featureFlags, FeatureFlag } from '../flags/featureFlags';
import { logEvent } from '../telemetry/logEvent';
import { useUIScale } from '../hooks/useUIScale';

type Props = {
  navigation: any;
};

export default function SeniorHomeScreen({ navigation }: Props) {
  const { theme, isHighContrast } = useUIScale();
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


  // Create dynamic styles based on current theme
  const dynamicStyles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isHighContrast ? theme.colors.high.background : theme.colors.normal.background,
      paddingHorizontal: theme.spacing.lg,
      paddingTop: theme.spacing.xl,
    },
    header: {
      alignItems: 'center',
      marginBottom: theme.spacing.xl,
      paddingHorizontal: theme.spacing.md,
    },
    titleContainer: {
      marginBottom: theme.spacing.lg,
    },
    title: {
      color: isHighContrast ? theme.colors.high.text : theme.colors.normal.text,
      textAlign: 'center',
      fontSize: theme.fontSize.xxlarge,
      fontWeight: 'bold',
      letterSpacing: 1,
    },
    headerButtons: {
      flexDirection: 'row',
      gap: theme.spacing.md,
      alignItems: 'center',
    },
    headerButton: {
      paddingVertical: theme.spacing.sm,
      paddingHorizontal: theme.spacing.md,
      backgroundColor: isHighContrast ? theme.colors.high.surface : theme.colors.normal.surface,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: isHighContrast ? theme.colors.high.border : theme.colors.normal.border,
      minHeight: theme.touchTarget.recommended,
    },
    voiceButton: {
      backgroundColor: isHighContrast ? theme.colors.high.primary : theme.colors.normal.primary,
    },
    headerButtonText: {
      color: isHighContrast ? theme.colors.high.text : theme.colors.normal.text,
      fontSize: theme.fontSize.medium,
      fontWeight: '500',
    },
    grid: {
      flex: 1,
      justifyContent: 'space-evenly',
      alignItems: 'center',
      paddingVertical: theme.spacing.lg,
      maxWidth: 400,
      alignSelf: 'center',
      width: '100%',
    },
    actionTile: {
      width: '100%',
      maxWidth: 280,
      height: theme.button.height.large * 2,
      borderRadius: 20,
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: theme.spacing.lg,
      paddingHorizontal: theme.spacing.md,
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
      backgroundColor: isHighContrast ? theme.colors.high.primary : theme.colors.normal.primary,
    },
    sosTile: {
      backgroundColor: isHighContrast ? theme.colors.high.error : theme.colors.normal.error,
    },
    photosTile: {
      backgroundColor: isHighContrast ? theme.colors.high.success : theme.colors.normal.success,
    },
    tileIcon: {
      fontSize: 40,
      marginBottom: theme.spacing.sm,
    },
    tileLabel: {
      color: isHighContrast ? theme.colors.high.text : theme.colors.normal.text,
      textAlign: 'center',
      fontWeight: '700',
      fontSize: theme.fontSize.large,
      letterSpacing: 0.5,
    },
    hintContainer: {
      paddingHorizontal: theme.spacing.lg,
      paddingBottom: theme.spacing.xl,
      alignItems: 'center',
    },
    hint: {
      color: isHighContrast ? theme.colors.high.textSecondary : theme.colors.normal.textSecondary,
      textAlign: 'center',
      fontSize: theme.fontSize.medium,
      lineHeight: theme.lineHeight.medium,
      maxWidth: 320,
    },
    noFeaturesContainer: {
      alignItems: 'center',
      padding: theme.spacing.xl,
      backgroundColor: isHighContrast ? theme.colors.high.surface : theme.colors.normal.surface,
      borderRadius: 20,
      width: '100%',
      maxWidth: 300,
    },
    noFeaturesIcon: {
      fontSize: 48,
      marginBottom: theme.spacing.md,
    },
    noFeaturesText: {
      color: isHighContrast ? theme.colors.high.text : theme.colors.normal.text,
      textAlign: 'center',
      marginBottom: theme.spacing.sm,
      fontSize: theme.fontSize.large,
      fontWeight: '600',
    },
    noFeaturesHint: {
      color: isHighContrast ? theme.colors.high.textSecondary : theme.colors.normal.textSecondary,
      textAlign: 'center',
      fontSize: theme.fontSize.small,
    },
  });

  return (
    <View style={dynamicStyles.container}>
      {/* Header with TTS and Voice Commands */}
      <View style={dynamicStyles.header}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={title}
          onPress={handleTitlePress}
          style={dynamicStyles.titleContainer}
        >
          <Text 
            accessibilityRole="header" 
            style={dynamicStyles.title}
          >
            {title || 'FamilyBridge'}
          </Text>
        </Pressable>
        <View style={dynamicStyles.headerButtons}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('home.tts.readTitle')}
            onPress={readTitle}
            style={dynamicStyles.headerButton}
          >
            <Text style={dynamicStyles.headerButtonText}>
              {t('home.tts.readTitle') || 'Read Title'}
            </Text>
          </Pressable>
          {voiceCommandsEnabled && (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t('home.voiceCommands') || 'Voice Commands'}
              onPress={handleVoiceCommands}
              style={[dynamicStyles.headerButton, dynamicStyles.voiceButton]}
            >
              <Text style={dynamicStyles.headerButtonText}>🎤</Text>
            </Pressable>
          )}
        </View>
      </View>

      {/* Main Action Grid */}
      <View style={dynamicStyles.grid}>
        {/* Call Button - Only show if enabled */}
        {flags.CALL_ENABLED && (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('home.call')}
            onPress={handleCall}
            style={[dynamicStyles.actionTile, dynamicStyles.callTile]}
          >
            <Text style={dynamicStyles.tileIcon}>📞</Text>
            <Text style={dynamicStyles.tileLabel}>
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
            style={[dynamicStyles.actionTile, dynamicStyles.sosTile]}
          >
            <Text style={dynamicStyles.tileIcon}>🚨</Text>
            <Text style={dynamicStyles.tileLabel}>
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
            style={[dynamicStyles.actionTile, dynamicStyles.photosTile]}
          >
            <Text style={dynamicStyles.tileIcon}>📷</Text>
            <Text style={dynamicStyles.tileLabel}>
              {t('home.photos')}
            </Text>
          </Pressable>
        )}

        {/* Show message if all features are disabled */}
        {!flags.CALL_ENABLED && !flags.SOS_ENABLED && !flags.PHOTOS_ENABLED && (
          <View style={dynamicStyles.noFeaturesContainer}>
            <Text style={dynamicStyles.noFeaturesIcon}>⚙️</Text>
            <Text style={dynamicStyles.noFeaturesText}>
              {t('home.noFeatures')}
            </Text>
            <Text style={dynamicStyles.noFeaturesHint}>
              {t('home.noFeaturesHint')}
            </Text>
          </View>
        )}
      </View>

      {/* Hint Text */}
      <View style={dynamicStyles.hintContainer}>
        <Text style={dynamicStyles.hint}>
          {t('home.hint')}
        </Text>
      </View>
    </View>
  );
}

