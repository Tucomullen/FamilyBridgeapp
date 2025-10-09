import React, { useEffect, useState } from 'react';
import { View, Text, Pressable, Switch, ScrollView } from 'react-native';
import { colors, spacing, typography } from '../theme/colors';
import { t, setLocale, getCurrentLocale, getDeviceLanguageCode, logLanguageInfo } from '../i18n';
import { featureFlags, FeatureFlag } from '../flags/featureFlags';
import { logEvent } from '../telemetry/logEvent';

type Props = {
  navigation: any;
};

export default function SettingsScreen({ navigation }: Props) {
  const [flags, setFlags] = useState<Record<FeatureFlag, boolean>>({
    CALL_ENABLED: true,
    SOS_ENABLED: true,
    PHOTOS_ENABLED: true,
    TELEMETRY_ENABLED: true,
  });
  const [currentLanguage, setCurrentLanguage] = useState(getCurrentLocale());

  useEffect(() => {
    loadFlags();
  }, []);

  const loadFlags = async () => {
    await featureFlags.initialize();
    setFlags(featureFlags.getAllFlags());
  };

  const toggleFlag = async (flag: FeatureFlag) => {
    const newValue = !flags[flag];
    await featureFlags.setFlag(flag, newValue);
    setFlags({ ...flags, [flag]: newValue });
    
    // Log the toggle event
    await logEvent('flag_toggle', { flag, enabled: newValue });
  };

  const resetToDefaults = async () => {
    await featureFlags.resetToDefaults();
    await loadFlags();
  };

  const switchLanguage = (language: 'es' | 'en') => {
    setLocale(language);
    setCurrentLanguage(language);
    logLanguageInfo();
  };

  return (
    <ScrollView style={styles.container}>
      <Text 
        accessibilityRole="header"
        style={[typography.h1, styles.title]}
      >
        {t('settings.title')}
      </Text>

      {/* Language Selection */}
      <View style={styles.section}>
        <Text style={[typography.h2, styles.sectionTitle]}>
          {t('settings.language.title')}
        </Text>
        <Text style={[typography.body, styles.languageInfo]}>
          {t('settings.language.device')}: {getDeviceLanguageCode()}
        </Text>
        
                <View style={styles.languageRow}>
          <Pressable
            style={[
              styles.languageButton,
              currentLanguage === 'es' && styles.languageButtonActive
            ]}
            onPress={() => switchLanguage('es')}
          >
            <Text style={[
              styles.languageButtonText,
              currentLanguage === 'es' && styles.languageButtonTextActive
            ]}>
              Español
            </Text>
          </Pressable>
          
          <Pressable
            style={[
              styles.languageButton,
              currentLanguage === 'en' && styles.languageButtonActive
            ]}
            onPress={() => switchLanguage('en')}
          >
            <Text style={[
              styles.languageButtonText,
              currentLanguage === 'en' && styles.languageButtonTextActive
            ]}>
              English
            </Text>
          </Pressable>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={[typography.h2, styles.sectionTitle]}>
          {t('settings.features')}
        </Text>

        <View style={styles.flagRow}>
          <Text style={[typography.body, styles.flagLabel]}>
            {t('settings.flags.call')}
          </Text>
          <Switch
            value={flags.CALL_ENABLED}
            onValueChange={() => toggleFlag('CALL_ENABLED')}
            trackColor={{ false: colors.surface, true: colors.primary }}
            thumbColor={flags.CALL_ENABLED ? colors.text : colors.mutedText}
          />
        </View>

        <View style={styles.flagRow}>
          <Text style={[typography.body, styles.flagLabel]}>
            {t('settings.flags.sos')}
          </Text>
          <Switch
            value={flags.SOS_ENABLED}
            onValueChange={() => toggleFlag('SOS_ENABLED')}
            trackColor={{ false: colors.surface, true: colors.primary }}
            thumbColor={flags.SOS_ENABLED ? colors.text : colors.mutedText}
          />
        </View>

        <View style={styles.flagRow}>
          <Text style={[typography.body, styles.flagLabel]}>
            {t('settings.flags.photos')}
          </Text>
          <Switch
            value={flags.PHOTOS_ENABLED}
            onValueChange={() => toggleFlag('PHOTOS_ENABLED')}
            trackColor={{ false: colors.surface, true: colors.primary }}
            thumbColor={flags.PHOTOS_ENABLED ? colors.text : colors.mutedText}
          />
        </View>

        <View style={styles.flagRow}>
          <Text style={[typography.body, styles.flagLabel]}>
            {t('settings.flags.telemetry')}
          </Text>
          <Switch
            value={flags.TELEMETRY_ENABLED}
            onValueChange={() => toggleFlag('TELEMETRY_ENABLED')}
            trackColor={{ false: colors.surface, true: colors.primary }}
            thumbColor={flags.TELEMETRY_ENABLED ? colors.text : colors.mutedText}
          />
        </View>
      </View>

      <View style={styles.actions}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('settings.reset')}
          onPress={resetToDefaults}
          style={[styles.button, styles.resetButton]}
        >
          <Text style={[typography.button, styles.buttonText]}>
            {t('settings.reset')}
          </Text>
        </Pressable>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('common.back')}
          onPress={() => navigation.goBack()}
          style={[styles.button, styles.backButton]}
        >
          <Text style={[typography.button, styles.buttonText]}>
            {t('common.back')}
          </Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = {
  container: {
    flex: 1,
    backgroundColor: colors.highContrastBg,
    padding: spacing.l,
  },
  title: {
    color: colors.text,
    textAlign: 'center' as const,
    marginBottom: spacing.xl,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    color: colors.text,
    marginBottom: spacing.l,
  },
  languageInfo: {
    color: colors.mutedText,
    marginBottom: spacing.m,
    textAlign: 'center' as const,
  },
  languageRow: {
    flexDirection: 'row' as const,
    justifyContent: 'space-around' as const,
  },
  languageButton: {
    flex: 1,
    padding: spacing.m,
    backgroundColor: colors.surface,
    borderRadius: 8,
    alignItems: 'center' as const,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  languageButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.text,
  },
  languageButtonText: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '600' as const,
  },
  languageButtonTextActive: {
    color: colors.highContrastBg,
  },
  flagRow: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    paddingVertical: spacing.m,
    borderBottomWidth: 1,
    borderBottomColor: colors.surface,
  },
  flagLabel: {
    color: colors.text,
    flex: 1,
  },
  actions: {
    gap: spacing.m,
  },
  button: {
    padding: spacing.l,
    borderRadius: 12,
    alignItems: 'center' as const,
  },
  resetButton: {
    backgroundColor: colors.surface,
  },
  backButton: {
    backgroundColor: colors.primary,
  },
  buttonText: {
    color: colors.text,
  },
};
