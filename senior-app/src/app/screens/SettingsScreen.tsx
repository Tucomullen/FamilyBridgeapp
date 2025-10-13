import React, { useEffect, useState } from 'react';
import { View, Text, Pressable, Switch, ScrollView, Alert } from 'react-native';
import { colors, spacing, typography } from '../theme/colors';
import { t, setLocale, getCurrentLocale, getDeviceLanguageCode, logLanguageInfo } from '../i18n';
import { featureFlags, FeatureFlag } from '../flags/featureFlags';
import { logEvent } from '../telemetry/logEvent';
import { ttsService, Voice, TTSSettings } from '../services/tts';
import { useUIScale, UIScale } from '../hooks/useUIScale';
import { navigationService } from '../services/navigation/NavigationService';
import NavigationHeader from '../components/nav/NavigationHeader';
import AsyncStorage from '@react-native-async-storage/async-storage';

type Props = {
  navigation: any;
};

export default function SettingsScreen({ navigation }: Props) {
  const { scale, contrast, setScale, toggleContrast, getScaleDisplayName, getContrastDisplayName } = useUIScale();
  const [flags, setFlags] = useState<Record<FeatureFlag, boolean>>({
    CALL_ENABLED: true,
    SOS_ENABLED: true,
    PHOTOS_ENABLED: true,
    TELEMETRY_ENABLED: true,
  });
  const [currentLanguage, setCurrentLanguage] = useState(getCurrentLocale());
  const [ttsSettings, setTtsSettings] = useState<TTSSettings>({
    voiceId: null,
    rate: 1.0,
    pitch: 1.0,
    volume: 1.0,
    voiceFeedbackEnabled: true,
  });
  const [availableVoices, setAvailableVoices] = useState<Voice[]>([]);
  const [isTtsInitialized, setIsTtsInitialized] = useState(false);
  const [voiceCommandsEnabled, setVoiceCommandsEnabled] = useState(true);

  useEffect(() => {
    loadFlags();
    initializeTTS();
    loadVoiceCommandsSetting();
  }, []);

  const loadFlags = async () => {
    await featureFlags.initialize();
    setFlags(featureFlags.getAllFlags());
  };

  const initializeTTS = async () => {
    try {
      await ttsService.initialize();
      const settings = ttsService.getSettings();
      const voices = ttsService.getVoices();
      
      setTtsSettings(settings);
      setAvailableVoices(voices);
      setIsTtsInitialized(true);
      
      console.log('🔊 TTS initialized in Settings');
    } catch (error) {
      console.error('🔊 Failed to initialize TTS in Settings:', error);
    }
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

  const handleVoiceChange = async (voiceId: string) => {
    try {
      await ttsService.setVoice(voiceId);
      const settings = ttsService.getSettings();
      setTtsSettings(settings);
      await logEvent('tts_voice_changed', { voiceId });
    } catch (error) {
      console.error('🔊 Failed to change voice:', error);
      Alert.alert('Error', 'No se pudo cambiar la voz');
    }
  };

  const handleRateChange = async (rate: number) => {
    try {
      await ttsService.setRate(rate);
      const settings = ttsService.getSettings();
      setTtsSettings(settings);
      await logEvent('tts_rate_changed', { rate });
    } catch (error) {
      console.error('🔊 Failed to change rate:', error);
    }
  };

  const handlePitchChange = async (pitch: number) => {
    try {
      await ttsService.setPitch(pitch);
      const settings = ttsService.getSettings();
      setTtsSettings(settings);
      await logEvent('tts_pitch_changed', { pitch });
    } catch (error) {
      console.error('🔊 Failed to change pitch:', error);
    }
  };

  const handleVolumeChange = async (volume: number) => {
    try {
      await ttsService.setVolume(volume);
      const settings = ttsService.getSettings();
      setTtsSettings(settings);
      await logEvent('tts_volume_changed', { volume });
    } catch (error) {
      console.error('🔊 Failed to change volume:', error);
    }
  };

  const handleVoiceFeedbackToggle = async (enabled: boolean) => {
    try {
      await ttsService.setVoiceFeedbackEnabled(enabled);
      const settings = ttsService.getSettings();
      setTtsSettings(settings);
      await logEvent('tts_feedback_toggled', { enabled });
    } catch (error) {
      console.error('🔊 Failed to toggle voice feedback:', error);
    }
  };

  const testVoice = async () => {
    try {
      await ttsService.testVoice();
      await logEvent('tts_test_voice');
    } catch (error) {
      console.error('🔊 Failed to test voice:', error);
      Alert.alert('Error', 'No se pudo probar la voz');
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

  const handleVoiceCommandsToggle = async (enabled: boolean) => {
    try {
      await AsyncStorage.setItem('voice_commands_enabled', enabled.toString());
      setVoiceCommandsEnabled(enabled);
      await logEvent('voice_commands_toggled', { enabled });
    } catch (error) {
      console.error('Failed to save voice commands setting:', error);
      Alert.alert('Error', 'No se pudo guardar la configuración');
    }
  };

  const handleScaleChange = async (newScale: UIScale) => {
    try {
      await setScale(newScale);
      const scaleName = getScaleDisplayName(newScale);
      const message = currentLanguage === 'es' 
        ? `Tamaño ${scaleName.toLowerCase()} activado`
        : `${scaleName} size activated`;
      
      if (ttsSettings.voiceFeedbackEnabled) {
        await ttsService.speak(message);
      }
      
      await logEvent('ui_scale_changed', { scale: newScale });
    } catch (error) {
      console.error('Failed to change UI scale:', error);
      Alert.alert('Error', 'No se pudo cambiar el tamaño');
    }
  };

  const handleContrastToggle = async () => {
    try {
      await toggleContrast();
      const contrastName = getContrastDisplayName();
      
      if (ttsSettings.voiceFeedbackEnabled) {
        await ttsService.speak(contrastName);
      }
      
      await logEvent('ui_contrast_toggled', { contrast });
    } catch (error) {
      console.error('Failed to toggle contrast:', error);
      Alert.alert('Error', 'No se pudo cambiar el contraste');
    }
  };

  const getCurrentVoiceName = (): string => {
    const currentVoice = ttsService.getCurrentVoice();
    return currentVoice ? currentVoice.name : t('settings.voice.defaultVoice');
  };

  return (
    <View style={styles.container}>
      {/* Navigation Header */}
      <NavigationHeader 
        showBack={true}
        showBreadcrumbs={true}
        showQuickHome={true}
      />
      
      <ScrollView style={styles.scrollContainer}>
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

      {/* UI Scaling Settings */}
      <View style={styles.section}>
        <Text style={[typography.h2, styles.sectionTitle]}>
          {currentLanguage === 'es' ? 'Tamaño de Texto y Botones' : 'Text & Button Size'}
        </Text>
        
        <View style={styles.scaleButtonsContainer}>
          <Pressable
            style={[
              styles.scaleButton,
              scale === 'small' && styles.scaleButtonActive
            ]}
            onPress={() => handleScaleChange('small')}
            accessibilityRole="button"
            accessibilityLabel={currentLanguage === 'es' ? 'Seleccionar tamaño pequeño' : 'Select small size'}
          >
            <Text style={[
              styles.scaleButtonText,
              scale === 'small' && styles.scaleButtonTextActive
            ]}>
              {currentLanguage === 'es' ? '🅐 Pequeño' : '🅐 Small'}
            </Text>
            <Text style={[
              styles.scaleButtonPreview,
              scale === 'small' && styles.scaleButtonPreviewActive
            ]}>
              Aa
            </Text>
          </Pressable>

          <Pressable
            style={[
              styles.scaleButton,
              scale === 'medium' && styles.scaleButtonActive
            ]}
            onPress={() => handleScaleChange('medium')}
            accessibilityRole="button"
            accessibilityLabel={currentLanguage === 'es' ? 'Seleccionar tamaño medio' : 'Select medium size'}
          >
            <Text style={[
              styles.scaleButtonText,
              scale === 'medium' && styles.scaleButtonTextActive
            ]}>
              {currentLanguage === 'es' ? '🅑 Medio' : '🅑 Medium'}
            </Text>
            <Text style={[
              styles.scaleButtonPreview,
              scale === 'medium' && styles.scaleButtonPreviewActive
            ]}>
              Aa
            </Text>
          </Pressable>

          <Pressable
            style={[
              styles.scaleButton,
              scale === 'large' && styles.scaleButtonActive
            ]}
            onPress={() => handleScaleChange('large')}
            accessibilityRole="button"
            accessibilityLabel={currentLanguage === 'es' ? 'Seleccionar tamaño grande' : 'Select large size'}
          >
            <Text style={[
              styles.scaleButtonText,
              scale === 'large' && styles.scaleButtonTextActive
            ]}>
              {currentLanguage === 'es' ? '🅒 Grande' : '🅒 Large'}
            </Text>
            <Text style={[
              styles.scaleButtonPreview,
              scale === 'large' && styles.scaleButtonPreviewActive
            ]}>
              Aa
            </Text>
          </Pressable>
        </View>

        <View style={styles.flagRow}>
          <View style={styles.flagLabelContainer}>
            <Text style={[typography.body, styles.flagLabel]}>
              {currentLanguage === 'es' ? 'Alto Contraste' : 'High Contrast'}
            </Text>
            <Text style={[typography.body, { color: colors.mutedText, fontSize: 12 }]}>
              {currentLanguage === 'es' 
                ? 'Mejora el contraste para mejor visibilidad' 
                : 'Enhance contrast for better visibility'
              }
            </Text>
          </View>
          <Switch
            value={contrast === 'high'}
            onValueChange={handleContrastToggle}
            trackColor={{ false: colors.surface, true: colors.primary }}
            thumbColor={contrast === 'high' ? colors.text : colors.mutedText}
          />
        </View>
      </View>

      {/* Voice Settings */}
      {isTtsInitialized && (
        <View style={styles.section}>
          <Text style={[typography.h2, styles.sectionTitle]}>
            {t('settings.voice.title')}
          </Text>

          {/* Voice Selection */}
          <View style={styles.voiceRow}>
            <Text style={[typography.body, styles.voiceLabel]}>
              {t('settings.voice.voice')}
            </Text>
            <Pressable
              style={styles.voiceSelector}
              onPress={() => {
                // Show voice selection modal
                Alert.alert(
                  t('settings.voice.selectVoice'),
                  '',
                  availableVoices.map(voice => ({
                    text: voice.name,
                    onPress: async () => await handleVoiceChange(voice.id),
                  })).concat([{ text: t('common.back'), onPress: async () => {} }])
                );
              }}
            >
              <Text style={[typography.body, styles.voiceSelectorText]}>
                {getCurrentVoiceName()}
              </Text>
              <Text style={[typography.body, { color: colors.mutedText }]}>
                ▼
              </Text>
            </Pressable>
          </View>

          {/* Speed Control */}
          <View style={styles.voiceRow}>
            <Text style={[typography.body, styles.voiceLabel]}>
              {t('settings.voice.speed')}
            </Text>
            <View style={styles.sliderContainer}>
              <Text style={[typography.body, { color: colors.mutedText, fontSize: 12 }]}>
                {t('settings.voice.speedSlow')}
              </Text>
              <View style={styles.sliderRow}>
                <Pressable
                  style={styles.sliderButton}
                  onPress={() => handleRateChange(0.5)}
                >
                  <Text style={[typography.body, { fontSize: 16 }]}>0.5x</Text>
                </Pressable>
                <Pressable
                  style={[styles.sliderButton, ttsSettings.rate === 1.0 && styles.sliderButtonActive]}
                  onPress={() => handleRateChange(1.0)}
                >
                  <Text style={[typography.body, { fontSize: 16 }]}>1.0x</Text>
                </Pressable>
                <Pressable
                  style={styles.sliderButton}
                  onPress={() => handleRateChange(1.5)}
                >
                  <Text style={[typography.body, { fontSize: 16 }]}>1.5x</Text>
                </Pressable>
              </View>
              <Text style={[typography.body, { color: colors.mutedText, fontSize: 12 }]}>
                {t('settings.voice.speedFast')}
              </Text>
            </View>
          </View>

          {/* Test Voice Button */}
          <Pressable
            style={[styles.button, { backgroundColor: colors.primary, marginTop: spacing.m }]}
            onPress={testVoice}
          >
            <Text style={[typography.button, { color: colors.text }]}>
              {t('settings.voice.test')}
            </Text>
          </Pressable>
        </View>
      )}

      {/* Accessibility Settings */}
      {isTtsInitialized && (
        <View style={styles.section}>
          <Text style={[typography.h2, styles.sectionTitle]}>
            {t('settings.accessibility.title')}
          </Text>

          <View style={styles.flagRow}>
            <View style={styles.flagLabelContainer}>
              <Text style={[typography.body, styles.flagLabel]}>
                {t('settings.accessibility.voiceFeedback')}
              </Text>
              <Text style={[typography.body, { color: colors.mutedText, fontSize: 12 }]}>
                {t('settings.accessibility.voiceFeedbackDesc')}
              </Text>
            </View>
            <Switch
              value={ttsSettings.voiceFeedbackEnabled}
              onValueChange={handleVoiceFeedbackToggle}
              trackColor={{ false: colors.surface, true: colors.primary }}
              thumbColor={ttsSettings.voiceFeedbackEnabled ? colors.text : colors.mutedText}
            />
          </View>

          <View style={styles.flagRow}>
            <View style={styles.flagLabelContainer}>
              <Text style={[typography.body, styles.flagLabel]}>
                {currentLanguage === 'es' ? 'Comandos por voz' : 'Voice Commands'}
              </Text>
              <Text style={[typography.body, { color: colors.mutedText, fontSize: 12 }]}>
                {currentLanguage === 'es' 
                  ? 'Usa comandos de voz para navegar la aplicación' 
                  : 'Use voice commands to navigate the app'
                }
              </Text>
            </View>
            <Switch
              value={voiceCommandsEnabled}
              onValueChange={handleVoiceCommandsToggle}
              trackColor={{ false: colors.surface, true: colors.primary }}
              thumbColor={voiceCommandsEnabled ? colors.text : colors.mutedText}
            />
          </View>
        </View>
      )}

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
        {__DEV__ && (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="API Development"
            onPress={() => navigation.navigate('DevApi')}
            style={[styles.button, { backgroundColor: colors.success }]}
          >
            <Text style={[typography.button, styles.buttonText]}>
              🔧 API Development
            </Text>
          </Pressable>
        )}

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
    </View>
  );
}

const styles = {
  container: {
    flex: 1,
    backgroundColor: colors.highContrastBg,
  },
  scrollContainer: {
    flex: 1,
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
  flagLabelContainer: {
    flex: 1,
  },
  voiceRow: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    paddingVertical: spacing.m,
    borderBottomWidth: 1,
    borderBottomColor: colors.surface,
  },
  voiceLabel: {
    color: colors.text,
    flex: 1,
  },
  voiceSelector: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.s,
    borderRadius: 8,
    minHeight: 48,
  },
  voiceSelectorText: {
    color: colors.text,
    marginRight: spacing.s,
  },
  sliderContainer: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    flex: 1,
    justifyContent: 'space-between' as const,
  },
  sliderRow: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: spacing.s,
  },
  sliderButton: {
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.s,
    backgroundColor: colors.surface,
    borderRadius: 6,
    minHeight: 40,
    minWidth: 50,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  sliderButtonActive: {
    backgroundColor: colors.primary,
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
  scaleButtonsContainer: {
    flexDirection: 'row' as const,
    justifyContent: 'space-around' as const,
    marginBottom: spacing.l,
    gap: spacing.s,
  },
  scaleButton: {
    flex: 1,
    padding: spacing.m,
    backgroundColor: colors.surface,
    borderRadius: 12,
    alignItems: 'center' as const,
    borderWidth: 2,
    borderColor: 'transparent',
    minHeight: 80,
    justifyContent: 'center' as const,
  },
  scaleButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.text,
  },
  scaleButtonText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600' as const,
    marginBottom: spacing.s,
  },
  scaleButtonTextActive: {
    color: colors.highContrastBg,
  },
  scaleButtonPreview: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '400' as const,
  },
  scaleButtonPreviewActive: {
    color: colors.highContrastBg,
  },
};
