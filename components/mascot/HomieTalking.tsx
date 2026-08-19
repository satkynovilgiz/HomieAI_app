import { useEffect, useRef } from 'react';
import { Animated, View, StyleSheet } from 'react-native';
import HomieBot from './HomieBot';

interface HomieTalkingProps {
  isTalking: boolean;
  isListening: boolean;
  size?: number;
  mood?: 'happy' | 'thinking' | 'celebrating' | 'sad' | 'angry' | 'sleepy';
}

export default function HomieTalking({ isTalking, isListening, size = 200, mood = 'happy' }: HomieTalkingProps) {
  const pulse = useRef(new Animated.Value(0)).current;
  const breathe = useRef(new Animated.Value(1)).current;

  const active = isTalking || isListening;
  const ringColor = isListening ? '#22c55e' : '#7c3aed';

  useEffect(() => {
    if (active) {
      const loop = Animated.loop(
        Animated.timing(pulse, { toValue: 1, duration: isTalking ? 900 : 1400, useNativeDriver: true })
      );
      loop.start();
      return () => loop.stop();
    }
    pulse.setValue(0);
  }, [active, isTalking]);

  useEffect(() => {
    if (active) {
      const loop = Animated.loop(
        Animated.sequence([
          Animated.timing(breathe, { toValue: 1.05, duration: 500, useNativeDriver: true }),
          Animated.timing(breathe, { toValue: 1, duration: 500, useNativeDriver: true }),
        ])
      );
      loop.start();
      return () => loop.stop();
    }
    Animated.timing(breathe, { toValue: 1, duration: 200, useNativeDriver: true }).start();
  }, [active]);

  const ringScale = pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.5] });
  const ringOpacity = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.35, 0] });

  return (
    <View style={[styles.wrap, { width: size, height: size * 1.25 }]}>
      {active && (
        <Animated.View
          style={[
            styles.ring,
            {
              width: size * 0.85,
              height: size * 0.85,
              borderRadius: size * 0.425,
              borderColor: ringColor,
              opacity: ringOpacity,
              transform: [{ scale: ringScale }],
            },
          ]}
        />
      )}
      <Animated.View style={{ transform: [{ scale: breathe }] }}>
        <HomieBot mood={mood} size={size} />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', justifyContent: 'center' },
  ring: { position: 'absolute', borderWidth: 2 },
});
