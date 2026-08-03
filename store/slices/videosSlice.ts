
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface SavedItem {
  id: string;
  type: 'video' | 'article';
  title: string;
  url: string;
  thumbnail?: string;
  source: string;
  channelTitle?: string;
  videoId?: string;
  savedAt: string;
  query: string;
}

const STORAGE_KEY = 'hm_saved_items';

interface VideosState { items: SavedItem[]; }
const initialState: VideosState = { items: [] };

const videosSlice = createSlice({
  name: 'videos',
  initialState,
  reducers: {
    saveItem(state, { payload }: PayloadAction<SavedItem>) {
      if (!state.items.some(i => i.url === payload.url)) state.items.unshift(payload);
    },
    removeItem(state, { payload }: PayloadAction<string>) {
      state.items = state.items.filter(i => i.id !== payload);
    },
    loadItems(state, { payload }: PayloadAction<SavedItem[]>) {
      state.items = payload;
    },
    clearVideos() { return initialState; },
  },
});

export const { saveItem, removeItem, loadItems, clearVideos } = videosSlice.actions;
export default videosSlice.reducer;

export async function persistSavedItems(items: SavedItem[]): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    // best-effort persistence — a failed write just means the library
    // doesn't survive a restart, not worth surfacing to the user
  }
}

export async function loadSavedItemsFromStorage(): Promise<SavedItem[]> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}
