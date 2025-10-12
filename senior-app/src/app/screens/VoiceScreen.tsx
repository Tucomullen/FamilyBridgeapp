import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, 
  Text, 
  Pressable, 
  StyleSheet, 
  Alert,
  SafeAreaView,
  StatusBar
} from 'react-native';
import { colors, spacing, typography } from '../theme/colors';
import { t } from '../i18n';
import { voiceCommandService, VoiceCommandEvent } from '../services/voice/VoiceCommandService';
import { parseVoiceIntent, getExamplePhrases, VoiceIntent } from '../services/voice/intent';
import { ttsService } from '../services/tts';

type Props = {
  navigation: any;
};

type VoiceState = 'idle' | 'listening' | 'thinking' | 'result' | 'error';

export default function VoiceScreen({ navigation }: Props) {
  const [voiceState, setVoiceState] = useState<VoiceState>('idle');
  const [lastTranscript, setLastTranscript] = useState<string>('');
  const [lastIntent, setLastIntent] = useState<VoiceIntent>('UNKNOWN');
  const [currentLanguage, setCurrentLanguage] = useState<'es-ES' | 'en-US'>('en-US');

  useEffect(() => {
    // Set language based on device locale
    const locale = t('common.locale') || 'en';
    setCurrentLanguage(locale === 'es' ? 'es-ES' : 'en-US');

    // Set up voice command listeners
    const handleVoiceEvent = (event: VoiceCommandEvent) => {
      switch (event.type) {
        case 'listening':
          setVoiceState('listening');
          break;
        case 'result':
          if (event.data?.transcript) {
            setLastTranscript(event.data.transcript);
            setVoiceState('thinking');
            handleVoiceResult(event.data.transcript, event.data.confidence || 0);
          }
          break;
        case 'error':
          setVoiceState('error');
          if (event.data?.error) {
            showError(event.data.error);
          }
          break;
        case 'timeout':
          setVoiceState('idle');
          speakFeedback('timeout');
          break;
        case 'stopped':
          if (voiceState === 'listening') {
            setVoiceState('idle');
          }
          break;
      }
    };

    voiceCommandService.on('listening', () => handleVoiceEvent({ type: 'listening' }));
    voiceCommandService.on('result', (event) => handleVoiceEvent({ type: 'result', data: event.data }));
    voiceCommandService.on('error', (event) => handleVoiceEvent({ type: 'error', data: event.data }));
    voiceCommandService.on('timeout', () => handleVoiceEvent({ type: 'timeout' }));
    voiceCommandService.on('stopped', () => handleVoiceEvent({ type: 'stopped' }));

    return () => {
      voiceCommandService.removeAllListeners();
    };
  }, [voiceState]);

  const handleVoiceResult = useCallback(async (transcript: string, confidence: number) => {
    try {
      const intentResult = parseVoiceIntent(transcript, currentLanguage);
      setLastIntent(intentResult.intent);
      
      if (intentResult.intent === 'UNKNOWN') {
        setVoiceState('error');
        speakFeedback('not_understood');
        return;
      }

      setVoiceState('result');
      await executeIntent(intentResult);
    } catch (error) {
      console.error('Error processing voice result:', error);
      setVoiceState('error');
      speakFeedback('error');
    }
  }, [currentLanguage]);

  const executeIntent = async (intentResult: any) => {
    const { intent, payload } = intentResult;
    
    switch (intent) {
      case 'CALL':
        speakFeedback('calling', payload?.name);
        // Navigate to call screen with contact name
        navigation.navigate('Call', { contactName: payload?.name });
        break;
        
      case 'PHOTOS':
        speakFeedback('opening_photos');
        navigation.navigate('Photos');
        // TODO: Handle next/previous if photos screen is already open
        break;
        
      case 'SOS':
        speakFeedback('opening_sos');
        navigation.navigate('SOS');
        break;
        
      case 'NAV_BACK':
        speakFeedback('going_back');
        navigation.goBack();
        break;
        
      case 'NAV_HOME':
        speakFeedback('going_home');
        navigation.navigate('Home');
        break;
        
      case 'READ':
        speakFeedback('reading_screen');
        // TODO: Implement screen reading functionality
        break;
        
      default:
        speakFeedback('not_understood');
    }
  };

  const speakFeedback = async (type: string, name?: string) => {
    if (!ttsService.isVoiceFeedbackEnabled()) return;

    const messages = {
      listening: currentLanguage === 'es-ES' ? 'Te escucho...' : 'I\'m listening...',
      not_understood: currentLanguage === 'es-ES' ? 'No te entendí. Toca el botón para intentar de nuevo.' : 'I didn\'t understand. Tap the button to try again.',
      timeout: currentLanguage === 'es-ES' ? 'No te entendí. Toca el botón para intentar de nuevo.' : 'I didn\'t understand. Tap the button to try again.',
      error: currentLanguage === 'es-ES' ? 'Hubo un error. Inténtalo de nuevo.' : 'There was an error. Please try again.',
      calling: currentLanguage === 'es-ES' ? `Llamando a ${name || 'contacto'}...` : `Calling ${name || 'contact'}...`,
      opening_photos: currentLanguage === 'es-ES' ? 'Abriendo fotos...' : 'Opening photos...',
      opening_sos: currentLanguage === 'es-ES' ? 'Abriendo emergencias...' : 'Opening emergency...',
      going_back: currentLanguage === 'es-ES' ? 'Volviendo atrás...' : 'Going back...',
      going_home: currentLanguage === 'es-ES' ? 'Yendo al inicio...' : 'Going home...',
      reading_screen: currentLanguage === 'es-ES' ? 'Leyendo pantalla...' : 'Reading screen...'
    };

    const message = messages[type as keyof typeof messages] || messages.not_understood;
    await ttsService.speak(message);
  };

  const showError = (error: string) => {
    Alert.alert(
      currentLanguage === 'es-ES' ? 'Error de voz' : 'Voice Error',
      error,
      [{ text: currentLanguage === 'es-ES' ? 'OK' : 'OK' }]
    );
  };

  const handlePressToTalk = async () => {
    // Check if voice recognition is available
    if (!voiceCommandService.isAvailable()) {
      Alert.alert(
        currentLanguage === 'es-ES' ? 'No disponible' : 'Not Available',
        currentLanguage === 'es-ES' 
          ? 'El reconocimiento de voz no está disponible en este dispositivo.'
          : 'Voice recognition is not available on this device.',
        [{ text: currentLanguage === 'es-ES' ? 'OK' : 'OK' }]
      );
      return;
    }

    if (voiceState === 'listening') {
      await voiceCommandService.stopListening();
      return;
    }

    try {
      setVoiceState('idle');
      await speakFeedback('listening');
      await voiceCommandService.startListening({
        language: currentLanguage,
        timeout: 8000
      });
    } catch (error) {
      console.error('Failed to start voice recognition:', error);
      setVoiceState('error');
      speakFeedback('error');
    }
  };

  const getButtonText = () => {
    if (!voiceCommandService.isAvailable()) {
      return currentLanguage === 'es-ES' ? '❌ No disponible' : '❌ Not Available';
    }

    switch (voiceState) {
      case 'listening':
        return currentLanguage === 'es-ES' ? '🎤 Escuchando...' : '🎤 Listening...';
      case 'thinking':
        return currentLanguage === 'es-ES' ? '🤔 Pensando...' : '🤔 Thinking...';
      case 'result':
        return currentLanguage === 'es-ES' ? '✅ Listo' : '✅ Done';
      case 'error':
        return currentLanguage === 'es-ES' ? '❌ Error' : '❌ Error';
      default:
        return currentLanguage === 'es-ES' ? '🎤 Hablar' : '🎤 Speak';
    }
  };

  const getButtonColor = () => {
    if (!voiceCommandService.isAvailable()) {
      return colors.mutedText;
    }

    switch (voiceState) {
      case 'listening':
        return colors.success;
      case 'thinking':
        return colors.warning;
      case 'result':
        return colors.primary;
      case 'error':
        return colors.danger;
      default:
        return colors.primary;
    }
  };

  const examplePhrases = getExamplePhrases(currentLanguage);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.highContrastBg} />
      
      <View style={styles.content}>
        <Text style={styles.title}>
          {currentLanguage === 'es-ES' ? 'Comandos por Voz' : 'Voice Commands'}
        </Text>
        
        <Text style={styles.subtitle}>
          {currentLanguage === 'es-ES' 
            ? 'Toca el botón y di lo que necesitas' 
            : 'Tap the button and say what you need'
          }
        </Text>

        <Pressable
          style={[styles.speakButton, { backgroundColor: getButtonColor() }]}
          onPress={handlePressToTalk}
          accessibilityLabel={getButtonText()}
          accessibilityRole="button"
        >
          <Text style={styles.speakButtonText}>{getButtonText()}</Text>
        </Pressable>

        {lastTranscript && (
          <View style={styles.resultContainer}>
            <Text style={styles.resultLabel}>
              {currentLanguage === 'es-ES' ? 'Dijiste:' : 'You said:'}
            </Text>
            <Text style={styles.resultText}>"{lastTranscript}"</Text>
            {lastIntent !== 'UNKNOWN' && (
              <Text style={styles.intentText}>
                {currentLanguage === 'es-ES' ? 'Acción:' : 'Action:'} {lastIntent}
              </Text>
            )}
          </View>
        )}

        <View style={styles.examplesContainer}>
          <Text style={styles.examplesTitle}>
            {currentLanguage === 'es-ES' ? 'Ejemplos:' : 'Examples:'}
          </Text>
          {examplePhrases.map((phrase, index) => (
            <Text key={index} style={styles.examplePhrase}>
              • {phrase}
            </Text>
          ))}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.highContrastBg,
  },
  content: {
    flex: 1,
    padding: spacing.l,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    ...typography.h1,
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.m,
  },
  subtitle: {
    ...typography.body,
    color: colors.mutedText,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  speakButton: {
    width: 200,
    height: 200,
    borderRadius: 100,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xl,
    shadowColor: colors.text,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  speakButtonText: {
    ...typography.button,
    color: colors.text,
    textAlign: 'center',
  },
  resultContainer: {
    backgroundColor: colors.surface,
    padding: spacing.m,
    borderRadius: 8,
    marginBottom: spacing.l,
    width: '100%',
    maxWidth: 300,
  },
  resultLabel: {
    ...typography.body,
    color: colors.mutedText,
    marginBottom: spacing.s,
  },
  resultText: {
    ...typography.body,
    color: colors.text,
    fontStyle: 'italic',
    marginBottom: spacing.s,
  },
  intentText: {
    ...typography.body,
    color: colors.primary,
    fontWeight: '600',
  },
  examplesContainer: {
    width: '100%',
    maxWidth: 300,
  },
  examplesTitle: {
    ...typography.h3,
    color: colors.text,
    marginBottom: spacing.m,
    textAlign: 'center',
  },
  examplePhrase: {
    ...typography.body,
    color: colors.mutedText,
    marginBottom: spacing.s,
    textAlign: 'left',
  },
});
