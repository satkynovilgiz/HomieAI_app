
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';
import { addFriend, removeFriend } from '../store/slices/friendsSlice';
import { unlock } from '../store/slices/achievementsSlice';
import { Friend } from '../store/slices/friendsSlice';

export function useFriends() {
  const dispatch = useDispatch();
  const { list } = useSelector((s: RootState) => s.friends);

  const add = (friend: Friend) => {
    dispatch(addFriend(friend));
    if (list.length === 0) dispatch(unlock('friend_first'));
  };

  return { friends: list, add, remove: (id: string) => dispatch(removeFriend(id)), online: list.filter(f => f.status !== 'offline') };
}
