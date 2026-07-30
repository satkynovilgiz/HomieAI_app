import { useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { useDispatch } from 'react-redux';
import * as Haptics from 'expo-haptics';
import { addXP } from '../../store/slices/userSlice';
import { Colors, Radius } from '../../constants/theme';
import { generateGameQuestions, GameQuestion } from '../../lib/gemini';
import HomieBot from '../../components/mascot/HomieBot';
import GameHeader, { PauseOverlay } from '../../components/games/GameHeader';
import ResultsScreen from '../../components/games/ResultsScreen';

const PAIR_COUNT = 6;

const FALLBACK: GameQuestion[] = [
  { question: 'Derivative', answer: 'Rate of change' },
  { question: 'Mitochondria', answer: 'Powerhouse of the cell' },
  { question: 'Prime number', answer: 'Divisible only by 1 and itself' },
  { question: 'Photosynthesis', answer: 'Plants making food from light' },
  { question: 'DNA', answer: 'Carries genetic instructions' },
  { question: 'Variable', answer: 'Named container for a value' },
];

interface Card { pairIndex: number; kind: 'term' | 'definition'; text: string; }

function shuffleArr<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function MatchingPairsGame() {
  const dispatch = useDispatch();
  const { subject } = useLocalSearchParams<{ subject?: string }>();
  const subj = subject || 'General';

  const [pairs, setPairs] = useState<GameQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [cards, setCards] = useState<Card[]>([]);
  const [flipped, setFlipped] = useState<number[]>([]);
  const [matched, setMatched] = useState<Set<number>>(new Set());
  const [xpEarned, setXpEarned] = useState(0);
  const [paused, setPaused] = useState(false);
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);
  const startRef = useRef(Date.now());

  useEffect(() => {
    generateGameQuestions('matching pairs term and definition', subj, '').then(gen => {
      const list = gen.filter(q => q.question && q.answer).slice(0, PAIR_COUNT);
      const final = list.length ? list : FALLBACK;
      setPairs(final);
      const built: Card[] = [];
      final.forEach((p, i) => { built.push({ pairIndex: i, kind: 'term', text: p.question }, { pairIndex: i, kind: 'definition', text: p.answer }); });
      setCards(shuffleArr(built));
      setLoading(false);
    });
  }, []);

  const tapCard = (i: number) => {
    if (busy || paused || flipped.includes(i) || matched.has(cards[i].pairIndex) || flipped.length === 2) return;
    const next = [...flipped, i];
    setFlipped(next);
    if (next.length === 2) {
      setBusy(true);
      const [a, b] = next;
      const isMatch = cards[a].pairIndex === cards[b].pairIndex && cards[a].kind !== cards[b].kind;
      setTimeout(() => {
        if (isMatch) {
          setMatched(prev => new Set(prev).add(cards[a].pairIndex));
          setXpEarned(x => x + 20);
          dispatch(addXP(20));
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          if (matched.size + 1 === pairs.length) setDone(true);
        } else {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        }
        setFlipped([]);
        setBusy(false);
      }, 700);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.loadingWrap}>
          <HomieBot mood="thinking" size={100} />
          <Text style={styles.loadingText}>shuffling {subj} pairs...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (done) {
    return (
      <SafeAreaView style={styles.safe}>
        <ResultsScreen
          score={matched.size} total={pairs.length} xpEarned={xpEarned}
          timeSeconds={Math.round((Date.now() - startRef.current) / 1000)}
          onPlayAgain={() => { setCards(shuffleArr(cards)); setFlipped([]); setMatched(new Set()); setXpEarned(0); setDone(false); startRef.current = Date.now(); }}
          onNewGame={() => router.replace('/games')}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <GameHeader onBack={() => router.back()} onPause={() => setPaused(true)} score={matched.size} total={pairs.length} xpEarned={xpEarned} />
      {paused && <PauseOverlay onResume={() => setPaused(false)} onQuit={() => router.replace('/games')} />}

      <View style={styles.grid}>
        {cards.map((c, i) => {
          const isFlipped = flipped.includes(i) || matched.has(c.pairIndex);
          const isMatched = matched.has(c.pairIndex);
          return (
            <TouchableOpacity
              key={i} onPress={() => tapCard(i)} disabled={isFlipped}
              style={[styles.card, isFlipped && styles.cardFlipped, isMatched && styles.cardMatched]}
            >
              <Text style={[styles.cardText, !isFlipped && styles.cardTextHidden]} numberOfLines={4}>
                {isFlipped ? c.text : '?'}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  loadingWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 14 },
  loadingText: { color: Colors.muted, fontSize: 14 },
  grid: { flex: 1, flexDirection: 'row', flexWrap: 'wrap', padding: 12, gap: 10, alignContent: 'flex-start' },
  card: { width: '30%', aspectRatio: 0.85, backgroundColor: Colors.bg3, borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.border2, alignItems: 'center', justifyContent: 'center', padding: 6 },
  cardFlipped: { backgroundColor: 'rgba(124,58,237,0.12)', borderColor: Colors.purpleL },
  cardMatched: { backgroundColor: 'rgba(16,185,129,0.12)', borderColor: Colors.green },
  cardText: { fontSize: 11, color: Colors.text, textAlign: 'center', fontWeight: '700' },
  cardTextHidden: { fontSize: 22, color: Colors.muted },
});
