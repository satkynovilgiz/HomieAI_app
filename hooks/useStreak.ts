
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store';
import { checkInToday } from '../store/slices/streakSlice';
import { unlock } from '../store/slices/achievementsSlice';
import { earnGems } from '../store/slices/gemsSlice';

export function useStreak() {
  const dispatch = useDispatch();
  const streak = useSelector((s: RootState) => s.streak);

  const checkin = () => {
    dispatch(checkInToday());
    if (streak.current + 1 === 3) dispatch(unlock('streak_3'));
    if (streak.current + 1 === 7) { dispatch(unlock('streak_7')); dispatch(earnGems(50)); }
    if (streak.current + 1 === 30) { dispatch(unlock('streak_30')); dispatch(earnGems(200)); }
  };

  return { streak, checkin };
}
