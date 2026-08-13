import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type FocusLevel = 'soft' | 'medium' | 'hard';
export type FocusPhase = 'idle' | 'active' | 'break' | 'complete';

interface FocusState {
  phase: FocusPhase;
  durationMins: number;
  subject: string;
  level: FocusLevel;
  // Timestamps, not per-second counters, so the countdown survives the user
  // navigating away (e.g. "Open Homie Chat") and back without an interval.
  endsAt: number | null;
  breakEndsAt: number | null;
  remainingMsAtBreak: number | null;
  distractions: number;
  breaksTaken: number;
  leftAt: number | null;
  endedEarly: boolean;
  elapsedSeconds: number;
}

const initialState: FocusState = {
  phase: 'idle',
  durationMins: 25,
  subject: 'Math',
  level: 'medium',
  endsAt: null,
  breakEndsAt: null,
  remainingMsAtBreak: null,
  distractions: 0,
  breaksTaken: 0,
  leftAt: null,
  endedEarly: false,
  elapsedSeconds: 0,
};

const focusSlice = createSlice({
  name: 'focus',
  initialState,
  reducers: {
    startFocusSession(state, { payload }: PayloadAction<{ durationMins: number; subject: string; level: FocusLevel }>) {
      state.phase = 'active';
      state.durationMins = payload.durationMins;
      state.subject = payload.subject;
      state.level = payload.level;
      state.endsAt = Date.now() + payload.durationMins * 60000;
      state.breakEndsAt = null;
      state.remainingMsAtBreak = null;
      state.distractions = 0;
      state.breaksTaken = 0;
      state.leftAt = null;
      state.endedEarly = false;
      state.elapsedSeconds = 0;
    },
    markLeftApp(state, { payload }: PayloadAction<number>) {
      state.leftAt = payload;
      state.distractions += 1;
    },
    clearLeftApp(state) {
      state.leftAt = null;
    },
    startBreak(state) {
      state.remainingMsAtBreak = state.endsAt ? Math.max(0, state.endsAt - Date.now()) : 0;
      state.phase = 'break';
      state.breakEndsAt = Date.now() + 5 * 60000;
      state.breaksTaken += 1;
    },
    endBreak(state) {
      state.endsAt = Date.now() + (state.remainingMsAtBreak ?? 0);
      state.phase = 'active';
      state.breakEndsAt = null;
      state.remainingMsAtBreak = null;
    },
    completeSession(state, { payload }: PayloadAction<{ endedEarly: boolean; elapsedSeconds: number }>) {
      state.phase = 'complete';
      state.endedEarly = payload.endedEarly;
      state.elapsedSeconds = payload.elapsedSeconds;
    },
    resetFocus() {
      return initialState;
    },
  },
});

export const {
  startFocusSession, markLeftApp, clearLeftApp, startBreak, endBreak, completeSession, resetFocus,
} = focusSlice.actions;
export default focusSlice.reducer;
