import { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet } from 'react-native';

interface SoundWaveProps {
  isActive: boolean;
  color?: string;
}

const BAR_COUNT = 7;

export default function SoundWave({ isActive, color = '#a78bfa' }: SoundWaveProps) {
  const bars = useRef(Array.from({ length: BAR_COUNT }, () => new Animated.Value(0.3))).current;
  const activeRef = useRef(isActive);

  useEffect(() => {
    activeRef.current = isActive;

    if (!isActive) {
      bars.forEach(bar => {
        Animated.timing(bar, { toValue: 0.15, duration: 300, useNativeDriver: true }).start();
      });
      return;
    }

    const timeouts = bars.map((bar, i) => {
      const animate = () => {
        Animated.sequence([
          Animated.timing(bar, { toValue: Math.random() * 0.7 + 0.3, duration: 150 + i * 30, useNativeDriver: true }),
          Animated.timing(bar, { toValue: Math.random() * 0.4 + 0.1, duration: 150 + i * 20, useNativeDriver: true }),
        ]).start(() => { if (activeRef.current) animate(); });
      };
      return setTimeout(animate, i * 80);
    });

    return () => timeouts.forEach(clearTimeout);
  }, [isActive]);

  return (
    <View style={styles.container}>
      {bars.map((bar, i) => (
        <Animated.View key={i} style={[styles.bar, { backgroundColor: color, transform: [{ scaleY: bar }] }]} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: 'row', alignItems: 'center', gap: 5, height: 48 },
  bar: { width: 5, height: 40, borderRadius: 3 },
});
