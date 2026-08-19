
import { useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { updateUser } from '../lib/authService';

// XP/level/correct are mutated directly on the Redux user object (addXP,
// addCorrect) with no write-back to Firestore/AsyncStorage anywhere, so a
// refresh always reverted them to whatever was last persisted at login.
// Mirrors the write-back half of useStreakSync/useHeartsGemsSync.
export function useUserStatsSync() {
  const user = useSelector((s: RootState) => s.user.current);
  const initialized = useRef<string | null>(null);

  useEffect(() => {
    if (!user) { initialized.current = null; return; }
    if (initialized.current !== user.uid) { initialized.current = user.uid; return; }
    updateUser(user.uid, { xp: user.xp, level: user.level, correct: user.correct });
  }, [user?.xp, user?.level, user?.correct]);
}
