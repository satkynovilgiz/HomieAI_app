
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface StreakState {
  current: number;
  longest: number;
  lastStudy: string | null;
  freezesLeft: number;
  weekActivity: boolean[];
}

const init: StreakState = {
  current: 0, longest: 0, lastStudy: null, freezesLeft: 2,
  weekActivity: [false,false,false,false,false,false,false],
};

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
      const dow = new Date().getDay();
      state.weekActivity[dow] = true;
    },
    useFreeze(state) { if (state.freezesLeft > 0) state.freezesLeft--; },
    addFreeze(state) { state.freezesLeft++; },
    resetStreak(state) { state.current = 0; },
  },
});

export const { checkInToday, useFreeze, addFreeze, resetStreak } = streakSlice.actions;
export default streakSlice.reducer;
