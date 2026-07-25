import { Platform } from 'react-native';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { initializeAuth, getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: 'AIzaSyA7LzUQTNueeGAH3uYuApHijhwkbVNXMYM',
  authDomain: 'homie-a.firebaseapp.com',
  projectId: 'homie-a',
  storageBucket: 'homie-a.firebasestorage.app',
  messagingSenderId: '421693685248',
  appId: '1:421693685248:web:c5362edb45e1d7443222e5',
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

// Web already persists sessions to the browser itself by default (getAuth is enough).
// On native, initializeAuth + AsyncStorage persistence is required or sessions are lost
// on every app restart — getAuth() alone on native falls back to in-memory only.
export const auth = (() => {
  if (Platform.OS === 'web') return getAuth(app);
  try {
    // getReactNativePersistence lives in the native-only build of firebase/auth, resolved
    // via Metro's "react-native" package export condition — not present in the web bundle.
    const { getReactNativePersistence } = require('firebase/auth');
    return initializeAuth(app, { persistence: getReactNativePersistence(AsyncStorage) });
  } catch {
    // initializeAuth throws if it's already been called once (e.g. Fast Refresh) — fall back to the existing instance
    return getAuth(app);
  }
})();

export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();

export default app;
