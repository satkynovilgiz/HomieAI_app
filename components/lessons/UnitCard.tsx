
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Colors, Radius } from '../../constants/theme';

interface Props {
  unit: { id:string; title:string; color:string; description:string };
  progress: { completed:boolean; unlocked:boolean; completedLessons:number; totalLessons:number };
  onPress: () => void;
}

export default function UnitCard({ unit, progress, onPress }: Props) {
  const pct = progress.totalLessons > 0 ? progress.completedLessons / progress.totalLessons : 0;

  return (
    <TouchableOpacity onPress={onPress} disabled={!progress.unlocked} style={[styles.card, { borderColor: unit.color + '44' }, !progress.unlocked && styles.locked]} activeOpacity={0.85}>
      {!progress.unlocked && <View style={styles.lockOverlay}><Text style={styles.lockIcon}>locked</Text></View>}
      <View style={[styles.iconBg, { backgroundColor: unit.color + '22' }]}>
        <Text style={styles.emoji}>{unit.title.charAt(0).toUpperCase()}</Text>
      </View>
      <View style={styles.info}>
        <Text style={styles.title}>{unit.title}</Text>
        <Text style={styles.desc} numberOfLines={1}>{unit.description}</Text>
        <View style={styles.progressRow}>
          <View style={styles.track}>
            <View style={[styles.fill, { width:`${pct*100}%` as any, backgroundColor:unit.color }]}/>
          </View>
          <Text style={styles.progressText}>{progress.completedLessons}/{progress.totalLessons}</Text>
        </View>
      </View>
      {progress.completed && <Text style={styles.crown}>done</Text>}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: { flexDirection:'row', alignItems:'center', gap:14, padding:18, backgroundColor:Colors.bg3, borderRadius:Radius.lg, borderWidth:1.5, position:'relative' },
  locked: { opacity:0.6 },
  lockOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor:'rgba(0,0,0,0.4)', borderRadius:Radius.lg, alignItems:'center', justifyContent:'center', zIndex:10 },
  lockIcon: { fontSize:13, fontWeight:'700', color:Colors.white, textTransform:'uppercase', letterSpacing:1 },
  iconBg: { width:56, height:56, borderRadius:28, alignItems:'center', justifyContent:'center' },
  emoji: { fontSize:28 },
  info: { flex:1 },
  title: { fontSize:16, fontWeight:'900', color:Colors.text, marginBottom:3 },
  desc: { fontSize:12, color:Colors.muted, marginBottom:8 },
  progressRow: { flexDirection:'row', alignItems:'center', gap:8 },
  track: { flex:1, height:6, backgroundColor:Colors.bg4, borderRadius:3, overflow:'hidden' },
  fill: { height:'100%', borderRadius:3 },
  progressText: { fontSize:11, color:Colors.muted, width:30, textAlign:'right' },
  crown: { fontSize:11, fontWeight:'700', color:Colors.yellow, textTransform:'uppercase', letterSpacing:1 },
});
