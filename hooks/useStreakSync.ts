
import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store';
import { hydrate } from '../store/slices/streakSlice';
import { localAuth } from '../lib/auth';

export function useStreakSync() {
  const dispatch = useDispatch();
  const user = useSelector((s: RootState) => s.user.current);
  const streak = useSelector((s: RootState) => s.streak);
  const hydratedFor = useRef<string | null>(null);

  useEffect(() => {
    if (!user) { hydratedFor.current = null; return; }
    if (hydratedFor.current === user.email) return;
    hydratedFor.current = user.email;
    dispatch(hydrate({
      current: user.streak || 0,
      longest: user.longestStreak || user.streak || 0,
      lastStudy: user.lastStudy || null,
      studiedDates: user.studiedDates || [],
    }));
  }, [user?.email]);

  useEffect(() => {
    if (!user || hydratedFor.current !== user.email) return;
    localAuth.update(user.email, {
      streak: streak.current,
      longestStreak: streak.longest,
      lastStudy: streak.lastStudy,
      studiedDates: streak.studiedDates,
    });
  }, [streak.current, streak.longest, streak.lastStudy, streak.studiedDates.length]);
}
