import {
  doc, getDoc, setDoc, updateDoc,
  collection, query, orderBy, limit, getDocs,
} from 'firebase/firestore';
import { db } from './firebaseConfig';
import { User } from './authService';

const USERS = 'users';

export async function createUser(uid: string, userData: Omit<User, 'uid'>): Promise<User> {
  const user: User = { uid, ...userData };
  await setDoc(doc(db, USERS, uid), user);
  return user;
}

export async function getUserByUid(uid: string): Promise<User | null> {
  const snap = await getDoc(doc(db, USERS, uid));
  return snap.exists() ? (snap.data() as User) : null;
}

export async function updateUser(uid: string, updates: Partial<User>): Promise<void> {
  await updateDoc(doc(db, USERS, uid), { ...updates, updatedAt: new Date().toISOString() });
}

export async function getLeaderboard(max = 20): Promise<User[]> {
  const q = query(collection(db, USERS), orderBy('xp', 'desc'), limit(max));
  const snap = await getDocs(q);
  return snap.docs.map(d => d.data() as User);
}

export async function addToHistory(uid: string, session: {
  subject: string; preview: string; xp_earned: number; duration_mins: number;
}): Promise<void> {
  const user = await getUserByUid(uid);
  if (!user) return;
  const entry = { ...session, id: Date.now().toString(), date: new Date().toISOString() };
  const history = [entry, ...(user.history || [])].slice(0, 100);
  await updateDoc(doc(db, USERS, uid), { history, updatedAt: new Date().toISOString() });
}
