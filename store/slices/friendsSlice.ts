
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Friend {
  id: string; name: string; avatar: string;
  xp: number; level: number; streak: number;
  status: 'online' | 'studying' | 'offline';
  isChallengeable: boolean;
}

const DEMO_FRIENDS: Friend[] = [
  { id:'u2', name:'Sarah K.', avatar:'#ec4899', xp:1240, level:12, streak:15, status:'studying', isChallengeable:true },
  { id:'u3', name:'Marcus T.', avatar:'#3b82f6', xp:980, level:9, streak:7, status:'online', isChallengeable:true },
  { id:'u4', name:'Priya R.', avatar:'#10b981', xp:720, level:7, streak:4, status:'offline', isChallengeable:false },
  { id:'u5', name:'James L.', avatar:'#f97316', xp:430, level:4, streak:2, status:'online', isChallengeable:true },
];

const friendsSlice = createSlice({
  name: 'friends',
  initialState: { list: DEMO_FRIENDS, pendingRequests: [] as Friend[], sentRequests: [] as string[] },
  reducers: {
    addFriend(state, { payload }: PayloadAction<Friend>) { state.list.push(payload); },
    removeFriend(state, { payload }: PayloadAction<string>) { state.list = state.list.filter(f => f.id !== payload); },
    sendRequest(state, { payload }: PayloadAction<string>) { state.sentRequests.push(payload); },
    updateFriendStatus(state, { payload }: PayloadAction<{ id: string; status: Friend['status'] }>) {
      const f = state.list.find(f => f.id === payload.id);
      if (f) f.status = payload.status;
    },
  },
});

export const { addFriend, removeFriend, sendRequest, updateFriendStatus } = friendsSlice.actions;
export default friendsSlice.reducer;
