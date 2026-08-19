
import { useSelector, useDispatch } from 'react-redux';
import store, { RootState } from '../store';
import { unlock, clearNew } from '../store/slices/achievementsSlice';
import { addXP } from '../store/slices/userSlice';
import { earnGems } from '../store/slices/gemsSlice';

export function useAchievements() {
  const dispatch = useDispatch();
  const { list, newlyEarned } = useSelector((s: RootState) => s.achievements);

  const tryUnlock = (id: string) => {
    // Reads the live store, not the `list` captured by this render's
    // useSelector: achievements can be hydrated from Firestore in the same
    // effect batch a caller checks tryUnlock in (see useAchievementAutoUnlock),
    // and a dispatch()'d hydration is applied to the store immediately even
    // though React doesn't reflect it in this closure until the next render.
    // Checking the stale `list` here would think an already-earned
    // achievement was still locked and re-grant its XP/gems every time.
    const a = store.getState().achievements.list.find(a => a.id === id);
    if (a && !a.earned) {
      dispatch(unlock(id));
      dispatch(addXP(a.xpReward));
      dispatch(earnGems(a.xpReward / 10));
    }
  };

  return { achievements: list, newlyEarned, tryUnlock, dismissNew: () => dispatch(clearNew()), earned: list.filter(a => a.earned), total: list.length };
}
