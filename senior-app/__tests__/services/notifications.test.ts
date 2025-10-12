import { notificationService } from '../../src/app/services/notifications';

// Mock Expo Notifications
jest.mock('expo-notifications', () => ({
  setNotificationHandler: jest.fn(),
  getPermissionsAsync: jest.fn(),
  requestPermissionsAsync: jest.fn(),
  getExpoPushTokenAsync: jest.fn(),
  isDeviceRegisteredForRemoteNotificationsAsync: jest.fn(),
  scheduleNotificationAsync: jest.fn(),
  addNotificationReceivedListener: jest.fn(() => ({ remove: jest.fn() })),
  addNotificationResponseReceivedListener: jest.fn(() => ({ remove: jest.fn() })),
  getAllScheduledNotificationsAsync: jest.fn(),
  cancelAllScheduledNotificationsAsync: jest.fn(),
}));

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
}));

describe('NotificationService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('requestPermission', () => {
    it('should return granted when permission is granted', async () => {
      const { getPermissionsAsync, requestPermissionsAsync } = require('expo-notifications');
      
      getPermissionsAsync.mockResolvedValue({ status: 'granted' });
      
      const result = await notificationService.requestPermission();
      
      expect(result).toBe('granted');
      expect(getPermissionsAsync).toHaveBeenCalled();
      expect(requestPermissionsAsync).not.toHaveBeenCalled();
    });

    it('should request permission when not granted', async () => {
      const { getPermissionsAsync, requestPermissionsAsync } = require('expo-notifications');
      
      getPermissionsAsync.mockResolvedValue({ status: 'denied' });
      requestPermissionsAsync.mockResolvedValue({ status: 'granted' });
      
      const result = await notificationService.requestPermission();
      
      expect(result).toBe('granted');
      expect(getPermissionsAsync).toHaveBeenCalled();
      expect(requestPermissionsAsync).toHaveBeenCalled();
    });

    it('should return denied when permission is denied', async () => {
      const { getPermissionsAsync, requestPermissionsAsync } = require('expo-notifications');
      
      getPermissionsAsync.mockResolvedValue({ status: 'denied' });
      requestPermissionsAsync.mockResolvedValue({ status: 'denied' });
      
      const result = await notificationService.requestPermission();
      
      expect(result).toBe('denied');
    });

    it('should return unavailable on error', async () => {
      const { getPermissionsAsync } = require('expo-notifications');
      
      getPermissionsAsync.mockRejectedValue(new Error('Permission error'));
      
      const result = await notificationService.requestPermission();
      
      expect(result).toBe('unavailable');
    });
  });

  describe('sendDevNotification', () => {
    it('should send notification successfully', async () => {
      const { scheduleNotificationAsync } = require('expo-notifications');
      
      scheduleNotificationAsync.mockResolvedValue('notification-id');
      
      const payload = {
        deviceId: 'test-device',
        pushToken: 'test-token',
        location: null,
        timestamp: Date.now()
      };
      
      const result = await notificationService.sendDevNotification(payload);
      
      expect(result).toBe(true);
      expect(scheduleNotificationAsync).toHaveBeenCalledWith({
        content: {
          title: '🚨 SOS Alert (Dev)',
          body: 'Emergency alert from device test-device',
          data: {
            type: 'sos_alert',
            payload: JSON.stringify(payload),
            timestamp: payload.timestamp,
          },
          sound: 'default',
          priority: 1, // HIGH priority
        },
        trigger: null,
      });
    });

    it('should handle notification send failure', async () => {
      const { scheduleNotificationAsync } = require('expo-notifications');
      
      scheduleNotificationAsync.mockRejectedValue(new Error('Notification error'));
      
      const payload = {
        deviceId: 'test-device',
        pushToken: 'test-token',
        location: null,
        timestamp: Date.now()
      };
      
      const result = await notificationService.sendDevNotification(payload);
      
      expect(result).toBe(false);
    });
  });

  describe('getPushToken', () => {
    it('should return stored push token', () => {
      // Set a mock token
      (notificationService as any).pushToken = 'test-token-123';
      
      const token = notificationService.getPushToken();
      
      expect(token).toBe('test-token-123');
    });

    it('should return null when no token is stored', () => {
      // Clear token
      (notificationService as any).pushToken = null;
      
      const token = notificationService.getPushToken();
      
      expect(token).toBe(null);
    });
  });
});
