
import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useShop } from '../../hooks/useShop';
import { useGems } from '../../hooks/useGems';
import { Colors, Radius } from '../../constants/theme';
import ShopItemCard from '../../components/shop/ShopItem';
import GemsCounter from '../../components/ui/GemsCounter';
import HomieBot from '../../components/mascot/HomieBot';

const CATS = ['All','powerup','boost','freeze','cosmetic'] as const;

export default function ShopScreen() {
  const { items, buy, use, equip } = useShop();
  const { count: gems } = useGems();
  const [cat, setCat] = useState<typeof CATS[number]>('All');
  const [mood, setMood] = useState<'happy'|'celebrating'|'sad'>('happy');

  const filtered = cat === 'All' ? items : items.filter(i => i.category === cat);
  const catLabels: Record<string, string> = { All:'All', powerup:'Powers', boost:'Boosts', freeze:'Freezes', cosmetic:'Skins' };

  const handleBuy = (id: string, price: number, name: string) => {
    if (gems < price) {
      Alert.alert('not enough gems', `you need ${price - gems} more gems for ${name}`);
      setMood('sad');
      return;
    }
    Alert.alert(`buy ${name}?`, `${price} gems · you've got ${gems} gems`, [
      { text:'nvm', style:'cancel' },
      { text:'buy', onPress:() => { buy(id); setMood('celebrating'); setTimeout(()=>setMood('happy'),2000); }},
    ]);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.back}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>HOMIE Shop</Text>
        <GemsCounter/>
      </View>

      <View style={styles.hero}>
        <HomieBot mood={mood} size={80}/>
        <View style={styles.heroText}>
          <Text style={styles.heroTitle}>Shop</Text>
          <Text style={styles.heroSub}>spend gems on powerups</Text>
        </View>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.cats}>
        {CATS.map(c => (
          <TouchableOpacity key={c} onPress={() => setCat(c)} style={[styles.catChip, cat===c && styles.catChipActive]}>
            <Text style={[styles.catText, cat===c && styles.catTextActive]}>{catLabels[c]}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {filtered.map(item => (
          <ShopItemCard
            key={item.id} item={item}
            canAfford={gems >= item.price}
            onBuy={() => handleBuy(item.id, item.price, item.name)}
            onUse={item.owned > 0 ? () => use(item.id) : undefined}
          />
        ))}
        <View style={{ height:24 }}/>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex:1, backgroundColor:Colors.bg },
  header: { flexDirection:'row', alignItems:'center', padding:16, gap:12 },
  back: { padding:4 },
  backArrow: { fontSize:24, color:Colors.text },
  title: { fontSize:22, fontWeight:'900', color:Colors.text, flex:1 },
  hero: { flexDirection:'row', alignItems:'center', gap:14, paddingHorizontal:16, paddingBottom:12 },
  heroText: {},
  heroTitle: { fontSize:20, fontWeight:'900', color:Colors.text },
  heroSub: { fontSize:13, color:Colors.muted, marginTop:2 },
  cats: { paddingHorizontal:16, marginBottom:8 },
  catChip: { paddingHorizontal:16, paddingVertical:8, borderRadius:50, backgroundColor:Colors.bg3, borderWidth:1, borderColor:Colors.border, marginRight:8 },
  catChipActive: { backgroundColor:'rgba(59,130,246,0.15)', borderColor:'rgba(59,130,246,0.4)' },
  catText: { fontSize:13, fontWeight:'600', color:Colors.muted },
  catTextActive: { color:Colors.blue, fontWeight:'700' },
  content: { padding:16, gap:10 },
});
