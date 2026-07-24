
import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { Colors } from '../../constants/theme';
import { xpProgress, levelFromXP } from '../../lib/utils';

export default function XPBar({ xp }: { xp: number }) {
  const anim = useRef(new Animated.Value(0)).current;
  const pct = xpProgress(xp);
  const level = levelFromXP(xp);

  useEffect(() => {
    Animated.spring(anim, { toValue: pct, useNativeDriver: false }).start();
  }, [xp]);

  const width = anim.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] });

  return (
    <View style={styles.container}>
      <View style={styles.labels}>
        <Text style={styles.label}>Level {level}</Text>
        <Text style={styles.label}>{100 - (xp % 100)} XP to Level {level + 1}</Text>
      </View>
      <View style={styles.track}>
        <Animated.View style={[styles.fill, { width }]}/>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginVertical: 8 },
  labels: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  label: { fontSize: 11, color: Colors.muted },
  track: { height: 7, backgroundColor: Colors.bg4, borderRadius: 4, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: 4, backgroundColor: Colors.purple },
});
