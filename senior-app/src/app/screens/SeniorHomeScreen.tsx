import React, { useState, useEffect } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { colors, spacing, typography } from '../theme/colors';
import { t } from '../i18n';
import { speak } from '../lib/accessibility/tts';
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

  useEffect(() => {
    loadFlags();
  }, []);

  const loadFlags = async () => {
    await featureFlags.initialize();
    setFlags(featureFlags.getAllFlags());
  };

  const title = t('home.title');
  
  const handleCall = async () => {
    if (!flags.CALL_ENABLED) return;
    await logEvent('photos_open');
    navigation.navigate('Call');
  };

  const handleSOS = async () => {
    if (!flags.SOS_ENABLED) return;
    await logEvent('sos_send_attempt');
    navigation.navigate('SOS');
  };

  const handlePhotos = async () => {
    if (!flags.PHOTOS_ENABLED) return;
    await logEvent('photos_open');
    navigation.navigate('Photos');
  };

  const readTitle = () => {
    speak(title);
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

  return (
    <View style={styles.container}>
      {/* Header with TTS */}
      <View style={styles.header}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={title}
          onPress={handleTitlePress}
        >
          <Text 
            accessibilityRole="header" 
            style={[typography.h1, styles.title]}
          >
            {title}
          </Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('home.tts.readTitle')}
          onPress={readTitle}
          style={styles.ttsButton}
        >
          <Text style={[typography.body, styles.ttsText]}>
            {t('home.tts.readTitle')}
          </Text>
        </Pressable>
      </View>

      {/* Main Action Grid */}
      <View style={styles.grid}>
        {/* Call Button */}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('home.call')}
          accessibilityState={{ disabled: !flags.CALL_ENABLED }}
          onPress={handleCall}
          style={[
            styles.actionTile, 
            styles.callTile,
            !flags.CALL_ENABLED && styles.disabledTile
          ]}
        >
          <Text style={[typography.h2, styles.tileIcon]}>📞</Text>
          <Text style={[typography.h2, styles.tileLabel]}>
            {t('home.call')}
          </Text>
        </Pressable>

        {/* SOS Button */}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('home.sos')}
          accessibilityState={{ disabled: !flags.SOS_ENABLED }}
          onPress={handleSOS}
          style={[
            styles.actionTile, 
            styles.sosTile,
            !flags.SOS_ENABLED && styles.disabledTile
          ]}
        >
          <Text style={[typography.h2, styles.tileIcon]}>🚨</Text>
          <Text style={[typography.h2, styles.tileLabel]}>
            {t('home.sos')}
          </Text>
        </Pressable>

        {/* Photos Button */}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('home.photos')}
          accessibilityState={{ disabled: !flags.PHOTOS_ENABLED }}
          onPress={handlePhotos}
          style={[
            styles.actionTile, 
            styles.photosTile,
            !flags.PHOTOS_ENABLED && styles.disabledTile
          ]}
        >
          <Text style={[typography.h2, styles.tileIcon]}>📷</Text>
          <Text style={[typography.h2, styles.tileLabel]}>
            {t('home.photos')}
          </Text>
        </Pressable>
      </View>

      {/* Hint Text */}
      <Text style={[typography.body, styles.hint]}>
        {t('home.hint')}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.highContrastBg,
    padding: spacing.l,
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  title: {
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.m,
  },
  ttsButton: {
    padding: spacing.m,
    backgroundColor: colors.surface,
    borderRadius: 8,
  },
  ttsText: {
    color: colors.text,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.l,
    marginBottom: spacing.xl,
  },
  actionTile: {
    width: 160,
    height: 160,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.l,
    minWidth: 160,
    minHeight: 160,
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
    fontSize: 48,
    marginBottom: spacing.m,
  },
  tileLabel: {
    color: colors.text,
    textAlign: 'center',
    fontWeight: '700',
  },
  hint: {
    color: colors.mutedText,
    textAlign: 'center',
    maxWidth: 300,
  },
  disabledTile: {
    opacity: 0.5,
  },
});
