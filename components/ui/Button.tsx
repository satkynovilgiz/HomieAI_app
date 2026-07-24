
import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle, ActivityIndicator } from 'react-native';
import { Colors, Radius } from '../../constants/theme';

interface Props {
  title: string; onPress: () => void;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg'; disabled?: boolean; loading?: boolean;
  style?: ViewStyle; textStyle?: TextStyle;
}

export default function Button({ title, onPress, variant = 'primary', size = 'md', disabled, loading, style, textStyle }: Props) {
  const sizeMap = { sm: { p: 8, fontSize: 13 }, md: { p: 13, fontSize: 15 }, lg: { p: 16, fontSize: 17 } };
  const sz = sizeMap[size];

  const bgMap = {
    primary: Colors.purple, secondary: Colors.bg3,
    ghost: 'transparent', danger: 'rgba(239,68,68,0.1)',
  };
  const textMap = {
    primary: Colors.white, secondary: Colors.text,
    ghost: Colors.purpleL, danger: Colors.red,
  };

  return (
    <TouchableOpacity
      onPress={onPress} disabled={disabled || loading}
      style={[styles.btn, { backgroundColor: bgMap[variant], paddingVertical: sz.p, opacity: disabled ? 0.5 : 1 }, style]}
      activeOpacity={0.8}>
      {loading
        ? <ActivityIndicator color={textMap[variant]} size="small"/>
        : <Text style={[styles.text, { color: textMap[variant], fontSize: sz.fontSize }, textStyle]}>{title}</Text>}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  btn: { borderRadius: Radius.md, paddingHorizontal: 22, alignItems: 'center', justifyContent: 'center' },
  text: { fontWeight: '700', letterSpacing: 0.3 },
});
