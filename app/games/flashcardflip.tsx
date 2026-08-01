import { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, PanResponder } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { useDispatch, useSelector } from 'react-redux';
import * as Haptics from 'expo-haptics';
import { addXP } from '../../store/slices/userSlice';
import { Colors, Radius } from '../../constants/theme';
import { generateGameQuestions, GameQuestion } from '../../lib/gemini';
import { RootState } from '../../store';
import HomieBot from '../../components/mascot/HomieBot';
import GameHeader, { PauseOverlay } from '../../components/games/GameHeader';
import ResultsScreen from '../../components/games/ResultsScreen';

const FALLBACK: GameQuestion[] = [
  { question: 'Derivative', answer: 'The rate of change of a function at a point' },
  { question: 'Mitochondria', answer: 'The organelle that produces energy for the cell' },
  { question: 'Photosynthesis', answer: 'How plants convert light into food' },
  { question: 'Prime number', answer: 'A number divisible only by 1 and itself' },
  { question: 'DNA', answer: 'The molecule that carries genetic instructions' },
  { question: 'Renaissance', answer: 'A period of cultural rebirth in Europe (14th-17th century)' },
  { question: 'Variable', answer: 'A named container for a value in programming' },
  { question: 'Momentum', answer: 'Mass times velocity of a moving object' },
  { question: 'Metaphor', answer: 'A figure of speech comparing two unlike things directly' },
  { question: 'Ecosystem', answer: 'A community of living things interacting with their environment' },
];

