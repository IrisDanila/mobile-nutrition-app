import React, { useEffect } from 'react';
import AppNavigator from './src/navigation/AppNavigator';
import { StatusBar } from 'react-native';
import { ThemeGradientProvider, useGradient } from './src/providers/ThemeGradientProvider';
import { GamificationEventsProvider } from './src/providers/GamificationEvents';
import { LinearGradient } from 'expo-linear-gradient';

const GradientShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const g = useGradient();
  return (
    <LinearGradient colors={[g.top, g.bottom]} style={{ flex:1 }}>
      {children}
    </LinearGradient>
  );
};

export default function App() {
  // Previously attempted to hide Android nav bar via expo-navigation-bar.
  // Removed to avoid runtime error when the package isn't installed.
  // To re-enable, install with: npx expo install expo-navigation-bar
  // then restore dynamic import code.
  useEffect(()=>{}, []);
  return (
    <ThemeGradientProvider>
      <GamificationEventsProvider>
        <GradientShell>
          <StatusBar hidden translucent backgroundColor='transparent' barStyle='light-content' />
          <AppNavigator />
        </GradientShell>
      </GamificationEventsProvider>
    </ThemeGradientProvider>
  );
}
