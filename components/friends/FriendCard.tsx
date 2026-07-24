
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Colors, Radius } from '../../constants/theme';
import { Friend } from '../../store/slices/friendsSlice';

interface Props { friend: Friend; onMessage?: () => void; onChallenge?: () => void; }

export default function FriendCard({ friend: f, onMessage, onChallenge }: Props) {
  const statusColor = f.status === 'online' ? Colors.green : f.status === 'studying' ? Colors.purple : Colors.muted;
  const statusLabel = f.status === 'online' ? '🟢 Online' : f.status === 'studying' ? '📚 Studying' : '⚫ Offline';

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.avatar}>{f.avatar}</Text>
        <View style={styles.info}>
          <Text style={styles.name}>{f.name}</Text>
          <Text style={[styles.status, { color: statusColor }]}>{statusLabel}</Text>
        </View>
        <View style={styles.stats}>
          <Text style={styles.level}>Lv.{f.level}</Text>
          <Text style={styles.xp}>⭐{f.xp}</Text>
        </View>
      </View>
      <View style={styles.streakRow}>
        <Text style={styles.streakText}>🔥 {f.streak} day streak</Text>
        <View style={styles.actions}>
          <TouchableOpacity onPress={onMessage} style={styles.msgBtn}>
            <Text style={styles.msgBtnText}>💬</Text>
          </TouchableOpacity>
          {f.isChallengeable && (
            <TouchableOpacity onPress={onChallenge} style={styles.challengeBtn}>
              <Text style={styles.challengeBtnText}>⚔️ Challenge</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { padding:16, backgroundColor:Colors.bg3, borderRadius:Radius.lg, borderWidth:1, borderColor:Colors.border },
  header: { flexDirection:'row', alignItems:'center', gap:12, marginBottom:12 },
  avatar: { fontSize:38 },
  info: { flex:1 },
  name: { fontSize:16, fontWeight:'800', color:Colors.text },
  status: { fontSize:12, marginTop:2, fontWeight:'600' },
  stats: { alignItems:'flex-end' },
  level: { fontSize:16, fontWeight:'900', color:Colors.purpleL },
  xp: { fontSize:12, color:Colors.muted },
  streakRow: { flexDirection:'row', alignItems:'center', justifyContent:'space-between' },
  streakText: { fontSize:13, color:Colors.orange, fontWeight:'600' },
  actions: { flexDirection:'row', gap:8 },
  msgBtn: { width:36, height:36, borderRadius:18, backgroundColor:Colors.bg2, alignItems:'center', justifyContent:'center', borderWidth:1, borderColor:Colors.border },
  msgBtnText: { fontSize:18 },
  challengeBtn: { paddingHorizontal:14, paddingVertical:7, backgroundColor:'rgba(124,58,237,0.15)', borderRadius:Radius.full, borderWidth:1, borderColor:'rgba(124,58,237,0.3)' },
  challengeBtnText: { fontSize:12, fontWeight:'700', color:Colors.purpleL },
});
