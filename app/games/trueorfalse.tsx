import { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, PanResponder } from 'react-native';
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
  { question: 'The mitochondria is the powerhouse of the cell', answer: 'true' },
  { question: 'The sun revolves around the Earth', answer: 'false' },
  { question: 'Water boils at 100°C at sea level', answer: 'true' },
  { question: 'Humans have 5 senses total, no more no less', answer: 'false' },
  { question: 'A derivative measures the rate of change of a function', answer: 'true' },
  { question: 'Shakespeare wrote in modern English', answer: 'false' },
  { question: '0 is a prime number', answer: 'false' },
  { question: 'The French Revolution started in 1789', answer: 'true' },
  { question: 'DNA is shaped like a double helix', answer: 'true' },
  { question: 'JavaScript and Java are the same language', answer: 'false' },
];

export default function TrueOrFalseGame() {
  const dispatch = useDispatch();
  const { subject } = useLocalSearchParams<{ subject?: string }>();
  const subj = subject || 'General';

  const [cards, setCards] = useState<GameQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [idx, setIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [xpEarned, setXpEarned] = useState(0);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [paused, setPaused] = useState(false);
  const [done, setDone] = useState(false);
  const startRef = useRef(Date.now());
  const pos = useRef(new Animated.ValueXY()).current;

  useEffect(() => {
    generateGameQuestions('true or false', subj, '').then(gen => {
      const list = gen.filter(q => q.question && /true|false/i.test(q.answer)).slice(0, 10);
      setCards(list.length ? list : FALLBACK);
      setLoading(false);
    });
  }, []);

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dx) > 6,
      onPanResponderMove: Animated.event([null, { dx: pos.x, dy: pos.y }], { useNativeDriver: false }),
      onPanResponderRelease: (_, g) => {
        if (g.dx > 100) answer(true);
        else if (g.dx < -100) answer(false);
        else Animated.spring(pos, { toValue: { x: 0, y: 0 }, useNativeDriver: false }).start();
      },
    })
  ).current;

  const answer = (guessTrue: boolean) => {
    if (feedback || !cards[idx]) return;
    const correct = (guessTrue ? 'true' : 'false') === cards[idx].answer.toLowerCase().trim();
    Animated.timing(pos, { toValue: { x: guessTrue ? 500 : -500, y: 0 }, duration: 220, useNativeDriver: false }).start(() => {
      pos.setValue({ x: 0, y: 0 });
      if (idx + 1 >= cards.length) {
        if (correct && score + 1 === cards.length) { setXpEarned(x => x + 50); dispatch(addXP(50)); }
        setDone(true);
      } else {
        setIdx(i => i + 1);
      }
      setFeedback(null);
    });
    if (correct) {
      setScore(s => s + 1); setXpEarned(x => x + 10);
      dispatch(addXP(10)); dispatch(addCorrect());
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
    setFeedback(correct ? 'correct' : 'wrong');
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.loadingWrap}>
          <HomieBot mood="thinking" size={100} />
          <Text style={styles.loadingText}>cooking up {subj} statements...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (done) {
    return (
      <SafeAreaView style={styles.safe}>
        <ResultsScreen
          score={score} total={cards.length} xpEarned={xpEarned}
          timeSeconds={Math.round((Date.now() - startRef.current) / 1000)}
          onPlayAgain={() => { setIdx(0); setScore(0); setXpEarned(0); setDone(false); startRef.current = Date.now(); }}
          onNewGame={() => router.replace('/games')}
        />
      </SafeAreaView>
    );
  }

  const rotate = pos.x.interpolate({ inputRange: [-300, 0, 300], outputRange: ['-18deg', '0deg', '18deg'] });

  return (
    <SafeAreaView style={styles.safe}>
      <GameHeader onBack={() => router.back()} onPause={() => setPaused(true)} score={score} current={idx} total={cards.length} xpEarned={xpEarned} />
      {paused && <PauseOverlay onResume={() => setPaused(false)} onQuit={() => router.replace('/games')} />}

      <View style={styles.body}>
        <Text style={styles.instructions}>Swipe right for TRUE, left for FALSE</Text>
        <View style={styles.cardStack}>
          <Animated.View
            {...panResponder.panHandlers}
            style={[styles.card, { transform: [{ translateX: pos.x }, { translateY: pos.y }, { rotate }] }]}
          >
            <Text style={styles.cardText}>{cards[idx]?.question}</Text>
          </Animated.View>
        </View>

        <View style={styles.btnRow}>
          <TouchableOpacity onPress={() => answer(false)} disabled={!!feedback} style={[styles.answerBtn, styles.falseBtn]}>
            <Text style={styles.answerBtnText}>False</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => answer(true)} disabled={!!feedback} style={[styles.answerBtn, styles.trueBtn]}>
            <Text style={styles.answerBtnText}>True</Text>
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
  body: { flex: 1, alignItems: 'center', padding: 20, gap: 24 },
  instructions: { fontSize: 13, color: Colors.muted, marginTop: 6 },
  cardStack: { flex: 1, width: '100%', alignItems: 'center', justifyContent: 'center' },
  card: { width: '90%', minHeight: 220, backgroundColor: Colors.bg3, borderRadius: Radius.xl, borderWidth: 1, borderColor: Colors.border2, alignItems: 'center', justifyContent: 'center', padding: 28 },
  cardText: { fontSize: 19, fontWeight: '700', color: Colors.text, textAlign: 'center', lineHeight: 27 },
  btnRow: { flexDirection: 'row', gap: 16, width: '100%', marginBottom: 20 },
  answerBtn: { flex: 1, paddingVertical: 16, borderRadius: Radius.md, alignItems: 'center', borderWidth: 1.5 },
  falseBtn: { backgroundColor: 'rgba(239,68,68,0.12)', borderColor: Colors.red },
  trueBtn: { backgroundColor: 'rgba(16,185,129,0.12)', borderColor: Colors.green },
  answerBtnText: { fontSize: 16, fontWeight: '800', color: Colors.text },
});
