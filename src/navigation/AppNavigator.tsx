import React from 'react';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useColorScheme } from 'react-native';
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import ScanScreen from '../screens/scan/ScanScreen';
import LiveCameraScreen from '../screens/scan/LiveCameraScreen';
import HistoryScreen from '../screens/history/HistoryScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';
import HomeDashboardScreen from '../screens/home/HomeDashboardScreen';
import { useAuth } from '../hooks/useAuth';
import { colors } from '../theme/colors';
import { Ionicons } from '@expo/vector-icons';
import { Splash } from '../components/Splash';
import OnboardingNavigator from '../screens/onboarding/OnboardingNavigator';
import { useOnboardingStatus } from '../hooks/useOnboardingStatus';

const RootStack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function Tabs() {
  return (
    <Tab.Navigator screenOptions={({ route }) => ({
      headerShown: false,
      tabBarStyle: { backgroundColor: colors.bgAlt, borderTopColor: colors.border },
      tabBarActiveTintColor: colors.primary,
      tabBarInactiveTintColor: colors.textDim,
      tabBarIcon: ({ color, size }) => {
        let icon: keyof typeof Ionicons.glyphMap = 'home';
        if (route.name === 'Scan') icon = 'camera';
        else if (route.name === 'History') icon = 'time';
        else if (route.name === 'Profile') icon = 'person';
        return <Ionicons name={icon} size={size} color={color} />;
      }
    })}>
      <Tab.Screen name="Home" component={HomeDashboardScreen} />
      <Tab.Screen name="Scan" component={ScanScreen} />
      <Tab.Screen name="History" component={HistoryScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

function AuthedTabs() {
  return <Tabs />;
}

export default function AppNavigator() {
  const { user, loading } = useAuth();
  const scheme = useColorScheme();
  const { completed, loading: onboardingLoading } = useOnboardingStatus();
  if (loading) return <Splash />;
  if (user && onboardingLoading) return <Splash />;
  return (
    <NavigationContainer theme={scheme === 'dark' ? DarkTheme : DefaultTheme}>
      {user ? (
        <RootStack.Navigator screenOptions={{ headerShown:false, presentation:'containedModal' }}>
          {completed ? (
            <RootStack.Screen name="MainTabs" component={AuthedTabs} />
          ) : (
            <RootStack.Screen name="Onboarding" component={OnboardingNavigator} />
          )}
          <RootStack.Screen name="LiveCamera" component={LiveCameraScreen} />
        </RootStack.Navigator>
      ) : (
        <RootStack.Navigator screenOptions={{ headerShown: false }}>
          <RootStack.Screen name="Login" component={LoginScreen} />
          <RootStack.Screen name="Register" component={RegisterScreen} />
        </RootStack.Navigator>
      )}
    </NavigationContainer>
  );
}
