import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import Constants, { ExecutionEnvironment } from 'expo-constants';
import {
  createUserWithEmailAndPassword, signInWithEmailAndPassword,
  signInWithCredential, GoogleAuthProvider, onAuthStateChanged,
  signOut as firebaseSignOut, updateProfile,
} from 'firebase/auth';
import { auth } from './firebaseConfig';
import * as firestoreService from './firestoreService';
import store from '../store';
import { setUser, clearUser } from '../store/slices/userSlice';

WebBrowser.maybeCompleteAuthSession();

// TODO: from Firebase Console -> Authentication -> Sign-in method -> Google ->
// "Web SDK configuration" -> Web client ID (Firebase auto-creates this the moment
// you enable the Google provider — no separate Google Cloud Console setup needed).
const GOOGLE_CLIENT_ID = '421693685248-2vf20q7kno5rptrv4dmuvuvktakgf2ut.apps.googleusercontent.com';

const GOOGLE_DISCOVERY = {
  authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
  tokenEndpoint: 'https://oauth2.googleapis.com/token',
};

const SESSION_KEY = 'hm_session';

export interface User {
  uid: string;
  name: string;
  email: string;
  avatar: string;
  provider: 'email' | 'google';
  xp: number;
  level: number;
  streak: number;
  longestStreak: number;
  lastStudyDate: string | null;
  studiedDates: string[];
  correct: number;
  sessions: number;
  msgsSent: number;
  studyHours: number;
  gems: number;
  hearts: number;
  freezesLeft: number;
  goals: string[];
  achievements: string[];
  history: Array<{ id: string; subject: string; preview: string; xp_earned: number; duration_mins: number; date: string }>;
  notifications: boolean;
  createdAt: string;
  updatedAt: string;
}

function defaultUserData(overrides: Pick<User, 'name' | 'email' | 'avatar' | 'provider'>): Omit<User, 'uid'> {
  const now = new Date().toISOString();
  return {
    ...overrides,
    xp: 0, level: 1, streak: 0, longestStreak: 0, lastStudyDate: null, studiedDates: [],
    correct: 0, sessions: 0, msgsSent: 0, studyHours: 0,
    gems: 500, hearts: 5, freezesLeft: 2,
    goals: [], achievements: [], history: [], notifications: true,
    createdAt: now, updatedAt: now,
  };
}

async function cacheSession(user: User): Promise<void> {
  await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(user));
}

// Applies the same "check in today" streak logic on every sign-in, whether by
// email or Google, so the streak stays accurate no matter how someone logs in.
async function applyDailyCheckIn(user: User): Promise<User> {
  const today = new Date().toDateString();
  if (user.lastStudyDate === today) return user;
  const yesterday = new Date(Date.now() - 86400000).toDateString();
  const streak = user.lastStudyDate === yesterday ? user.streak + 1 : 1;
  const longestStreak = Math.max(streak, user.longestStreak);
  const updates = { streak, longestStreak, lastStudyDate: today };
  await firestoreService.updateUser(user.uid, updates);
  return { ...user, ...updates };
}

export async function signUpWithEmail(name: string, email: string, password: string, avatar: string): Promise<{ user?: User; err?: string }> {
  try {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(cred.user, { displayName: name });
    const user = await firestoreService.createUser(cred.user.uid, defaultUserData({ name, email, avatar, provider: 'email' }));
    await cacheSession(user);
    store.dispatch(setUser(user as any));
    return { user };
  } catch (e: any) {
    return { err: mapFirebaseError(e) };
  }
}

export async function signInWithEmail(email: string, password: string): Promise<{ user?: User; err?: string }> {
  try {
    const cred = await signInWithEmailAndPassword(auth, email, password);
    let user = await firestoreService.getUserByUid(cred.user.uid);
    if (!user) return { err: 'no profile found for this account' };
    user = await applyDailyCheckIn(user);
    await cacheSession(user);
    store.dispatch(setUser(user as any));
    return { user };
  } catch (e: any) {
    return { err: mapFirebaseError(e) };
  }
}

