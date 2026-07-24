
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface ShopItem {
  id: string; name: string; desc: string; icon: string;
  price: number; category: 'powerup' | 'cosmetic' | 'boost' | 'freeze';
  owned: number; equipped?: boolean;
}

const SHOP_ITEMS: ShopItem[] = [
  { id:'streak_freeze', name:'Streak Freeze', desc:'Protect your streak for one day', icon:'🧊', price:200, category:'freeze', owned:1 },
  { id:'heart_refill', name:'Heart Refill', desc:'Restore all 5 hearts instantly', icon:'❤️', price:350, category:'powerup', owned:0 },
  { id:'double_xp', name:'Double XP', desc:'2x XP for the next 30 minutes', icon:'⚡', price:150, category:'boost', owned:0 },
  { id:'skip_lesson', name:'Lesson Skip', desc:'Skip one lesson and still earn XP', icon:'⏭️', price:500, category:'powerup', owned:0 },
  { id:'theme_dark', name:'Dark Purple Theme', desc:'Premium dark purple HOMIE theme', icon:'🎨', price:1000, category:'cosmetic', owned:1, equipped:true },
  { id:'theme_neon', name:'Neon Theme', desc:'Neon green HOMIE theme', icon:'💚', price:1500, category:'cosmetic', owned:0 },
  { id:'theme_red', name:'Fire Theme', desc:'Red hot fire theme', icon:'🔥', price:1500, category:'cosmetic', owned:0 },
  { id:'mascot_crown', name:'Crown for HOMIE', desc:'Give your mascot a royal crown', icon:'👑', price:800, category:'cosmetic', owned:0 },
  { id:'xp_boost_week', name:'Week XP Boost', desc:'1.5x XP for 7 days', icon:'🚀', price:2000, category:'boost', owned:0 },
];

const shopSlice = createSlice({
  name: 'shop',
  initialState: { items: SHOP_ITEMS },
  reducers: {
    purchaseItem(state, { payload }: PayloadAction<string>) {
      const item = state.items.find(i => i.id === payload);
      if (item) item.owned++;
    },
    useItem(state, { payload }: PayloadAction<string>) {
      const item = state.items.find(i => i.id === payload);
      if (item && item.owned > 0) item.owned--;
    },
    equipItem(state, { payload }: PayloadAction<string>) {
      state.items.filter(i => i.category === 'cosmetic').forEach(i => i.equipped = false);
      const item = state.items.find(i => i.id === payload);
      if (item) item.equipped = true;
    },
  },
});

export const { purchaseItem, useItem, equipItem } = shopSlice.actions;
export default shopSlice.reducer;
