
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';
import { loseHeart, gainHeart, refillHearts } from '../store/slices/heartsSlice';
import { spendGems } from '../store/slices/gemsSlice';

export function useHearts() {
  const dispatch = useDispatch();
  const { count, max } = useSelector((s: RootState) => s.hearts);

  const lose = () => dispatch(loseHeart());
  const gain = () => dispatch(gainHeart());
  const refillWithGems = () => {
    dispatch(spendGems(350));
    dispatch(refillHearts());
  };

  return { count, max, lose, gain, refillWithGems, isEmpty: count === 0, isFull: count === max };
}
