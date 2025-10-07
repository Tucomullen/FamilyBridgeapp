import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import WelcomeScreen from './WelcomeScreen';
import PermissionScreen from './PermissionScreen';
import FamilyLinkScreen from './FamilyLinkScreen';
import ConfirmationScreen from './ConfirmationScreen';

type Props = { onDone: () => void };

const Stack = createNativeStackNavigator();

export default function OnboardingNavigator({ onDone }: Props) {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Welcome" component={WelcomeScreen} />
      <Stack.Screen name="Permissions" component={PermissionScreen} />
      <Stack.Screen name="FamilyLink" component={FamilyLinkScreen} />
      <Stack.Screen name="Confirmation">
        {() => <ConfirmationScreen onDone={onDone} />}
      </Stack.Screen>
    </Stack.Navigator>
  );
}


