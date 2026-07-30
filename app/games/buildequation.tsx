import { useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { useDispatch } from 'react-redux';
import * as Haptics from 'expo-haptics';
import { addXP, addCorrect } from '../../store/slices/userSlice';
import { Colors, Radius } from '../../constants/theme';
import HomieBot from '../../components/mascot/HomieBot';
import GameHeader, { PauseOverlay } from '../../components/games/GameHeader';
import ResultsScreen from '../../components/games/ResultsScreen';

const ROUND_LENGTH = 8;
const OPS = ['+', '-', '×'] as const;

// Numbers/operators must build to an exact result the user can drag into place
// and get checked deterministically — an AI-generated puzzle whose numbers
// don't actually add up to its own stated answer would break the game, so
// (like Math Lightning) this is generated locally instead of via Gemini.
function evalOp(a: number, op: string, b: number): number {
  return op === '+' ? a + b : op === '-' ? a - b : a * b;
}

interface Puzzle { numbers: number[]; ops: string[]; result: number; }

function makePuzzle(): Puzzle {
  const numbers = [Math.floor(Math.random() * 9) + 1, Math.floor(Math.random() * 9) + 1, Math.floor(Math.random() * 9) + 1];
  const ops = [OPS[Math.floor(Math.random() * OPS.length)], OPS[Math.floor(Math.random() * OPS.length)]];
  const result = evalOp(evalOp(numbers[0], ops[0], numbers[1]), ops[1], numbers[2]);
  return { numbers, ops, result };
}

type Tile = { id: string; kind: 'number' | 'op'; value: string | number; used: boolean };

function buildTiles(p: Puzzle): Tile[] {
  const distractNums = [Math.floor(Math.random() * 9) + 1, Math.floor(Math.random() * 9) + 1];
  const distractOps = OPS.filter(o => !p.ops.includes(o));
  const raw: Tile[] = [
    ...p.numbers.map((n, i) => ({ id: `n${i}`, kind: 'number' as const, value: n, used: false })),
    ...p.ops.map((o, i) => ({ id: `o${i}`, kind: 'op' as const, value: o, used: false })),
    ...distractNums.map((n, i) => ({ id: `dn${i}`, kind: 'number' as const, value: n, used: false })),
    { id: 'do0', kind: 'op' as const, value: distractOps[0] || '+', used: false },
  ];
  for (let i = raw.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [raw[i], raw[j]] = [raw[j], raw[i]];
  }
  return raw;
}

export default function BuildEquationGame() {
  const dispatch = useDispatch();
  const { subject } = useLocalSearchParams<{ subject?: string }>();
  const subj = subject || 'Math';
  const allowed = subj === 'Math' || subj === 'Science';

  const [round, setRound] = useState(0);
  const [puzzle, setPuzzle] = useState<Puzzle>(() => makePuzzle());
  const [tiles, setTiles] = useState<Tile[]>(() => buildTiles(puzzle));
  const [slots, setSlots] = useState<(number | null)[]>([null, null, null, null, null]);
  const [status, setStatus] = useState<'playing' | 'correct' | 'wrong'>('playing');
  const [score, setScore] = useState(0);
  const [xpEarned, setXpEarned] = useState(0);
  const [paused, setPaused] = useState(false);
  const [done, setDone] = useState(false);
  const startRef = useRef(Date.now());

  if (!allowed) {
    return (
      <SafeAreaView style={styles.safe}>
        <GameHeader onBack={() => router.back()} />
        <View style={styles.loadingWrap}>
          <HomieBot mood="sad" size={90} />
          <Text style={styles.loadingText}>Build the Equation is only available for Math and Science</Text>
          <TouchableOpacity onPress={() => router.replace({ pathname: '/games/buildequation', params: { subject: 'Math' } })} style={styles.submitBtn}>
            <Text style={styles.submitBtnText}>Play as Math</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const nextEmptySlot = slots.findIndex(s => s === null);

  const tapTile = (tileIdx: number) => {
    if (status !== 'playing' || tiles[tileIdx].used || nextEmptySlot === -1) return;
    const newSlots = [...slots]; newSlots[nextEmptySlot] = tileIdx;
    const newTiles = tiles.map((t, i) => i === tileIdx ? { ...t, used: true } : t);
    setSlots(newSlots); setTiles(newTiles);
    if (!newSlots.includes(null)) checkAnswer(newSlots, newTiles);
  };

  const tapSlot = (slotIdx: number) => {
    if (status !== 'playing' || slots[slotIdx] === null) return;
    const tileIdx = slots[slotIdx]!;
    setSlots(slots.map((s, i) => i === slotIdx ? null : s));
    setTiles(tiles.map((t, i) => i === tileIdx ? { ...t, used: false } : t));
  };

  const checkAnswer = (finalSlots: (number | null)[], finalTiles: Tile[]) => {
    const values = finalSlots.map(i => finalTiles[i!].value);
    const built = evalOp(evalOp(Number(values[0]), String(values[1]), Number(values[2])), String(values[3]), Number(values[4]));
    const correct = built === puzzle.result;
    setStatus(correct ? 'correct' : 'wrong');
    if (correct) {
      setScore(s => s + 1); setXpEarned(x => x + 25);
      dispatch(addXP(25)); dispatch(addCorrect());
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
    setTimeout(() => {
      if (round + 1 >= ROUND_LENGTH) {
        if (correct && score + 1 === ROUND_LENGTH) { setXpEarned(x => x + 50); dispatch(addXP(50)); }
        setDone(true);
      } else {
        const p = makePuzzle();
        setPuzzle(p); setTiles(buildTiles(p)); setSlots([null, null, null, null, null]);
        setRound(r => r + 1); setStatus('playing');
      }
    }, 1500);
  };

  if (done) {
    return (
      <SafeAreaView style={styles.safe}>
        <ResultsScreen
          score={score} total={ROUND_LENGTH} xpEarned={xpEarned}
          timeSeconds={Math.round((Date.now() - startRef.current) / 1000)}
          onPlayAgain={() => { const p = makePuzzle(); setPuzzle(p); setTiles(buildTiles(p)); setSlots([null, null, null, null, null]); setRound(0); setScore(0); setXpEarned(0); setDone(false); setStatus('playing'); startRef.current = Date.now(); }}
          onNewGame={() => router.replace('/games')}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <GameHeader onBack={() => router.back()} onPause={() => setPaused(true)} score={score} current={round} total={ROUND_LENGTH} xpEarned={xpEarned} />
      {paused && <PauseOverlay onResume={() => setPaused(false)} onQuit={() => router.replace('/games')} />}

      <View style={styles.body}>
        <Text style={styles.goal}>Build an equation that equals {puzzle.result}</Text>

        <View style={styles.slotRow}>
          {slots.map((tileIdx, i) => (
            <TouchableOpacity key={i} onPress={() => tapSlot(i)} style={[styles.slot, tileIdx !== null && styles.slotFilled, status === 'correct' && styles.slotCorrect, status === 'wrong' && styles.slotWrong]}>
              <Text style={styles.slotText}>{tileIdx !== null ? tiles[tileIdx].value : ''}</Text>
            </TouchableOpacity>
          ))}
          <Text style={styles.equalsSign}>= {puzzle.result}</Text>
        </View>

        {status === 'wrong' && <Text style={styles.wrongNote}>not quite — try the next one</Text>}

        <View style={styles.tileBank}>
          {tiles.map((t, i) => (
            <TouchableOpacity key={t.id} disabled={t.used || status !== 'playing'} onPress={() => tapTile(i)}
              style={[styles.tile, t.kind === 'op' && styles.opTile, t.used && styles.tileUsed]}>
              <Text style={styles.tileText}>{t.value}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  loadingWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16, padding: 24 },
  loadingText: { color: Colors.muted, fontSize: 14, textAlign: 'center' },
  body: { flex: 1, alignItems: 'center', padding: 24, gap: 24 },
  goal: { fontSize: 18, fontWeight: '800', color: Colors.text, textAlign: 'center', marginTop: 10 },
  slotRow: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap', justifyContent: 'center' },
  slot: { width: 46, height: 46, borderRadius: 10, backgroundColor: Colors.bg3, borderWidth: 2, borderColor: Colors.border2, alignItems: 'center', justifyContent: 'center' },
  slotFilled: { borderColor: Colors.purpleL, backgroundColor: 'rgba(124,58,237,0.12)' },
  slotCorrect: { borderColor: Colors.green, backgroundColor: 'rgba(16,185,129,0.15)' },
  slotWrong: { borderColor: Colors.red, backgroundColor: 'rgba(239,68,68,0.12)' },
  slotText: { fontSize: 18, fontWeight: '800', color: Colors.text },
  equalsSign: { fontSize: 18, fontWeight: '800', color: Colors.text, marginLeft: 6 },
  wrongNote: { color: Colors.red, fontSize: 13 },
  tileBank: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, justifyContent: 'center' },
  tile: { width: 48, height: 48, borderRadius: 10, backgroundColor: Colors.bg3, borderWidth: 1, borderColor: Colors.border2, alignItems: 'center', justifyContent: 'center' },
  opTile: { backgroundColor: 'rgba(249,115,22,0.12)', borderColor: 'rgba(249,115,22,0.4)' },
  tileUsed: { opacity: 0.2 },
  tileText: { fontSize: 18, fontWeight: '800', color: Colors.text },
  submitBtn: { paddingHorizontal: 24, paddingVertical: 13, borderRadius: Radius.md, backgroundColor: Colors.purple },
  submitBtnText: { color: Colors.white, fontWeight: '800', fontSize: 14 },
});
