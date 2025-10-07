import React, { useEffect, useState } from 'react';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import RootNavigator from './src/app/navigation/RootNavigator';
import { colors } from './src/app/theme/colors';
import { StatusBar } from 'react-native';

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
  return (
    <NavigationContainer theme={navTheme}>
      <StatusBar barStyle="light-content" />
      <RootNavigator />
    </NavigationContainer>
  );
}


