
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { Colors, Radius } from '../../constants/theme';
import { timeAgo } from '../../lib/utils';
import HomieBot from '../../components/mascot/HomieBot';

export default function HistoryScreen() {
  const user = useSelector((s: RootState) => s.user.current);
  const history = user?.history || [];

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Study History 📜</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.statsRow}>
          {[['📚', history.length, 'Sessions'],['⭐', history.reduce((a,h) => a + (h.xp_earned||0), 0), 'XP Earned'],['⏱️', `${Math.round((user?.studyHours||0)*10)/10}h`, 'Hours']].map(([icon,val,label]) => (
            <View key={label as string} style={styles.statBox}>
              <Text style={styles.statIcon}>{icon as string}</Text>
              <Text style={styles.statValue}>{String(val)}</Text>
              <Text style={styles.statLabel}>{label as string}</Text>
            </View>
          ))}
        </View>

        <View style={{ padding: 16, gap: 10 }}>
          {history.length === 0 ? (
            <View style={{ alignItems: 'center', paddingVertical: 40 }}>
              <HomieBot mood="sad" size={100}/>
              <Text style={styles.emptyTitle}>No sessions yet 😢</Text>
              <Text style={styles.emptySub}>Start chatting with HOMIE!</Text>
              <TouchableOpacity onPress={() => router.push('/chat/index')} style={styles.startBtn}>
                <Text style={styles.startBtnText}>Start Studying 🚀</Text>
              </TouchableOpacity>
            </View>
          ) : history.map((h, i) => (
            <View key={i} style={styles.historyRow}>
              <View style={styles.historyIcon}>
                <Text style={{ fontSize: 28 }}>{h.subj_emoji || '📚'}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.historySubject}>{h.subject || 'Study Session'}</Text>
                <Text style={styles.historyPreview} numberOfLines={1}>{h.preview || 'Chat session'}</Text>
                <Text style={styles.historyTime}>{h.date ? timeAgo(h.date) : ''}</Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={styles.historyXP}>+{h.xp_earned || 0}</Text>
                <Text style={styles.historyXPLabel}>XP</Text>
                <Text style={styles.historyDuration}>{h.duration_mins || 0} min</Text>
              </View>
            </View>
          ))}
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
  statsRow: { flexDirection: 'row', padding: 16, gap: 10 },
  statBox: { flex: 1, backgroundColor: Colors.bg3, borderRadius: Radius.md, padding: 14, alignItems: 'center', borderWidth: 1, borderColor: Colors.border },
  statIcon: { fontSize: 22, marginBottom: 5 },
  statValue: { fontSize: 20, fontWeight: '900', color: Colors.purpleL },
  statLabel: { fontSize: 10, color: Colors.muted, textTransform: 'uppercase' },
  historyRow: { flexDirection: 'row', alignItems: 'center', gap: 14, padding: 16, backgroundColor: Colors.bg3, borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.border },
  historyIcon: { width: 50, height: 50, borderRadius: 14, backgroundColor: 'rgba(124,58,237,0.12)', alignItems: 'center', justifyContent: 'center' },
  historySubject: { fontSize: 15, fontWeight: '700', color: Colors.text, marginBottom: 3 },
  historyPreview: { fontSize: 12, color: Colors.muted, marginBottom: 3 },
  historyTime: { fontSize: 11, color: Colors.muted },
  historyXP: { fontSize: 17, fontWeight: '900', color: Colors.green },
  historyXPLabel: { fontSize: 10, color: Colors.muted },
  historyDuration: { fontSize: 11, color: Colors.muted, marginTop: 2 },
  emptyTitle: { fontSize: 20, fontWeight: '800', color: Colors.text, marginTop: 14 },
  emptySub: { fontSize: 14, color: Colors.muted, marginTop: 5, marginBottom: 20 },
  startBtn: { paddingHorizontal: 28, paddingVertical: 13, backgroundColor: Colors.purple, borderRadius: Radius.md },
  startBtnText: { color: Colors.white, fontWeight: '700', fontSize: 15 },
});
