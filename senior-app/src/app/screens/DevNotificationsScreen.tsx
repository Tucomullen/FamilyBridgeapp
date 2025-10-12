import React, { useState, useEffect } from 'react';
import { View, Text, Pressable, ScrollView, Alert } from 'react-native';
import { colors, spacing, typography } from '../theme/colors';
import { t } from '../i18n';
import { notificationService, NotificationPayload } from '../services/notifications';
import * as Notifications from 'expo-notifications';

type Props = {
  navigation: any;
};

interface NotificationLogEntry {
  id: string;
  timestamp: number;
  payload: NotificationPayload;
  type: 'received' | 'sent';
}

export default function DevNotificationsScreen({ navigation }: Props) {
  const [notifications, setNotifications] = useState<NotificationLogEntry[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    initializeNotifications();
  }, []);

  const initializeNotifications = async () => {
    try {
      await notificationService.initialize();
      
      // Set up notification listeners
      const unsubscribeReceived = notificationService.onReceive((notification) => {
        console.log('🔔 Dev: Notification received:', notification);
        
        try {
          const payload = notification.request.content.data?.payload;
          if (payload && typeof payload === 'string') {
            const parsedPayload: NotificationPayload = JSON.parse(payload);
            addNotificationToLog({
              id: notification.request.identifier,
              timestamp: Date.now(),
              payload: parsedPayload,
              type: 'received'
            });
          }
        } catch (error) {
          console.error('🔔 Dev: Failed to parse notification payload:', error);
        }
      });

      const unsubscribeResponse = notificationService.onResponse((response) => {
        console.log('🔔 Dev: Notification response:', response);
      });

      setIsInitialized(true);
      
      // Cleanup on unmount
      return () => {
        unsubscribeReceived();
        unsubscribeResponse();
      };
    } catch (error) {
      console.error('🔔 Dev: Failed to initialize notifications:', error);
      Alert.alert('Error', 'Failed to initialize notifications');
    }
  };

  const addNotificationToLog = (entry: NotificationLogEntry) => {
    setNotifications(prev => [entry, ...prev].slice(0, 50)); // Keep last 50 entries
  };

  const clearLog = () => {
    setNotifications([]);
    notificationService.cancelAllNotifications();
  };

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  const formatLocation = (location: NotificationPayload['location']) => {
    if (!location) return 'No location';
    return `${location.lat.toFixed(4)}, ${location.lon.toFixed(4)} (±${Math.round(location.accuracy)}m)`;
  };

  const testNotification = async () => {
    try {
      const testPayload: NotificationPayload = {
        deviceId: 'test-device-123',
        pushToken: notificationService.getPushToken() || 'no-token',
        location: {
          lat: 37.7749,
          lon: -122.4194,
          accuracy: 10,
          timestamp: Date.now()
        },
        timestamp: Date.now()
      };

      const success = await notificationService.sendDevNotification(testPayload);
      if (success) {
        addNotificationToLog({
          id: `test-${Date.now()}`,
          timestamp: Date.now(),
          payload: testPayload,
          type: 'sent'
        });
        Alert.alert('Success', 'Test notification sent');
      } else {
        Alert.alert('Error', 'Failed to send test notification');
      }
    } catch (error) {
      console.error('🔔 Dev: Test notification error:', error);
      Alert.alert('Error', 'Failed to send test notification');
    }
  };

  return (
    <View style={{
      flex: 1,
      backgroundColor: colors.highContrastBg,
      padding: spacing.l,
    }}>
      {/* Header */}
      <View style={{ marginBottom: spacing.l }}>
        <Text 
          accessibilityRole="header"
          style={[typography.h1, { color: colors.text, textAlign: 'center', marginBottom: spacing.s }]}
        >
          {t('sos.dev.title')}
        </Text>
        <Text 
          style={[typography.body, { color: colors.mutedText, textAlign: 'center', marginBottom: spacing.l }]}
        >
          {t('sos.dev.subtitle')}
        </Text>
        
        {/* Status */}
        <View style={{ 
          flexDirection: 'row', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: spacing.l 
        }}>
          <Text style={[typography.body, { color: colors.text }]}>
            Status: {isInitialized ? '✅ Ready' : '⏳ Initializing...'}
          </Text>
          <Text style={[typography.body, { color: colors.text }]}>
            Count: {notifications.length}
          </Text>
        </View>

        {/* Action buttons */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Send Test Notification"
            onPress={testNotification}
            style={{
              flex: 1,
              padding: spacing.m,
              backgroundColor: colors.primary,
              borderRadius: 8,
              marginRight: spacing.s,
              alignItems: 'center'
            }}
          >
            <Text style={[typography.button, { color: colors.text }]}>
              Send Test
            </Text>
          </Pressable>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('sos.dev.clear')}
            onPress={clearLog}
            style={{
              flex: 1,
              padding: spacing.m,
              backgroundColor: colors.surface,
              borderRadius: 8,
              marginLeft: spacing.s,
              alignItems: 'center'
            }}
          >
            <Text style={[typography.button, { color: colors.text }]}>
              {t('sos.dev.clear')}
            </Text>
          </Pressable>
        </View>
      </View>

      {/* Notifications list */}
      <ScrollView style={{ flex: 1 }}>
        {notifications.length === 0 ? (
          <View style={{ 
            flex: 1, 
            justifyContent: 'center', 
            alignItems: 'center', 
            paddingVertical: spacing.xl 
          }}>
            <Text style={[typography.body, { color: colors.mutedText, textAlign: 'center' }]}>
              {t('sos.dev.noAlerts')}
            </Text>
          </View>
        ) : (
          notifications.map((notification) => (
            <View 
              key={notification.id}
              style={{
                backgroundColor: colors.surface,
                borderRadius: 8,
                padding: spacing.m,
                marginBottom: spacing.s,
                borderLeftWidth: 4,
                borderLeftColor: notification.type === 'sent' ? colors.primary : colors.success
              }}
            >
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.s }}>
                <Text style={[typography.body, { color: colors.text, fontWeight: '600' }]}>
                  {notification.type === 'sent' ? '📤 Sent' : '📥 Received'}
                </Text>
                <Text style={[typography.body, { color: colors.mutedText }]}>
                  {formatTimestamp(notification.timestamp)}
                </Text>
              </View>
              
              <Text style={[typography.body, { color: colors.text, marginBottom: spacing.s }]}>
                Device: {notification.payload.deviceId}
              </Text>
              
              <Text style={[typography.body, { color: colors.text, marginBottom: spacing.s }]}>
                Token: {notification.payload.pushToken ? 'Available' : 'None'}
              </Text>
              
              <Text style={[typography.body, { color: colors.text, marginBottom: spacing.s }]}>
                Location: {formatLocation(notification.payload.location)}
              </Text>
              
              <Text style={[typography.body, { color: colors.mutedText, fontSize: 12 }]}>
                ID: {notification.id}
              </Text>
            </View>
          ))
        )}
      </ScrollView>

      {/* Back button */}
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t('common.back')}
        onPress={() => navigation.goBack()}
        style={{
          padding: spacing.l,
          backgroundColor: colors.surface,
          borderRadius: 12,
          alignItems: 'center',
          marginTop: spacing.m
        }}
      >
        <Text style={[typography.button, { color: colors.text }]}>
          {t('common.back')}
        </Text>
      </Pressable>
    </View>
  );
}