export default function FlashcardFlipGame() {
  const dispatch = useDispatch();
  const { subject, lectureId } = useLocalSearchParams<{ subject?: string; lectureId?: string }>();
  const subj = subject || 'General';
  const lecture = useSelector((s: RootState) => (lectureId ? s.recorder.lectures.find(l => l.id === lectureId) : undefined));

  const [deck, setDeck] = useState<GameQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [queue, setQueue] = useState<number[]>([]);
  const [qi, setQi] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [mastered, setMastered] = useState<Set<number>>(new Set());
  const [xpEarned, setXpEarned] = useState(0);
  const [paused, setPaused] = useState(false);
  const [done, setDone] = useState(false);
  const startRef = useRef(Date.now());
  const pos = useRef(new Animated.ValueXY()).current;
  const flipAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (lecture) {
      const cards = (lecture.notes?.flashcards || []).map(f => ({ question: f.front, answer: f.back }));
      const final = cards.length ? cards : FALLBACK;
      setDeck(final);
      setQueue(final.map((_, i) => i));
      setLoading(false);
      return;
    }
    generateGameQuestions('flashcard', subj, '').then(gen => {
      const list = gen.filter(q => q.question && q.answer).slice(0, 10);
      const final = list.length ? list : FALLBACK;
      setDeck(final);
      setQueue(final.map((_, i) => i));
      setLoading(false);
    });
  }, []);

  const flip = () => {
    Animated.timing(flipAnim, { toValue: flipped ? 0 : 1, duration: 300, useNativeDriver: true }).start();
    setFlipped(f => !f);
  };

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dx) > 6,
      onPanResponderMove: Animated.event([null, { dx: pos.x }], { useNativeDriver: false }),
      onPanResponderRelease: (_, g) => {
        if (g.dx > 90) markCard(true);
        else if (g.dx < -90) markCard(false);
        else Animated.spring(pos, { toValue: { x: 0, y: 0 }, useNativeDriver: false }).start();
      },
    })
  ).current;

  const markCard = (gotIt: boolean) => {
    const cardIdx = queue[qi];
    Animated.timing(pos, { toValue: { x: gotIt ? 500 : -500, y: 0 }, duration: 220, useNativeDriver: false }).start(() => {
      pos.setValue({ x: 0, y: 0 });
      setFlipped(false);
      flipAnim.setValue(0);

      const newlyMastered = gotIt && !mastered.has(cardIdx);
      if (newlyMastered) {
        setMastered(prev => new Set(prev).add(cardIdx));
        setXpEarned(x => x + 5);
        dispatch(addXP(5));
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } else if (!gotIt) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      }

      const nextQueue = gotIt ? queue : [...queue, cardIdx];
      if (qi + 1 >= nextQueue.length) {
        setDone(true);
      } else {
        setQueue(nextQueue);
        setQi(i => i + 1);
      }
    });
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.loadingWrap}>
          <HomieBot mood="thinking" size={100} />
          <Text style={styles.loadingText}>building {subj} flashcards...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (done) {
    const masteryPct = deck.length ? Math.round((mastered.size / deck.length) * 100) : 0;
    return (
      <SafeAreaView style={styles.safe}>
        <ResultsScreen
          score={mastered.size} total={deck.length} xpEarned={xpEarned}
          timeSeconds={Math.round((Date.now() - startRef.current) / 1000)}
          onPlayAgain={() => { setQueue(deck.map((_, i) => i)); setQi(0); setMastered(new Set()); setXpEarned(0); setDone(false); startRef.current = Date.now(); }}
          onNewGame={() => router.replace('/games')}
        />
        <Text style={styles.masteryNote}>mastery: {masteryPct}%</Text>
      </SafeAreaView>
    );
  }

  const card = deck[queue[qi]];
  const rotateY = flipAnim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '180deg'] });
  const backRotateY = flipAnim.interpolate({ inputRange: [0, 1], outputRange: ['180deg', '360deg'] });
  const frontOpacity = flipAnim.interpolate({ inputRange: [0, 0.5, 0.5, 1], outputRange: [1, 1, 0, 0] });
  const backOpacity = flipAnim.interpolate({ inputRange: [0, 0.5, 0.5, 1], outputRange: [0, 0, 1, 1] });

  return (
    <SafeAreaView style={styles.safe}>
      <GameHeader onBack={() => router.back()} onPause={() => setPaused(true)} score={mastered.size} current={qi} total={queue.length} xpEarned={xpEarned} />
      {paused && <PauseOverlay onResume={() => setPaused(false)} onQuit={() => router.replace('/games')} />}

      <View style={styles.body}>
        <Text style={styles.instructions}>Tap to flip - swipe right if you got it, left to review again</Text>
        <View style={styles.cardStack}>
          <Animated.View {...panResponder.panHandlers} style={[styles.cardWrap, { transform: [{ translateX: pos.x }] }]}>
            <TouchableOpacity activeOpacity={0.9} onPress={flip} style={StyleSheet.absoluteFillObject}>
              <Animated.View style={[styles.card, styles.cardFront, { opacity: frontOpacity, transform: [{ rotateY }] }]}>
                <Text style={styles.cardLabel}>TERM</Text>
                <Text style={styles.cardText}>{card.question}</Text>
              </Animated.View>
              <Animated.View style={[styles.card, styles.cardBack, { opacity: backOpacity, transform: [{ rotateY: backRotateY }] }]}>
                <Text style={styles.cardLabel}>DEFINITION</Text>
                <Text style={styles.cardText}>{card.answer}</Text>
              </Animated.View>
            </TouchableOpacity>
          </Animated.View>
        </View>

        <View style={styles.btnRow}>
          <TouchableOpacity onPress={() => markCard(false)} style={[styles.answerBtn, styles.reviewBtn]}>
            <Text style={styles.answerBtnText}>Review Again</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => markCard(true)} style={[styles.answerBtn, styles.gotItBtn]}>
            <Text style={styles.answerBtnText}>Got It</Text>
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
  body: { flex: 1, alignItems: 'center', padding: 20, gap: 20 },
  instructions: { fontSize: 12, color: Colors.muted, textAlign: 'center', marginTop: 6 },
  cardStack: { flex: 1, width: '100%', alignItems: 'center', justifyContent: 'center' },
  cardWrap: { width: '88%', height: 220 },
  card: { position: 'absolute', width: '100%', height: '100%', borderRadius: Radius.xl, borderWidth: 1, alignItems: 'center', justifyContent: 'center', padding: 24, backfaceVisibility: 'hidden' },
  cardFront: { backgroundColor: Colors.bg3, borderColor: Colors.purpleL },
  cardBack: { backgroundColor: 'rgba(124,58,237,0.12)', borderColor: Colors.purple },
  cardLabel: { fontSize: 11, fontWeight: '800', color: Colors.muted, letterSpacing: 1, marginBottom: 10 },
  cardText: { fontSize: 19, fontWeight: '700', color: Colors.text, textAlign: 'center', lineHeight: 26 },
  btnRow: { flexDirection: 'row', gap: 16, width: '100%', marginBottom: 20 },
  answerBtn: { flex: 1, paddingVertical: 16, borderRadius: Radius.md, alignItems: 'center', borderWidth: 1.5 },
  reviewBtn: { backgroundColor: 'rgba(239,68,68,0.12)', borderColor: Colors.red },
  gotItBtn: { backgroundColor: 'rgba(16,185,129,0.12)', borderColor: Colors.green },
  answerBtnText: { fontSize: 14, fontWeight: '800', color: Colors.text },
  masteryNote: { textAlign: 'center', color: Colors.muted, fontSize: 13, marginBottom: 20 },
});
