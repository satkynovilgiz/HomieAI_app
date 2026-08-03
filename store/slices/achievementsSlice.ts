
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Achievement {
  id: string; title: string; desc: string; icon: string;
  earned: boolean; earnedAt?: string; xpReward: number;
}

const ALL_ACHIEVEMENTS: Achievement[] = [
  { id:'first_chat', title:'First Chat!', desc:'Send your first message to HOMIE', icon:'💬', earned:false, xpReward:50 },
  { id:'streak_3', title:'3 Day Streak', desc:'Study 3 days in a row', icon:'🔥', earned:false, xpReward:100 },
  { id:'streak_7', title:'Week Warrior', desc:'Study 7 days in a row', icon:'⚡', earned:false, xpReward:250 },
  { id:'streak_30', title:'Month Legend', desc:'Study 30 days in a row', icon:'👑', earned:false, xpReward:1000 },
  { id:'quiz_10', title:'Quiz Crusher', desc:'Answer 10 quiz questions correctly', icon:'🎯', earned:false, xpReward:150 },
  { id:'quiz_50', title:'Quiz Master', desc:'Answer 50 quiz questions correctly', icon:'🏆', earned:false, xpReward:500 },
  { id:'level_5', title:'Level 5!', desc:'Reach Level 5', icon:'⭐', earned:false, xpReward:200 },
  { id:'level_10', title:'Level 10!', desc:'Reach Level 10', icon:'💫', earned:false, xpReward:500 },
  { id:'pomodoro_5', title:'Focus Mode', desc:'Complete 5 Pomodoro sessions', icon:'🍅', earned:false, xpReward:150 },
  { id:'essay_first', title:'Essay Pro', desc:'Generate your first essay', icon:'✍️', earned:false, xpReward:100 },
  { id:'scan_first', title:'Homework Hero', desc:'Scan your first homework', icon:'📸', earned:false, xpReward:100 },
  { id:'friend_first', title:'Social Bro', desc:'Add your first friend', icon:'👥', earned:false, xpReward:100 },
  { id:'gems_100', title:'Gem Collector', desc:'Earn 100 gems total', icon:'💎', earned:false, xpReward:50 },
  { id:'perfect_lesson', title:'No Mistakes!', desc:'Complete a lesson with no errors', icon:'✨', earned:false, xpReward:200 },
  { id:'night_owl', title:'Night Owl', desc:'Study after midnight', icon:'🦉', earned:false, xpReward:75 },
  { id:'early_bird', title:'Early Bird', desc:'Study before 7am', icon:'🐦', earned:false, xpReward:75 },
  { id:'lecture_5', title:'Lecture Legend', desc:'Record 5 lectures total', icon:'🎙️', earned:false, xpReward:200 },
  { id:'first_step', title:'First Step', desc:'Joined Homie', icon:'🎉', earned:false, xpReward:20 },
];

const achievementsSlice = createSlice({
  name: 'achievements',
  initialState: { list: ALL_ACHIEVEMENTS, newlyEarned: null as Achievement | null },
  reducers: {
    unlock(state, { payload }: PayloadAction<string>) {
      const a = state.list.find(a => a.id === payload);
      if (a && !a.earned) {
        a.earned = true;
        a.earnedAt = new Date().toISOString();
        state.newlyEarned = a;
      }
    },
    clearNew(state) { state.newlyEarned = null; },
  },
});

export const { unlock, clearNew } = achievementsSlice.actions;
export default achievementsSlice.reducer;
