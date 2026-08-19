
import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { useAchievements } from './useAchievements';

// Threshold-based achievements were defined but never actually checked
// anywhere -- tryUnlock() existed only for lecture_5. Centralizing the
// numeric/streak ones here instead of scattering checks across every
// screen that could move these stats. tryUnlock() itself is idempotent
// (no-ops once earned), so re-running these checks on every relevant
// state change is safe.
export function useAchievementAutoUnlock() {
  const { tryUnlock } = useAchievements();
  const user = useSelector((s: RootState) => s.user.current);
  const streak = useSelector((s: RootState) => s.streak.current);

  useEffect(() => {
    if (!user) return;
    tryUnlock('first_step');
    if (user.level >= 5) tryUnlock('level_5');
    if (user.level >= 10) tryUnlock('level_10');
    if (user.correct >= 10) tryUnlock('quiz_10');
    if (user.correct >= 50) tryUnlock('quiz_50');
  }, [user?.uid, user?.level, user?.correct]);

  useEffect(() => {
    if (!user) return;
    if (streak >= 3) tryUnlock('streak_3');
    if (streak >= 7) tryUnlock('streak_7');
    if (streak >= 30) tryUnlock('streak_30');
  }, [user?.uid, streak]);
}
