import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { colors, spacing, typography } from '../theme/colors';
import { t } from '../i18n';
import { speak } from '../lib/accessibility/tts';

type Props = {
  navigation: any;
};

export default function SeniorHomeScreen({ navigation }: Props) {
  const title = t('home.title');
  
  const handleCall = () => {
    navigation.navigate('Call');
  };

  const handleSOS = () => {
    navigation.navigate('SOS');
  };

  const handlePhotos = () => {
    navigation.navigate('Photos');
  };

  const readTitle = () => {
    speak(title);
  };

  return (
    <View style={styles.container}>
      {/* Header with TTS */}
      <View style={styles.header}>
        <Text 
          accessibilityRole="header" 
          accessibilityLabel={title}
          style={[typography.h1, styles.title]}
        >
          {title}
        </Text>
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
          onPress={handleCall}
          style={[styles.actionTile, styles.callTile]}
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
          onPress={handleSOS}
          style={[styles.actionTile, styles.sosTile]}
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
          onPress={handlePhotos}
          style={[styles.actionTile, styles.photosTile]}
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
});
