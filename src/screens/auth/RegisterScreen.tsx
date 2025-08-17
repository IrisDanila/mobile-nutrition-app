import React, { useState } from 'react';
import { TextInput, StyleSheet, KeyboardAvoidingView, Platform, Pressable } from 'react-native';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../services/firebase';
import { Button } from '../../components/Button';
import { ThemedText } from '../../components/Themed';
import { colors } from '../../theme/colors';

export default function RegisterScreen({ navigation }: any) {
  const [email,setEmail] = useState('');
  const [password,setPassword] = useState('');
  const [confirm,setConfirm] = useState('');
  const [loading,setLoading] = useState(false);
  const [error,setError] = useState<string|null>(null);

  const handleRegister = async () => {
    if (password !== confirm) { setError('Passwords do not match'); return; }
    setLoading(true); setError(null);
    try {
      await createUserWithEmailAndPassword(auth, email.trim(), password);
    } catch (e:any) { setError(e.message); }
    finally { setLoading(false); }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS==='ios'? 'padding': undefined}>
      <ThemedText weight='700' style={styles.title}>Create Account</ThemedText>
      <ThemedText dim style={{ marginBottom: 28 }}>Join and start tracking</ThemedText>
      <TextInput autoCapitalize='none' placeholder='Email' placeholderTextColor={colors.textDim} style={styles.input} value={email} onChangeText={setEmail} />
      <TextInput placeholder='Password' placeholderTextColor={colors.textDim} secureTextEntry style={styles.input} value={password} onChangeText={setPassword} />
      <TextInput placeholder='Confirm Password' placeholderTextColor={colors.textDim} secureTextEntry style={styles.input} value={confirm} onChangeText={setConfirm} />
      {error && <ThemedText style={{ color: colors.danger, marginBottom: 12 }}>{error}</ThemedText>}
      <Button title='Register' onPress={handleRegister} loading={loading} />
      <Pressable onPress={()=>navigation.goBack()} style={{ marginTop: 24 }}>
        <ThemedText dim>Have an account? <ThemedText weight='600' style={{ color: colors.primary }}>Login</ThemedText></ThemedText>
      </Pressable>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex:1, backgroundColor: colors.bg, padding: 24, justifyContent: 'center' },
  input: { backgroundColor: colors.bgAlt, color: colors.text, padding: 14, borderRadius: 14, marginBottom: 14 },
  title: { fontSize: 28, color: colors.text, marginBottom: 4 }
});
