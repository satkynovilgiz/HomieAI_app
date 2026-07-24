
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Colors, Radius } from '../../constants/theme';
import { Challenge } from '../../store/slices/challengesSlice';

interface Props { challenge: Challenge; onAccept?: () => void; }

export default function ChallengeCard({ challenge: c, onAccept }: Props) {
  const myPct = Math.min((c.myProgress / c.target) * 100, 100);
  const theirPct = Math.min((c.theirProgress / c.target) * 100, 100);
  const timeLeft = Math.max(0, Math.floor((c.expiresAt - Date.now()) / 3600000));

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.type}>{c.type === 'xp_race' ? '⭐ XP Race' : c.type === 'quiz_battle' ? '🎯 Quiz Battle' : '🔥 Streak Challenge'}</Text>
        <Text style={styles.timer}>⏰ {timeLeft}h left</Text>
      </View>
      <View style={styles.vs}>
        <View style={styles.player}>
          <Text style={styles.playerAvatar}>🧑</Text>
          <Text style={styles.playerName}>You</Text>
          <Text style={styles.playerScore}>{c.myProgress}/{c.target}</Text>
        </View>
        <Text style={styles.vsText}>VS</Text>
        <View style={styles.player}>
          <Text style={styles.playerAvatar}>{c.fromAvatar}</Text>
          <Text style={styles.playerName}>{c.fromName}</Text>
          <Text style={styles.playerScore}>{c.theirProgress}/{c.target}</Text>
        </View>
      </View>
      <View style={styles.bars}>
        <View style={styles.barRow}>
          <View style={styles.track}><View style={[styles.fill, { width:`${myPct}%` as any, backgroundColor:Colors.purple }]}/></View>
        </View>
        <View style={styles.barRow}>
          <View style={styles.track}><View style={[styles.fill, { width:`${theirPct}%` as any, backgroundColor:Colors.red }]}/></View>
        </View>
      </View>
      {c.status === 'pending' && onAccept && (
        <TouchableOpacity onPress={onAccept} style={styles.acceptBtn}>
          <Text style={styles.acceptBtnText}>⚔️ Accept Challenge!</Text>
        </TouchableOpacity>
      )}
      {c.status === 'won' && <Text style={styles.resultWon}>🏆 You Won! +{c.xpReward} XP</Text>}
      {c.status === 'lost' && <Text style={styles.resultLost}>😢 You lost this time...</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { padding:18, backgroundColor:Colors.bg3, borderRadius:Radius.lg, borderWidth:1, borderColor:'rgba(124,58,237,0.3)' },
  header: { flexDirection:'row', justifyContent:'space-between', marginBottom:16 },
  type: { fontSize:13, fontWeight:'700', color:Colors.purpleL },
  timer: { fontSize:12, color:Colors.muted },
  vs: { flexDirection:'row', alignItems:'center', justifyContent:'space-between', marginBottom:16 },
  player: { alignItems:'center', gap:4 },
  playerAvatar: { fontSize:36 },
  playerName: { fontSize:13, fontWeight:'700', color:Colors.text },
  playerScore: { fontSize:16, fontWeight:'900', color:Colors.purpleL },
  vsText: { fontSize:20, fontWeight:'900', color:Colors.muted },
  bars: { gap:8, marginBottom:14 },
  barRow: {},
  track: { height:10, backgroundColor:Colors.bg4, borderRadius:5, overflow:'hidden' },
  fill: { height:'100%', borderRadius:5 },
  acceptBtn: { paddingVertical:13, backgroundColor:Colors.purple, borderRadius:Radius.md, alignItems:'center' },
  acceptBtnText: { color:Colors.white, fontWeight:'900', fontSize:15 },
  resultWon: { textAlign:'center', fontSize:16, fontWeight:'900', color:Colors.green, paddingVertical:8 },
  resultLost: { textAlign:'center', fontSize:14, color:Colors.muted, paddingVertical:8 },
});
