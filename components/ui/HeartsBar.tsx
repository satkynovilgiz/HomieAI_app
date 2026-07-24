import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import Svg, { Path } from 'react-native-svg';

function HeartIcon({ filled }: { filled: boolean }) {
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 21C12 21 3 15 3 8.5C3 5.4 5.4 3 8.5 3C10.2 3 11.7 3.8 12 4.5C12.3 3.8 13.8 3 15.5 3C18.6 3 21 5.4 21 8.5C21 15 12 21 12 21Z"
        fill={filled ? '#ef4444' : 'none'}
        stroke={filled ? '#ef4444' : '#555577'}
        strokeWidth="1.8"
      />
    </Svg>
  );
}

export default function HeartsBar({ onRefill }: { onRefill?: () => void }) {
  const { count, max } = useSelector((s: RootState) => s.hearts);
  return (
    <TouchableOpacity onPress={onRefill} style={styles.container}>
      {[...Array(max)].map((_, i) => (
        <HeartIcon key={i} filled={i < count} />
      ))}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: 'row', gap: 3, alignItems: 'center' },
});
