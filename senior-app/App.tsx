import React, { useEffect, useState, useRef } from 'react';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import RootNavigator from './src/app/navigation/RootNavigator';
import { colors } from './src/app/theme/colors';
import { StatusBar } from 'react-native';
import { logLanguageInfo, testLanguageDetection } from './src/app/i18n';
import { navigationService } from './src/app/services/navigation/NavigationService';

const navTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: colors.highContrastBg,
    text: colors.text,
    primary: colors.primary
  }
};

export default function App() {
  const navigationRef = useRef<any>(null);

  useEffect(() => {
    // Test language detection
    testLanguageDetection();
    
    // Log language detection on app startup
    logLanguageInfo();
  }, []);

  useEffect(() => {
    if (navigationRef.current) {
      navigationService.setNavigationRef(navigationRef.current);
      navigationService.initialize();
    }
  }, []);

  return (
    <NavigationContainer ref={navigationRef} theme={navTheme}>
      <StatusBar barStyle="light-content" />
      <RootNavigator />
    </NavigationContainer>
  );
}


