import React, { useState } from 'react';
import { View, StyleSheet, Image, ScrollView, Modal, TextInput, Pressable, Animated, Easing } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Button } from '../../components/Button';
import { ThemedText } from '../../components/Themed';
import { analyzeFood, FoodAnalysis } from '../../services/ai';
import { colors } from '../../theme/colors';
import { ref, push, set } from 'firebase/database';
import { db, auth } from '../../services/firebase';
import { format } from 'date-fns';
import { MacroBar } from '../../components/MacroBar';
import { updateGamificationAfterMeal } from '../../services/gamification';
import { useGamificationEvents } from '../../providers/GamificationEvents';

export default function ScanScreen({ navigation }: any) {
  const { triggerBadges } = useGamificationEvents();
  const [image, setImage] = useState<string | null>(null);
  const [result, setResult] = useState<FoodAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState<FoodAnalysis | null>(null);
  const [anim] = useState(new Animated.Value(0));

  const pickImage = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') return;
    const res = await ImagePicker.launchCameraAsync({ quality: 0.8 });
    if (!res.canceled) {
      setImage(res.assets[0].uri);
      setResult(null);
    }
  };

  const analyze = async () => {
    if (!image) return;
    setLoading(true);
    try {
      const analysis = await analyzeFood(image);
      setResult(analysis);
      setEditing(analysis); // open edit modal before persisting
      Animated.timing(anim, { toValue:1, duration:280, easing: Easing.out(Easing.ease), useNativeDriver:true }).start();
    } finally { setLoading(false); }
  };

  const persistEdited = async () => {
    if (!editing || !image || !auth.currentUser) { setEditing(null); return; }
    const listRef = ref(db, `users/${auth.currentUser.uid}/foods`);
    const newRef = push(listRef);
    await set(newRef, { ...editing, image, timestamp: Date.now() });
    // update streak & badges
  const { newBadges } = await updateGamificationAfterMeal({
      calories: editing.calories,
      protein: editing.macros.protein,
      carbs: editing.macros.carbs,
      fat: editing.macros.fat
    });
  if (newBadges.length) triggerBadges(newBadges);
    setResult(editing);
    setEditing(null);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <ThemedText weight='700' style={styles.title}>Scan Food</ThemedText>
      <ThemedText dim style={{ marginBottom: 20 }}>Capture a photo to analyze nutrition</ThemedText>
      {image && <Image source={{ uri: image }} style={styles.preview} />}
  {!image && <Button title='Quick Capture (Live)' onPress={()=> navigation.navigate('LiveCamera')} />}
  {!image && <Button title='Take Photo (Legacy)' variant='outline' onPress={pickImage} style={{ marginTop:12 }} />}
      {image && !result && <Button title='Analyze' onPress={analyze} loading={loading} style={{ marginTop: 12 }} />}
      {result && !editing && (
        <View style={styles.card}>
          <ThemedText weight='600' style={{ fontSize: 20 }}>{result.name}</ThemedText>
          <ThemedText dim style={{ marginBottom: 8 }}>{result.quantity} • {Math.round(result.confidence*100)}% confidence</ThemedText>
          <ThemedText weight='700' style={{ fontSize: 18 }}>{result.calories} kcal</ThemedText>
          <MacroBar protein={result.macros.protein} carbs={result.macros.carbs} fat={result.macros.fat} style={{ marginTop: 12 }} />
          <ThemedText dim style={{ marginTop: 8 }}>P {result.macros.protein}g • C {result.macros.carbs}g • F {result.macros.fat}g</ThemedText>
          <View style={{ flexDirection:'row', gap:12, marginTop:16 }}>
            <Button title='Retake' variant='outline' onPress={()=>{ setImage(null); setResult(null); }} style={{ flex:1 }} />
            <Button title='Edit' variant='outline' onPress={()=>{ setEditing(result); anim.setValue(0); Animated.timing(anim,{ toValue:1,duration:280,easing:Easing.out(Easing.ease),useNativeDriver:true }).start(); }} style={{ flex:1 }} />
          </View>
        </View>
      )}

      <Modal visible={!!editing} transparent animationType='fade' onRequestClose={()=>setEditing(null)}>
        <View style={styles.modalBackdrop}>
          <Animated.View style={[styles.modalCard,{ transform:[{ translateY: anim.interpolate({ inputRange:[0,1], outputRange:[40,0] }) }], opacity: anim }]}> 
            <ThemedText weight='700' style={{ fontSize:18, marginBottom:12 }}>Review & Save</ThemedText>
            <ThemedText dim style={{ fontSize:12, marginBottom:12 }}>Adjust values if needed before saving.</ThemedText>
            <TextInput style={styles.input} value={editing?.name} placeholder='Name' placeholderTextColor={colors.textDim} onChangeText={t=> setEditing(e=> e? { ...e, name:t }: e)} />
            <TextInput style={styles.input} value={editing?.quantity} placeholder='Quantity' placeholderTextColor={colors.textDim} onChangeText={t=> setEditing(e=> e? { ...e, quantity:t }: e)} />
            <View style={styles.inlineInputs}>
              <TextInput style={[styles.inputSmall]} keyboardType='numeric' value={editing?.calories.toString()} placeholder='kcal' placeholderTextColor={colors.textDim} onChangeText={t=> setEditing(e=> e? { ...e, calories: Number(t)||0 }: e)} />
              <TextInput style={styles.inputSmall} keyboardType='numeric' value={editing?.macros.protein.toString()} placeholder='P' placeholderTextColor={colors.textDim} onChangeText={t=> setEditing(e=> e? { ...e, macros:{ ...e.macros, protein: Number(t)||0 } }: e)} />
              <TextInput style={styles.inputSmall} keyboardType='numeric' value={editing?.macros.carbs.toString()} placeholder='C' placeholderTextColor={colors.textDim} onChangeText={t=> setEditing(e=> e? { ...e, macros:{ ...e.macros, carbs: Number(t)||0 } }: e)} />
              <TextInput style={styles.inputSmall} keyboardType='numeric' value={editing?.macros.fat.toString()} placeholder='F' placeholderTextColor={colors.textDim} onChangeText={t=> setEditing(e=> e? { ...e, macros:{ ...e.macros, fat: Number(t)||0 } }: e)} />
            </View>
            <MacroBar protein={editing?.macros.protein||0} carbs={editing?.macros.carbs||0} fat={editing?.macros.fat||0} style={{ marginTop: 8 }} />
            <View style={{ flexDirection:'row', gap:12, marginTop:20 }}>
              <Button title='Cancel' variant='outline' style={{ flex:1 }} onPress={()=> setEditing(null)} />
              <Button title='Save' style={{ flex:1 }} onPress={persistEdited} />
            </View>
          </Animated.View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 24, backgroundColor: colors.bg },
  title: { fontSize: 24, marginTop: 8, marginBottom: 4 },
  preview: { width: '100%', aspectRatio: 1, borderRadius: 16, marginBottom: 16 },
  card: { backgroundColor: colors.bgAlt, padding: 20, borderRadius: 20, marginTop: 16, shadowColor:'#000', shadowOpacity:0.3, shadowRadius:12, shadowOffset:{ width:0, height:6 } },
  modalBackdrop: { flex:1, backgroundColor: 'rgba(0,0,0,0.6)', padding:24, justifyContent:'flex-end' },
  modalCard: { backgroundColor: colors.bgAlt, padding:20, borderRadius:20, marginBottom: 120 },
  input: { backgroundColor: colors.bg, color: colors.text, padding:12, borderRadius:12, marginBottom:10 },
  inlineInputs: { flexDirection:'row', gap:8 },
  inputSmall: { flex:1, backgroundColor: colors.bg, color: colors.text, padding:12, borderRadius:12 }
});
