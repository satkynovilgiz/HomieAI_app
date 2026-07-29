import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  type: 'text' | 'quiz' | 'image' | 'search_results';
  xpEarned?: number;
}

export interface ChatSession {
  id: string;
  title: string;
  subject: string;
  messages: ChatMessage[];
  createdAt: string;
  updatedAt: string;
  messageCount: number;
  totalXP: number;
  preview: string;
}

interface ChatHistoryState {
  sessions: ChatSession[];
  activeChatId: string | null;
  // Distinguishes "AsyncStorage hasn't been read yet" from "read, and there's
  // genuinely no history" — both look like an empty sessions array otherwise,
  // and screens that read this state (chat, sidebar, history) need to tell them
  // apart so they don't flash an empty state before the real data arrives.
  loaded: boolean;
}

const STORAGE_KEY = 'hm_chat_history';

const initialState: ChatHistoryState = { sessions: [], activeChatId: null, loaded: false };

const chatHistorySlice = createSlice({
  name: 'chatHistory',
  initialState,
  reducers: {
    createSession: (state, { payload: subject }: PayloadAction<string>) => {
      const now = new Date().toISOString();
      const session: ChatSession = {
        id: `session_${Date.now()}`,
        title: 'New Chat',
        subject,
        messages: [],
        createdAt: now,
        updatedAt: now,
        messageCount: 0,
        totalXP: 0,
        preview: '',
      };
      state.sessions.unshift(session);
      state.activeChatId = session.id;
    },

    addMessageToSession: (state, { payload }: PayloadAction<{ chatId: string; message: ChatMessage }>) => {
      const session = state.sessions.find(s => s.id === payload.chatId);
      if (!session) return;
      session.messages.push(payload.message);
      session.updatedAt = payload.message.timestamp;
      session.messageCount = session.messages.length;
      session.preview = payload.message.content.slice(0, 100);
      if (payload.message.xpEarned) session.totalXP += payload.message.xpEarned;
    },

    // Also used for user-triggered rename (long-press > Rename) — same mutation,
    // just a different caller. Truncated to 40 chars either way.
    updateSessionTitle: (state, { payload }: PayloadAction<{ chatId: string; title: string }>) => {
      const session = state.sessions.find(s => s.id === payload.chatId);
      if (session) session.title = payload.title.trim().slice(0, 40) || session.title;
    },

    deleteSession: (state, { payload: chatId }: PayloadAction<string>) => {
      state.sessions = state.sessions.filter(s => s.id !== chatId);
      if (state.activeChatId === chatId) {
        state.activeChatId = state.sessions[0]?.id ?? null;
      }
    },

    // Restores both sessions and the previously-active chat id together, since
    // the two are always persisted and read back as one payload (see
    // loadChatHistoryFromStorage below).
    loadSessions: (state, { payload }: PayloadAction<{ sessions: ChatSession[]; activeChatId: string | null }>) => {
      state.sessions = payload.sessions;
      state.activeChatId = payload.activeChatId;
      state.loaded = true;
    },

    setActiveChat: (state, { payload: chatId }: PayloadAction<string | null>) => {
      state.activeChatId = chatId;
    },
  },
});

export const {
  createSession,
  addMessageToSession,
  updateSessionTitle,
  deleteSession,
  loadSessions,
  setActiveChat,
} = chatHistorySlice.actions;
export default chatHistorySlice.reducer;

export async function persistChatHistory(sessions: ChatSession[], activeChatId: string | null): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ sessions, activeChatId }));
  } catch {
    // best-effort persistence — a failed write just means history doesn't survive a restart
  }
}

export async function loadChatHistoryFromStorage(): Promise<{ sessions: ChatSession[]; activeChatId: string | null }> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : { sessions: [], activeChatId: null };
  } catch {
    return { sessions: [], activeChatId: null };
  }
}
