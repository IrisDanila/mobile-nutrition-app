import React from 'react';
import AppNavigator from './src/navigation/AppNavigator';
import { StatusBar, View } from 'react-native';
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
  return (
    <ThemeGradientProvider>
      <GamificationEventsProvider>
        <GradientShell>
          <StatusBar barStyle='light-content' />
          <AppNavigator />
        </GradientShell>
      </GamificationEventsProvider>
    </ThemeGradientProvider>
  );
}
