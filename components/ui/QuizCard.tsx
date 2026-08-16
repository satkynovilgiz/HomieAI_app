
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors, Radius } from '../../constants/theme';

interface Props {
  quiz: { q: string; opts: string[]; ans: number; exp: string };
  onAnswer: (idx: number, correct: boolean) => void;
}

export default function QuizCard({ quiz, onAnswer }: Props) {
  const [selected, setSelected] = useState<number | null>(null);

  const answer = (idx: number) => {
    if (selected !== null) return;
    setSelected(idx);
    onAnswer(idx, idx === quiz.ans);
  };

  const letters = ['A','B','C','D'];

  return (
    <View style={styles.card}>
      <Text style={styles.badge}>quiz — +20 XP if you get it</Text>
      <Text style={styles.question}>{quiz.q}</Text>
      <View style={styles.opts}>
        {quiz.opts.map((opt, i) => {
          let bg = Colors.bg4, border = Colors.border2, textColor = Colors.text;
          if (selected !== null) {
            if (i === quiz.ans) { bg = 'rgba(16,185,129,0.15)'; border = Colors.green; textColor = Colors.greenL; }
            else if (i === selected) { bg = 'rgba(239,68,68,0.1)'; border = Colors.red; textColor = Colors.red; }
          }
          return (
            <TouchableOpacity key={i} onPress={() => answer(i)} disabled={selected !== null}
              style={[styles.opt, { backgroundColor: bg, borderColor: border }]}>
              <Text style={[styles.letter, { color: textColor }]}>{letters[i]})</Text>
              <Text style={[styles.optText, { color: textColor }]}>{opt}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
      {selected !== null && (
        <View style={styles.expBox}>
          <Text style={styles.expText}>
            {selected === quiz.ans ? 'yeah exactly — +20 XP ' : 'not quite — '}
            {quiz.exp}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: Colors.bg3, borderRadius: Radius.lg, padding: 18, borderWidth: 1, borderColor: Colors.purple + '44', marginVertical: 8 },
  badge: { fontSize: 11, color: Colors.purpleL, fontWeight: '700', marginBottom: 10 },
  question: { fontSize: 15, fontWeight: '700', color: Colors.text, marginBottom: 14, lineHeight: 22 },
  opts: { gap: 8 },
  opt: { flexDirection: 'row', alignItems: 'center', padding: 11, borderRadius: Radius.sm, borderWidth: 1.5, gap: 10 },
  letter: { fontWeight: '800', fontSize: 14, width: 22 },
  optText: { fontSize: 13, flex: 1 },
  expBox: { marginTop: 12, padding: 12, backgroundColor: 'rgba(124,58,237,0.1)', borderRadius: Radius.sm },
  expText: { fontSize: 13, color: Colors.text2, lineHeight: 19 },
});
