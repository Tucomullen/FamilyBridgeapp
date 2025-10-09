import * as Speech from 'expo-speech';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { getCurrentLocale } from '../i18n';

export interface Voice {
  id: string;
  name: string;
  language: string;
  quality: 'default' | 'enhanced';
  isDefault?: boolean;
}

export interface TTSSettings {
  voiceId: string | null;
  rate: number; // 0.5 to 1.5
  pitch: number; // 0.5 to 2.0
  volume: number; // 0.0 to 1.0
  voiceFeedbackEnabled: boolean;
}

export interface SpeakOptions {
  voiceId?: string;
  rate?: number;
  pitch?: number;
  volume?: number;
  language?: string;
  onStart?: () => void;
  onDone?: () => void;
  onError?: (error: Error) => void;
}

class TTSService {
  private isInitialized = false;
  private availableVoices: Voice[] = [];
  private currentSettings: TTSSettings = {
    voiceId: null,
    rate: 1.0,
    pitch: 1.0,
    volume: 1.0,
    voiceFeedbackEnabled: true,
  };
  private isSpeaking = false;
  private isPaused = false;
  private currentUtterance: any = null;
  private errorCount = 0;
  private readonly MAX_ERRORS = 3;

  private readonly STORAGE_KEYS = {
    VOICE_ID: 'tts_voice_id',
    RATE: 'tts_rate',
    PITCH: 'tts_pitch',
    VOLUME: 'tts_volume',
    VOICE_FEEDBACK_ENABLED: 'tts_voice_feedback_enabled',
  };

  /**
   * Initialize the TTS service
   * Loads available voices and user preferences
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      console.log('🔊 Initializing TTS service...');
      
      // Load user preferences
      await this.loadSettings();
      
      // Load available voices
      await this.loadVoices();
      
      // Set default voice based on device language
      await this.setDefaultVoice();
      
      this.isInitialized = true;
      console.log('🔊 TTS service initialized with', this.availableVoices.length, 'voices');
    } catch (error) {
      console.error('🔊 Failed to initialize TTS service:', error);
      this.isInitialized = true; // Mark as initialized to prevent retries
    }
  }

  /**
   * Load available voices from the system
   */
  private async loadVoices(): Promise<void> {
    try {
      const voices = await Speech.getAvailableVoicesAsync();
      
      this.availableVoices = voices.map(voice => ({
        id: voice.identifier,
        name: voice.name,
        language: voice.language,
        quality: (voice as any).quality === 'enhanced' ? 'enhanced' : 'default',
        isDefault: (voice as any).isDefault || false,
      }));

      console.log('🔊 Loaded voices:', this.availableVoices.map(v => `${v.name} (${v.language})`));
    } catch (error) {
      console.error('🔊 Failed to load voices:', error);
      this.availableVoices = [];
    }
  }

  /**
   * Load user preferences from AsyncStorage
   */
  private async loadSettings(): Promise<void> {
    try {
      const [voiceId, rate, pitch, volume, voiceFeedbackEnabled] = await Promise.all([
        AsyncStorage.getItem(this.STORAGE_KEYS.VOICE_ID),
        AsyncStorage.getItem(this.STORAGE_KEYS.RATE),
        AsyncStorage.getItem(this.STORAGE_KEYS.PITCH),
        AsyncStorage.getItem(this.STORAGE_KEYS.VOLUME),
        AsyncStorage.getItem(this.STORAGE_KEYS.VOICE_FEEDBACK_ENABLED),
      ]);

      this.currentSettings = {
        voiceId: voiceId || null,
        rate: rate ? parseFloat(rate) : 1.0,
        pitch: pitch ? parseFloat(pitch) : 1.0,
        volume: volume ? parseFloat(volume) : 1.0,
        voiceFeedbackEnabled: voiceFeedbackEnabled !== 'false',
      };

      console.log('🔊 Loaded TTS settings:', this.currentSettings);
    } catch (error) {
      console.error('🔊 Failed to load TTS settings:', error);
    }
  }

  /**
   * Save user preferences to AsyncStorage
   */
  private async saveSettings(): Promise<void> {
    try {
      await Promise.all([
        AsyncStorage.setItem(this.STORAGE_KEYS.VOICE_ID, this.currentSettings.voiceId || ''),
        AsyncStorage.setItem(this.STORAGE_KEYS.RATE, this.currentSettings.rate.toString()),
        AsyncStorage.setItem(this.STORAGE_KEYS.PITCH, this.currentSettings.pitch.toString()),
        AsyncStorage.setItem(this.STORAGE_KEYS.VOLUME, this.currentSettings.volume.toString()),
        AsyncStorage.setItem(this.STORAGE_KEYS.VOICE_FEEDBACK_ENABLED, this.currentSettings.voiceFeedbackEnabled.toString()),
      ]);
      console.log('🔊 TTS settings saved');
    } catch (error) {
      console.error('🔊 Failed to save TTS settings:', error);
    }
  }

