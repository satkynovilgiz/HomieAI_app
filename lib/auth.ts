import AsyncStorage from '@react-native-async-storage/async-storage';

export interface User {
  id: string;
  name: string;
  email: string;
  pass: string;
  avatar: string;
  xp: number;
  level: number;
  streak: number;
  lastStudy: string | null;
  correct: number;
  sessions: number;
  msgsSent: number;
  studyHours: number;
  joined: string;
  history: any[];
  flashcards: any[];
  goals: string[];
  notifications: boolean;
}

const USERS_KEY = 'hm_users';
const SESSION_KEY = 'hm_session';

export const localAuth = {
  async getUsers(): Promise<User[]> {
    try {
      const raw = await AsyncStorage.getItem(USERS_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch { return []; }
  },

  async saveUsers(users: User[]): Promise<void> {
    await AsyncStorage.setItem(USERS_KEY, JSON.stringify(users));
  },

  async getUser(email: string): Promise<User | null> {
    const users = await this.getUsers();
    return users.find(u => u.email === email) || null;
  },

  async create({ name, email, pass, avatar = '🧑' }: { name: string; email: string; pass: string; avatar?: string }): Promise<{ user?: User; err?: string }> {
    const users = await this.getUsers();
    if (users.find(u => u.email === email)) return { err: 'Email already taken!' };
    const user: User = {
      id: Date.now().toString(), name, email,
      pass: btoa(unescape(encodeURIComponent(pass))),
      avatar, xp: 0, level: 1, streak: 0, lastStudy: null,
      correct: 0, sessions: 0, msgsSent: 0, studyHours: 0,
      joined: new Date().toLocaleDateString(),
      history: [], flashcards: [], goals: [], notifications: true,
    };
    users.push(user);
    await this.saveUsers(users);
    await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(user));
    return { user };
  },

  async login(email: string, pass: string): Promise<{ user?: User; err?: string }> {
    const u = await this.getUser(email);
    if (!u) return { err: 'No account found!' };
    const encoded = btoa(unescape(encodeURIComponent(pass)));
    if (u.pass !== encoded) return { err: 'Wrong password!' };
    const today = new Date().toDateString();
    if (u.lastStudy !== today) {
      const yesterday = new Date(Date.now() - 86400000).toDateString();
      const streak = u.lastStudy === yesterday ? (u.streak || 0) + 1 : 1;
      await this.update(email, { lastStudy: today, streak });
      u.streak = streak; u.lastStudy = today;
    }
    await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(u));
    return { user: u };
  },

  async update(email: string, updates: Partial<User>): Promise<User | null> {
    const users = await this.getUsers();
    const i = users.findIndex(u => u.email === email);
    if (i < 0) return null;
    Object.assign(users[i], updates);
    await this.saveUsers(users);
    await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(users[i]));
    return users[i];
  },

  async delete(email: string): Promise<void> {
    const users = (await this.getUsers()).filter(u => u.email !== email);
    await this.saveUsers(users);
    await AsyncStorage.removeItem(SESSION_KEY);
  },

  async getSession(): Promise<User | null> {
    try {
      const raw = await AsyncStorage.getItem(SESSION_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch { return null; }
  },

  async logout(): Promise<void> {
    await AsyncStorage.removeItem(SESSION_KEY);
  },

  async addHistory(email: string, session: any): Promise<void> {
    const u = await this.getUser(email);
    if (!u) return;
    u.history = [{ ...session, id: Date.now().toString(), date: new Date().toISOString() }, ...(u.history || [])].slice(0, 100);
    await this.update(email, { history: u.history });
  },

  async leaderboard(): Promise<any[]> {
    const users = await this.getUsers();
    return users
      .map(u => ({ name: u.name, avatar: u.avatar, xp: u.xp, level: u.level, streak: u.streak }))
      .sort((a, b) => b.xp - a.xp)
      .slice(0, 20);
  },
};
