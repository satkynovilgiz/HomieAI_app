
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';
import { unlock, clearNew } from '../store/slices/achievementsSlice';
import { addXP } from '../store/slices/userSlice';
import { earnGems } from '../store/slices/gemsSlice';

export function useAchievements() {
  const dispatch = useDispatch();
  const { list, newlyEarned } = useSelector((s: RootState) => s.achievements);

  const tryUnlock = (id: string) => {
    const a = list.find(a => a.id === id);
    if (a && !a.earned) {
      dispatch(unlock(id));
      dispatch(addXP(a.xpReward));
      dispatch(earnGems(a.xpReward / 10));
    }
  };

  return { achievements: list, newlyEarned, tryUnlock, dismissNew: () => dispatch(clearNew()), earned: list.filter(a => a.earned), total: list.length };
}
