import React, { useEffect, useMemo, useState } from 'react';
import { View, StyleSheet, FlatList, Image, Pressable, ScrollView, RefreshControl } from 'react-native';
import { auth, db } from '../../services/firebase';
import { onValue, ref } from 'firebase/database';
import { ThemedText } from '../../components/Themed';
import { Button } from '../../components/Button';
import { colors } from '../../theme/colors';
import { MacroBar } from '../../components/MacroBar';
import { useGamification } from '../../hooks/useGamification';

interface FoodItem { id:string; name:string; calories:number; quantity:string; image?:string; timestamp:number; macros?: { protein:number; carbs:number; fat:number }; }

export default function HomeDashboardScreen({ navigation }: any) {
  const user = auth.currentUser;
  const [foods, setFoods] = useState<FoodItem[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const { streak, badges } = useGamification();

  useEffect(()=>{
    if(!user) return;
    const listRef = ref(db, `users/${user.uid}/foods`);
    const unsub = onValue(listRef, snap => {
      const val = snap.val() || {};
      const mapped: FoodItem[] = Object.entries(val).map(([k,v]: any)=> ({ id:k, ...v })).sort((a,b)=> b.timestamp - a.timestamp);
      setFoods(mapped);
    });
    return () => unsub();
  }, [user?.uid]);

  const today = new Date();
  const isToday = (ts:number)=> new Date(ts).toDateString() === today.toDateString();
  const todaysFoods = foods.filter(f=> isToday(f.timestamp));
  const dailyTotals = todaysFoods.reduce((acc, cur)=> { acc.calories+= cur.calories||0; acc.protein+= cur.macros?.protein||0; acc.carbs+= cur.macros?.carbs||0; acc.fat+= cur.macros?.fat||0; return acc; }, { calories:0, protein:0, carbs:0, fat:0 });

  const insightPhrase = useMemo(()=>{
    if (dailyTotals.protein < 30 && todaysFoods.length >=1) return 'Add a protein source next meal';
    if (dailyTotals.calories === 0) return 'Start with a quick scan';
    if (streak.currentStreak >= 3) return `Streak on! Day ${streak.currentStreak}`;
    return 'Welcome back';
  }, [dailyTotals, todaysFoods.length, streak.currentStreak]);

  const recent = foods.slice(0,5);

  const onRefresh = async () => {
    setRefreshing(true); // realtime listener already updates; simulate delay
    setTimeout(()=> setRefreshing(false), 600);
  };

  return (
    <ScrollView contentContainerStyle={styles.container} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}> 
      <View style={styles.headerRow}>
        <View>
          <ThemedText weight='700' style={styles.greeting}>Hi{user?.email? ',' : ''} {user?.email?.split('@')[0]||''}</ThemedText>
          <ThemedText dim style={{ fontSize:12 }}>{insightPhrase}</ThemedText>
        </View>
        <Pressable accessibilityLabel='Open camera' onPress={()=> navigation.navigate('LiveCamera')} style={styles.quickScanBtn}>
          <ThemedText weight='600' style={{ color:'#fff' }}>Scan</ThemedText>
        </Pressable>
      </View>

      <View style={styles.card}> 
        <ThemedText weight='600' style={{ marginBottom:4 }}>Today</ThemedText>
        <ThemedText weight='700' style={{ fontSize:24 }}>{dailyTotals.calories} kcal</ThemedText>
        <MacroBar protein={dailyTotals.protein} carbs={dailyTotals.carbs} fat={dailyTotals.fat} style={{ marginTop:12 }} />
        <ThemedText dim style={{ fontSize:12, marginTop:6 }}>P {dailyTotals.protein} • C {dailyTotals.carbs} • F {dailyTotals.fat}</ThemedText>
      </View>

      <View style={[styles.card,{ flexDirection:'row', justifyContent:'space-between', alignItems:'center' }]}> 
        <View>
          <ThemedText weight='600'>Streak</ThemedText>
          <ThemedText weight='700' style={{ fontSize:22 }}>{streak.currentStreak} day{streak.currentStreak!==1?'s':''}</ThemedText>
          <ThemedText dim style={{ fontSize:12 }}>Longest {streak.longestStreak}</ThemedText>
        </View>
        <View>
          <ThemedText weight='600'>Badges</ThemedText>
          <ThemedText weight='700' style={{ fontSize:22 }}>{Object.keys(badges).length}</ThemedText>
        </View>
      </View>

      <View style={{ marginTop:8, marginBottom:4 }}>
        <ThemedText weight='600'>Recent Meals</ThemedText>
      </View>
      {recent.length === 0 && <ThemedText dim style={{ marginBottom:24 }}>No meals yet. Tap Scan to start.</ThemedText>}
      {recent.length > 0 && (
        <FlatList data={recent} keyExtractor={i=>i.id} horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom:24 }} renderItem={({ item }) => (
          <Pressable onPress={()=> navigation.navigate('History')} style={styles.mealCard} accessibilityLabel={`Meal ${item.name} ${item.calories} calories`}>
            {item.image ? <Image source={{ uri: item.image }} style={styles.mealImg} /> : <View style={[styles.mealImg,{ backgroundColor:'#222' }]} />}
            <ThemedText numberOfLines={1} weight='600' style={{ marginTop:6 }}>{item.name}</ThemedText>
            <ThemedText dim style={{ fontSize:12 }}>{item.calories} kcal</ThemedText>
          </Pressable>
        )} />
      )}

      <View style={styles.actionsRow}>
        <Button title='Manual Log (stub)' variant='outline' style={{ flex:1 }} onPress={()=> navigation.navigate('Scan')} />
        <Button title='Open Scanner' style={{ flex:1 }} onPress={()=> navigation.navigate('LiveCamera')} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding:24, paddingBottom:120 },
  headerRow: { flexDirection:'row', justifyContent:'space-between', alignItems:'center', marginBottom:20 },
  greeting: { fontSize:24 },
  quickScanBtn: { backgroundColor: colors.primary, paddingVertical:10, paddingHorizontal:18, borderRadius:18 },
  card: { backgroundColor: colors.bgAlt, padding:16, borderRadius:20, marginBottom:18 },
  mealCard: { width:140, backgroundColor: colors.bgAlt, padding:12, borderRadius:16, marginRight:14 },
  mealImg: { width:'100%', height:80, borderRadius:12 },
  actionsRow: { flexDirection:'row', gap:14, marginTop:8 }
});
