// Conditional import for Expo Go compatibility
let Camera: any = null;

try {
  Camera = require('expo-camera');
} catch (error) {
  console.log('📷 expo-camera not available in Expo Go');
}

import { Platform } from 'react-native';
import { photoService, Photo } from './PhotoService';

export type CameraType = 'front' | 'back';
export type CameraFlashMode = 'off' | 'on' | 'auto';

export interface CameraSettings {
  type: CameraType;
  flashMode: CameraFlashMode;
  autoFocus: boolean;
  whiteBalance: 'auto' | 'sunny' | 'cloudy' | 'fluorescent' | 'incandescent';
}

export interface CameraState {
  isInitialized: boolean;
  hasPermission: boolean;
  isRecording: boolean;
  settings: CameraSettings;
}

class CameraManager {
  private isInitialized = false;
  private hasPermission = false;
  private settings: CameraSettings = {
    type: 'back',
    flashMode: 'auto',
    autoFocus: true,
    whiteBalance: 'auto',
  };

  async initialize(): Promise<void> {
    if (this.isInitialized) return;
    
    try {
      // Check camera availability
      if (!Camera) {
        console.log('📷 Camera not available in Expo Go');
        this.isInitialized = true;
        return;
      }

      // Check if camera is available on device by requesting permissions
      const { status } = await Camera.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        console.log('📷 Camera not available on this device');
        this.isInitialized = true;
        return;
      }

      // Request camera permission
      const permission = await photoService.requestCameraPermission();
      this.hasPermission = permission === 'granted';

      this.isInitialized = true;
      console.log('📷 CameraManager initialized, permission:', this.hasPermission);
    } catch (error) {
      console.error('📷 Failed to initialize CameraManager:', error);
      this.isInitialized = true;
    }
  }

  getState(): CameraState {
    return {
      isInitialized: this.isInitialized,
      hasPermission: this.hasPermission,
      isRecording: false,
      settings: { ...this.settings },
    };
  }

  async requestPermission(): Promise<boolean> {
    try {
      const permission = await photoService.requestCameraPermission();
      this.hasPermission = permission === 'granted';
      return this.hasPermission;
    } catch (error) {
      console.error('📷 Failed to request camera permission:', error);
      return false;
    }
  }

  async takePhoto(): Promise<Photo | null> {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }

      if (!this.hasPermission) {
        const granted = await this.requestPermission();
        if (!granted) {
          console.log('📷 Camera permission not granted');
          return null;
        }
      }

      return await photoService.takePhoto();
    } catch (error) {
      console.error('📷 Failed to take photo:', error);
      return null;
    }
  }

  async selectFromGallery(): Promise<Photo | null> {
    try {
      return await photoService.selectFromGallery();
    } catch (error) {
      console.error('📷 Failed to select photo from gallery:', error);
      return null;
    }
  }

  updateSettings(newSettings: Partial<CameraSettings>): void {
    this.settings = { ...this.settings, ...newSettings };
    console.log('📷 Camera settings updated:', this.settings);
  }

  switchCamera(): void {
    this.settings.type = this.settings.type === 'back' ? 'front' : 'back';
    console.log('📷 Camera switched to:', this.settings.type);
  }

  toggleFlash(): void {
    const flashModes: CameraFlashMode[] = ['off', 'on', 'auto'];
    const currentIndex = flashModes.indexOf(this.settings.flashMode);
    const nextIndex = (currentIndex + 1) % flashModes.length;
    this.settings.flashMode = flashModes[nextIndex];
    console.log('📷 Flash mode changed to:', this.settings.flashMode);
  }

  toggleAutoFocus(): void {
    this.settings.autoFocus = !this.settings.autoFocus;
    console.log('📷 Auto focus toggled:', this.settings.autoFocus);
  }

  setWhiteBalance(whiteBalance: CameraSettings['whiteBalance']): void {
    this.settings.whiteBalance = whiteBalance;
    console.log('📷 White balance set to:', this.settings.whiteBalance);
  }

  // Get camera settings for UI display
  getSettingsForUI() {
    return {
      cameraType: this.settings.type === 'back' ? 'Trasera' : 'Frontal',
      flashMode: this.getFlashModeText(),
      autoFocus: this.settings.autoFocus ? 'Activado' : 'Desactivado',
      whiteBalance: this.getWhiteBalanceText(),
    };
  }

  private getFlashModeText(): string {
    switch (this.settings.flashMode) {
      case 'off': return 'Apagado';
      case 'on': return 'Encendido';
      case 'auto': return 'Automático';
      default: return 'Automático';
    }
  }

  private getWhiteBalanceText(): string {
    switch (this.settings.whiteBalance) {
      case 'auto': return 'Automático';
      case 'sunny': return 'Soleado';
      case 'cloudy': return 'Nublado';
      case 'fluorescent': return 'Fluorescente';
      case 'incandescent': return 'Incandescente';
      default: return 'Automático';
    }
  }

  // Check if camera is available on this device
  async isCameraAvailable(): Promise<boolean> {
    try {
      if (!Camera) return false;
      const { status } = await Camera.requestCameraPermissionsAsync();
      return status === 'granted';
    } catch (error) {
      console.error('📷 Failed to check camera availability:', error);
      return false;
    }
  }

  // Get supported camera types
  async getSupportedCameraTypes(): Promise<CameraType[]> {
    try {
      if (!Camera) return ['back'];
      
      const types: CameraType[] = ['back'];
      
      // Check if front camera is available by checking permissions
      const { status } = await Camera.requestCameraPermissionsAsync();
      if (status === 'granted') {
        types.push('front');
      }
      
      return types;
    } catch (error) {
      console.error('📷 Failed to get supported camera types:', error);
      return ['back'];
    }
  }

  // Reset camera settings to defaults
  resetSettings(): void {
    this.settings = {
      type: 'back',
      flashMode: 'auto',
      autoFocus: true,
      whiteBalance: 'auto',
    };
    console.log('📷 Camera settings reset to defaults');
  }
}

// Export singleton instance
export const cameraManager = new CameraManager();