// In Expo Go, the OAuth redirect URL is generated dynamically (tied to the current dev/tunnel
// session) and is explicitly documented by Expo as unstable when loaded via a published update —
// Google rejects it against the app's pre-registered redirect URLs with "Access blocked, Error 400".
// This only resolves correctly in a real custom build, where the app's own fixed URL scheme is used.
export function isGoogleSignInSupported(): boolean {
  return Platform.OS === 'web' || Constants.executionEnvironment !== ExecutionEnvironment.StoreClient;
}

export async function signInWithGoogle(): Promise<{ user?: User; err?: string }> {
  if (!isGoogleSignInSupported()) {
    return { err: 'google sign-in needs the full app, not Expo Go — ask for that build link' };
  }
  try {
    const redirectUri = AuthSession.makeRedirectUri();
    const request = new AuthSession.AuthRequest({
      clientId: GOOGLE_CLIENT_ID,
      scopes: ['openid', 'profile', 'email'],
      redirectUri,
      responseType: AuthSession.ResponseType.IdToken,
      // PKCE only applies to the authorization-code flow — Google rejects
      // code_challenge/code_challenge_method outright on an id_token request
      // ("invalid_request: Parameter not allowed for this message type"),
      // and AuthRequest defaults usePKCE to true regardless of responseType.
      usePKCE: false,
      extraParams: { nonce: Math.random().toString(36).slice(2) },
    });
    const result = await request.promptAsync(GOOGLE_DISCOVERY);
    if (result.type !== 'success' || !result.params?.id_token) {
      return { err: 'google sign-in cancelled' };
    }
    const credential = GoogleAuthProvider.credential(result.params.id_token);
    const cred = await signInWithCredential(auth, credential);
    let user = await firestoreService.getUserByUid(cred.user.uid);
    if (!user) {
      user = await firestoreService.createUser(cred.user.uid, defaultUserData({
        name: cred.user.displayName || 'Student',
        email: cred.user.email || '',
        avatar: '🧑',
        provider: 'google',
      }));
    } else {
      user = await applyDailyCheckIn(user);
    }
    await cacheSession(user);
    store.dispatch(setUser(user as any));
    return { user };
  } catch (e: any) {
    return { err: mapFirebaseError(e) };
  }
}

export async function signOutUser(): Promise<void> {
  await firebaseSignOut(auth);
  await AsyncStorage.removeItem(SESSION_KEY);
  store.dispatch(clearUser());
}

export async function getSession(): Promise<User | null> {
  try {
    const cached = await AsyncStorage.getItem(SESSION_KEY);
    if (!cached) return null;
    const user = JSON.parse(cached) as User;
    // Firebase rehydrates the persisted session asynchronously on cold start —
    // auth.currentUser isn't reliable immediately, so wait for the first state event.
    const fbUser = await new Promise<import('firebase/auth').User | null>((resolve) => {
      const unsub = onAuthStateChanged(auth, (u) => { unsub(); resolve(u); });
    });
    if (!fbUser || fbUser.uid !== user.uid) {
      await AsyncStorage.removeItem(SESSION_KEY);
      return null;
    }
    return user;
  } catch {
    return null;
  }
}

export async function updateUser(uid: string, updates: Partial<User>): Promise<User | null> {
  await firestoreService.updateUser(uid, updates);
  const cached = await AsyncStorage.getItem(SESSION_KEY);
  if (!cached) return null;
  const merged = { ...JSON.parse(cached), ...updates };
  await cacheSession(merged);
  return merged;
}

function mapFirebaseError(e: any): string {
  const code = e?.code || '';
  if (code.includes('email-already-in-use')) return "that email's taken";
  if (code.includes('invalid-email')) return 'invalid email';
  if (code.includes('weak-password')) return 'needs 6+ characters';
  if (code.includes('user-not-found') || code.includes('wrong-password') || code.includes('invalid-credential')) return 'wrong email or password';
  if (code.includes('network-request-failed')) return "can't reach the internet — check your connection";
  if (code.includes('too-many-requests')) return 'too many attempts — try again in a bit';
  return 'something broke — try again';
}
