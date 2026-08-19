import { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { useDispatch, useSelector } from 'react-redux';
import * as Haptics from 'expo-haptics';
import { RootState } from '../../store';
import { addXP, addCorrect } from '../../store/slices/userSlice';
import { Colors, Radius } from '../../constants/theme';
import { generateGameQuestions, GameQuestion } from '../../lib/gemini';
import HomieBot from '../../components/mascot/HomieBot';
import GameHeader, { PauseOverlay } from '../../components/games/GameHeader';
import ResultsScreen from '../../components/games/ResultsScreen';

const FALLBACK: GameQuestion[] = [
  { question: 'A measure of how fast something changes', answer: 'DERIVATIVE' },
  { question: 'The building block of matter', answer: 'ATOM' },
  { question: 'Genetic material that carries instructions for life', answer: 'DNA' },
  { question: 'A number that only divides by 1 and itself', answer: 'PRIME' },
  { question: 'The force that pulls objects toward Earth', answer: 'GRAVITY' },
  { question: 'A story passed down about the past', answer: 'HISTORY' },
  { question: 'The smallest unit of a language', answer: 'WORD' },
  { question: 'A repeating pattern in math', answer: 'SEQUENCE' },
  { question: 'The process plants use to make food from light', answer: 'PHOTOSYNTHESIS' },
  { question: 'A programming instruction that repeats', answer: 'LOOP' },
];

const ROUND_SECONDS = 30;

function shuffle(word: string): string[] {
  const letters = word.split('');
  for (let i = letters.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [letters[i], letters[j]] = [letters[j], letters[i]];
  }
  // A shuffle that happens to match the original order is a boring puzzle —
  // reshuffle once if that happens (letters.length > 1 guards single-letter edge case).
  if (letters.join('') === word && letters.length > 1) return shuffle(word);
  return letters;
}

export default function WordScrambleGame() {
  const dispatch = useDispatch();
  const { subject } = useLocalSearchParams<{ subject?: string }>();
  const subj = subject || 'General';

  const [questions, setQuestions] = useState<GameQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [idx, setIdx] = useState(0);
  const [tiles, setTiles] = useState<{ letter: string; used: boolean }[]>([]);
  const [guess, setGuess] = useState<number[]>([]);
  const [timeLeft, setTimeLeft] = useState(ROUND_SECONDS);
  const [score, setScore] = useState(0);
  const [xpEarned, setXpEarned] = useState(0);
  const [status, setStatus] = useState<'playing' | 'correct' | 'wrong'>('playing');
  const [paused, setPaused] = useState(false);
  const [done, setDone] = useState(false);
  const startRef = useRef(Date.now());

  useEffect(() => {
    generateGameQuestions('word scramble', subj, '').then(gen => {
      const list = gen.filter(q => q.answer && q.answer.trim().length >= 3).slice(0, 10);
      setQuestions(list.length ? list : FALLBACK);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    if (loading || !questions[idx]) return;
    setTiles(shuffle(questions[idx].answer.toUpperCase().replace(/[^A-Z]/g, '')).map(letter => ({ letter, used: false })));
    setGuess([]);
    setTimeLeft(ROUND_SECONDS);
    setStatus('playing');
  }, [idx, loading, questions]);

  useEffect(() => {
    if (loading || done || paused || status !== 'playing') return;
    if (timeLeft <= 0) { advance(false); return; }
    const t = setTimeout(() => setTimeLeft(s => s - 1), 1000);
    return () => clearTimeout(t);
  }, [timeLeft, loading, done, paused, status]);

  const currentWord = questions[idx]?.answer.toUpperCase().replace(/[^A-Z]/g, '') || '';
  const guessedWord = guess.map(i => tiles[i]?.letter).join('');

  const tapTile = (tileIdx: number) => {
    if (status !== 'playing' || tiles[tileIdx].used) return;
    const nextGuess = [...guess, tileIdx];
    const nextTiles = tiles.map((t, i) => i === tileIdx ? { ...t, used: true } : t);
    setGuess(nextGuess);
    setTiles(nextTiles);
    if (nextGuess.length === currentWord.length) {
      const word = nextGuess.map(i => nextTiles[i].letter).join('');
      if (word === currentWord) advance(true);
      else { setStatus('wrong'); Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error); setTimeout(() => { setGuess([]); setTiles(tiles.map(t => ({ ...t, used: false }))); setStatus('playing'); }, 900); }
    }
  };

  const clearGuess = () => { setGuess([]); setTiles(tiles.map(t => ({ ...t, used: false }))); };

  const advance = (correct: boolean) => {
    if (correct) {
      setScore(s => s + 1);
      setXpEarned(x => x + 15);
      dispatch(addXP(15));
      dispatch(addCorrect());
      setStatus('correct');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    setTimeout(() => {
      if (idx + 1 >= questions.length) {
        if (correct && score + 1 === questions.length) { setXpEarned(x => x + 50); dispatch(addXP(50)); }
        setDone(true);
      } else {
        setIdx(i => i + 1);
      }
    }, correct ? 700 : 100);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.loadingWrap}>
          <HomieBot mood="thinking" size={100} />
          <Text style={styles.loadingText}>scrambling up {subj} words...</Text>
          <Text style={styles.loadingHint}>this can take up to a minute</Text>
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
        <Text style={styles.timer}>{timeLeft}s</Text>
        <Text style={styles.hint}>{questions[idx]?.question}</Text>

        <View style={styles.guessRow}>
          {currentWord.split('').map((_, i) => (
            <View key={i} style={[styles.guessSlot, status === 'wrong' && styles.guessSlotWrong, status === 'correct' && styles.guessSlotCorrect]}>
              <Text style={styles.guessLetter}>{guessedWord[i] || ''}</Text>
            </View>
          ))}
        </View>

        <View style={styles.tileGrid}>
          {tiles.map((t, i) => (
            <TouchableOpacity key={i} disabled={t.used || status !== 'playing'} onPress={() => tapTile(i)}
              style={[styles.tile, t.used && styles.tileUsed]}>
              <Text style={styles.tileLetter}>{t.letter}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity onPress={clearGuess} style={styles.clearBtn}>
          <Text style={styles.clearBtnText}>Clear</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  loadingWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 14 },
  loadingText: { color: Colors.muted, fontSize: 14 },
  loadingHint: { color: Colors.muted, fontSize: 12, opacity: 0.7 },
  body: { flex: 1, alignItems: 'center', padding: 24, gap: 20 },
  timer: { fontSize: 32, fontWeight: '900', color: Colors.purpleL, marginTop: 10 },
  hint: { fontSize: 15, color: Colors.text2, textAlign: 'center', paddingHorizontal: 10 },
  guessRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, justifyContent: 'center' },
  guessSlot: { width: 32, height: 40, borderBottomWidth: 3, borderBottomColor: Colors.purpleL, alignItems: 'center', justifyContent: 'center' },
  guessSlotWrong: { borderBottomColor: Colors.red },
  guessSlotCorrect: { borderBottomColor: Colors.green },
  guessLetter: { fontSize: 22, fontWeight: '900', color: Colors.text },
  tileGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'center' },
  tile: { width: 44, height: 44, borderRadius: 10, backgroundColor: Colors.bg3, borderWidth: 1, borderColor: Colors.border2, alignItems: 'center', justifyContent: 'center' },
  tileUsed: { opacity: 0.25 },
  tileLetter: { fontSize: 18, fontWeight: '800', color: Colors.text },
  clearBtn: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: Radius.md, backgroundColor: Colors.bg3, borderWidth: 1, borderColor: Colors.border },
  clearBtnText: { color: Colors.muted, fontWeight: '700', fontSize: 13 },
});
