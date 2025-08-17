import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Pressable, TextInput } from 'react-native';
import { signOut } from 'firebase/auth';
import { auth, db } from '../../services/firebase';
import { ref, onValue, set } from 'firebase/database';
import { ThemedText } from '../../components/Themed';
import { colors } from '../../theme/colors';
import { MacroBar } from '../../components/MacroBar';
import { useGamification } from '../../hooks/useGamification';
import { useUserProfile } from '../../hooks/useUserProfile';

export default function ProfileScreen() {
  const user = auth.currentUser;
  const { username, saveUsername } = useUserProfile();
  const [goal, setGoal] = useState(2000);
  const [consumed, setConsumed] = useState(0);
  const [macros, setMacros] = useState({ protein:0, carbs:0, fat:0 });

  useEffect(()=>{
    if (!user) return;
    const goalRef = ref(db, `users/${user.uid}/settings/goal`);
    const unsubGoal = onValue(goalRef, s=> { if (s.exists()) setGoal(s.val()); });
    const foodsRef = ref(db, `users/${user.uid}/foods`);
    const unsubFoods = onValue(foodsRef, snap => {
      const val = snap.val()||{};
      let c=0; let m = { protein:0, carbs:0, fat:0 };
      Object.values(val).forEach((anyItem:any)=> { c+= anyItem.calories||0; m.protein+= anyItem.macros?.protein||0; m.carbs+= anyItem.macros?.carbs||0; m.fat+= anyItem.macros?.fat||0; });
      setConsumed(c); setMacros(m);
    });
    return () => { unsubGoal(); unsubFoods(); };
  }, [user]);

  const saveGoal = async (value:number) => {
    if (!user) return; setGoal(value); await set(ref(db, `users/${user.uid}/settings/goal`), value);
  };

  const pct = Math.min(consumed / goal, 1);
  const { streak, badges } = useGamification();
  const badgeCount = Object.keys(badges).length;
  return (
    <View style={styles.container}>
      <ThemedText weight='700' style={styles.title}>Profile</ThemedText>
      <TextInput style={styles.input} value={username} onChangeText={t=> saveUsername(t)} placeholder='Username' placeholderTextColor={colors.textDim} />
      <ThemedText style={{ fontSize: 14, marginBottom: 12 }} dim>{user?.email}</ThemedText>
      <ThemedText dim style={{ marginBottom: 24 }}>UID: {user?.uid}</ThemedText>
      <View style={styles.card}>
        <ThemedText weight='600'>Daily Goal</ThemedText>
        <ThemedText dim style={{ fontSize:12, marginBottom:8 }}>Set your target calories</ThemedText>
        <TextInput keyboardType='numeric' value={goal.toString()} onChangeText={t=>{ const v= Number(t)||0; setGoal(v); }} onBlur={()=> saveGoal(goal)} style={styles.input} placeholder='Goal kcal' placeholderTextColor={colors.textDim} />
        <ThemedText weight='700' style={{ fontSize:22, marginTop:4 }}>{consumed} / {goal} kcal</ThemedText>
        <View style={styles.progressOuter}>
          <View style={[styles.progressInner,{ width: `${pct*100}%` }]} />
        </View>
        <MacroBar protein={macros.protein} carbs={macros.carbs} fat={macros.fat} style={{ marginTop:14 }} />
        <ThemedText dim style={{ fontSize:12, marginTop:6 }}>P {macros.protein}g • C {macros.carbs}g • F {macros.fat}g</ThemedText>
      </View>
      <View style={[styles.card,{ marginTop:20 }]}> 
        <ThemedText weight='600'>Streak & Badges</ThemedText>
        <ThemedText dim style={{ fontSize:12, marginTop:2 }}>Current Streak: {streak.currentStreak} day(s)</ThemedText>
        <ThemedText dim style={{ fontSize:12 }}>Longest: {streak.longestStreak}</ThemedText>
        <ThemedText style={{ marginTop:8 }}>{badgeCount} badge{badgeCount!==1?'s':''} earned</ThemedText>
      </View>
      <Pressable onPress={()=>signOut(auth)} style={styles.logout}>
        <ThemedText weight='600' style={{ color: colors.danger }}>Sign Out</ThemedText>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex:1, backgroundColor: colors.bg, padding: 24 },
  title: { fontSize: 24, marginTop: 8, marginBottom: 24 },
  logout: { marginTop: 40, backgroundColor: colors.bgAlt, padding: 14, borderRadius: 14, alignItems: 'center' },
  card: { backgroundColor: colors.bgAlt, padding:16, borderRadius:20 },
  input: { backgroundColor: colors.bg, color: colors.text, padding:12, borderRadius:12 },
  progressOuter: { height:10, borderRadius:10, backgroundColor: '#222', width:'100%', marginTop:12, overflow:'hidden' },
  progressInner: { height:'100%', backgroundColor: colors.primary }
});
