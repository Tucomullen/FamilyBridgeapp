import { Linking } from 'react-native';
import { notificationService, NotificationPermissionStatus } from '../../services/notifications';
import { locationService, LocationPermissionStatus } from '../../services/location';

export type PermissionState = 'granted' | 'denied' | 'unavailable';

export async function requestCamera(): Promise<PermissionState> {
  try {
    console.log('📷 Requesting camera permission...');
    
    // Try to use expo-camera directly
    const Camera = require('expo-camera');
    if (Camera && Camera.requestCameraPermissionsAsync) {
      const { status } = await Camera.requestCameraPermissionsAsync();
      console.log('📷 Camera permission result:', status);
      return status === 'granted' ? 'granted' : 'denied';
    }
    
    console.log('📷 Camera permission API not available, simulating granted');
    return 'granted';
  } catch (error) {
    console.error('📷 Camera permission error:', error);
    return 'unavailable';
  }
}

export async function requestMicrophone(): Promise<PermissionState> {
  try {
    console.log('🎤 Requesting microphone permission...');
    
    // Try to use expo-camera directly
    const Camera = require('expo-camera');
    if (Camera && Camera.requestMicrophonePermissionsAsync) {
      const { status } = await Camera.requestMicrophonePermissionsAsync();
      console.log('🎤 Microphone permission result:', status);
      return status === 'granted' ? 'granted' : 'denied';
    }
    
    console.log('🎤 Microphone permission API not available, simulating granted');
    return 'granted';
  } catch (error) {
    console.error('🎤 Microphone permission error:', error);
    return 'unavailable';
  }
}

export async function requestNotifications(): Promise<PermissionState> {
  try {
    console.log('🔔 Requesting notification permission...');
    await notificationService.initialize();
    const status = await notificationService.requestPermission();
    console.log('🔔 Notification permission result:', status);
    return status;
  } catch (error) {
    console.error('🔔 Notification permission error:', error);
    return 'unavailable';
  }
}

export async function requestLocation(): Promise<PermissionState> {
  try {
    console.log('📍 Requesting location permission...');
    await locationService.initialize();
    const status = await locationService.requestPermission();
    console.log('📍 Location permission result:', status);
    return status;
  } catch (error) {
    console.error('📍 Location permission error:', error);
    return 'unavailable';
  }
}

export function openOSSettings() {
  Linking.openSettings();
}


