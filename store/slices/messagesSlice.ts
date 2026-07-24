
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface ChatMessage {
  id: string; senderId: string; text: string;
  timestamp: number; read: boolean; type: 'text' | 'xp_share' | 'streak_share' | 'challenge';
  payload?: any;
}

export interface Conversation {
  id: string; friendId: string; friendName: string;
  friendAvatar: string; messages: ChatMessage[];
  lastMessage: string; lastTimestamp: number; unread: number;
}

const demoConvos: Conversation[] = [
  { id:'1', friendId:'u2', friendName:'Sarah K.', friendAvatar:'👩', lastMessage:'bro I got a 7 day streak!', lastTimestamp: Date.now()-300000, unread:2, messages:[
    { id:'m1', senderId:'u2', text:'yo did u do the math quiz?', timestamp:Date.now()-600000, read:true, type:'text' },
    { id:'m2', senderId:'me', text:'yeah it was hard ngl 😅', timestamp:Date.now()-500000, read:true, type:'text' },
    { id:'m3', senderId:'u2', text:'bro I got a 7 day streak!', timestamp:Date.now()-300000, read:false, type:'text' },
    { id:'m4', senderId:'u2', text:'🔥🔥🔥', timestamp:Date.now()-280000, read:false, type:'streak_share', payload:{ streak:7 } },
  ]},
  { id:'2', friendId:'u3', friendName:'Marcus T.', friendAvatar:'🧑', lastMessage:'+50 XP challenge!', lastTimestamp: Date.now()-3600000, unread:1, messages:[
    { id:'m5', senderId:'u3', text:'study battle? first to 500 XP wins', timestamp:Date.now()-7200000, read:true, type:'text' },
    { id:'m6', senderId:'me', text:'LETS GO', timestamp:Date.now()-7000000, read:true, type:'text' },
    { id:'m7', senderId:'u3', text:'+50 XP challenge!', timestamp:Date.now()-3600000, read:false, type:'xp_share', payload:{ xp:50 } },
  ]},
];

const messagesSlice = createSlice({
  name: 'messages',
  initialState: { conversations: demoConvos, totalUnread: 3 },
  reducers: {
    sendMessage(state, { payload }: PayloadAction<{ convId: string; text: string; type?: string }>) {
      const conv = state.conversations.find(c => c.id === payload.convId);
      if (!conv) return;
      const msg: ChatMessage = { id: Date.now().toString(), senderId:'me', text:payload.text, timestamp:Date.now(), read:true, type:(payload.type as any) || 'text' };
      conv.messages.push(msg);
      conv.lastMessage = payload.text;
      conv.lastTimestamp = Date.now();
    },
    markRead(state, { payload }: PayloadAction<string>) {
      const conv = state.conversations.find(c => c.id === payload);
      if (!conv) return;
      conv.messages.forEach(m => m.read = true);
      state.totalUnread = Math.max(0, state.totalUnread - conv.unread);
      conv.unread = 0;
    },
    receiveMessage(state, { payload }: PayloadAction<{ convId: string; msg: ChatMessage }>) {
      const conv = state.conversations.find(c => c.id === payload.convId);
      if (!conv) return;
      conv.messages.push(payload.msg);
      conv.lastMessage = payload.msg.text;
      conv.lastTimestamp = payload.msg.timestamp;
      conv.unread++;
      state.totalUnread++;
    },
  },
});

export const { sendMessage, markRead, receiveMessage } = messagesSlice.actions;
export default messagesSlice.reducer;
