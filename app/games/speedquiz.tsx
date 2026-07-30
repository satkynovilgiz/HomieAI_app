import { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
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

const QUESTION_SECONDS = 10;

const FALLBACK: GameQuestion[] = [
  { question: 'What is H2O?', options: ['Salt', 'Water', 'Sugar', 'Acid'], answer: 'Water' },
  { question: 'Who invented the telephone?', options: ['Edison', 'Tesla', 'Bell', 'Morse'], answer: 'Bell' },
  { question: '7 x 8 = ?', options: ['54', '56', '58', '52'], answer: '56' },
  { question: 'What is the powerhouse of the cell?', options: ['Nucleus', 'Ribosome', 'Mitochondria', 'Golgi'], answer: 'Mitochondria' },
  { question: 'What planet is closest to the sun?', options: ['Venus', 'Earth', 'Mercury', 'Mars'], answer: 'Mercury' },
  { question: 'Who wrote Romeo and Juliet?', options: ['Dickens', 'Shakespeare', 'Austen', 'Chaucer'], answer: 'Shakespeare' },
  { question: 'What is a derivative in calculus?', options: ['Area under curve', 'Rate of change', 'A constant', 'An integral'], answer: 'Rate of change' },
  { question: 'What does "const" do in JavaScript?', options: ['Loops', 'Declares a constant', 'Deletes a variable', 'Imports a module'], answer: 'Declares a constant' },
  { question: 'What year did World War 2 end?', options: ['1943', '1944', '1945', '1946'], answer: '1945' },
  { question: 'What is the chemical symbol for gold?', options: ['Ag', 'Au', 'Gd', 'Go'], answer: 'Au' },
];

export default function SpeedQuizGame() {
  const dispatch = useDispatch();
  const { subject } = useLocalSearchParams<{ subject?: string }>();
  const subj = subject || 'General';

  const [questions, setQuestions] = useState<GameQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [idx, setIdx] = useState(0);
  const [timeLeft, setTimeLeft] = useState(QUESTION_SECONDS);
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [xpEarned, setXpEarned] = useState(0);
  const [paused, setPaused] = useState(false);
  const [done, setDone] = useState(false);
  const startRef = useRef(Date.now());

  useEffect(() => {
    generateGameQuestions('speed quiz multiple choice', subj, '').then(gen => {
      const list = gen.filter(q => Array.isArray(q.options) && q.options.length === 4).slice(0, 10);
      setQuestions(list.length ? list : FALLBACK);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    if (loading || done) return;
    setTimeLeft(QUESTION_SECONDS);
    setSelected(null);
  }, [idx, loading]);

  useEffect(() => {
    if (loading || done || paused || selected !== null) return;
    if (timeLeft <= 0) { answer(-1); return; }
    const t = setTimeout(() => setTimeLeft(s => s - 1), 1000);
    return () => clearTimeout(t);
  }, [timeLeft, loading, done, paused, selected]);

  const answer = (optIdx: number) => {
    if (selected !== null || !questions[idx]) return;
    setSelected(optIdx);
    const opts = questions[idx].options || [];
    const correct = optIdx >= 0 && opts[optIdx]?.trim().toLowerCase() === questions[idx].answer.trim().toLowerCase();
    if (correct) {
      const xp = 10 + Math.round((timeLeft / QUESTION_SECONDS) * 5);
      setScore(s => s + 1); setXpEarned(x => x + xp);
      dispatch(addXP(xp)); dispatch(addCorrect());
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
    setTimeout(() => {
      if (idx + 1 >= questions.length) {
        if (correct && score + 1 === questions.length) { setXpEarned(x => x + 50); dispatch(addXP(50)); }
        setDone(true);
      } else {
        setIdx(i => i + 1);
      }
    }, 1400);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.loadingWrap}>
          <HomieBot mood="thinking" size={100} />
          <Text style={styles.loadingText}>writing {subj} questions...</Text>
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
  const correctIdx = q.options?.findIndex(o => o.trim().toLowerCase() === q.answer.trim().toLowerCase()) ?? -1;

  return (
    <SafeAreaView style={styles.safe}>
      <GameHeader onBack={() => router.back()} onPause={() => setPaused(true)} score={score} current={idx} total={questions.length} xpEarned={xpEarned} />
      {paused && <PauseOverlay onResume={() => setPaused(false)} onQuit={() => router.replace('/games')} />}

      <View style={styles.body}>
        <Text style={styles.timer}>{timeLeft}s</Text>
        <Text style={styles.question}>{q.question}</Text>
        <View style={styles.opts}>
          {(q.options || []).map((opt, i) => {
            let bg = Colors.bg3, border = Colors.border2;
            if (selected !== null) {
              if (i === correctIdx) { bg = 'rgba(16,185,129,0.15)'; border = Colors.green; }
              else if (i === selected) { bg = 'rgba(239,68,68,0.12)'; border = Colors.red; }
            }
            return (
              <TouchableOpacity key={i} onPress={() => answer(i)} disabled={selected !== null}
                style={[styles.opt, { backgroundColor: bg, borderColor: border }]}>
                <Text style={styles.optLetter}>{['A', 'B', 'C', 'D'][i]}</Text>
                <Text style={styles.optText}>{opt}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  loadingWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 14 },
  loadingText: { color: Colors.muted, fontSize: 14 },
  body: { flex: 1, padding: 24, gap: 18, alignItems: 'center' },
  timer: { fontSize: 26, fontWeight: '900', color: Colors.purpleL },
  question: { fontSize: 18, fontWeight: '800', color: Colors.text, textAlign: 'center', lineHeight: 25 },
  opts: { width: '100%', gap: 10, marginTop: 6 },
  opt: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderRadius: Radius.md, borderWidth: 1.5 },
  optLetter: { fontSize: 14, fontWeight: '900', color: Colors.muted, width: 20 },
  optText: { fontSize: 14, color: Colors.text, flex: 1 },
});
