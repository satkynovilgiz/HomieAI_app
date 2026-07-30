import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Colors, Radius } from '../../constants/theme';
import HomieBot from '../mascot/HomieBot';

interface Props {
  score: number;
  total: number;
  xpEarned: number;
  heartsLeft?: number;
  timeSeconds?: number;
  onPlayAgain: () => void;
  onNewGame: () => void;
}

function formatTime(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export default function ResultsScreen({ score, total, xpEarned, heartsLeft, timeSeconds, onPlayAgain, onNewGame }: Props) {
  const good = total > 0 ? score / total >= 0.6 : score > 0;

  return (
    <View style={styles.wrap}>
      <HomieBot mood={good ? 'celebrating' : 'happy'} size={110} />
      <Text style={styles.title}>Round Complete</Text>

      <View style={styles.card}>
        <View style={styles.row}>
          <Text style={styles.label}>Score</Text>
          <Text style={styles.value}>{score}/{total}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>XP Earned</Text>
          <Text style={[styles.value, styles.xpValue]}>+{xpEarned} XP</Text>
        </View>
        {typeof heartsLeft === 'number' && (
          <View style={styles.row}>
            <Text style={styles.label}>Hearts Left</Text>
            <Text style={styles.value}>{heartsLeft}</Text>
          </View>
        )}
        {typeof timeSeconds === 'number' && (
          <View style={styles.row}>
            <Text style={styles.label}>Time</Text>
            <Text style={styles.value}>{formatTime(timeSeconds)}</Text>
          </View>
        )}
      </View>

      <View style={styles.btnRow}>
        <TouchableOpacity onPress={onPlayAgain} style={styles.primaryBtn}>
          <Text style={styles.primaryBtnText}>Play Again</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={onNewGame} style={styles.secondaryBtn}>
          <Text style={styles.secondaryBtnText}>New Game</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, gap: 16 },
  title: { fontSize: 24, fontWeight: '900', color: Colors.text },
  card: { width: '100%', backgroundColor: Colors.bg3, borderRadius: Radius.lg, borderWidth: 1, borderColor: Colors.border, padding: 20, gap: 14 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  label: { fontSize: 14, color: Colors.muted, fontWeight: '600' },
  value: { fontSize: 16, color: Colors.text, fontWeight: '800' },
  xpValue: { color: Colors.green },
  btnRow: { flexDirection: 'row', gap: 12, width: '100%' },
  primaryBtn: { flex: 1, paddingVertical: 15, borderRadius: Radius.md, backgroundColor: Colors.purple, alignItems: 'center' },
  primaryBtnText: { color: Colors.white, fontWeight: '800', fontSize: 15 },
  secondaryBtn: { flex: 1, paddingVertical: 15, borderRadius: Radius.md, backgroundColor: Colors.bg3, borderWidth: 1, borderColor: Colors.border, alignItems: 'center' },
  secondaryBtnText: { color: Colors.text2, fontWeight: '700', fontSize: 15 },
});
