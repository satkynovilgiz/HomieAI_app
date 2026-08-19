
import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store';
import { hydrateHearts } from '../store/slices/heartsSlice';
import { hydrateGems } from '../store/slices/gemsSlice';
import { updateUser } from '../lib/authService';

export function useHeartsGemsSync() {
  const dispatch = useDispatch();
  const user = useSelector((s: RootState) => s.user.current);
  const hearts = useSelector((s: RootState) => s.hearts.count);
  const gems = useSelector((s: RootState) => s.gems.count);
  const hydratedFor = useRef<string | null>(null);

  useEffect(() => {
    if (!user) { hydratedFor.current = null; return; }
    if (hydratedFor.current === user.uid) return;
    hydratedFor.current = user.uid;
    dispatch(hydrateHearts(user.hearts ?? 5));
    dispatch(hydrateGems(user.gems ?? 500));
  }, [user?.uid]);

  useEffect(() => {
    if (!user || hydratedFor.current !== user.uid) return;
    updateUser(user.uid, { hearts, gems });
  }, [hearts, gems]);
}
