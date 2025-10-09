import React, { useState, useEffect } from 'react';
import { View, Text, Pressable, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { colors, spacing, typography } from '../theme/colors';
import { t } from '../i18n';
import { apiService } from '../services/ApiService';
import { authManager } from '../services/AuthManager';
import { syncService } from '../services/SyncService';

type Props = {
  navigation: any;
};

interface ServerStatus {
  isOnline: boolean;
  lastCheck: number;
  responseTime: number | null;
  error: string | null;
}

export default function DevApiScreen({ navigation }: Props) {
  const [serverStatus, setServerStatus] = useState<ServerStatus>({
    isOnline: false,
    lastCheck: 0,
    responseTime: null,
    error: null,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [authState, setAuthState] = useState(authManager.getAuthState());

  useEffect(() => {
    initializeServices();
    checkServerStatus();
    
    // Check server status every 15 seconds
    const interval = setInterval(checkServerStatus, 15000);
    
    return () => clearInterval(interval);
  }, []);

  const initializeServices = async () => {
    try {
      await authManager.initialize();
      await syncService.initialize();
      setAuthState(authManager.getAuthState());
      console.log('🔧 Dev API services initialized');
    } catch (error) {
      console.error('🔧 Failed to initialize dev services:', error);
    }
  };

  const checkServerStatus = async () => {
    try {
      const startTime = Date.now();
      const response = await apiService.checkHealth();
      const responseTime = Date.now() - startTime;

      setServerStatus({
        isOnline: response.success,
        lastCheck: Date.now(),
        responseTime,
        error: response.success ? null : response.error || 'Unknown error',
      });

      console.log('🔧 Server status check:', response.success ? 'Online' : 'Offline');
    } catch (error) {
      setServerStatus({
        isOnline: false,
        lastCheck: Date.now(),
        responseTime: null,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };

  const testLogin = async () => {
    try {
      setIsLoading(true);
      
      const credentials = {
        email: 'senior@familybridge.com',
        password: 'password123',
      };

      const response = await authManager.login(credentials);
      
      Alert.alert(
        'Login Test',
        `Successfully logged in as ${response.user.name} (${response.user.role})`,
        [{ text: 'OK' }]
      );

      setAuthState(authManager.getAuthState());
    } catch (error) {
      Alert.alert(
        'Login Test Failed',
        error instanceof Error ? error.message : 'Unknown error',
        [{ text: 'OK' }]
      );
    } finally {
      setIsLoading(false);
    }
  };

  const testLogout = async () => {
    try {
      setIsLoading(true);
      await authManager.logout();
      
      Alert.alert('Logout Test', 'Successfully logged out', [{ text: 'OK' }]);
      setAuthState(authManager.getAuthState());
    } catch (error) {
      Alert.alert(
        'Logout Test Failed',
        error instanceof Error ? error.message : 'Unknown error',
        [{ text: 'OK' }]
      );
    } finally {
      setIsLoading(false);
    }
  };

  const testSync = async () => {
    try {
      setIsLoading(true);
      await syncService.forceSync();
      
      const stats = await syncService.getSyncStats();
      Alert.alert(
        'Sync Test',
        `Sync completed. Stats: ${stats.syncedItems}/${stats.totalItems} items synced`,
        [{ text: 'OK' }]
      );
    } catch (error) {
      Alert.alert(
        'Sync Test Failed',
        error instanceof Error ? error.message : 'Unknown error',
        [{ text: 'OK' }]
      );
    } finally {
      setIsLoading(false);
    }
  };

  const formatLastCheck = (timestamp: number) => {
    if (timestamp === 0) return 'Never';
    const now = Date.now();
    const diff = now - timestamp;
    const seconds = Math.floor(diff / 1000);
    
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h ago`;
  };

  return (
    <View style={{
      flex: 1,
      backgroundColor: colors.highContrastBg,
      padding: spacing.l,
    }}>
      <Text 
        accessibilityRole="header"
        style={[typography.h1, { color: colors.text, textAlign: 'center', marginBottom: spacing.xl }]}
      >
        🔧 API Development
      </Text>

      <ScrollView 
        contentContainerStyle={{
          flexGrow: 1,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Server Status */}
        <View style={{
          backgroundColor: colors.surface,
          borderRadius: 12,
          padding: spacing.l,
          marginBottom: spacing.xl,
          borderWidth: 2,
          borderColor: serverStatus.isOnline ? colors.success : colors.danger,
        }}>
          <Text style={[typography.h2, { color: colors.text, marginBottom: spacing.m }]}>
            Server Status
          </Text>
          
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: spacing.s }}>
            <Text style={{ fontSize: 24, marginRight: spacing.s }}>
              {serverStatus.isOnline ? '✅' : '❌'}
            </Text>
            <Text style={[typography.body, { color: colors.text }]}>
              {serverStatus.isOnline ? 'Connected' : 'Offline'}
            </Text>
          </View>

          {serverStatus.responseTime && (
            <Text style={[typography.body, { color: colors.mutedText }]}>
              Response time: {serverStatus.responseTime}ms
            </Text>
          )}

          <Text style={[typography.body, { color: colors.mutedText }]}>
            Last check: {formatLastCheck(serverStatus.lastCheck)}
          </Text>

          {serverStatus.error && (
            <Text style={[typography.body, { color: colors.danger, marginTop: spacing.s }]}>
              Error: {serverStatus.error}
            </Text>
          )}
        </View>

        {/* Authentication Status */}
        <View style={{
          backgroundColor: colors.surface,
          borderRadius: 12,
          padding: spacing.l,
          marginBottom: spacing.xl,
        }}>
          <Text style={[typography.h2, { color: colors.text, marginBottom: spacing.m }]}>
            Authentication
          </Text>
          
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: spacing.s }}>
            <Text style={{ fontSize: 24, marginRight: spacing.s }}>
              {authState.isAuthenticated ? '🔐' : '🔓'}
            </Text>
            <Text style={[typography.body, { color: colors.text }]}>
              {authState.isAuthenticated ? 'Logged In' : 'Not Logged In'}
            </Text>
          </View>

          {authState.user && (
            <Text style={[typography.body, { color: colors.mutedText }]}>
              User: {authState.user.name} ({authState.user.role})
            </Text>
          )}
        </View>

        {/* Test Buttons */}
        <View style={{ gap: spacing.m, marginBottom: spacing.xl }}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Test login"
            onPress={testLogin}
            disabled={isLoading || authState.isAuthenticated}
            style={{
              padding: spacing.l,
              backgroundColor: authState.isAuthenticated ? colors.mutedText : colors.primary,
              borderRadius: 12,
              alignItems: 'center',
              opacity: (isLoading || authState.isAuthenticated) ? 0.6 : 1,
            }}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color={colors.text} />
            ) : (
              <Text style={[typography.button, { color: colors.text }]}>
                🔐 Test Login
              </Text>
            )}
          </Pressable>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Test logout"
            onPress={testLogout}
            disabled={isLoading || !authState.isAuthenticated}
            style={{
              padding: spacing.l,
              backgroundColor: !authState.isAuthenticated ? colors.mutedText : colors.surface,
              borderRadius: 12,
              alignItems: 'center',
              opacity: (isLoading || !authState.isAuthenticated) ? 0.6 : 1,
            }}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color={colors.text} />
            ) : (
              <Text style={[typography.button, { color: colors.text }]}>
                🔓 Test Logout
              </Text>
            )}
          </Pressable>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Test sync"
            onPress={testSync}
            disabled={isLoading || !authState.isAuthenticated}
            style={{
              padding: spacing.l,
              backgroundColor: (!authState.isAuthenticated || !serverStatus.isOnline) ? colors.mutedText : colors.success,
              borderRadius: 12,
              alignItems: 'center',
              opacity: (isLoading || !authState.isAuthenticated || !serverStatus.isOnline) ? 0.6 : 1,
            }}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color={colors.text} />
            ) : (
              <Text style={[typography.button, { color: colors.text }]}>
                🔄 Test Sync
              </Text>
            )}
          </Pressable>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Refresh server status"
            onPress={checkServerStatus}
            disabled={isLoading}
            style={{
              padding: spacing.l,
              backgroundColor: colors.surface,
              borderRadius: 12,
              alignItems: 'center',
              opacity: isLoading ? 0.6 : 1,
            }}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color={colors.text} />
            ) : (
              <Text style={[typography.button, { color: colors.text }]}>
                🔄 Refresh Status
              </Text>
            )}
          </Pressable>
        </View>

        {/* API Info */}
        <View style={{
          backgroundColor: colors.surface,
          borderRadius: 12,
          padding: spacing.l,
        }}>
          <Text style={[typography.h2, { color: colors.text, marginBottom: spacing.m }]}>
            API Information
          </Text>
          
          <Text style={[typography.body, { color: colors.mutedText, marginBottom: spacing.s }]}>
            Base URL: {apiService.getBaseUrl()}
          </Text>
          
          <Text style={[typography.body, { color: colors.mutedText, marginBottom: spacing.s }]}>
            Status checks: Every 15 seconds
          </Text>
          
          <Text style={[typography.body, { color: colors.mutedText }]}>
            This is a development screen for testing API connectivity.
          </Text>
        </View>
      </ScrollView>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t('common.back')}
        onPress={() => navigation.goBack()}
        style={{
          padding: spacing.l,
          backgroundColor: colors.surface,
          borderRadius: 12,
          minWidth: 120,
          alignItems: 'center',
          alignSelf: 'center',
          marginTop: spacing.l,
        }}
      >
        <Text style={[typography.button, { color: colors.text }]}>
          {t('common.back')}
        </Text>
      </Pressable>
    </View>
  );
}
