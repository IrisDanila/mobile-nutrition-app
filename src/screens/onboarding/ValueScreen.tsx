import React from 'react';
import { View, StyleSheet } from 'react-native';
import { ThemedText } from '../../components/Themed';
import { Button } from '../../components/Button';

export default function ValueScreen({ navigation }: any){
  return (
    <View style={styles.container} accessibilityLabel='Onboarding value proposition screen'>
      <ThemedText weight='700' style={styles.title}>Smarter, Faster Nutrition Logging</ThemedText>
      <ThemedText dim style={{ marginBottom:32 }}>Instant AI meal recognition, habit streaks, and actionable insights to elevate your health journey.</ThemedText>
      <Button title='Continue' onPress={()=> navigation.navigate('Permissions')} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex:1, padding:28, justifyContent:'center' },
  title: { fontSize:28, marginBottom:16 }
});
