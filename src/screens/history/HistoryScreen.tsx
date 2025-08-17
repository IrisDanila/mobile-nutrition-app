import React, { useEffect, useMemo, useState } from 'react';
import { View, StyleSheet, FlatList, Image } from 'react-native';
import { onValue, ref } from 'firebase/database';
import { auth, db } from '../../services/firebase';
import { ThemedText } from '../../components/Themed';
import { colors } from '../../theme/colors';
import { format } from 'date-fns';
import { MacroBar } from '../../components/MacroBar';

interface Item { id: string; name: string; calories: number; quantity: string; image: string; timestamp: number; }

export default function HistoryScreen() {
  const [items, setItems] = useState<Item[]>([]);

  useEffect(() => {
    if (!auth.currentUser) return;
    const listRef = ref(db, `users/${auth.currentUser.uid}/foods`);
    return onValue(listRef, snap => {
      const val = snap.val() || {};
      const mapped = Object.entries(val).map(([k,v]: any) => ({ id: k, ...v })).sort((a,b)=>b.timestamp - a.timestamp);
      setItems(mapped);
    });
  }, []);

  const summary = useMemo(()=>{
    const today = new Date();
    const isSameDay = (ts:number) => new Date(ts).toDateString() === today.toDateString();
    const todays = items.filter(i=> isSameDay(i.timestamp));
    const calories = todays.reduce((a,b)=> a + b.calories, 0);
    const macros = todays.reduce((acc:any, cur:any)=>{ acc.protein+= cur.macros?.protein||0; acc.carbs+= cur.macros?.carbs||0; acc.fat+= cur.macros?.fat||0; return acc; }, { protein:0, carbs:0, fat:0 });
    return { calories, macros, count: todays.length };
  }, [items]);

  return (
    <View style={styles.container}>
      <ThemedText weight='700' style={styles.title}>History</ThemedText>
      <View style={styles.summaryCard}>
        <ThemedText weight='600' style={{ fontSize:16 }}>Today</ThemedText>
        <ThemedText dim style={{ marginTop:2 }}>{summary.count} items</ThemedText>
        <ThemedText weight='700' style={{ fontSize:22, marginTop:4 }}>{summary.calories} kcal</ThemedText>
        <MacroBar protein={summary.macros.protein} carbs={summary.macros.carbs} fat={summary.macros.fat} style={{ marginTop:10 }} />
        <ThemedText dim style={{ fontSize:12, marginTop:6 }}>P {summary.macros.protein}g • C {summary.macros.carbs}g • F {summary.macros.fat}g</ThemedText>
      </View>
      <FlatList data={items} keyExtractor={i=>i.id} contentContainerStyle={{ paddingBottom: 160 }} renderItem={({ item }) => (
        <View style={styles.row}>
          <Image source={{ uri: item.image }} style={styles.thumb} />
          <View style={{ flex: 1 }}>
            <ThemedText weight='600'>{item.name}</ThemedText>
            <ThemedText dim style={{ fontSize: 12 }}>{item.quantity} • {format(item.timestamp,'PPpp')}</ThemedText>
          </View>
          <ThemedText weight='600'>{item.calories} kcal</ThemedText>
        </View>
      )} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex:1, backgroundColor: colors.bg, padding: 24 },
  title: { fontSize: 24, marginTop: 8, marginBottom: 12 },
  row: { flexDirection: 'row', gap:12, alignItems: 'center', backgroundColor: colors.bgAlt, padding: 12, borderRadius: 14, marginBottom: 12 },
  thumb: { width: 56, height: 56, borderRadius: 12, backgroundColor: '#333' },
  summaryCard: { backgroundColor: colors.bgAlt, padding:16, borderRadius:18, marginBottom:18 }
});
