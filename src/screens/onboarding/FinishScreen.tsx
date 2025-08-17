import React from 'react';
import { View, StyleSheet } from 'react-native';
import { ThemedText } from '../../components/Themed';
import { Button } from '../../components/Button';
import { auth, db } from '../../services/firebase';
import { ref, set } from 'firebase/database';

export default function FinishScreen({ navigation, route }: any) {
  const goal = route.params?.goal;
  const complete = async () => {
    const user = auth.currentUser;
    if (user) {
      await set(ref(db, `users/${user.uid}/profile/onboardingCompleted`), true);
      if(goal) await set(ref(db, `users/${user.uid}/profile/goalType`), goal);
    }
    navigation.reset({ index:0, routes:[{ name:'Value' }] });
    // Navigate out via higher level once listener updates
  };
  return (
    <View style={styles.container} accessibilityLabel='Onboarding finish screen'>
      <ThemedText weight='700' style={styles.title}>You're All Set</ThemedText>
      <ThemedText dim style={{ marginBottom:32 }}>We'll tailor insights based on your goal.</ThemedText>
      <Button title='Start Logging' onPress={complete} />
    </View>
  );
}
const styles = StyleSheet.create({
  container: { flex:1, padding:28, justifyContent:'center' },
  title: { fontSize:28, marginBottom:16 }
});
