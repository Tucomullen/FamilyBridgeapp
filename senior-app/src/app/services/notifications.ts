// Conditional import for Expo Go compatibility
let Notifications: any = null;
try {
  Notifications = require('expo-notifications');
} catch (error) {
  console.log('🔔 expo-notifications not available in Expo Go');
}

import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type NotificationPermissionStatus = 'granted' | 'denied' | 'unavailable';

export interface NotificationPayload {
  deviceId: string;
  pushToken?: string;
  location?: {
    lat: number;
    lon: number;
    accuracy: number;
    timestamp: number;
  } | null;
  timestamp: number;
}

// Configure notification behavior (only if available)
if (Notifications) {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
}

class NotificationService {
  private pushToken: string | null = null;
  private isInitialized = false;

  async initialize(): Promise<void> {
    if (this.isInitialized) return;
    
    try {
      // Load stored token
      const storedToken = await AsyncStorage.getItem('pushToken');
      if (storedToken) {
        this.pushToken = storedToken;
      }

      // Set up notification listeners
      this.setupNotificationListeners();
      
      this.isInitialized = true;
      console.log('🔔 NotificationService initialized');
    } catch (error) {
      console.error('🔔 Failed to initialize NotificationService:', error);
    }
  }

  async requestPermission(): Promise<NotificationPermissionStatus> {
    try {
      console.log('🔔 Requesting notification permission...');
      
      if (!Notifications) {
        console.log('🔔 Notifications not available in Expo Go');
        return 'unavailable';
      }
      
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      console.log('🔔 Current notification permission status:', existingStatus);
      
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        console.log('🔔 Requesting notification permissions...');
        const { status } = await Notifications.requestPermissionsAsync({
          ios: {
            allowAlert: true,
            allowBadge: true,
            allowSound: true,
            allowAnnouncements: true,
          },
        });
        finalStatus = status;
        console.log('🔔 Permission request result:', finalStatus);
      }

      console.log('🔔 Final notification permission status:', finalStatus);
      
      if (finalStatus === 'granted') {
        await this.registerDevice();
      }

      return finalStatus === 'granted' ? 'granted' : 'denied';
    } catch (error) {
      console.error('🔔 Notification permission error:', error);
      return 'unavailable';
    }
  }

  async registerDevice(): Promise<string | null> {
    try {
      if (this.pushToken) {
        console.log('🔔 Using existing push token:', this.pushToken);
        return this.pushToken;
      }

      console.log('🔔 Registering device for push notifications...');
      
      if (!Notifications.isDeviceRegisteredForRemoteNotificationsAsync) {
        console.log('🔔 Remote notifications not supported on this platform');
        return null;
      }

      const isRegistered = await Notifications.isDeviceRegisteredForRemoteNotificationsAsync();
      if (!isRegistered) {
        console.log('🔔 Device not registered for remote notifications');
        return null;
      }

      const token = await Notifications.getExpoPushTokenAsync({
        projectId: 'your-expo-project-id', // This should be configured in app.json
      });

      this.pushToken = token.data;
      await AsyncStorage.setItem('pushToken', this.pushToken);
      
      console.log('🔔 Device registered with token:', this.pushToken);
      return this.pushToken;
    } catch (error) {
      console.error('🔔 Failed to register device:', error);
      return null;
    }
  }

  async sendDevNotification(payload: NotificationPayload): Promise<boolean> {
    try {
      console.log('🔔 Sending dev notification with payload:', payload);

      if (!Notifications) {
        console.log('🔔 Notifications not available in Expo Go - simulating success');
        return true; // Simulate success for Expo Go
      }

      // First, ensure we have notification permissions
      const permissionStatus = await this.requestPermission();
      if (permissionStatus !== 'granted') {
        console.log('🔔 Notification permission not granted, cannot send notification');
        return false;
      }

      // For dev, we'll schedule a local notification
      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: '🚨 SOS Alert (Dev)',
          body: `Emergency alert from device ${payload.deviceId}`,
          data: {
            type: 'sos_alert',
            payload: JSON.stringify(payload),
            timestamp: payload.timestamp,
          },
          sound: 'default',
          priority: Notifications.AndroidNotificationPriority.HIGH,
        },
        trigger: null, // Show immediately
      });

      console.log('🔔 Dev notification scheduled with ID:', notificationId);
      return true;
    } catch (error) {
      console.error('🔔 Failed to send dev notification:', error);
      return false;
    }
  }

  onReceive(handler: (notification: any) => void): () => void {
    if (!Notifications) {
      console.log('🔔 Notifications not available - returning no-op function');
      return () => {};
    }
    const subscription = Notifications.addNotificationReceivedListener(handler);
    return () => subscription.remove();
  }

  onResponse(handler: (response: any) => void): () => void {
    if (!Notifications) {
      console.log('🔔 Notifications not available - returning no-op function');
      return () => {};
    }
    const subscription = Notifications.addNotificationResponseReceivedListener(handler);
    return () => subscription.remove();
  }

  getPushToken(): string | null {
    return this.pushToken;
  }

  private setupNotificationListeners(): void {
    if (!Notifications) {
      console.log('🔔 Notifications not available - skipping listener setup');
      return;
    }
    
    // Listen for notifications received while app is in foreground
    this.onReceive((notification) => {
      console.log('🔔 Notification received:', notification);
    });

    // Listen for user interactions with notifications
    this.onResponse((response) => {
      console.log('🔔 Notification response:', response);
    });
  }

  // For testing - get all scheduled notifications
  async getScheduledNotifications(): Promise<Notifications.NotificationRequest[]> {
    try {
      return await Notifications.getAllScheduledNotificationsAsync();
    } catch (error) {
      console.error('🔔 Failed to get scheduled notifications:', error);
      return [];
    }
  }

  // For testing - cancel all notifications
  async cancelAllNotifications(): Promise<void> {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
      console.log('🔔 All notifications cancelled');
    } catch (error) {
      console.error('🔔 Failed to cancel notifications:', error);
    }
  }
}

// Export singleton instance
export const notificationService = new NotificationService();
