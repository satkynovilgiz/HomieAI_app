
import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity } from 'react-native';
import { Colors, Radius } from '../../constants/theme';
import { Achievement } from '../../store/slices/achievementsSlice';

interface Props { achievement: Achievement | null; onDismiss: () => void; }

export default function AchievementPopup({ achievement, onDismiss }: Props) {
  const translateY = useRef(new Animated.Value(-100)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (achievement) {
      Animated.parallel([
        Animated.spring(translateY, { toValue:0, useNativeDriver:true }),
        Animated.timing(opacity, { toValue:1, duration:300, useNativeDriver:true }),
      ]).start();
      setTimeout(onDismiss, 3000);
    } else {
      Animated.parallel([
        Animated.timing(translateY, { toValue:-100, duration:250, useNativeDriver:true }),
        Animated.timing(opacity, { toValue:0, duration:250, useNativeDriver:true }),
      ]).start();
    }
  }, [achievement]);

  if (!achievement) return null;

  return (
    <Animated.View style={[styles.container, { transform:[{ translateY }], opacity }]}>
      <TouchableOpacity onPress={onDismiss} style={styles.card}>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{achievement.title.charAt(0)}</Text>
        </View>
        <View style={styles.info}>
          <Text style={styles.label}>unlocked</Text>
          <Text style={styles.title}>{achievement.title}</Text>
          <Text style={styles.desc}>{achievement.desc}</Text>
        </View>
        <Text style={styles.xp}>+{achievement.xpReward} XP</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: { position:'absolute', top:60, left:16, right:16, zIndex:999 },
  card: { flexDirection:'row', alignItems:'center', gap:12, padding:16, backgroundColor:Colors.bg2, borderRadius:Radius.lg, borderWidth:1, borderColor:'rgba(251,191,36,0.5)', shadowColor:Colors.yellow, shadowOffset:{width:0,height:4}, shadowOpacity:0.3, shadowRadius:8, elevation:10 },
  badge: { width:44, height:44, borderRadius:22, backgroundColor:'rgba(251,191,36,0.15)', alignItems:'center', justifyContent:'center', borderWidth:1, borderColor:'rgba(251,191,36,0.4)' },
  badgeText: { fontSize:18, fontWeight:'900', color:Colors.yellow },
  info: { flex:1 },
  label: { fontSize:10, fontWeight:'700', color:Colors.yellow, letterSpacing:1 },
  title: { fontSize:15, fontWeight:'900', color:Colors.text, marginTop:2 },
  desc: { fontSize:12, color:Colors.muted, marginTop:1 },
  xp: { fontSize:14, fontWeight:'900', color:Colors.green },
});