  /**
   * Set default voice based on device language
   */
  private async setDefaultVoice(): Promise<void> {
    if (this.currentSettings.voiceId) return; // User has already selected a voice

    const deviceLanguage = getCurrentLocale();
    const preferredLanguage = deviceLanguage === 'es' ? 'es' : 'en';
    
    // Find best voice for the language
    const preferredVoice = this.availableVoices.find(voice => 
      voice.language.startsWith(preferredLanguage) && voice.quality === 'enhanced'
    ) || this.availableVoices.find(voice => 
      voice.language.startsWith(preferredLanguage)
    ) || this.availableVoices.find(voice => 
      voice.isDefault
    ) || this.availableVoices[0];

    if (preferredVoice) {
      this.currentSettings.voiceId = preferredVoice.id;
      await this.saveSettings();
      console.log('🔊 Set default voice:', preferredVoice.name);
    }
  }

  /**
   * Speak text with current or specified options
   */
  async speak(text: string, options: SpeakOptions = {}): Promise<void> {
    if (!this.isInitialized) {
      console.warn('🔊 TTS not initialized, skipping speech');
      return;
    }

    if (!this.currentSettings.voiceFeedbackEnabled) {
      console.log('🔊 Voice feedback disabled, skipping speech');
      return;
    }

    if (!text || text.trim().length === 0) {
      console.warn('🔊 Empty text provided to speak');
      return;
    }

    try {
      // Stop any current speech
      await this.stop();

      const voiceId = options.voiceId || this.currentSettings.voiceId;
      const rate = options.rate ?? this.currentSettings.rate;
      const pitch = options.pitch ?? this.currentSettings.pitch;
      const volume = options.volume ?? this.currentSettings.volume;

      const utterance: any = {
        text,
        voice: voiceId || undefined,
        rate: Math.max(0.1, Math.min(2.0, rate)),
        pitch: Math.max(0.1, Math.min(2.0, pitch)),
        volume: Math.max(0.0, Math.min(1.0, volume)),
        language: options.language || getCurrentLocale(),
        onStart: () => {
          this.isSpeaking = true;
          this.isPaused = false;
          this.errorCount = 0;
          console.log('🔊 Speech started:', text.substring(0, 50) + '...');
          options.onStart?.();
        },
        onDone: () => {
          this.isSpeaking = false;
          this.isPaused = false;
          console.log('🔊 Speech completed');
          options.onDone?.();
        },
        onError: (error: Error) => {
          this.isSpeaking = false;
          this.isPaused = false;
          this.errorCount++;
          console.error('🔊 Speech error:', error);
          
          // Disable voice feedback after too many errors
          if (this.errorCount >= this.MAX_ERRORS) {
            this.currentSettings.voiceFeedbackEnabled = false;
            this.saveSettings();
            console.warn('🔊 Disabled voice feedback due to repeated errors');
          }
          
          options.onError?.(error);
        },
      };

      this.currentUtterance = utterance;
      await Speech.speak(text, {
        voice: voiceId || undefined,
        rate: Math.max(0.1, Math.min(2.0, rate)),
        pitch: Math.max(0.1, Math.min(2.0, pitch)),
        volume: Math.max(0.0, Math.min(1.0, volume)),
        language: options.language || getCurrentLocale(),
        onStart: () => {
          this.isSpeaking = true;
          this.isPaused = false;
          this.errorCount = 0;
          console.log('🔊 Speech started:', text.substring(0, 50) + '...');
          options.onStart?.();
        },
        onDone: () => {
          this.isSpeaking = false;
          this.isPaused = false;
          console.log('🔊 Speech completed');
          options.onDone?.();
        },
        onError: (error: Error) => {
          this.isSpeaking = false;
          this.isPaused = false;
          this.errorCount++;
          console.error('🔊 Speech error:', error);
          
          // Disable voice feedback after too many errors
          if (this.errorCount >= this.MAX_ERRORS) {
            this.currentSettings.voiceFeedbackEnabled = false;
            this.saveSettings();
            console.warn('🔊 Disabled voice feedback due to repeated errors');
          }
          
          options.onError?.(error);
        },
      });
      
    } catch (error) {
      console.error('🔊 Failed to speak text:', error);
      this.errorCount++;
      
      if (this.errorCount >= this.MAX_ERRORS) {
        this.currentSettings.voiceFeedbackEnabled = false;
        await this.saveSettings();
        console.warn('🔊 Disabled voice feedback due to repeated errors');
      }
    }
  }

