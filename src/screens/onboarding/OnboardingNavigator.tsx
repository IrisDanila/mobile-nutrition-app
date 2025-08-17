import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import ValueScreen from './ValueScreen';
import PermissionsScreen from './PermissionsScreen';
import GoalsScreen from './GoalsScreen';
import FinishScreen from './FinishScreen';

const Stack = createNativeStackNavigator();

export default function OnboardingNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown:false }}>
      <Stack.Screen name='Value' component={ValueScreen} />
      <Stack.Screen name='Permissions' component={PermissionsScreen} />
      <Stack.Screen name='Goals' component={GoalsScreen} />
      <Stack.Screen name='Finish' component={FinishScreen} />
    </Stack.Navigator>
  );
}
