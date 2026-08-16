
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Colors, Radius } from '../../constants/theme';
import { ShopItem } from '../../store/slices/shopSlice';

interface Props { item: ShopItem; canAfford: boolean; onBuy: () => void; onUse?: () => void; }

export default function ShopItemCard({ item, canAfford, onBuy, onUse }: Props) {
  return (
    <View style={styles.card}>
      <View style={styles.info}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.desc}>{item.desc}</Text>
        {item.owned > 0 && <Text style={styles.owned}>owned: {item.owned}</Text>}
      </View>
      <View style={styles.actions}>
        {item.owned > 0 && onUse ? (
          <TouchableOpacity onPress={onUse} style={styles.useBtn}>
            <Text style={styles.useBtnText}>use</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity onPress={onBuy} disabled={!canAfford}
            style={[styles.buyBtn, !canAfford && styles.buyBtnDisabled]}>
            <Text style={[styles.price, !canAfford && styles.priceDisabled]}>{item.price} gems</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { flexDirection:'row', alignItems:'center', gap:12, padding:16, backgroundColor:Colors.bg3, borderRadius:Radius.md, borderWidth:1, borderColor:Colors.border },
  icon: { fontSize:36 },
  info: { flex:1 },
  name: { fontSize:14, fontWeight:'800', color:Colors.text },
  desc: { fontSize:12, color:Colors.muted, marginTop:2 },
  owned: { fontSize:11, color:Colors.green, marginTop:3, fontWeight:'700' },
  actions: {},
  buyBtn: { flexDirection:'row', alignItems:'center', gap:4, paddingHorizontal:14, paddingVertical:8, backgroundColor:'rgba(59,130,246,0.15)', borderRadius:Radius.full, borderWidth:1, borderColor:'rgba(59,130,246,0.3)' },
  buyBtnDisabled: { opacity:0.4, backgroundColor:Colors.bg4, borderColor:Colors.border },
  gemIcon: { fontSize:14 },
  price: { fontSize:14, fontWeight:'800', color:Colors.blue },
  priceDisabled: { color:Colors.muted },
  useBtn: { paddingHorizontal:14, paddingVertical:8, backgroundColor:'rgba(16,185,129,0.15)', borderRadius:Radius.full, borderWidth:1, borderColor:'rgba(16,185,129,0.3)' },
  useBtnText: { fontSize:13, fontWeight:'700', color:Colors.green },
});
