
import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useDispatch } from 'react-redux';
import * as Haptics from 'expo-haptics';
import { addXP, addCorrect } from '../../store/slices/userSlice';
import { Colors, Radius } from '../../constants/theme';
import { QUIZ_BANK } from '../../constants/subjects';
import HomieBot from '../../components/mascot/HomieBot';

const WORDLE_WORDS = ['REACT','REDUX','PYTHON','PHOTON','NEURAL','BINARY','MATRIX'];

function WordleGame({ dispatch }: { dispatch: any }) {
  const [word] = useState(WORDLE_WORDS[Math.floor(Math.random() * WORDLE_WORDS.length)]);
  const [guesses, setGuesses] = useState<Array<Array<{l:string,s:string}>>>([]);
  const [current, setCurrent] = useState('');
  const [done, setDone] = useState(false);
  const [won, setWon] = useState(false);

  const submit = () => {
    if (current.length !== 5) return;
    const g = current.toUpperCase();
    const result = g.split('').map((l,i) => ({
      l, s: l === word[i] ? 'correct' : word.includes(l) ? 'present' : 'absent'
    }));
    const ng = [...guesses, result];
    setGuesses(ng); setCurrent('');
    if (g === word) { setWon(true); setDone(true); dispatch(addXP(30)); Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); }
    else if (ng.length >= 6) setDone(true);
  };

  const colors = { correct: Colors.green, present: Colors.yellow, absent: Colors.bg4 };

  return (
    <View style={{ alignItems: 'center', gap: 12 }}>
      <Text style={styles.gameTitle}>HOMIE Wordle</Text>
      <Text style={styles.gameSub}>Guess the 5-letter study word</Text>
      <View style={{ gap: 6 }}>
        {[...Array(6)].map((_,ri) => (
          <View key={ri} style={{ flexDirection: 'row', gap: 6 }}>
            {[...Array(5)].map((_,ci) => {
              const g = guesses[ri]; const cell = g?.[ci];
              return (
                <View key={ci} style={[styles.cell, cell && { backgroundColor: colors[cell.s as keyof typeof colors] }]}>
                  <Text style={styles.cellText}>{cell?.l || (ri === guesses.length && current[ci]) || ''}</Text>
                </View>
              );
            })}
          </View>
        ))}
      </View>
      {!done ? (
        <View style={{ flexDirection: 'row', gap: 10, marginTop: 8 }}>
          <TextInput
            value={current} onChangeText={t => setCurrent(t.toUpperCase().slice(0,5))}
            style={styles.wordleInput} maxLength={5} autoCapitalize="characters"
            placeholder="Type 5 letters..." placeholderTextColor={Colors.muted}
          />
          <TouchableOpacity onPress={submit} style={styles.wordleBtn}>
            <Text style={{ color: Colors.white, fontWeight: '800' }}>Guess</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={{ alignItems: 'center', gap: 8 }}>
          <HomieBot mood={won ? 'celebrating' : 'sad'} size={80}/>
          <Text style={{ fontSize: 18, fontWeight: '800', color: won ? Colors.green : Colors.red }}>
            {won ? 'YOOOO YOU GOT IT! 🎉 +30 XP' : `Word was: ${word} 😭`}
          </Text>
        </View>
      )}
    </View>
  );
}

function QuizGame({ dispatch }: { dispatch: any }) {
  const [idx, setIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState<number | null>(null);
  const [done, setDone] = useState(false);
  const q = QUIZ_BANK[idx];

  const answer = (i: number) => {
    if (answered !== null) return;
    setAnswered(i);
    if (i === q.ans) { setScore(s => s + 1); dispatch(addXP(10)); dispatch(addCorrect()); Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); }
    setTimeout(() => {
      if (idx + 1 >= QUIZ_BANK.length) setDone(true);
      else { setIdx(i => i + 1); setAnswered(null); }
    }, 1600);
  };

  if (done) return (
    <View style={{ alignItems: 'center', gap: 12 }}>
      <HomieBot mood={score >= 6 ? 'celebrating' : 'happy'} size={100}/>
      <Text style={styles.gameTitle}>{score}/{QUIZ_BANK.length} Correct!</Text>
      <Text style={{ color: Colors.green, fontSize: 15, fontWeight: '700' }}>+{score * 10} XP earned</Text>
      <TouchableOpacity onPress={() => { setIdx(0); setScore(0); setAnswered(null); setDone(false); }} style={styles.playAgainBtn}>
        <Text style={{ color: Colors.white, fontWeight: '800', fontSize: 15 }}>Play Again</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={{ gap: 14 }}>
      <Text style={{ fontSize: 12, color: Colors.muted }}>Question {idx + 1} of {QUIZ_BANK.length}</Text>
      <Text style={styles.gameTitle}>{q.q}</Text>
      {q.opts.map((opt, i) => {
        let bg = Colors.bg4, border = Colors.border;
        if (answered !== null) {
          if (i === q.ans) { bg = 'rgba(16,185,129,0.2)'; border = Colors.green; }
          else if (i === answered) { bg = 'rgba(239,68,68,0.1)'; border = Colors.red; }
        }
        return (
          <TouchableOpacity key={i} onPress={() => answer(i)} disabled={answered !== null}
            style={[styles.quizOpt, { backgroundColor: bg, borderColor: border }]}>
            <Text style={{ color: Colors.text, fontSize: 14 }}>{['A','B','C','D'][i]}) {opt}</Text>
          </TouchableOpacity>
        );
      })}
      {answered !== null && <Text style={{ color: Colors.text2, fontSize: 13 }}>{q.exp}</Text>}
    </View>
  );
}

