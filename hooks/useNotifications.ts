
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';
import { markAllRead, markRead, addNotification } from '../store/slices/notificationsSlice';
import { AppNotification } from '../store/slices/notificationsSlice';

export function useNotifications() {
  const dispatch = useDispatch();
  const { list, unread } = useSelector((s: RootState) => s.notifications);

  return {
    notifications: list, unread,
    markAll: () => dispatch(markAllRead()),
    mark: (id: string) => dispatch(markRead(id)),
    push: (n: Omit<AppNotification, 'id' | 'timestamp' | 'read'>) => dispatch(addNotification({ ...n, id: Date.now().toString(), timestamp: Date.now(), read: false })),
  };
}
