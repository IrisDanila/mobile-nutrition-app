import React, { createContext, useCallback, useContext, useRef, useState } from 'react';
import { View, StyleSheet, Animated, Easing, Dimensions } from 'react-native';
import { ThemedText } from '../components/Themed';
import { colors } from '../theme/colors';

interface GamificationEventsCtx { triggerBadges: (ids: string[]) => void; }
const Ctx = createContext<GamificationEventsCtx>({ triggerBadges: ()=>{} });

export const GamificationEventsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [badges, setBadges] = useState<string[]|null>(null);
  const fade = useRef(new Animated.Value(0)).current;

  const triggerBadges = useCallback((ids: string[]) => {
    if(!ids.length) return;
    setBadges(ids);
    fade.setValue(0);
    Animated.timing(fade,{ toValue:1, duration:250, easing:Easing.out(Easing.ease), useNativeDriver:true }).start(()=>{
      setTimeout(()=>{
        Animated.timing(fade,{ toValue:0, duration:350, useNativeDriver:true }).start(()=> setBadges(null));
      }, 1800);
    });
  }, []);

  return (
    <Ctx.Provider value={{ triggerBadges }}>
      {children}
      {badges && <Animated.View pointerEvents='none' style={[styles.overlay,{ opacity: fade }]}> 
        <View style={styles.toast} accessibilityLiveRegion='polite'>
          <ThemedText weight='700' style={{ fontSize:16, marginBottom:4 }}>Badge Unlocked!</ThemedText>
          <ThemedText dim>{badges.join(', ')}</ThemedText>
        </View>
        {Array.from({ length: 12 }).map((_,i)=> <Particle key={i} index={i} />)}
      </Animated.View>}
    </Ctx.Provider>
  );
};

export function useGamificationEvents(){ return useContext(Ctx); }

const { width } = Dimensions.get('window');
const Particle: React.FC<{ index:number }> = ({ index }) => {
  const fall = useRef(new Animated.Value(0)).current;
  React.useEffect(()=>{ Animated.timing(fall,{ toValue:1, duration:1600 + index*30, useNativeDriver:true }).start(); }, []);
  const translateY = fall.interpolate({ inputRange:[0,1], outputRange:[-20, 220] });
  const translateX = (Math.random()*width) - width/2;
  const scale = 0.6 + Math.random()*0.8;
  const rotate = fall.interpolate({ inputRange:[0,1], outputRange:['0deg','320deg'] });
  return <Animated.View style={{ position:'absolute', top:0, left:'50%', transform:[{ translateX },{ translateY }, { scale }, { rotate }], width:10, height:10, borderRadius:2, backgroundColor: colors.primary }} />;
};

const styles = StyleSheet.create({
  overlay: { position:'absolute', left:0, right:0, top:0, bottom:0, alignItems:'center', justifyContent:'center' },
  toast: { backgroundColor:'#101820EE', padding:18, borderRadius:20, alignItems:'center', minWidth:220 }
});
