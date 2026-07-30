import { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { useDispatch } from 'react-redux';
import * as Haptics from 'expo-haptics';
import { addXP, addCorrect } from '../../store/slices/userSlice';
import { Colors, Radius } from '../../constants/theme';
import { generateGameQuestions, GameQuestion } from '../../lib/gemini';
import HomieBot from '../../components/mascot/HomieBot';
import GameHeader, { PauseOverlay } from '../../components/games/GameHeader';
import ResultsScreen from '../../components/games/ResultsScreen';

const FALLBACK: GameQuestion[] = [
  { question: 'A ______ measures the rate of change of a function', answer: 'derivative' },
  { question: 'The ______ is the powerhouse of the cell', answer: 'mitochondria' },
  { question: 'World War 2 ended in the year ______', answer: '1945' },
  { question: 'A ______ is a number that only divides evenly by 1 and itself', answer: 'prime' },
  { question: 'In JavaScript, ______ is used to declare a constant', answer: 'const' },
  { question: 'The chemical symbol for gold is ______', answer: 'au' },
  { question: 'Shakespeare wrote the play Romeo and ______', answer: 'juliet' },
  { question: 'The process of plants making food from light is called ______', answer: 'photosynthesis' },
  { question: 'The speed of light is approximately 300,000 ______ per second', answer: 'kilometers' },
  { question: 'In algebra, the letter commonly used for an unknown value is ______', answer: 'x' },
];

function normalize(s: string): string {
  return s.toLowerCase().trim().replace(/[.,!?]/g, '');
}

export default function FillInBlankGame() {
  const dispatch = useDispatch();
  const { subject } = useLocalSearchParams<{ subject?: string }>();
  const subj = subject || 'General';

  const [questions, setQuestions] = useState<GameQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [idx, setIdx] = useState(0);
  const [input, setInput] = useState('');
  const [score, setScore] = useState(0);
  const [xpEarned, setXpEarned] = useState(0);
  const [status, setStatus] = useState<'playing' | 'correct' | 'wrong'>('playing');
  const [paused, setPaused] = useState(false);
  const [done, setDone] = useState(false);
  const startRef = useRef(Date.now());

  useEffect(() => {
    generateGameQuestions('fill in the blank', subj, '').then(gen => {
      const list = gen.filter(q => q.question?.includes('_') && q.answer).slice(0, 10);
      setQuestions(list.length ? list : FALLBACK);
      setLoading(false);
    });
  }, []);

  const submit = () => {
    if (status !== 'playing' || !input.trim() || !questions[idx]) return;
    const correct = normalize(input) === normalize(questions[idx].answer);
    if (correct) {
      setScore(s => s + 1); setXpEarned(x => x + 15);
      dispatch(addXP(15)); dispatch(addCorrect());
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
    setStatus(correct ? 'correct' : 'wrong');
    setTimeout(() => {
      if (idx + 1 >= questions.length) {
        if (correct && score + 1 === questions.length) { setXpEarned(x => x + 50); dispatch(addXP(50)); }
        setDone(true);
      } else {
        setIdx(i => i + 1); setInput(''); setStatus('playing');
      }
    }, 1300);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.loadingWrap}>
          <HomieBot mood="thinking" size={100} />
          <Text style={styles.loadingText}>writing {subj} sentences...</Text>
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

  const q = questions[idx];

  return (
    <SafeAreaView style={styles.safe}>
      <GameHeader onBack={() => router.back()} onPause={() => setPaused(true)} score={score} current={idx} total={questions.length} xpEarned={xpEarned} />
      {paused && <PauseOverlay onResume={() => setPaused(false)} onQuit={() => router.replace('/games')} />}

      <View style={styles.body}>
        <Text style={styles.sentence}>{q.question}</Text>
        <TextInput
          value={input} onChangeText={setInput}
          style={[styles.input, status === 'correct' && styles.inputCorrect, status === 'wrong' && styles.inputWrong]}
          placeholder="type the missing word" placeholderTextColor={Colors.muted}
          editable={status === 'playing'}
          onSubmitEditing={submit}
          autoCapitalize="none"
          autoFocus
        />
        {status === 'wrong' && <Text style={styles.answerReveal}>correct answer: {q.answer}</Text>}
        <TouchableOpacity onPress={submit} disabled={status !== 'playing' || !input.trim()} style={[styles.submitBtn, (status !== 'playing' || !input.trim()) && styles.submitBtnDisabled]}>
          <Text style={styles.submitBtnText}>Submit</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  loadingWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 14 },
  loadingText: { color: Colors.muted, fontSize: 14 },
  body: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, gap: 18 },
  sentence: { fontSize: 19, fontWeight: '700', color: Colors.text, textAlign: 'center', lineHeight: 27 },
  input: { width: '100%', textAlign: 'center', fontSize: 17, fontWeight: '700', color: Colors.text, backgroundColor: Colors.bg3, borderWidth: 2, borderColor: Colors.border2, borderRadius: Radius.md, padding: 14 },
  inputCorrect: { borderColor: Colors.green },
  inputWrong: { borderColor: Colors.red },
  answerReveal: { color: Colors.red, fontSize: 13 },
  submitBtn: { paddingHorizontal: 28, paddingVertical: 13, borderRadius: Radius.md, backgroundColor: Colors.purple },
  submitBtnDisabled: { opacity: 0.4 },
  submitBtnText: { color: Colors.white, fontWeight: '800', fontSize: 15 },
});
