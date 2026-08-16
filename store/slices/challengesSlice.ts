
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Challenge {
  id: string; fromId: string; fromName: string; fromAvatar: string;
  type: 'xp_race' | 'quiz_battle' | 'streak_challenge';
  target: number; myProgress: number; theirProgress: number;
  status: 'pending' | 'active' | 'won' | 'lost' | 'draw';
  expiresAt: number; xpReward: number;
}

const demoChallenges: Challenge[] = [
  { id:'c1', fromId:'u2', fromName:'Sarah K.', fromAvatar:'#ec4899', type:'xp_race', target:500, myProgress:120, theirProgress:280, status:'active', expiresAt: Date.now()+86400000, xpReward:100 },
  { id:'c2', fromId:'u3', fromName:'Marcus T.', fromAvatar:'#3b82f6', type:'quiz_battle', target:10, myProgress:0, theirProgress:0, status:'pending', expiresAt: Date.now()+172800000, xpReward:150 },
];

const challengesSlice = createSlice({
  name: 'challenges',
  initialState: { active: demoChallenges },
  reducers: {
    acceptChallenge(state, { payload }: PayloadAction<string>) {
      const c = state.active.find(c => c.id === payload);
      if (c) c.status = 'active';
    },
    updateProgress(state, { payload }: PayloadAction<{ id: string; amount: number }>) {
      const c = state.active.find(c => c.id === payload.id);
      if (c) {
        c.myProgress = Math.min(c.myProgress + payload.amount, c.target);
        if (c.myProgress >= c.target) c.status = c.theirProgress >= c.target ? 'draw' : 'won';
      }
    },
    sendChallenge(state, { payload }: PayloadAction<Challenge>) { state.active.push(payload); },
    resolveChallenge(state, { payload }: PayloadAction<{ id: string; result: 'won'|'lost'|'draw' }>) {
      const c = state.active.find(c => c.id === payload.id);
      if (c) c.status = payload.result;
    },
  },
});

export const { acceptChallenge, updateProgress, sendChallenge, resolveChallenge } = challengesSlice.actions;
export default challengesSlice.reducer;
