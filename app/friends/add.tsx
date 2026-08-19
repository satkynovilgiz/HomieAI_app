
import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useFriends } from '../../hooks/useFriends';
import { Colors, Radius } from '../../constants/theme';
import HomieBot from '../../components/mascot/HomieBot';
import AvatarCircle from '../../components/ui/AvatarCircle';

const SUGGESTIONS = [
  { id:'s1', name:'Alex P.', xp:840, level:8, streak:5 },
  { id:'s2', name:'Emma W.', xp:1100, level:11, streak:12 },
  { id:'s3', name:'Ryan M.', xp:320, level:3, streak:1 },
  { id:'s4', name:'Zoe K.', xp:590, level:5, streak:8 },
];

export default function AddFriendsScreen() {
  const { add } = useFriends();
  const [search, setSearch] = useState('');
  const [added, setAdded] = useState<string[]>([]);

  const handleAdd = (s: any) => {
    add({ ...s, status: 'online', isChallengeable: true });
    setAdded(prev => [...prev, s.id]);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.back} accessibilityLabel="Go back" accessibilityRole="button">
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Add Friends</Text>
      </View>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <TextInput
          value={search} onChangeText={setSearch}
          placeholder="search by username..."
          placeholderTextColor={Colors.muted}
          style={styles.searchInput}
        />
        <Text style={styles.sectionLabel}>SUGGESTED FRIENDS</Text>
        {SUGGESTIONS.filter(s => s.name.toLowerCase().includes(search.toLowerCase())).map(s => (
          <View key={s.id} style={styles.suggestionCard}>
            <AvatarCircle name={s.name} size={36} />
            <View style={{ flex:1 }}>
              <Text style={styles.suggestionName}>{s.name}</Text>
              <Text style={styles.suggestionStats}>Lv.{s.level} · {s.streak} streak · {s.xp} XP</Text>
            </View>
            <TouchableOpacity
              onPress={() => handleAdd(s)} disabled={added.includes(s.id)}
              style={[styles.addBtn, added.includes(s.id) && styles.addBtnDone]}>
              <Text style={styles.addBtnText}>{added.includes(s.id) ? 'added' : '+ add'}</Text>
            </TouchableOpacity>
          </View>
        ))}
        <View style={styles.shareCard}>
          <HomieBot mood="happy" size={80}/>
          <Text style={styles.shareTitle}>invite your friends</Text>
          <Text style={styles.shareSub}>Share your code and study together</Text>
          <TouchableOpacity style={styles.shareBtn}>
            <Text style={styles.shareBtnText}>Share HOMIE AI</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex:1, backgroundColor:Colors.bg },
  header: { flexDirection:'row', alignItems:'center', padding:16, gap:12 },
  back: { padding:4 },
  backArrow: { fontSize:24, color:Colors.text },
  title: { fontSize:22, fontWeight:'900', color:Colors.text },
  content: { padding:16, gap:12 },
  searchInput: { backgroundColor:Colors.bg3, borderWidth:1, borderColor:Colors.border, borderRadius:Radius.md, color:Colors.text, padding:13, fontSize:14 },
  sectionLabel: { fontSize:10, fontWeight:'700', color:Colors.muted, letterSpacing:2 },
  suggestionCard: { flexDirection:'row', alignItems:'center', gap:12, padding:16, backgroundColor:Colors.bg3, borderRadius:Radius.md, borderWidth:1, borderColor:Colors.border },
  suggestionAvatar: { fontSize:36 },
  suggestionName: { fontSize:15, fontWeight:'800', color:Colors.text },
  suggestionStats: { fontSize:12, color:Colors.muted, marginTop:2 },
  addBtn: { paddingHorizontal:16, paddingVertical:8, backgroundColor:'rgba(124,58,237,0.15)', borderRadius:Radius.full, borderWidth:1, borderColor:'rgba(124,58,237,0.3)' },
  addBtnDone: { backgroundColor:'rgba(16,185,129,0.1)', borderColor:'rgba(16,185,129,0.3)' },
  addBtnText: { fontSize:13, fontWeight:'700', color:Colors.purpleL },
  shareCard: { alignItems:'center', padding:24, backgroundColor:Colors.bg2, borderRadius:Radius.xl, borderWidth:1, borderColor:Colors.border, gap:8, marginTop:8 },
  shareTitle: { fontSize:18, fontWeight:'800', color:Colors.text },
  shareSub: { fontSize:13, color:Colors.muted },
  shareBtn: { paddingHorizontal:24, paddingVertical:12, backgroundColor:Colors.purple, borderRadius:Radius.md, marginTop:8 },
  shareBtnText: { color:'white', fontWeight:'700', fontSize:14 },
});
