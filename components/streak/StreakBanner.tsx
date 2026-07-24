
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { Colors, Radius } from '../../constants/theme';

export default function StreakBanner({ onPress }: { onPress?: () => void }) {
  const streak = useSelector((s: RootState) => s.streak);
  const days = ['S','M','T','W','T','F','S'];

  return (
    <TouchableOpacity onPress={onPress} style={styles.banner} activeOpacity={0.85}>
      <View style={styles.left}>
        <Text style={styles.fire}>🔥</Text>
        <View>
          <Text style={styles.count}>{streak.current} day streak!</Text>
          <Text style={styles.sub}>Keep it going bro 💪</Text>
        </View>
      </View>
      <View style={styles.week}>
        {days.map((d, i) => (
          <View key={i} style={styles.dayCol}>
            <View style={[styles.dot, streak.weekActivity[i] && styles.dotActive]}>
              {streak.weekActivity[i] && <Text style={styles.check}>✓</Text>}
            </View>
            <Text style={styles.dayLabel}>{d}</Text>
          </View>
        ))}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  banner: { flexDirection:'row', alignItems:'center', justifyContent:'space-between', margin:16, padding:16, backgroundColor:Colors.bg2, borderRadius:Radius.lg, borderWidth:1, borderColor:'rgba(249,115,22,0.3)' },
  left: { flexDirection:'row', alignItems:'center', gap:10 },
  fire: { fontSize:32 },
  count: { fontSize:16, fontWeight:'900', color:Colors.orange },
  sub: { fontSize:11, color:Colors.muted, marginTop:2 },
  week: { flexDirection:'row', gap:6 },
  dayCol: { alignItems:'center', gap:4 },
  dot: { width:24, height:24, borderRadius:12, backgroundColor:Colors.bg4, borderWidth:1.5, borderColor:Colors.border, alignItems:'center', justifyContent:'center' },
  dotActive: { backgroundColor:Colors.orange, borderColor:Colors.orange },
  check: { fontSize:10, color:Colors.white, fontWeight:'900' },
  dayLabel: { fontSize:9, color:Colors.muted, fontWeight:'700' },
});
