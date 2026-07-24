
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

const gemsSlice = createSlice({
  name: 'gems',
  initialState: { count: 500, totalEarned: 500 },
  reducers: {
    earnGems(state, { payload }: PayloadAction<number>) { state.count += payload; state.totalEarned += payload; },
    spendGems(state, { payload }: PayloadAction<number>) { if (state.count >= payload) state.count -= payload; },
  },
});

export const { earnGems, spendGems } = gemsSlice.actions;
export default gemsSlice.reducer;
