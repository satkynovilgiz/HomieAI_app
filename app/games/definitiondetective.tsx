import { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { useDispatch, useSelector } from 'react-redux';
import * as Haptics from 'expo-haptics';
import { RootState } from '../../store';
import { addXP, addCorrect } from '../../store/slices/userSlice';
import { spendGems } from '../../store/slices/gemsSlice';
import { Colors, Radius } from '../../constants/theme';
import { generateGameQuestions, GameQuestion } from '../../lib/gemini';
import HomieBot from '../../components/mascot/HomieBot';
import GameHeader, { PauseOverlay } from '../../components/games/GameHeader';
import ResultsScreen from '../../components/games/ResultsScreen';

const HINT_COST = 10;
const ROUND_LENGTH = 10;

const FALLBACK: GameQuestion[] = [
  { question: 'A measure of how fast something changes at a point', answer: 'derivative', hint: 'Used constantly in calculus' },
  { question: 'The organelle that produces energy for the cell', answer: 'mitochondria', hint: 'Called the powerhouse of the cell' },
  { question: 'A number divisible only by 1 and itself', answer: 'prime', hint: '2, 3, 5, 7, 11 are examples' },
  { question: 'The process plants use to convert light into food', answer: 'photosynthesis', hint: 'Happens in chloroplasts' },
  { question: 'The molecule that carries genetic instructions', answer: 'dna', hint: 'Shaped like a double helix' },
  { question: 'A named container for a value in programming', answer: 'variable', hint: 'Declared with let or const in JS' },
  { question: 'A period of cultural rebirth in Europe', answer: 'renaissance', hint: 'Followed the Middle Ages' },
  { question: 'The force that pulls objects toward Earth', answer: 'gravity', hint: 'Discovered by Newton' },
  { question: 'A community of living things interacting with their environment', answer: 'ecosystem', hint: 'Includes both organisms and habitat' },
  { question: 'Mass times velocity of a moving object', answer: 'momentum', hint: 'Conserved in collisions' },
];

function normalize(s: string): string { return s.toLowerCase().trim().replace(/[.,!?]/g, ''); }

export default function DefinitionDetectiveGame() {
  const dispatch = useDispatch();
  const gems = useSelector((s: RootState) => s.gems.count);
  const { subject } = useLocalSearchParams<{ subject?: string }>();
  const subj = subject || 'General';

  const [questions, setQuestions] = useState<GameQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [idx, setIdx] = useState(0);
  const [input, setInput] = useState('');
  const [hintsUsed, setHintsUsed] = useState(0);
  const [score, setScore] = useState(0);
  const [xpEarned, setXpEarned] = useState(0);
  const [status, setStatus] = useState<'playing' | 'correct' | 'wrong'>('playing');
  const [paused, setPaused] = useState(false);
  const [done, setDone] = useState(false);
  const startRef = useRef(Date.now());

  useEffect(() => {
    generateGameQuestions('definition detective (give a definition, guess the word)', subj, '').then(gen => {
      const list = gen.filter(q => q.question && q.answer).slice(0, ROUND_LENGTH);
      setQuestions(list.length ? list : FALLBACK);
      setLoading(false);
    });
  }, []);

  const q = questions[idx];

  const revealHint = (level: number): string => {
    if (!q) return '';
    if (level === 1) return `First letter: ${q.answer[0].toUpperCase()}`;
    if (level === 2) return `It's ${q.answer.replace(/\s/g, '').length} letters long`;
    return q.hint || `Think about where "${subj}" concepts like this show up`;
  };

  const useHint = () => {
    if (hintsUsed >= 3 || gems < HINT_COST) return;
    dispatch(spendGems(HINT_COST));
    setHintsUsed(h => h + 1);
  };

  const submit = () => {
    if (status !== 'playing' || !input.trim() || !q) return;
    const correct = normalize(input) === normalize(q.answer);
    if (correct) {
      const xp = hintsUsed === 0 ? 20 : 10;
      setScore(s => s + 1); setXpEarned(x => x + xp);
      dispatch(addXP(xp)); dispatch(addCorrect());
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
    setStatus(correct ? 'correct' : 'wrong');
    setTimeout(() => {
      if (idx + 1 >= questions.length) setDone(true);
      else { setIdx(i => i + 1); setInput(''); setHintsUsed(0); setStatus('playing'); }
    }, 1400);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.loadingWrap}>
          <HomieBot mood="thinking" size={100} />
          <Text style={styles.loadingText}>preparing {subj} mysteries...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (done) {
    return (
      <SafeAreaView style={styles.safe}>
        <ResultsScreen
          score={score} total={questions.length} xpEarned={xpEarned}
          timeSeconds={Math.round((Date.now() - startRef.current) / 1000)}
          onPlayAgain={() => { setIdx(0); setScore(0); setXpEarned(0); setDone(false); startRef.current = Date.now(); }}
          onNewGame={() => router.replace('/games')}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <GameHeader onBack={() => router.back()} onPause={() => setPaused(true)} score={score} current={idx} total={questions.length} xpEarned={xpEarned} />
      {paused && <PauseOverlay onResume={() => setPaused(false)} onQuit={() => router.replace('/games')} />}

      <View style={styles.body}>
        <HomieBot mood="thinking" size={70} />
        <Text style={styles.definition}>{q.question}</Text>

        {hintsUsed > 0 && (
          <View style={styles.hintsBox}>
            {Array.from({ length: hintsUsed }, (_, i) => (
              <Text key={i} style={styles.hintText}>Hint {i + 1}: {revealHint(i + 1)}</Text>
            ))}
          </View>
        )}

        <TextInput
          value={input} onChangeText={setInput}
          style={[styles.input, status === 'correct' && styles.inputCorrect, status === 'wrong' && styles.inputWrong]}
          placeholder="what's the word/concept?" placeholderTextColor={Colors.muted}
          editable={status === 'playing'} autoCapitalize="none" onSubmitEditing={submit}
        />
        {status === 'wrong' && <Text style={styles.answerReveal}>it was: {q.answer}</Text>}

        <View style={styles.btnRow}>
          <TouchableOpacity onPress={useHint} disabled={hintsUsed >= 3 || gems < HINT_COST || status !== 'playing'}
            style={[styles.hintBtn, (hintsUsed >= 3 || gems < HINT_COST || status !== 'playing') && styles.btnDisabled]}>
            <Text style={styles.hintBtnText}>Hint ({HINT_COST} gems) - {3 - hintsUsed} left</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={submit} disabled={status !== 'playing' || !input.trim()}
            style={[styles.submitBtn, (status !== 'playing' || !input.trim()) && styles.btnDisabled]}>
            <Text style={styles.submitBtnText}>Submit</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  loadingWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 14 },
  loadingText: { color: Colors.muted, fontSize: 14 },
  body: { flex: 1, alignItems: 'center', padding: 24, gap: 16 },
  definition: { fontSize: 17, fontWeight: '700', color: Colors.text, textAlign: 'center', lineHeight: 24 },
  hintsBox: { width: '100%', gap: 6, padding: 12, backgroundColor: 'rgba(251,191,36,0.08)', borderRadius: Radius.md, borderWidth: 1, borderColor: 'rgba(251,191,36,0.25)' },
  hintText: { fontSize: 13, color: Colors.yellow },
  input: { width: '100%', textAlign: 'center', fontSize: 16, fontWeight: '700', color: Colors.text, backgroundColor: Colors.bg3, borderWidth: 2, borderColor: Colors.border2, borderRadius: Radius.md, padding: 14 },
  inputCorrect: { borderColor: Colors.green },
  inputWrong: { borderColor: Colors.red },
  answerReveal: { color: Colors.red, fontSize: 13 },
  btnRow: { flexDirection: 'row', gap: 10, width: '100%' },
  hintBtn: { flex: 1, paddingVertical: 13, borderRadius: Radius.md, backgroundColor: Colors.bg3, borderWidth: 1, borderColor: 'rgba(251,191,36,0.4)', alignItems: 'center' },
  hintBtnText: { color: Colors.yellow, fontWeight: '700', fontSize: 12 },
  submitBtn: { flex: 1, paddingVertical: 13, borderRadius: Radius.md, backgroundColor: Colors.purple, alignItems: 'center' },
  submitBtnText: { color: Colors.white, fontWeight: '800', fontSize: 14 },
  btnDisabled: { opacity: 0.4 },
});
