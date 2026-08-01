import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LectureNotes } from '../../lib/gemini';

export interface Bookmark {
  time: number;
  label: string;
}

export interface LectureNote {
  id: string;
  name: string;
  subject: string;
  date: string;
  duration: number;
  transcript: string;
  audioUri: string;
  bookmarks: Bookmark[];
  notes: LectureNotes | null;
  createdAt: string;
}

interface RecorderState {
  lectures: LectureNote[];
  isRecording: boolean;
  isPaused: boolean;
}

const STORAGE_KEY = 'hm_lectures';

const initialState: RecorderState = { lectures: [], isRecording: false, isPaused: false };

const recorderSlice = createSlice({
  name: 'recorder',
  initialState,
  reducers: {
    saveLecture: (state, { payload }: PayloadAction<LectureNote>) => {
      state.lectures.unshift(payload);
    },
    deleteLecture: (state, { payload: id }: PayloadAction<string>) => {
      state.lectures = state.lectures.filter(l => l.id !== id);
    },
    updateLectureNotes: (state, { payload }: PayloadAction<{ id: string; notes: LectureNotes }>) => {
      const lecture = state.lectures.find(l => l.id === payload.id);
      if (lecture) lecture.notes = payload.notes;
    },
    renameLecture: (state, { payload }: PayloadAction<{ id: string; name: string }>) => {
      const lecture = state.lectures.find(l => l.id === payload.id);
      if (lecture) lecture.name = payload.name;
    },
    setRecording: (state, { payload }: PayloadAction<boolean>) => {
      state.isRecording = payload;
      if (payload) state.isPaused = false;
    },
    setPaused: (state, { payload }: PayloadAction<boolean>) => {
      state.isPaused = payload;
    },
    loadLectures: (state, { payload }: PayloadAction<LectureNote[]>) => {
      state.lectures = payload;
    },
  },
});

export const {
  saveLecture,
  deleteLecture,
  updateLectureNotes,
  renameLecture,
  setRecording,
  setPaused,
  loadLectures,
} = recorderSlice.actions;
export default recorderSlice.reducer;

export async function persistLectures(lectures: LectureNote[]): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(lectures));
  } catch {
    // best-effort persistence — a failed write just means lectures don't survive a restart
  }
}

export async function loadLecturesFromStorage(): Promise<LectureNote[]> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}
