
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useAchievements } from '../../hooks/useAchievements';
import { Colors, Radius } from '../../constants/theme';
import AchievementCard from '../../components/achievements/AchievementCard';

export default function AchievementsScreen() {
  const { achievements, earned } = useAchievements();
  const pct = Math.round((earned.length / achievements.length) * 100);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.back} accessibilityLabel="Go back" accessibilityRole="button">
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Achievements</Text>
      </View>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.progress}>
          <Text style={styles.progressLabel}>{earned.length}/{achievements.length} unlocked</Text>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width:`${pct}%` as any }]}/>
          </View>
          <Text style={styles.progressPct}>{pct}%</Text>
        </View>
        <View style={{ padding:16, gap:10 }}>
          <Text style={styles.sectionLabel}>EARNED ({earned.length})</Text>
          {earned.map(a => <AchievementCard key={a.id} achievement={a}/>)}
          <Text style={[styles.sectionLabel, { marginTop:16 }]}>LOCKED ({achievements.length - earned.length})</Text>
          {achievements.filter(a => !a.earned).map(a => <AchievementCard key={a.id} achievement={a}/>)}
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
  progress: { margin:16, padding:18, backgroundColor:Colors.bg2, borderRadius:Radius.lg, borderWidth:1, borderColor:Colors.border },
  progressLabel: { fontSize:15, fontWeight:'700', color:Colors.text, marginBottom:10 },
  progressTrack: { height:10, backgroundColor:Colors.bg4, borderRadius:5, overflow:'hidden', marginBottom:8 },
  progressFill: { height:'100%', backgroundColor:Colors.yellow, borderRadius:5 },
  progressPct: { fontSize:13, color:Colors.muted, textAlign:'right' },
  sectionLabel: { fontSize:10, fontWeight:'700', color:Colors.muted, letterSpacing:2 },
});
