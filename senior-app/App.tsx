import React, { useEffect, useState } from 'react';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import RootNavigator from './src/app/navigation/RootNavigator';
import { colors } from './src/app/theme/colors';
import { StatusBar } from 'react-native';
import { logLanguageInfo, testLanguageDetection } from './src/app/i18n';

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
  useEffect(() => {
    // Test language detection
    testLanguageDetection();
    
    // Log language detection on app startup
    logLanguageInfo();
  }, []);

  return (
    <NavigationContainer theme={navTheme}>
      <StatusBar barStyle="light-content" />
      <RootNavigator />
    </NavigationContainer>
  );
}


