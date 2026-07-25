
import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store';
import { hydrate } from '../store/slices/streakSlice';
import { updateUser } from '../lib/authService';

export function useStreakSync() {
  const dispatch = useDispatch();
  const user = useSelector((s: RootState) => s.user.current);
  const streak = useSelector((s: RootState) => s.streak);
  const hydratedFor = useRef<string | null>(null);

  useEffect(() => {
    if (!user) { hydratedFor.current = null; return; }
    if (hydratedFor.current === user.uid) return;
    hydratedFor.current = user.uid;
    dispatch(hydrate({
      current: user.streak || 0,
      longest: user.longestStreak || user.streak || 0,
      lastStudy: user.lastStudyDate || null,
      studiedDates: user.studiedDates || [],
    }));
  }, [user?.uid]);

  useEffect(() => {
    if (!user || hydratedFor.current !== user.uid) return;
    updateUser(user.uid, {
      streak: streak.current,
      longestStreak: streak.longest,
      lastStudyDate: streak.lastStudy,
      studiedDates: streak.studiedDates,
    });
  }, [streak.current, streak.longest, streak.lastStudy, streak.studiedDates.length]);
}
