
import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { Colors, Radius } from '../../constants/theme';

interface Props {
  lesson: { id:string; title:string };
  progress: { completed:boolean; stars:number };
  onPress: () => void; index: number;
}

export default function LessonNode({ lesson, progress, onPress, index }: Props) {
  const offset = [0, 40, 60, 40, 0, -40, -60, -40][index % 8];

  return (
    <View style={[styles.wrapper, { marginLeft: 120 + offset }]}>
      <TouchableOpacity onPress={onPress} style={[styles.node, progress.completed && styles.nodeComplete]} activeOpacity={0.8}>
        <Text style={styles.emoji}>{progress.completed ? '✓' : lesson.title.charAt(0).toUpperCase()}</Text>
      </TouchableOpacity>
      {progress.completed && (
        <View style={styles.stars}>
          {[0,1,2].map(i => <Text key={i} style={[styles.star, i < progress.stars && styles.starActive]}>★</Text>)}
        </View>
      )}
      <Text style={styles.label}>{lesson.title}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { alignItems:'center', marginVertical:12 },
  node: { width:70, height:70, borderRadius:35, backgroundColor:Colors.bg4, borderWidth:3, borderColor:Colors.border, alignItems:'center', justifyContent:'center' },
  nodeComplete: { backgroundColor:Colors.purple, borderColor:Colors.purpleL },
  emoji: { fontSize:30 },
  stars: { flexDirection:'row', gap:2, marginTop:4 },
  star: { fontSize:14, color:Colors.bg4 },
  starActive: { color:Colors.yellow },
  label: { fontSize:11, color:Colors.muted, marginTop:4, textAlign:'center', maxWidth:90 },
});
