
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface StreakState {
  current: number;
  longest: number;
  lastStudy: string | null;
  freezesLeft: number;
  weekActivity: boolean[];
  studiedDates: string[];
}

const init: StreakState = {
  current: 0, longest: 0, lastStudy: null, freezesLeft: 2,
  weekActivity: [false,false,false,false,false,false,false],
  studiedDates: [],
};

function weekActivityFor(studiedDates: string[]): boolean[] {
  const today = new Date();
  const sunday = new Date(today);
  sunday.setDate(today.getDate() - today.getDay());
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(sunday);
    d.setDate(sunday.getDate() + i);
    return studiedDates.includes(d.toDateString());
  });
}

const streakSlice = createSlice({
  name: 'streak',
  initialState: init,
  reducers: {
    checkInToday(state) {
      const today = new Date().toDateString();
      if (state.lastStudy === today) return;
      const yesterday = new Date(Date.now()-86400000).toDateString();
      state.current = state.lastStudy === yesterday ? state.current + 1 : 1;
      if (state.current > state.longest) state.longest = state.current;
      state.lastStudy = today;
      if (!state.studiedDates.includes(today)) state.studiedDates.push(today);
      state.weekActivity = weekActivityFor(state.studiedDates);
    },
    useFreeze(state) { if (state.freezesLeft > 0) state.freezesLeft--; },
    addFreeze(state) { state.freezesLeft++; },
    resetStreak(state) { state.current = 0; },
    hydrate(state, { payload }: PayloadAction<{ current: number; longest: number; lastStudy: string | null; studiedDates: string[] }>) {
      state.current = payload.current;
      state.longest = payload.longest;
      state.lastStudy = payload.lastStudy;
      state.studiedDates = payload.studiedDates;
      state.weekActivity = weekActivityFor(payload.studiedDates);
    },
  },
});

export const { checkInToday, useFreeze, addFreeze, resetStreak, hydrate } = streakSlice.actions;
export default streakSlice.reducer;
