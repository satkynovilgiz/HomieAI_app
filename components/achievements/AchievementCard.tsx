
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Radius } from '../../constants/theme';
import { Achievement } from '../../store/slices/achievementsSlice';

export default function AchievementCard({ achievement }: { achievement: Achievement }) {
  return (
    <View style={[styles.card, !achievement.earned && styles.cardLocked]}>
      <Text style={[styles.icon, !achievement.earned && styles.iconLocked]}>{achievement.earned ? achievement.icon : '🔒'}</Text>
      <View style={styles.info}>
        <Text style={[styles.title, !achievement.earned && styles.textLocked]}>{achievement.title}</Text>
        <Text style={styles.desc}>{achievement.desc}</Text>
        {achievement.earned && achievement.earnedAt && (
          <Text style={styles.date}>earned {new Date(achievement.earnedAt).toLocaleDateString()}</Text>
        )}
      </View>
      <View style={[styles.xpBadge, !achievement.earned && styles.xpBadgeLocked]}>
        <Text style={[styles.xpText, !achievement.earned && { color: Colors.muted }]}>+{achievement.xpReward} XP</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { flexDirection:'row', alignItems:'center', gap:14, padding:16, backgroundColor:Colors.bg3, borderRadius:Radius.md, borderWidth:1, borderColor:Colors.border },
  cardLocked: { opacity:0.55 },
  icon: { fontSize:32 },
  iconLocked: { opacity:0.4 },
  info: { flex:1 },
  title: { fontSize:14, fontWeight:'800', color:Colors.text },
  textLocked: { color:Colors.muted },
  desc: { fontSize:12, color:Colors.muted, marginTop:2 },
  date: { fontSize:10, color:Colors.green, marginTop:3 },
  xpBadge: { paddingHorizontal:10, paddingVertical:4, backgroundColor:'rgba(16,185,129,0.15)', borderRadius:Radius.full, borderWidth:1, borderColor:'rgba(16,185,129,0.3)' },
  xpBadgeLocked: { backgroundColor:Colors.bg4, borderColor:Colors.border },
  xpText: { fontSize:11, fontWeight:'700', color:Colors.green },
});
