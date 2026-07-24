
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';
import { purchaseItem, useItem, equipItem } from '../store/slices/shopSlice';
import { spendGems } from '../store/slices/gemsSlice';

export function useShop() {
  const dispatch = useDispatch();
  const { items } = useSelector((s: RootState) => s.shop);
  const gems = useSelector((s: RootState) => s.gems.count);

  const buy = (id: string): boolean => {
    const item = items.find(i => i.id === id);
    if (!item || gems < item.price) return false;
    dispatch(spendGems(item.price));
    dispatch(purchaseItem(id));
    return true;
  };

  return { items, buy, use: (id: string) => dispatch(useItem(id)), equip: (id: string) => dispatch(equipItem(id)), canAfford: (id: string) => { const i = items.find(x => x.id === id); return i ? gems >= i.price : false; } };
}
