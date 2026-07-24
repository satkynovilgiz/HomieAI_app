import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Radius } from '../../constants/theme';

interface Props { icon?: string; value: string | number; label: string; color?: string; }

export default function StatCard({ value, label, color = Colors.purpleL }: Props) {
  return (
    <View style={styles.card}>
      <Text style={[styles.value, { color }]}>{value}</Text>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { flex: 1, backgroundColor: Colors.bg3, borderRadius: Radius.md, padding: 12, alignItems: 'center', borderWidth: 1, borderColor: Colors.border },
  value: { fontSize: 20, fontWeight: '900', marginBottom: 3 },
  label: { fontSize: 10, color: Colors.muted, textTransform: 'uppercase', letterSpacing: 0.5 },
});
