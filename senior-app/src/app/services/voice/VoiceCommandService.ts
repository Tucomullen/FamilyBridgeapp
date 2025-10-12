import { getCurrentLocale } from '../../i18n';

// Try to import Voice, but handle cases where it's not available
let Voice: any = null;
let isExpoGo = false;

try {
  // Check if we're running in Expo Go
  isExpoGo = typeof __DEV__ !== 'undefined' && 
    (global as any).expo !== undefined;
  
  if (!isExpoGo) {
    Voice = require('@react-native-voice/voice').default;
  }
} catch (error) {
  console.warn('🎤 Voice module not available:', error);
}

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
  private isVoiceAvailable = false;

  constructor() {
    this.initializeVoice();
  }

  private async initializeVoice() {
    if (isExpoGo) {
      console.warn('🎤 Voice module not available in Expo Go - voice commands disabled');
      this.isVoiceAvailable = false;
      return;
    }

    if (!Voice) {
      console.warn('🎤 Voice module not available - voice commands disabled');
      this.isVoiceAvailable = false;
      return;
    }

    try {
      const isAvailable = await Voice.isAvailable();
      this.isVoiceAvailable = isAvailable;
      if (isAvailable) {
        this.setupVoiceListeners();
        console.log('🎤 Voice service initialized successfully');
      } else {
        console.warn('🎤 Voice recognition not available on this device');
      }
    } catch (error) {
      console.error('🎤 Failed to initialize voice service:', error);
      this.isVoiceAvailable = false;
    }
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
    if (isExpoGo || !Voice || !this.isVoiceAvailable) return;

    Voice.onSpeechStart = () => {
      console.log('🎤 Voice recognition started');
      this.emit('listening');
    };

    Voice.onSpeechEnd = () => {
      console.log('🎤 Voice recognition ended');
      this.stopListening();
    };

    Voice.onSpeechResults = (e: any) => {
      if (e.value && e.value.length > 0) {
        const transcript = e.value[0];
        const confidence = 0.8; // Default confidence since it's not available in the type
        console.log('🎤 Voice result:', transcript, 'confidence:', confidence);
        this.emit('result', { transcript, confidence });
      }
    };

    Voice.onSpeechError = (e: any) => {
      console.error('🎤 Voice error:', e.error);
      this.emit('error', { error: e.error?.message || 'Unknown error' });
      this.stopListening();
    };
  }

  /**
   * Check if voice recognition is available
   */
  isAvailable(): boolean {
    return this.isVoiceAvailable;
  }

  /**
   * Start listening for voice commands
   */
  async startListening(options: VoiceCommandOptions = {}): Promise<void> {
    if (!this.isVoiceAvailable) {
      const error = 'Voice recognition not available on this device';
      console.warn('🎤', error);
      this.emit('error', { error });
      throw new Error(error);
    }

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
    if (!this.isListening || !this.isVoiceAvailable) {
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
    if (isExpoGo || !Voice || !this.isVoiceAvailable) {
      return false;
    }

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
