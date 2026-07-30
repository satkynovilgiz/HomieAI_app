import { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { useDispatch } from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import { addXP, addCorrect } from '../../store/slices/userSlice';
import { Colors, Radius } from '../../constants/theme';
import { generateGameQuestions, GameQuestion } from '../../lib/gemini';
import HomieBot from '../../components/mascot/HomieBot';
import GameHeader, { PauseOverlay } from '../../components/games/GameHeader';
import ResultsScreen from '../../components/games/ResultsScreen';

const HIGHSCORE_KEY = 'hm_trivia_highscores';

const FALLBACK: GameQuestion[] = [
  { question: 'What is the capital of France?', options: ['Berlin', 'Madrid', 'Paris', 'Rome'], answer: 'Paris' },
  { question: 'What is 12 x 12?', options: ['124', '144', '134', '154'], answer: '144' },
  { question: 'Who painted the Mona Lisa?', options: ['Van Gogh', 'Da Vinci', 'Picasso', 'Monet'], answer: 'Da Vinci' },
  { question: 'What gas do plants absorb from the air?', options: ['Oxygen', 'Nitrogen', 'Carbon Dioxide', 'Helium'], answer: 'Carbon Dioxide' },
  { question: 'How many continents are there?', options: ['5', '6', '7', '8'], answer: '7' },
  { question: 'What is the largest planet in our solar system?', options: ['Earth', 'Saturn', 'Jupiter', 'Neptune'], answer: 'Jupiter' },
  { question: 'What year did the Berlin Wall fall?', options: ['1987', '1989', '1991', '1993'], answer: '1989' },
  { question: 'What is the chemical formula for water?', options: ['CO2', 'H2O', 'O2', 'NaCl'], answer: 'H2O' },
  { question: 'Who wrote "1984"?', options: ['Huxley', 'Orwell', 'Bradbury', 'Vonnegut'], answer: 'Orwell' },
  { question: 'What is the square root of 64?', options: ['6', '7', '8', '9'], answer: '8' },
];

async function getHighScore(subject: string): Promise<number> {
  try {
    const raw = await AsyncStorage.getItem(HIGHSCORE_KEY);
    const map = raw ? JSON.parse(raw) : {};
    return map[subject] || 0;
  } catch { return 0; }
}

async function saveHighScore(subject: string, score: number): Promise<number> {
  try {
    const raw = await AsyncStorage.getItem(HIGHSCORE_KEY);
    const map = raw ? JSON.parse(raw) : {};
    const best = Math.max(map[subject] || 0, score);
    map[subject] = best;
    await AsyncStorage.setItem(HIGHSCORE_KEY, JSON.stringify(map));
    return best;
  } catch { return score; }
}

export default function TriviaGame() {
  const dispatch = useDispatch();
  const { subject } = useLocalSearchParams<{ subject?: string }>();
  const subj = subject || 'General';

  const [questions, setQuestions] = useState<GameQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [idx, setIdx] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [xpEarned, setXpEarned] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [newHighScore, setNewHighScore] = useState(false);
  const [paused, setPaused] = useState(false);
  const [done, setDone] = useState(false);
  const startRef = useRef(Date.now());

  useEffect(() => {
    generateGameQuestions('trivia multiple choice', subj, '').then(gen => {
      const list = gen.filter(q => Array.isArray(q.options) && q.options.length === 4).slice(0, 10);
      setQuestions(list.length ? list : FALLBACK);
      setLoading(false);
    });
    getHighScore(subj).then(setHighScore);
  }, []);

  const answer = (optIdx: number) => {
    if (selected !== null || !questions[idx]) return;
    setSelected(optIdx);
    const opts = questions[idx].options || [];
    const correct = opts[optIdx]?.trim().toLowerCase() === questions[idx].answer.trim().toLowerCase();
    if (correct) {
      setScore(s => s + 1); setXpEarned(x => x + 10);
      dispatch(addXP(10)); dispatch(addCorrect());
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
    setTimeout(() => {
      if (idx + 1 >= questions.length) {
        const finalScore = score + (correct ? 1 : 0);
        if (correct && finalScore === questions.length) { setXpEarned(x => x + 50); dispatch(addXP(50)); }
        saveHighScore(subj, finalScore).then(best => { setHighScore(best); setNewHighScore(finalScore >= best && finalScore > 0); setDone(true); });
      } else {
        setIdx(i => i + 1); setSelected(null);
      }
    }, 1400);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.loadingWrap}>
          <HomieBot mood="thinking" size={100} />
          <Text style={styles.loadingText}>gathering {subj} trivia...</Text>
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
          onPlayAgain={() => { setIdx(0); setScore(0); setXpEarned(0); setSelected(null); setDone(false); setNewHighScore(false); startRef.current = Date.now(); }}
          onNewGame={() => router.replace('/games')}
        />
        <Text style={styles.highScoreNote}>{newHighScore ? 'New high score!' : `Best on ${subj}:`} {highScore}/{questions.length}</Text>
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
        <Text style={styles.bestLabel}>{subj} best: {highScore}/{questions.length}</Text>
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
  body: { flex: 1, padding: 24, gap: 16, alignItems: 'center' },
  bestLabel: { fontSize: 12, color: Colors.muted },
  question: { fontSize: 18, fontWeight: '800', color: Colors.text, textAlign: 'center', lineHeight: 25, marginTop: 6 },
  opts: { width: '100%', gap: 10, marginTop: 6 },
  opt: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderRadius: Radius.md, borderWidth: 1.5 },
  optLetter: { fontSize: 14, fontWeight: '900', color: Colors.muted, width: 20 },
  optText: { fontSize: 14, color: Colors.text, flex: 1 },
  highScoreNote: { textAlign: 'center', color: Colors.muted, fontSize: 13, marginBottom: 20 },
});