  /**
   * Pause current speech
   */
  async pause(): Promise<void> {
    if (!this.isSpeaking || this.isPaused) return;

    try {
      await Speech.pause();
      this.isPaused = true;
      console.log('🔊 Speech paused');
    } catch (error) {
      console.error('🔊 Failed to pause speech:', error);
    }
  }

  /**
   * Resume paused speech
   */
  async resume(): Promise<void> {
    if (!this.isSpeaking || !this.isPaused) return;

    try {
      await Speech.resume();
      this.isPaused = false;
      console.log('🔊 Speech resumed');
    } catch (error) {
      console.error('🔊 Failed to resume speech:', error);
    }
  }

  /**
   * Stop current speech
   */
  async stop(): Promise<void> {
    if (!this.isSpeaking) return;

    try {
      await Speech.stop();
      this.isSpeaking = false;
      this.isPaused = false;
      this.currentUtterance = null;
      console.log('🔊 Speech stopped');
    } catch (error) {
      console.error('🔊 Failed to stop speech:', error);
    }
  }

  /**
   * Get available voices
   */
  getVoices(): Voice[] {
    return [...this.availableVoices];
  }

  /**
   * Get current voice
   */
  getCurrentVoice(): Voice | null {
    if (!this.currentSettings.voiceId) return null;
    return this.availableVoices.find(voice => voice.id === this.currentSettings.voiceId) || null;
  }

  /**
   * Get current settings
   */
  getSettings(): TTSSettings {
    return { ...this.currentSettings };
  }

  /**
   * Update voice selection
   */
  async setVoice(voiceId: string): Promise<void> {
    const voice = this.availableVoices.find(v => v.id === voiceId);
    if (!voice) {
      console.warn('🔊 Voice not found:', voiceId);
      return;
    }

    this.currentSettings.voiceId = voiceId;
    await this.saveSettings();
    console.log('🔊 Voice changed to:', voice.name);
  }

  /**
   * Update speech rate
   */
  async setRate(rate: number): Promise<void> {
    const clampedRate = Math.max(0.1, Math.min(2.0, rate));
    this.currentSettings.rate = clampedRate;
    await this.saveSettings();
    console.log('🔊 Rate changed to:', clampedRate);
  }

  /**
   * Update speech pitch
   */
  async setPitch(pitch: number): Promise<void> {
    const clampedPitch = Math.max(0.1, Math.min(2.0, pitch));
    this.currentSettings.pitch = clampedPitch;
    await this.saveSettings();
    console.log('🔊 Pitch changed to:', clampedPitch);
  }

  /**
   * Update speech volume
   */
  async setVolume(volume: number): Promise<void> {
    const clampedVolume = Math.max(0.0, Math.min(1.0, volume));
    this.currentSettings.volume = clampedVolume;
    await this.saveSettings();
    console.log('🔊 Volume changed to:', clampedVolume);
  }

  /**
   * Toggle voice feedback
   */
  async setVoiceFeedbackEnabled(enabled: boolean): Promise<void> {
    this.currentSettings.voiceFeedbackEnabled = enabled;
    await this.saveSettings();
    console.log('🔊 Voice feedback', enabled ? 'enabled' : 'disabled');
  }

  /**
   * Test current voice settings
   */
  async testVoice(): Promise<void> {
    const testText = getCurrentLocale() === 'es' 
      ? 'Hola, soy tu asistente FamilyBridge. ¿Cómo estás hoy?'
      : 'Hello, I am your FamilyBridge assistant. How are you today?';
    
    await this.speak(testText);
  }

  /**
   * Check if TTS is currently speaking
   */
  isCurrentlySpeaking(): boolean {
    return this.isSpeaking;
  }

  /**
   * Check if TTS is paused
   */
  isCurrentlyPaused(): boolean {
    return this.isPaused;
  }

  /**
   * Check if voice feedback is enabled
   */
  isVoiceFeedbackEnabled(): boolean {
    return this.currentSettings.voiceFeedbackEnabled;
  }

  /**
   * Reset to default settings
   */
  async resetToDefaults(): Promise<void> {
    this.currentSettings = {
      voiceId: null,
      rate: 1.0,
      pitch: 1.0,
      volume: 1.0,
      voiceFeedbackEnabled: true,
    };
    
    await this.saveSettings();
    await this.setDefaultVoice();
    console.log('🔊 TTS settings reset to defaults');
  }
}

// Export singleton instance
export const ttsService = new TTSService();
