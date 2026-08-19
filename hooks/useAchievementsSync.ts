
import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store';
import { hydrateEarned } from '../store/slices/achievementsSlice';
import { updateUser } from '../lib/authService';

export function useAchievementsSync() {
  const dispatch = useDispatch();
  const user = useSelector((s: RootState) => s.user.current);
  const list = useSelector((s: RootState) => s.achievements.list);
  const hydratedFor = useRef<string | null>(null);

  useEffect(() => {
    if (!user) { hydratedFor.current = null; return; }
    if (hydratedFor.current === user.uid) return;
    hydratedFor.current = user.uid;
    dispatch(hydrateEarned(user.achievements || []));
  }, [user?.uid]);

  useEffect(() => {
    if (!user || hydratedFor.current !== user.uid) return;
    updateUser(user.uid, { achievements: list.filter(a => a.earned).map(a => a.id) });
  }, [list]);
}
