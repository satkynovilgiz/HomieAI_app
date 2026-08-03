import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Language } from '../../constants/translations';

interface LanguageState {
  current: Language;
}

const initialState: LanguageState = {
  current: 'en',
};

const languageSlice = createSlice({
  name: 'language',
  initialState,
  reducers: {
    setLanguage: (state, action: PayloadAction<Language>) => {
      state.current = action.payload;
    },
  },
});

export const { setLanguage } = languageSlice.actions;
export default languageSlice.reducer;
