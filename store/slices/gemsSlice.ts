
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

const initialState = { count: 500, totalEarned: 500 };

const gemsSlice = createSlice({
  name: 'gems',
  initialState,
  reducers: {
    earnGems(state, { payload }: PayloadAction<number>) { state.count += payload; state.totalEarned += payload; },
    spendGems(state, { payload }: PayloadAction<number>) { if (state.count >= payload) state.count -= payload; },
    clearGems() { return initialState; },
  },
});

export const { earnGems, spendGems, clearGems } = gemsSlice.actions;
export default gemsSlice.reducer;
