import React, { useState } from 'react';
import { View, StyleSheet, Switch } from 'react-native';
import { ThemedText } from '../../components/Themed';
import { Button } from '../../components/Button';

export default function PermissionsScreen({ navigation }: any) {
  const [camera,setCamera] = useState(true);
  const [notifications,setNotifications] = useState(true);
  return (
    <View style={styles.container} accessibilityLabel='Permissions request screen'>
      <ThemedText weight='700' style={styles.title}>Permissions</ThemedText>
      <View style={styles.row}><ThemedText style={styles.label}>Camera</ThemedText><Switch value={camera} onValueChange={setCamera} /></View>
      <View style={styles.row}><ThemedText style={styles.label}>Notifications</ThemedText><Switch value={notifications} onValueChange={setNotifications} /></View>
      <Button title='Continue' style={{ marginTop:32 }} onPress={()=> navigation.navigate('Goals')} />
    </View>
  );
}
const styles = StyleSheet.create({
  container: { flex:1, padding:28, justifyContent:'center' },
  title: { fontSize:28, marginBottom:28 },
  row: { flexDirection:'row', justifyContent:'space-between', alignItems:'center', marginBottom:18 },
  label: { fontSize:18 }
});
