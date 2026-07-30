import { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useDispatch, useSelector } from 'react-redux';
import * as Haptics from 'expo-haptics';
import { RootState } from '../../store';
import { addXP, addCorrect } from '../../store/slices/userSlice';
import { loseHeart } from '../../store/slices/heartsSlice';
import { Colors, Radius } from '../../constants/theme';
import GameHeader, { PauseOverlay } from '../../components/games/GameHeader';
import ResultsScreen from '../../components/games/ResultsScreen';

type Level = 1 | 2 | 3;
const ROUND_LENGTH = 10;

// Math Lightning skips Gemini generation deliberately — this is a fast,
// auto-graded numeric-answer game, and an AI-generated problem whose stated
// answer doesn't reliably match its own wording would break the core loop.
// A local generator guarantees every problem is solvable and correctly graded.
function generateProblem(level: Level): { question: string; answer: number } {
  if (level === 1) {
    const ops = ['+', '-', '×'] as const;
    const op = ops[Math.floor(Math.random() * ops.length)];
    const a = Math.floor(Math.random() * 18) + 2;
    const b = Math.floor(Math.random() * 18) + 2;
    const answer = op === '+' ? a + b : op === '-' ? a - b : a * b;
    return { question: `${a} ${op} ${b}`, answer };
  }
  if (level === 2) {
    const a = Math.floor(Math.random() * 8) + 2;
    const x = Math.floor(Math.random() * 10) + 1;
    const b = Math.floor(Math.random() * 20) - 10;
    const c = a * x + b;
    return { question: `Solve for x: ${a}x ${b >= 0 ? '+' : '-'} ${Math.abs(b)} = ${c}`, answer: x };
  }
  const a = Math.floor(Math.random() * 5) + 1;
  const x0 = Math.floor(Math.random() * 5) + 1;
  return { question: `f(x) = ${a}x². What is f'(${x0})?`, answer: 2 * a * x0 };
}

export default function MathLightningGame() {
  const dispatch = useDispatch();
  const hearts = useSelector((s: RootState) => s.hearts.count);
  const [level, setLevel] = useState<Level | null>(null);
  const [problems, setProblems] = useState<{ question: string; answer: number }[]>([]);
  const [idx, setIdx] = useState(0);
  const [input, setInput] = useState('');
  const [score, setScore] = useState(0);
  const [xpEarned, setXpEarned] = useState(0);
  const [status, setStatus] = useState<'playing' | 'correct' | 'wrong'>('playing');
  const [paused, setPaused] = useState(false);
  const [done, setDone] = useState(false);
  const startRef = useRef(Date.now());

  const startRound = (lvl: Level) => {
    setLevel(lvl);
    setProblems(Array.from({ length: ROUND_LENGTH }, () => generateProblem(lvl)));
    setIdx(0); setInput(''); setScore(0); setXpEarned(0); setStatus('playing'); setDone(false);
    startRef.current = Date.now();
  };

  const submit = () => {
    if (status !== 'playing' || !input.trim()) return;
    const correct = Number(input.trim()) === problems[idx].answer;
    if (correct) {
      setScore(s => s + 1);
      setXpEarned(x => x + 5);
      dispatch(addXP(5));
      dispatch(addCorrect());
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else {
      dispatch(loseHeart());
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
    setStatus(correct ? 'correct' : 'wrong');
    setTimeout(() => {
      const willEnd = idx + 1 >= ROUND_LENGTH || hearts - (correct ? 0 : 1) <= 0;
      if (willEnd) {
        if (correct && score + 1 === ROUND_LENGTH) { setXpEarned(x => x + 50); dispatch(addXP(50)); }
        setDone(true);
      } else {
        setIdx(i => i + 1); setInput(''); setStatus('playing');
      }
    }, 700);
  };

  if (!level) {
    return (
      <SafeAreaView style={styles.safe}>
        <GameHeader onBack={() => router.back()} />
        <View style={styles.pickWrap}>
          <Text style={styles.pickTitle}>Pick your level</Text>
          {[[1, 'Level 1', 'Basic arithmetic'], [2, 'Level 2', 'Algebra'], [3, 'Level 3', 'Calculus']].map(([lvl, label, desc]) => (
            <TouchableOpacity key={lvl as number} onPress={() => startRound(lvl as Level)} style={styles.levelCard}>
              <Text style={styles.levelLabel}>{label as string}</Text>
              <Text style={styles.levelDesc}>{desc as string}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </SafeAreaView>
    );
  }

  if (done) {
    return (
      <SafeAreaView style={styles.safe}>
        <ResultsScreen
          score={score} total={ROUND_LENGTH} xpEarned={xpEarned} heartsLeft={hearts}
          timeSeconds={Math.round((Date.now() - startRef.current) / 1000)}
          onPlayAgain={() => startRound(level)}
          onNewGame={() => router.replace('/games')}
        />
      </SafeAreaView>
    );
  }

  const problem = problems[idx];

  return (
    <SafeAreaView style={styles.safe}>
      <GameHeader onBack={() => router.back()} onPause={() => setPaused(true)} score={score} hearts={hearts} current={idx} total={ROUND_LENGTH} xpEarned={xpEarned} />
      {paused && <PauseOverlay onResume={() => setPaused(false)} onQuit={() => router.replace('/games')} />}

      <View style={styles.body}>
        <Text style={styles.problem}>{problem.question}</Text>
        <TextInput
          value={input} onChangeText={setInput}
          keyboardType="numbers-and-punctuation"
          style={[styles.input, status === 'correct' && styles.inputCorrect, status === 'wrong' && styles.inputWrong]}
          placeholder="?" placeholderTextColor={Colors.muted}
          editable={status === 'playing'}
          onSubmitEditing={submit}
          autoFocus
        />
        {status === 'wrong' && <Text style={styles.answerReveal}>answer: {problem.answer}</Text>}
        <TouchableOpacity onPress={submit} disabled={status !== 'playing' || !input.trim()} style={[styles.submitBtn, (status !== 'playing' || !input.trim()) && styles.submitBtnDisabled]}>
          <Text style={styles.submitBtnText}>Submit</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  pickWrap: { flex: 1, padding: 24, gap: 14, justifyContent: 'center' },
  pickTitle: { fontSize: 22, fontWeight: '900', color: Colors.text, marginBottom: 10, textAlign: 'center' },
  levelCard: { padding: 18, borderRadius: Radius.lg, backgroundColor: Colors.bg3, borderWidth: 1, borderColor: Colors.border },
  levelLabel: { fontSize: 17, fontWeight: '800', color: Colors.text },
  levelDesc: { fontSize: 13, color: Colors.muted, marginTop: 3 },
  body: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, gap: 20 },
  problem: { fontSize: 26, fontWeight: '900', color: Colors.text, textAlign: 'center' },
  input: { width: 160, textAlign: 'center', fontSize: 24, fontWeight: '800', color: Colors.text, backgroundColor: Colors.bg3, borderWidth: 2, borderColor: Colors.border2, borderRadius: Radius.md, padding: 14 },
  inputCorrect: { borderColor: Colors.green },
  inputWrong: { borderColor: Colors.red },
  answerReveal: { color: Colors.red, fontSize: 13 },
  submitBtn: { paddingHorizontal: 28, paddingVertical: 13, borderRadius: Radius.md, backgroundColor: Colors.purple },
  submitBtnDisabled: { opacity: 0.4 },
  submitBtnText: { color: Colors.white, fontWeight: '800', fontSize: 15 },
});
