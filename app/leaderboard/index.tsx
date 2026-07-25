
import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { getLeaderboard } from '../../lib/firestoreService';
import { Colors, Radius } from '../../constants/theme';
import HomieBot from '../../components/mascot/HomieBot';

export default function LeaderboardScreen() {
  const user = useSelector((s: RootState) => s.user.current);
  const [board, setBoard] = useState<any[]>([]);

  useEffect(() => { getLeaderboard().then(setBoard); }, []);

  const medals = ['🥇','🥈','🥉'];
  const myRank = board.findIndex(u => u.name === user?.name) + 1;

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Leaderboard 🏆</Text>
      </View>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={{ alignItems: 'center', padding: 20, paddingBottom: 10 }}>
          <HomieBot mood="celebrating" size={90}/>
          <Text style={styles.sub}>Top students by XP. Study more, climb higher!</Text>
          {myRank > 0 && (
            <View style={styles.rankBadge}>
              <Text style={styles.rankText}>you're #{myRank} 🔥</Text>
            </View>
          )}
        </View>

        <View style={{ padding: 16, gap: 10 }}>
          {board.length === 0 ? (
            <View style={{ alignItems: 'center', paddingVertical: 30 }}>
              <HomieBot mood="sad" size={80}/>
              <Text style={{ color: Colors.text, fontWeight: '700', fontSize: 16, marginTop: 12 }}>no students yet</Text>
              <Text style={{ color: Colors.muted, marginTop: 6 }}>be the first to earn XP 🎯</Text>
            </View>
          ) : board.map((u, i) => (
            <View key={i} style={[styles.row, u.name === user?.name && styles.rowMe]}>
              <Text style={styles.rank}>{i < 3 ? medals[i] : `#${i + 1}`}</Text>
              <Text style={styles.avatar}>{u.avatar || '🧑'}</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.name}>{u.name}{u.name === user?.name ? ' (you)' : ''}</Text>
                <Text style={styles.level}>Level {u.level} · 🔥{u.streak || 0} streak</Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={styles.xp}>{u.xp}</Text>
                <Text style={styles.xpLabel}>XP</Text>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.tipBox}>
          <Text style={styles.tipText}>💡 Earn XP by chatting, answering quizzes, and completing Pomodoro sessions!</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  header: { flexDirection: 'row', alignItems: 'center', padding: 16, paddingBottom: 8, gap: 12 },
  backBtn: { padding: 4 },
  backArrow: { fontSize: 24, color: Colors.text },
  title: { fontSize: 22, fontWeight: '900', color: Colors.text },
  sub: { fontSize: 13, color: Colors.muted, textAlign: 'center', marginTop: 8 },
  rankBadge: { marginTop: 12, paddingHorizontal: 18, paddingVertical: 7, backgroundColor: 'rgba(124,58,237,0.15)', borderRadius: 50, borderWidth: 1, borderColor: 'rgba(124,58,237,0.3)' },
  rankText: { fontSize: 14, fontWeight: '700', color: Colors.purpleL },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16, backgroundColor: Colors.bg3, borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.border },
  rowMe: { backgroundColor: 'rgba(124,58,237,0.08)', borderColor: 'rgba(124,58,237,0.3)' },
  rank: { fontSize: 20, width: 36, textAlign: 'center', fontWeight: '700', color: Colors.yellow },
  avatar: { fontSize: 26 },
  name: { fontSize: 15, fontWeight: '700', color: Colors.text },
  level: { fontSize: 12, color: Colors.muted, marginTop: 2 },
  xp: { fontSize: 20, fontWeight: '900', color: Colors.purpleL },
  xpLabel: { fontSize: 11, color: Colors.muted },
  tipBox: { margin: 16, padding: 16, backgroundColor: Colors.bg2, borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.border },
  tipText: { fontSize: 13, color: Colors.muted, textAlign: 'center', lineHeight: 19 },
});
