import { requestCameraPermissionsAsync } from 'expo-camera';
import { requestPermissionsAsync as requestAudioPermissionsAsync } from 'expo-av';
import { Linking } from 'react-native';

export type PermissionState = 'granted' | 'denied' | 'unavailable';

export async function requestCamera(): Promise<PermissionState> {
  try {
    const res = await requestCameraPermissionsAsync();
    return res.status === 'granted' ? 'granted' : 'denied';
  } catch {
    return 'unavailable';
  }
}

export async function requestMicrophone(): Promise<PermissionState> {
  try {
    const res = await requestAudioPermissionsAsync();
    return (res as any).status === 'granted' ? 'granted' : 'denied';
  } catch {
    return 'unavailable';
  }
}

export function openOSSettings() {
  Linking.openSettings();
}


