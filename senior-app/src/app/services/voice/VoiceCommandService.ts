import Voice, { SpeechResultsEvent, SpeechErrorEvent } from '@react-native-voice/voice';
import { getCurrentLocale } from '../../i18n';

export interface VoiceCommandEvent {
  type: 'listening' | 'result' | 'error' | 'timeout' | 'stopped';
  data?: {
    transcript?: string;
    confidence?: number;
    error?: string;
  };
}

export interface VoiceCommandOptions {
  language?: 'es-ES' | 'en-US';
  timeout?: number; // in milliseconds
  onStart?: () => void;
  onResult?: (transcript: string, confidence: number) => void;
  onError?: (error: string) => void;
  onTimeout?: () => void;
  onStop?: () => void;
}

class VoiceCommandService {
  private isListening = false;
  private timeoutId: number | null = null;
  private readonly defaultTimeout = 8000; // 8 seconds
  private currentLanguage: 'es-ES' | 'en-US' = 'en-US';
  private listeners: Map<string, ((event: VoiceCommandEvent) => void)[]> = new Map();

  constructor() {
    this.setupVoiceListeners();
  }

  on(event: string, listener: (event: VoiceCommandEvent) => void): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(listener);
  }

  emit(event: string, data?: any): void {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      eventListeners.forEach(listener => listener({ type: event as any, data }));
    }
  }

  removeAllListeners(): void {
    this.listeners.clear();
  }

  private setupVoiceListeners(): void {
    Voice.onSpeechStart = () => {
      console.log('🎤 Voice recognition started');
      this.emit('listening');
    };

    Voice.onSpeechEnd = () => {
      console.log('🎤 Voice recognition ended');
      this.stopListening();
    };

    Voice.onSpeechResults = (e: SpeechResultsEvent) => {
      if (e.value && e.value.length > 0) {
        const transcript = e.value[0];
        const confidence = 0.8; // Default confidence since it's not available in the type
        console.log('🎤 Voice result:', transcript, 'confidence:', confidence);
        this.emit('result', { transcript, confidence });
      }
    };

    Voice.onSpeechError = (e: SpeechErrorEvent) => {
      console.error('🎤 Voice error:', e.error);
      this.emit('error', { error: e.error?.message || 'Unknown error' });
      this.stopListening();
    };
  }

  /**
   * Start listening for voice commands
   */
  async startListening(options: VoiceCommandOptions = {}): Promise<void> {
    if (this.isListening) {
      console.log('🎤 Already listening, stopping previous session');
      await this.stopListening();
    }

    try {
      // Set language based on device locale or provided option
      this.currentLanguage = options.language || this.getDeviceLanguage();
      
      // Request permissions first
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) {
        throw new Error('Microphone permission denied');
      }

      // Start voice recognition
      await Voice.start(this.currentLanguage);
      this.isListening = true;

      // Set up timeout
      const timeout = options.timeout || this.defaultTimeout;
      this.timeoutId = setTimeout(() => {
        console.log('🎤 Voice recognition timeout');
        this.emit('timeout');
        this.stopListening();
      }, timeout) as any;

      // Call onStart callback
      options.onStart?.();
      this.emit('listening');

      console.log('🎤 Voice recognition started for language:', this.currentLanguage);
    } catch (error) {
      console.error('🎤 Failed to start voice recognition:', error);
      this.emit('error', { error: error instanceof Error ? error.message : 'Failed to start listening' });
      throw error;
    }
  }

  /**
   * Stop listening for voice commands
   */
  async stopListening(): Promise<void> {
    if (!this.isListening) {
      return;
    }

    try {
      await Voice.stop();
      this.isListening = false;
      
      if (this.timeoutId) {
        clearTimeout(this.timeoutId);
        this.timeoutId = null;
      }

      this.emit('stopped');
      console.log('🎤 Voice recognition stopped');
    } catch (error) {
      console.error('🎤 Failed to stop voice recognition:', error);
    }
  }

  /**
   * Check if currently listening
   */
  isCurrentlyListening(): boolean {
    return this.isListening;
  }

  /**
   * Get current language
   */
  getCurrentLanguage(): 'es-ES' | 'en-US' {
    return this.currentLanguage;
  }

  /**
   * Request microphone permissions
   */
  private async requestPermissions(): Promise<boolean> {
    try {
      const hasPermission = await Voice.isAvailable();
      if (!hasPermission) {
        console.log('🎤 Voice recognition not available on this device');
        return false;
      }
      return true;
    } catch (error) {
      console.error('🎤 Permission check failed:', error);
      return false;
    }
  }

  /**
   * Get device language for voice recognition
   */
  private getDeviceLanguage(): 'es-ES' | 'en-US' {
    const locale = getCurrentLocale();
    return locale === 'es' ? 'es-ES' : 'en-US';
  }

  /**
   * Destroy the service and clean up
   */
  destroy(): void {
    this.stopListening();
    this.removeAllListeners();
  }
}

// Export singleton instance
export const voiceCommandService = new VoiceCommandService();
