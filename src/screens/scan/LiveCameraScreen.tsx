import React, { useCallback, useRef, useState } from 'react';
import { View, StyleSheet, Dimensions, Pressable, Animated, Easing, FlatList } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { ThemedText } from '../../components/Themed';
import { colors } from '../../theme/colors';
import { analyzeMeal, MealItemAnalysis } from '../../services/aiMulti';
import { Button } from '../../components/Button';
import { MacroBar } from '../../components/MacroBar';
import { auth, db, storage } from '../../services/firebase';
import { ref, push, set } from 'firebase/database';
import { ref as sRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { updateGamificationAfterMeal } from '../../services/gamification';
import { useGamificationEvents } from '../../providers/GamificationEvents';

const { width } = Dimensions.get('window');

export default function LiveCameraScreen({ navigation }: any) {
  const [permission, requestPermission] = useCameraPermissions();
  const [capturing, setCapturing] = useState(false);
  const [images, setImages] = useState<string[]>([]);
  const [results, setResults] = useState<MealItemAnalysis[] | null>(null);
  const [editingItems, setEditingItems] = useState<MealItemAnalysis[] | null>(null);
  const [saving, setSaving] = useState(false);
  const sheetAnim = useRef(new Animated.Value(0)).current;
  const { triggerBadges } = useGamificationEvents();
  const cameraRef = useRef<CameraView | null>(null);

  const capture = async () => {
    if (!permission?.granted) {
      const p = await requestPermission();
      if (!p.granted) return;
    }
    if (capturing) return;
    setCapturing(true);
    try {
      let photoUri: string | null = null;
      const maybe = (cameraRef.current as any);
      if (maybe?.takePictureAsync) {
        try {
          const photo = await maybe.takePictureAsync({ quality:0.6, skipProcessing:true });
          photoUri = photo?.uri || null;
        } catch (err) {
          console.warn('takePictureAsync failed, falling back to mock', err);
        }
      } else {
        console.warn('CameraView takePictureAsync not available; using mock image');
      }

      let newImages: string[] = [];
      if (photoUri) {
        try {
          const fileName = `meal-${Date.now()}-${images.length+1}.jpg`;
          const path = `users/${auth.currentUser?.uid}/images/${fileName}`;
          const storageRef = sRef(storage, path);
          const resp = await fetch(photoUri);
          const blob = await resp.blob();
          await uploadBytes(storageRef, blob, { contentType: 'image/jpeg' });
          const url = await getDownloadURL(storageRef);
          newImages = [...images, url];
        } catch (e) {
          console.warn('Upload failed, using local uri placeholder');
          newImages = [...images, photoUri];
        }
      } else {
        // Always push at least a mock so UX continues
        newImages = [...images, `mock://image-${images.length+1}`];
      }
      setImages(newImages);
      const res = await analyzeMeal(newImages);
      setResults(res);
      setEditingItems(res.map(r=> ({ ...r })));
      Animated.timing(sheetAnim, { toValue:1, duration:260, easing:Easing.out(Easing.ease), useNativeDriver:true }).start();
    } finally { setCapturing(false); }
  };

  const reset = () => { setImages([]); setResults(null); setEditingItems(null); sheetAnim.setValue(0); };

  const totalCalories = (editingItems||results)?.reduce((a,b)=>a+b.calories,0)||0;
  const macros = (editingItems||results)?.reduce((acc,cur)=>{ acc.protein+=cur.macros.protein; acc.carbs+=cur.macros.carbs; acc.fat+=cur.macros.fat; return acc; }, { protein:0, carbs:0, fat:0 });

  const updateItem = (id: string, patch: Partial<MealItemAnalysis>) => {
    setEditingItems(items => items? items.map(it=> it.id===id? { ...it, ...patch, macros: patch.macros? { ...patch.macros }: it.macros }: it): items);
  };

  const saveMeal = async () => {
    if (!auth.currentUser || !editingItems) return;
    setSaving(true);
    try {
      const listRef = ref(db, `users/${auth.currentUser.uid}/foods`);
      const newRef = push(listRef);
      // Aggregate macros
      const agg = editingItems.reduce((acc,cur)=>{ acc.protein+=cur.macros.protein; acc.carbs+=cur.macros.carbs; acc.fat+=cur.macros.fat; return acc; }, { protein:0, carbs:0, fat:0 });
      await set(newRef, {
        name: editingItems.map(i=>i.name).join(' + '),
        quantity: editingItems.map(i=>i.quantity).join(' | '),
        calories: totalCalories,
        macros: agg,
        items: editingItems,
        images, // store array of image URLs
        image: images[0] || null,
        timestamp: Date.now()
      });
      const { newBadges } = await updateGamificationAfterMeal({ calories: totalCalories, protein: agg.protein, carbs: agg.carbs, fat: agg.fat });
      if (newBadges.length) triggerBadges(newBadges);
      reset();
      navigation.goBack();
    } finally { setSaving(false); }
  };

  const totalProtein = (editingItems || results)?.reduce((sum, item) => sum + item.macros.protein, 0) || 0;
  const totalCarbs = (editingItems || results)?.reduce((sum, item) => sum + item.macros.carbs, 0) || 0;
  const totalFat = (editingItems || results)?.reduce((sum, item) => sum + item.macros.fat, 0) || 0;

  return (
    <View style={styles.container}>
      <View style={styles.cameraWrap}>
        <CameraView ref={cameraRef} style={StyleSheet.absoluteFill} facing='back'>
          <View style={styles.overlay} pointerEvents='none'>
            <View style={styles.reticle} />
          </View>
        </CameraView>
        <View style={styles.topBar}>
          <Pressable accessibilityLabel='Close camera' onPress={()=> navigation.goBack()} style={styles.roundBtn}><ThemedText weight='700'>×</ThemedText></Pressable>
        </View>
        <View style={styles.bottomBar}>
          <Pressable accessibilityLabel='Capture Photo' onPress={capture} style={[styles.shutter, capturing && { opacity:0.5 }]} />
          <Pressable accessibilityLabel='Add angle' onPress={capture} style={styles.smallBtn}><ThemedText weight='600'>{capturing? '...' : '+ Angle'}</ThemedText></Pressable>
          {images.length>0 && <Pressable accessibilityLabel='Reset session' onPress={reset} style={styles.smallBtn}><ThemedText weight='600'>Reset</ThemedText></Pressable>}
        </View>
      </View>

      {/* Quick validation sheet */}
      {results && (
        <Animated.View style={[styles.sheet,{ transform:[{ translateY: sheetAnim.interpolate({ inputRange:[0,1], outputRange:[280,0] }) }] }]}> 
          <View style={{ flexDirection:'row', justifyContent:'space-between', alignItems:'center' }}>
            <ThemedText weight='700' style={{ fontSize:16 }}>Detected Items</ThemedText>
            <ThemedText dim style={{ fontSize:12 }}>{images.length} img{images.length!==1?'s':''}</ThemedText>
          </View>
          <FlatList data={editingItems||results} keyExtractor={i=>i.id} horizontal showsHorizontalScrollIndicator={false} style={{ marginVertical:12 }} renderItem={({ item }) => (
            <View style={styles.itemCard}>
              <ThemedText weight='600' numberOfLines={1} style={{ maxWidth:120 }}>{item.name}</ThemedText>
              <ThemedText dim style={{ fontSize:12 }}>{Math.round(item.confidence*100)}% • {item.quantity}</ThemedText>
              <ThemedText weight='700' style={{ marginTop:4 }}>{item.calories} kcal</ThemedText>
              <MacroBar protein={item.macros.protein} carbs={item.macros.carbs} fat={item.macros.fat} style={{ marginTop:8 }} />
              <View style={{ flexDirection:'row', gap:6, marginTop:8 }}>
                <Pressable accessibilityLabel='Decrease calories' onPress={()=> updateItem(item.id, { calories: Math.max(0, item.calories-10) })}><ThemedText dim>-10</ThemedText></Pressable>
                <Pressable accessibilityLabel='Increase calories' onPress={()=> updateItem(item.id, { calories: item.calories+10 })}><ThemedText dim>+10</ThemedText></Pressable>
              </View>
            </View>
          )} />
          <View style={{ marginTop:4 }}>
            <ThemedText dim style={{ fontSize:12, marginBottom:4 }}>Meal Summary</ThemedText>
            <ThemedText weight='700'>{totalCalories} kcal</ThemedText>
            {macros && <ThemedText dim style={{ marginTop:4 }}>P {macros.protein} • C {macros.carbs} • F {macros.fat}</ThemedText>}
          </View>
          <Button title={saving? 'Saving...' : 'Confirm & Save'} disabled={saving} style={{ marginTop:16 }} onPress={saveMeal} />
          <Pressable onPress={()=> setEditingItems(results? results.map(r=> ({ ...r })) : null)} style={{ marginTop:12, alignSelf:'center' }}>
            <ThemedText dim style={{ fontSize:12 }}>Reset edits</ThemedText>
          </Pressable>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex:1 },
  cameraWrap: { flex:1 },
  overlay: { flex:1, justifyContent:'center', alignItems:'center' },
  reticle: { width: width*0.75, height: width*0.75, borderRadius: 24, borderWidth:2, borderColor: 'rgba(255,255,255,0.25)' },
  topBar: { position:'absolute', top:40, left:0, right:0, paddingHorizontal:16, flexDirection:'row', justifyContent:'flex-start' },
  bottomBar: { position:'absolute', bottom:40, left:0, right:0, alignItems:'center' },
  shutter: { width:84, height:84, borderRadius:42, backgroundColor: colors.primary, borderWidth:6, borderColor:'rgba(255,255,255,0.5)' },
  smallBtn: { position:'absolute', right:16, bottom:0, backgroundColor:'rgba(0,0,0,0.4)', paddingHorizontal:14, paddingVertical:10, borderRadius:14 },
  roundBtn: { width:44, height:44, borderRadius:22, backgroundColor:'rgba(0,0,0,0.45)', alignItems:'center', justifyContent:'center' },
  sheet: { position:'absolute', left:0, right:0, bottom:0, backgroundColor: '#101820EE', padding:16, borderTopLeftRadius:24, borderTopRightRadius:24 },
  itemCard: { width:160, backgroundColor: 'rgba(255,255,255,0.06)', padding:12, borderRadius:16, marginRight:12 }
});
