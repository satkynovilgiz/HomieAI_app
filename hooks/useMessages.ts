
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';
import { sendMessage, markRead } from '../store/slices/messagesSlice';

export function useMessages() {
  const dispatch = useDispatch();
  const { conversations, totalUnread } = useSelector((s: RootState) => s.messages);

  return {
    conversations,
    totalUnread,
    send: (convId: string, text: string, type?: string) => dispatch(sendMessage({ convId, text, type })),
    read: (convId: string) => dispatch(markRead(convId)),
    getConv: (id: string) => conversations.find(c => c.id === id),
  };
}
