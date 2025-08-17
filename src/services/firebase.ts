import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import 'firebase/auth'; // ensure auth component registration side-effect
import { getDatabase } from 'firebase/database';
import { getStorage } from 'firebase/storage';
import Constants from 'expo-constants';

const extra = (Constants as any).expoConfig?.extra || (Constants as any).manifest?.extra || {};
const env = (key: string) => (extra?.[key] ?? (process.env as any)?.[key]);
// Use provided storage bucket (accept given domain)
const storageBucket = env('FIREBASE_STORAGE_BUCKET');

// Accept explicit regional database URL via EXTRA or derive (fallback is global domain which may warn)
const explicitDbUrl = env('FIREBASE_DATABASE_URL');
const defaultProject = env('FIREBASE_PROJECT_ID');
const regionalGuess = defaultProject ? `https://${defaultProject}-default-rtdb.europe-west1.firebasedatabase.app` : undefined;
const firebaseConfig = {
  apiKey: env('FIREBASE_API_KEY'),
  authDomain: env('FIREBASE_AUTH_DOMAIN'),
  projectId: defaultProject,
  storageBucket,
  messagingSenderId: env('FIREBASE_MESSAGING_SENDER_ID'),
  appId: env('FIREBASE_APP_ID'),
  databaseURL: explicitDbUrl || regionalGuess
};

const app: FirebaseApp = getApps()[0] ?? initializeApp(firebaseConfig);

// Initialize auth with persistence if react-native helper can be resolved
let authExport;
try {
  const rnAuth = require('firebase/auth/react-native');
  if (rnAuth.initializeAuth && rnAuth.getReactNativePersistence) {
    authExport = rnAuth.initializeAuth(app, { persistence: rnAuth.getReactNativePersistence(AsyncStorage) });
  }
} catch (e) {
  // Swallow resolution errors; will fall back to in-memory auth
}
if (!authExport) {
  authExport = getAuth(app);
}
export const auth = authExport;
export const googleProvider = new GoogleAuthProvider();
export const db = getDatabase(app);
export const storage = getStorage(app);
