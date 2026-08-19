import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { User } from '../../lib/authService';

interface UserState { current: User | null; authChecked: boolean; }
const initialState: UserState = { current: null, authChecked: false };

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser: (state, { payload }: PayloadAction<User>) => { state.current = payload; },
    clearUser: (state) => { state.current = null; },
    setAuthChecked: (state, { payload }: PayloadAction<boolean>) => { state.authChecked = payload; },
    addXP: (state, { payload }: PayloadAction<number>) => {
      if (!state.current) return;
      state.current.xp += payload;
      state.current.level = Math.floor(state.current.xp / 100) + 1;
    },
    addCorrect: (state) => { if (state.current) state.current.correct += 1; },
    updateUser: (state, { payload }: PayloadAction<Partial<User>>) => {
      if (state.current) Object.assign(state.current, payload);
    },
    addHistory: (state, { payload }: PayloadAction<any>) => {
      if (!state.current) return;
      state.current.history = [
        { ...payload, id: Date.now().toString(), date: new Date().toISOString() },
        ...(state.current.history || [])
      ].slice(0, 100);
    },
  },
});

export const { setUser, clearUser, setAuthChecked, addXP, addCorrect, updateUser, addHistory } = userSlice.actions;
export default userSlice.reducer;
