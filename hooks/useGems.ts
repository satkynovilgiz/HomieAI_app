
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';
import { earnGems, spendGems } from '../store/slices/gemsSlice';

export function useGems() {
  const dispatch = useDispatch();
  const { count, totalEarned } = useSelector((s: RootState) => s.gems);
  return {
    count, totalEarned,
    earn: (n: number) => dispatch(earnGems(n)),
    spend: (n: number) => { if (count >= n) { dispatch(spendGems(n)); return true; } return false; },
    canAfford: (n: number) => count >= n,
  };
}
