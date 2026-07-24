
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';
import { acceptChallenge, updateProgress, sendChallenge } from '../store/slices/challengesSlice';
import { earnGems } from '../store/slices/gemsSlice';
import { addXP } from '../store/slices/userSlice';

export function useChallenges() {
  const dispatch = useDispatch();
  const { active } = useSelector((s: RootState) => s.challenges);

  const accept = (id: string) => dispatch(acceptChallenge(id));
  const progress = (id: string, amount: number) => {
    dispatch(updateProgress({ id, amount }));
    const c = active.find(c => c.id === id);
    if (c && c.myProgress + amount >= c.target) {
      dispatch(addXP(c.xpReward));
      dispatch(earnGems(c.xpReward / 5));
    }
  };

  return { challenges: active, pending: active.filter(c => c.status === 'pending'), active: active.filter(c => c.status === 'active'), accept, progress };
}
