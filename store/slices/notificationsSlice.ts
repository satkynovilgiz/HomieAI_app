
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface AppNotification {
  id: string; type: 'streak' | 'message' | 'challenge' | 'achievement' | 'friend' | 'lesson';
  title: string; body: string; timestamp: number; read: boolean; icon: string;
}

const demoNotifs: AppNotification[] = [
  { id:'n1', type:'streak', title:'🔥 Streak reminder!', body:"Don't lose your 7 day streak bro — study now!", timestamp:Date.now()-3600000, read:false, icon:'🔥' },
  { id:'n2', type:'challenge', title:'⚔️ Challenge received!', body:'Marcus T. challenged you to an XP race!', timestamp:Date.now()-7200000, read:false, icon:'⚔️' },
  { id:'n3', type:'achievement', title:'🏆 Achievement unlocked!', body:'You earned: 3 Day Streak!', timestamp:Date.now()-86400000, read:true, icon:'🏆' },
  { id:'n4', type:'friend', title:'👥 New friend request!', body:'Priya R. wants to study with you!', timestamp:Date.now()-172800000, read:true, icon:'👥' },
];

const notificationsSlice = createSlice({
  name: 'notifications',
  initialState: { list: demoNotifs, unread: 2 },
  reducers: {
    addNotification(state, { payload }: PayloadAction<AppNotification>) {
      state.list.unshift(payload);
      state.unread++;
    },
    markAllRead(state) {
      state.list.forEach(n => n.read = true);
      state.unread = 0;
    },
    markRead(state, { payload }: PayloadAction<string>) {
      const n = state.list.find(n => n.id === payload);
      if (n && !n.read) { n.read = true; state.unread = Math.max(0, state.unread - 1); }
    },
    clearAll(state) { state.list = []; state.unread = 0; },
  },
});

export const { addNotification, markAllRead, markRead, clearAll } = notificationsSlice.actions;
export default notificationsSlice.reducer;
