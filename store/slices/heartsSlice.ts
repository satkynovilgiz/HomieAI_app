
import { createSlice } from '@reduxjs/toolkit';

interface HeartsState { count: number; max: number; lastRefill: string | null; }

const initialState: HeartsState = { count: 5, max: 5, lastRefill: null };

const heartsSlice = createSlice({
  name: 'hearts',
  initialState,
  reducers: {
    loseHeart(state) { if (state.count > 0) state.count--; },
    gainHeart(state) { if (state.count < state.max) state.count++; },
    refillHearts(state) { state.count = state.max; state.lastRefill = new Date().toISOString(); },
    setMax(state, { payload }) { state.max = payload; state.count = payload; },
    clearHearts() { return initialState; },
  },
});

export const { loseHeart, gainHeart, refillHearts, setMax, clearHearts } = heartsSlice.actions;
export default heartsSlice.reducer;
