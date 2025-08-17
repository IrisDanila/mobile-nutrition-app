import React, { createContext, useContext, useMemo } from 'react';
import { useColorScheme } from 'react-native';
import { lightMode, darkMode } from '../theme/colors';

interface GradientContextValue { top: string; bottom: string; }
const GradientContext = createContext<GradientContextValue>({ top: '#000', bottom: '#000'});

function timeSlot(hour: number) {
  if (hour < 6) return 'night';
  if (hour < 11) return 'morning';
  if (hour < 17) return 'day';
  if (hour < 20) return 'evening';
  return 'late';
}

export const ThemeGradientProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const scheme = useColorScheme();
  const hour = new Date().getHours();
  const slot = timeSlot(hour);
  const value = useMemo(()=>{
    const base = scheme === 'dark' ? darkMode : lightMode;
    // Slight shifts by time slot
    switch(slot){
      case 'morning': return { top: base.gradientTop, bottom: base.gradientBottom };
      case 'day': return { top: base.gradientTop, bottom: base.gradientBottom };
      case 'evening': return { top: scheme==='dark'? '#121B29':'#FFE7D2', bottom: scheme==='dark'? '#182638':'#FFFFFF' };
      case 'night': return { top: scheme==='dark'? '#0A121C':'#E8F1FF', bottom: scheme==='dark'? '#0F1A27':'#FFFFFF' };
      case 'late': return { top: scheme==='dark'? '#08111B':'#EDF4FF', bottom: scheme==='dark'? '#101B27':'#FFFFFF' };
      default: return { top: base.gradientTop, bottom: base.gradientBottom };
    }
  }, [scheme, slot]);
  return <GradientContext.Provider value={value}>{children}</GradientContext.Provider>;
};

export function useGradient(){ return useContext(GradientContext); }
