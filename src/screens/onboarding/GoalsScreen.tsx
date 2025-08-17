import React, { useState } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { ThemedText } from '../../components/Themed';
import { Button } from '../../components/Button';

const options = [
  { key:'lose', label:'Lose Weight' },
  { key:'maintain', label:'Maintain' },
  { key:'gain', label:'Gain Muscle' }
];

export default function GoalsScreen({ navigation }: any) {
  const [goal,setGoal] = useState('maintain');
  return (
    <View style={styles.container} accessibilityLabel='Goals selection screen'>
      <ThemedText weight='700' style={styles.title}>Your Goal</ThemedText>
      {options.map(o=> (
        <Pressable key={o.key} onPress={()=> setGoal(o.key)} style={[styles.option, goal===o.key && styles.optionActive]} accessibilityRole='button' accessibilityState={{ selected: goal===o.key }}>
          <ThemedText weight='600'>{o.label}</ThemedText>
        </Pressable>
      ))}
      <Button title='Finish' style={{ marginTop:32 }} onPress={()=> navigation.navigate('Finish',{ goal })} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex:1, padding:28, justifyContent:'center' },
  title: { fontSize:28, marginBottom:24 },
  option: { padding:16, borderRadius:16, backgroundColor:'rgba(255,255,255,0.06)', marginBottom:12 },
  optionActive: { backgroundColor:'rgba(75,139,255,0.25)', borderWidth:1, borderColor:'rgba(75,139,255,0.6)' }
});
