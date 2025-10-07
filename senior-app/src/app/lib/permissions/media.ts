import { Camera } from 'expo-camera';
import { Audio } from 'expo-av';
import { Linking } from 'react-native';

export type PermissionState = 'granted' | 'denied' | 'unavailable';

export async function requestCamera(): Promise<PermissionState> {
  try {
    const res = await Camera.requestCameraPermissionsAsync();
    return res.status === 'granted' ? 'granted' : 'denied';
  } catch {
    return 'unavailable';
  }
}

export async function requestMicrophone(): Promise<PermissionState> {
  try {
    const res = await Camera.requestMicrophonePermissionsAsync();
    return res.status === 'granted' ? 'granted' : 'denied';
  } catch {
    return 'unavailable';
  }
}

export function openOSSettings() {
  Linking.openSettings();
}