const GAMES = [
  { id: 'wordle', icon: '🔤', title: 'HOMIE Wordle', desc: 'Guess the 5-letter study word', color: Colors.green, xp: '+30 XP' },
  { id: 'quiz', icon: '🎯', title: 'Quick Quiz', desc: '8 questions, earn XP each', color: Colors.purple, xp: '+10 XP each' },
];

export default function GamesScreen() {
  const dispatch = useDispatch();
  const [game, setGame] = useState<string | null>(null);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => game ? setGame(null) : router.back()} style={styles.backBtn}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Study Games 🎮</Text>
      </View>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {!game ? (
          <>
            <Text style={styles.sub}>Learn without even realizing it fr</Text>
            <View style={{ gap: 16 }}>
              {GAMES.map(g => (
                <TouchableOpacity key={g.id} onPress={() => setGame(g.id)} style={[styles.gameCard, { borderColor: g.color + '44' }]} activeOpacity={0.85}>
                  <Text style={styles.gameIcon}>{g.icon}</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.gameName}>{g.title}</Text>
                    <Text style={styles.gameDesc}>{g.desc}</Text>
                  </View>
                  <View style={[styles.xpBadge, { backgroundColor: g.color + '22', borderColor: g.color + '44' }]}>
                    <Text style={[styles.xpText, { color: g.color }]}>{g.xp}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </>
        ) : (
          <View style={{ paddingTop: 8 }}>
            {game === 'wordle' && <WordleGame dispatch={dispatch}/>}
            {game === 'quiz' && <QuizGame dispatch={dispatch}/>}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  container: { padding: 20 },
  header: { flexDirection: 'row', alignItems: 'center', padding: 16, paddingBottom: 8, gap: 12 },
  backBtn: { padding: 4 },
  backArrow: { fontSize: 24, color: Colors.text },
  title: { fontSize: 22, fontWeight: '900', color: Colors.text },
  sub: { fontSize: 14, color: Colors.muted, marginBottom: 20 },
  gameCard: { flexDirection: 'row', alignItems: 'center', gap: 14, padding: 20, backgroundColor: Colors.bg3, borderRadius: Radius.lg, borderWidth: 1 },
  gameIcon: { fontSize: 40 },
  gameName: { fontSize: 17, fontWeight: '800', color: Colors.text, marginBottom: 4 },
  gameDesc: { fontSize: 13, color: Colors.muted },
  xpBadge: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: Radius.full, borderWidth: 1 },
  xpText: { fontSize: 11, fontWeight: '700' },
  gameTitle: { fontSize: 18, fontWeight: '800', color: Colors.text, textAlign: 'center' },
  gameSub: { fontSize: 13, color: Colors.muted, textAlign: 'center', marginBottom: 8 },
  cell: { width: 50, height: 50, borderWidth: 2, borderColor: Colors.border2, borderRadius: 8, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.bg3 },
  cellText: { fontSize: 20, fontWeight: '900', color: Colors.text },
  wordleInput: { flex: 1, backgroundColor: Colors.bg3, borderWidth: 1, borderColor: Colors.border, borderRadius: 10, color: Colors.text, padding: 12, fontSize: 16, fontWeight: '700', textAlign: 'center', letterSpacing: 4 },
  wordleBtn: { paddingHorizontal: 20, paddingVertical: 12, backgroundColor: Colors.purple, borderRadius: 10 },
  quizOpt: { padding: 13, borderRadius: 10, borderWidth: 1.5 },
  playAgainBtn: { paddingHorizontal: 28, paddingVertical: 13, backgroundColor: Colors.purple, borderRadius: Radius.md },
});
