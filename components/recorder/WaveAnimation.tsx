import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { Colors } from '../../constants/theme';

interface Props {
  // true while actively recording (bars bounce); false while paused or idle (flat).
  active: boolean;
}

const BAR_COUNT = 5;

export default function WaveAnimation({ active }: Props) {
  const heights = useRef(Array.from({ length: BAR_COUNT }, () => new Animated.Value(4))).current;
  const loopsRef = useRef<Animated.CompositeAnimation[]>([]);

  useEffect(() => {
    loopsRef.current.forEach(l => l.stop());

    if (!active) {
      heights.forEach(h => Animated.timing(h, { toValue: 4, duration: 200, useNativeDriver: false }).start());
      return;
    }

    const loops = heights.map((h, i) =>
      Animated.loop(
        Animated.sequence([
          Animated.timing(h, { toValue: 20 + Math.random() * 40, duration: 220 + i * 35, useNativeDriver: false }),
          Animated.timing(h, { toValue: 8 + Math.random() * 16, duration: 220 + i * 25, useNativeDriver: false }),
        ])
      )
    );
    loopsRef.current = loops;
    loops.forEach(l => l.start());
    return () => loops.forEach(l => l.stop());
  }, [active]);

  return (
    <View style={styles.row}>
      {heights.map((h, i) => (
        <Animated.View key={i} style={[styles.bar, { height: h }]} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 6, height: 60, justifyContent: 'center' },
  bar: { width: 8, borderRadius: 4, backgroundColor: Colors.purple },
});
