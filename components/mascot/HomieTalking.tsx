import { useEffect, useRef } from 'react';
import { Animated } from 'react-native';
import Svg, { Path, Circle, Ellipse, Rect, G } from 'react-native-svg';

interface HomieTalkingProps {
  isTalking: boolean;
  isListening: boolean;
  size?: number;
  mood?: 'happy' | 'thinking' | 'cool';
}

export default function HomieTalking({ isTalking, isListening, size = 200 }: HomieTalkingProps) {
  const mouthAnim = useRef(new Animated.Value(0)).current;
  const listenAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (isTalking) {
      const loop = Animated.loop(
        Animated.sequence([
          Animated.timing(mouthAnim, { toValue: 1, duration: 150, useNativeDriver: false }),
          Animated.timing(mouthAnim, { toValue: 0.3, duration: 120, useNativeDriver: false }),
          Animated.timing(mouthAnim, { toValue: 0.8, duration: 180, useNativeDriver: false }),
          Animated.timing(mouthAnim, { toValue: 0.1, duration: 100, useNativeDriver: false }),
        ])
      );
      loop.start();
      return () => loop.stop();
    }
    Animated.timing(mouthAnim, { toValue: 0, duration: 200, useNativeDriver: false }).start();
  }, [isTalking]);

  useEffect(() => {
    if (isListening) {
      const loop = Animated.loop(
        Animated.sequence([
          Animated.timing(listenAnim, { toValue: 1.08, duration: 600, useNativeDriver: true }),
          Animated.timing(listenAnim, { toValue: 0.95, duration: 600, useNativeDriver: true }),
        ])
      );
      loop.start();
      return () => loop.stop();
    }
    Animated.timing(listenAnim, { toValue: 1, duration: 200, useNativeDriver: true }).start();
  }, [isListening]);

  const s = size / 200;
  const cx = size / 2;
  const cy = size / 2;

  const mouthOpenHeight = mouthAnim.interpolate({ inputRange: [0, 1], outputRange: [4 * s, 22 * s] });
  const mouthWidth = mouthAnim.interpolate({ inputRange: [0, 1], outputRange: [28 * s, 36 * s] });

  return (
    <Animated.View style={{ transform: [{ scale: listenAnim }], width: size, height: size * 1.1 }}>
      <Svg width={size} height={size * 1.1} viewBox={`0 0 ${size} ${size * 1.1}`}>
        <G>
          {/* Body */}
          <Ellipse cx={cx} cy={cy + 55 * s} rx={44 * s} ry={52 * s} fill="#6d28d9" stroke="#3b0764" strokeWidth={2 * s} />

          {/* Belly */}
          <Ellipse cx={cx} cy={cy + 60 * s} rx={28 * s} ry={34 * s} fill="#8b5cf6" />

          {/* Left foot */}
          <Ellipse cx={cx - 20 * s} cy={cy + 100 * s} rx={18 * s} ry={10 * s} fill="#5b21b6" stroke="#3b0764" strokeWidth={1.5 * s} />

          {/* Right foot */}
          <Ellipse cx={cx + 20 * s} cy={cy + 100 * s} rx={18 * s} ry={10 * s} fill="#5b21b6" stroke="#3b0764" strokeWidth={1.5 * s} />

          {/* Left arm */}
          <Path
            d={`M ${cx - 44 * s} ${cy + 25 * s} C ${cx - 70 * s} ${cy + 15 * s} ${cx - 76 * s} ${cy - 2 * s} ${cx - 58 * s} ${cy}`}
            fill="#6d28d9" stroke="#3b0764" strokeWidth={2 * s}
          />

          {/* Right arm */}
          <Path
            d={`M ${cx + 44 * s} ${cy + 25 * s} C ${cx + 70 * s} ${cy + 15 * s} ${cx + 76 * s} ${cy - 2 * s} ${cx + 58 * s} ${cy}`}
            fill="#6d28d9" stroke="#3b0764" strokeWidth={2 * s}
          />

          {/* Head */}
          <Circle cx={cx} cy={cy - 10 * s} r={62 * s} fill="#6d28d9" stroke="#3b0764" strokeWidth={2 * s} />

          {/* Left ear */}
          <Ellipse cx={cx - 58 * s} cy={cy - 10 * s} rx={14 * s} ry={20 * s} fill="#5b21b6" stroke="#3b0764" strokeWidth={1.5 * s} />

          {/* Right ear */}
          <Ellipse cx={cx + 58 * s} cy={cy - 10 * s} rx={14 * s} ry={20 * s} fill="#5b21b6" stroke="#3b0764" strokeWidth={1.5 * s} />

          {/* Antenna stem */}
          <Rect x={cx - 4 * s} y={cy - 72 * s} width={8 * s} height={20 * s} rx={3 * s} fill="#3b0764" />

          {/* Antenna ball */}
          <Circle cx={cx} cy={cy - 78 * s} r={11 * s} fill="#d97706" stroke="#92400e" strokeWidth={1.5 * s} />
          <Circle cx={cx} cy={cy - 78 * s} r={6 * s} fill="#fbbf24" />

          {/* Left eye white */}
          <Ellipse cx={cx - 22 * s} cy={cy - 14 * s} rx={18 * s} ry={18 * s} fill="white" stroke="#3b0764" strokeWidth={1.5 * s} />

          {/* Left pupil */}
          <Circle cx={cx - 22 * s} cy={cy - 12 * s} r={10 * s} fill="#1e1b4b" />

          {/* Left eye shine */}
          <Circle cx={cx - 17 * s} cy={cy - 17 * s} r={3.5 * s} fill="white" />

          {/* Right eye white */}
          <Ellipse cx={cx + 22 * s} cy={cy - 14 * s} rx={18 * s} ry={18 * s} fill="white" stroke="#3b0764" strokeWidth={1.5 * s} />

          {/* Right pupil */}
          <Circle cx={cx + 22 * s} cy={cy - 12 * s} r={10 * s} fill="#1e1b4b" />

          {/* Right eye shine */}
          <Circle cx={cx + 27 * s} cy={cy - 17 * s} r={3.5 * s} fill="white" />

          {/* Eyebrows */}
          <Path
            d={`M ${cx - 36 * s} ${cy - 36 * s} Q ${cx - 22 * s} ${cy - 44 * s} ${cx - 8 * s} ${cy - 36 * s}`}
            fill="none" stroke="#3b0764" strokeWidth={2.5 * s} strokeLinecap="round"
          />
          <Path
            d={`M ${cx + 8 * s} ${cy - 36 * s} Q ${cx + 22 * s} ${cy - 44 * s} ${cx + 36 * s} ${cy - 36 * s}`}
            fill="none" stroke="#3b0764" strokeWidth={2.5 * s} strokeLinecap="round"
          />

          {/* Left cheek */}
          <Ellipse cx={cx - 46 * s} cy={cy - 2 * s} rx={12 * s} ry={8 * s} fill="#fda4af" opacity={0.55} />

          {/* Right cheek */}
          <Ellipse cx={cx + 46 * s} cy={cy - 2 * s} rx={12 * s} ry={8 * s} fill="#fda4af" opacity={0.55} />
        </G>
      </Svg>

      {/* Animated mouth — separate from SVG so its height/width can be layout-animated */}
      <Animated.View
        style={{
          position: 'absolute',
          left: cx - 18 * s,
          top: cy + 8 * s,
          width: mouthWidth,
          height: mouthOpenHeight,
          backgroundColor: '#fda4af',
          borderRadius: 20 * s,
          borderWidth: 2 * s,
          borderColor: '#3b0764',
          overflow: 'hidden',
          alignItems: 'center',
          justifyContent: 'flex-end',
        }}
      >
        <Animated.View
          style={{
            width: 16 * s,
            height: 10 * s,
            backgroundColor: '#f9a8d4',
            borderRadius: 8 * s,
            marginBottom: 2 * s,
            opacity: mouthAnim,
          }}
        />
      </Animated.View>
    </Animated.View>
  );
}
