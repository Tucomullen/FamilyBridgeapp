import React, { useEffect, useState } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import OnboardingNavigator from '../onboarding/OnboardingNavigator';
import { View, Text, Pressable } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Stack = createNativeStackNavigator();

function SeniorHome() {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ fontSize: 24, color: '#fff' }}>Senior Home</Text>
    </View>
  );
}

export default function RootNavigator() {
  const [hasOnboarded, setHasOnboarded] = useState<boolean | null>(null);

  useEffect(() => {
    AsyncStorage.getItem('hasOnboarded').then((v) => setHasOnboarded(v === 'true'));
  }, []);

  if (hasOnboarded === null) return null;

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {hasOnboarded ? (
        <Stack.Screen name="Home" component={SeniorHome} />
      ) : (
        <Stack.Screen name="Onboarding">
          {() => <OnboardingNavigator onDone={async () => {
            await AsyncStorage.setItem('hasOnboarded', 'true');
            setHasOnboarded(true);
          }} />}
        </Stack.Screen>
      )}
    </Stack.Navigator>
  );
}


