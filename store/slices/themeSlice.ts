import { createSlice } from '@reduxjs/toolkit';

const themeSlice = createSlice({
  name: 'theme',
  initialState: { mode: 'dark' as 'dark' | 'light' },
  reducers: {
    toggleTheme: (state) => { state.mode = state.mode === 'dark' ? 'light' : 'dark'; },
  },
});

export const { toggleTheme } = themeSlice.actions;
export default themeSlice.reducer;
