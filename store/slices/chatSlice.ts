import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Message {
  id: string; role: 'user' | 'assistant';
  content: string | any[]; quiz?: any; video?: any;
  answered?: number; showExp?: boolean; timestamp: number;
}

interface ChatState {
  messages: Message[]; subject: string; loading: boolean;
  sessionXP: number; mood: string;
}

const initialState: ChatState = {
  messages: [], subject: 'Math', loading: false, sessionXP: 0, mood: 'happy',
};

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    addMsg: (state, { payload }: PayloadAction<Message>) => { state.messages.push(payload); },
    clearMsgs: (state) => { state.messages = []; state.sessionXP = 0; },
    setSubject: (state, { payload }: PayloadAction<string>) => { state.subject = payload; state.messages = []; },
    setLoading: (state, { payload }: PayloadAction<boolean>) => { state.loading = payload; },
    addSessionXP: (state, { payload }: PayloadAction<number>) => { state.sessionXP += payload; },
    setMood: (state, { payload }: PayloadAction<string>) => { state.mood = payload; },
    updateMsg: (state, { payload }: PayloadAction<Partial<Message> & { id: string }>) => {
      const i = state.messages.findIndex(m => m.id === payload.id);
      if (i >= 0) Object.assign(state.messages[i], payload);
    },
  },
});

export const { addMsg, clearMsgs, setSubject, setLoading, addSessionXP, setMood, updateMsg } = chatSlice.actions;
export default chatSlice.reducer;
