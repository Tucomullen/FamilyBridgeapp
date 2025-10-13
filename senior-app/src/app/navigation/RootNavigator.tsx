import React, { useEffect, useState } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import OnboardingNavigator from '../onboarding/OnboardingNavigator';
import SeniorHomeScreen from '../screens/SeniorHomeScreen';
import CallScreen from '../screens/CallScreen';
import SosScreen from '../screens/SosScreen';
import PhotosScreen from '../screens/PhotosScreen';
import SettingsScreen from '../screens/SettingsScreen';
import VoiceScreen from '../screens/VoiceScreen';
import DevApiScreen from '../screens/DevApiScreen';
import DevNotificationsScreen from '../screens/DevNotificationsScreen';
import { UIScaleProvider } from '../hooks/useUIScale';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Stack = createNativeStackNavigator();

export default function RootNavigator() {
  const [hasOnboarded, setHasOnboarded] = useState<boolean | null>(null);

  useEffect(() => {
    AsyncStorage.getItem('hasOnboarded').then((v) => setHasOnboarded(v === 'true'));
  }, []);

  if (hasOnboarded === null) return null;

  return (
    <UIScaleProvider>
      <Stack.Navigator 
        screenOptions={{ headerShown: false }}
      >
          {hasOnboarded ? (
            <>
              <Stack.Screen name="Home" component={SeniorHomeScreen} />
              <Stack.Screen name="Call" component={CallScreen} />
              <Stack.Screen name="SOS" component={SosScreen} />
              <Stack.Screen name="Photos" component={PhotosScreen} />
              <Stack.Screen name="Settings" component={SettingsScreen} />
              <Stack.Screen name="Voice" component={VoiceScreen} />
              {__DEV__ && <Stack.Screen name="DevNotifications" component={DevNotificationsScreen} />}
              {__DEV__ && <Stack.Screen name="DevApi" component={DevApiScreen} />}
            </>
          ) : (
            <Stack.Screen name="Onboarding">
              {() => <OnboardingNavigator onDone={async () => {
                await AsyncStorage.setItem('hasOnboarded', 'true');
                setHasOnboarded(true);
              }} />}
            </Stack.Screen>
          )}
        </Stack.Navigator>
    </UIScaleProvider>
  );
}


