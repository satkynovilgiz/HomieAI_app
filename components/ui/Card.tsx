
import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { Colors, Radius } from '../../constants/theme';

interface Props { children: React.ReactNode; style?: ViewStyle; variant?: 'default' | 'elevated' | 'bordered'; }

export default function Card({ children, style, variant = 'default' }: Props) {
  return (
    <View style={[
      styles.card,
      variant === 'bordered' && styles.bordered,
      variant === 'elevated' && styles.elevated,
      style
    ]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: Colors.bg3, borderRadius: Radius.lg, padding: 16 },
  bordered: { borderWidth: 1, borderColor: Colors.border },
  elevated: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 5 },
});
