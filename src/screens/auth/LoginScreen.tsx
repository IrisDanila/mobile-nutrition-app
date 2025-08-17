import React, { useState } from 'react';
import { View, TextInput, StyleSheet, KeyboardAvoidingView, Platform, Pressable } from 'react-native';
import { signInWithEmailAndPassword, signInWithCredential, GoogleAuthProvider } from 'firebase/auth';
import * as WebBrowser from 'expo-web-browser';
import * as AuthSession from 'expo-auth-session';
import { auth } from '../../services/firebase';
import { Button } from '../../components/Button';
import { ThemedText } from '../../components/Themed';
import { colors } from '../../theme/colors';

WebBrowser.maybeCompleteAuthSession();

export default function LoginScreen({ navigation }: any) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string| null>(null);

  const handleLogin = async () => {
    setLoading(true); setError(null);
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
    } catch (e: any) {
      setError(e.message);
    } finally { setLoading(false); }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS==='ios'? 'padding': undefined}>
      <ThemedText weight='700' style={styles.title}>Welcome Back</ThemedText>
      <ThemedText dim style={{ marginBottom: 28 }}>Sign in to continue</ThemedText>
      <TextInput autoCapitalize='none' placeholder='Email' placeholderTextColor={colors.textDim} style={styles.input} value={email} onChangeText={setEmail} />
      <TextInput placeholder='Password' placeholderTextColor={colors.textDim} secureTextEntry style={styles.input} value={password} onChangeText={setPassword} />
      {error && <ThemedText style={{ color: colors.danger, marginBottom: 12 }}>{error}</ThemedText>}
      <Button title='Login' onPress={handleLogin} loading={loading} />
      <Pressable onPress={()=>navigation.navigate('Register')} style={{ marginTop: 24 }}>
        <ThemedText dim>Don't have an account? <ThemedText weight='600' style={{ color: colors.primary }}>Register</ThemedText></ThemedText>
      </Pressable>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex:1, backgroundColor: colors.bg, padding: 24, justifyContent: 'center' },
  input: { backgroundColor: colors.bgAlt, color: colors.text, padding: 14, borderRadius: 14, marginBottom: 14 },
  title: { fontSize: 28, color: colors.text, marginBottom: 4 }
});
