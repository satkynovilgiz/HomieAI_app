
import { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useDispatch, useSelector } from 'react-redux';
import * as Haptics from 'expo-haptics';
import Svg, { Circle } from 'react-native-svg';
import { RootState } from '../../store';
import { addXP } from '../../store/slices/userSlice';
import { Colors, Radius } from '../../constants/theme';
import { formatTime } from '../../lib/utils';
import HomieBot from '../../components/mascot/HomieBot';

const MODES = [
  { label: 'Focus', time: 25 * 60, color: Colors.purple },
  { label: 'Short Break', time: 5 * 60, color: Colors.green },
  { label: 'Long Break', time: 15 * 60, color: Colors.blue },
];

const SIZE = 240;
const STROKE = 16;
const RADIUS = (SIZE - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export default function PomodoroScreen() {
  const dispatch = useDispatch();
  const [modeIdx, setModeIdx] = useState(0);
  const [timeLeft, setTimeLeft] = useState(MODES[0].time);
  const [running, setRunning] = useState(false);
  const [sessions, setSessions] = useState(0);
  const [task, setTask] = useState('');
  const ref = useRef<ReturnType<typeof setInterval> | null>(null);
  const mode = MODES[modeIdx];
  const pct = timeLeft / mode.time;

  useEffect(() => {
    if (running) {
      ref.current = setInterval(() => {
        setTimeLeft(t => {
          if (t <= 1) {
            clearInterval(ref.current!);
            setRunning(false);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            if (modeIdx === 0) { setSessions(s => s + 1); dispatch(addXP(15)); }
            return 0;
          }
          return t - 1;
        });
      }, 1000);
    } else {
      if (ref.current) clearInterval(ref.current);
    }
    return () => { if (ref.current) clearInterval(ref.current); };
  }, [running]);

  const switchMode = (i: number) => {
    setModeIdx(i); setTimeLeft(MODES[i].time); setRunning(false);
  };

  const strokeDashoffset = CIRCUMFERENCE * (1 - pct);

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Text style={styles.backArrow}>←</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Pomodoro Timer</Text>
        </View>

        {/* Mode tabs */}
        <View style={styles.tabs}>
          {MODES.map((m, i) => (
            <TouchableOpacity key={i} onPress={() => switchMode(i)}
              style={[styles.tab, modeIdx === i && { backgroundColor: m.color + '2a', borderColor: m.color }]}>
              <Text style={[styles.tabText, modeIdx === i && { color: m.color }]}>{m.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Timer ring */}
        <View style={styles.timerContainer}>
          <Svg width={SIZE} height={SIZE} style={styles.ring}>
            <Circle
              cx={SIZE / 2} cy={SIZE / 2} r={RADIUS}
              stroke={Colors.bg3} strokeWidth={STROKE} fill="none"
            />
            <Circle
              cx={SIZE / 2} cy={SIZE / 2} r={RADIUS}
              stroke={mode.color} strokeWidth={STROKE} fill="none"
              strokeLinecap="round"
              strokeDasharray={CIRCUMFERENCE}
              strokeDashoffset={strokeDashoffset}
              rotation={-90}
              origin={`${SIZE / 2}, ${SIZE / 2}`}
            />
          </Svg>
          <View style={styles.timerCenter}>
            <Text style={[styles.timerText, { color: mode.color }]}>{formatTime(timeLeft)}</Text>
            <Text style={styles.timerMode}>{mode.label}</Text>
          </View>
        </View>

        {/* Task input */}
        <TextInput
          style={styles.taskInput}
          value={task} onChangeText={setTask}
          placeholder="what are you working on?"
          placeholderTextColor={Colors.muted}
        />

        {/* Controls */}
        <View style={styles.controls}>
          <TouchableOpacity onPress={() => { setTimeLeft(mode.time); setRunning(false); }} style={styles.resetBtn}>
            <Text style={styles.resetText}>reset</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setRunning(!running)}
            style={[styles.startBtn, { backgroundColor: mode.color }]}>
            <Text style={styles.startText}>
              {running ? '⏸ pause' : timeLeft === mode.time ? '▶ start' : '▶ resume'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Session dots */}
        <View style={styles.dots}>
          {[...Array(Math.max(4, sessions + 1))].map((_, i) => (
            <View key={i} style={[styles.dot, i < sessions && { backgroundColor: mode.color, borderColor: mode.color }]}/>
          ))}
          <Text style={styles.sessionCount}>{sessions} session{sessions !== 1 ? 's' : ''} today</Text>
        </View>

        {/* HOMIE tip */}
        <View style={styles.tipCard}>
          <HomieBot mood={running ? 'happy' : 'thinking'} size={56}/>
          <Text style={styles.tipText}>
            {running && modeIdx === 0
              ? "you're locked in bro, phone down, let's crush it"
              : running
              ? "real break: stretch, water, rest your eyes"
              : "commit to 25 mins of pure focus. you got this"}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  container: { padding: 20, alignItems: 'center' },
  header: { flexDirection: 'row', alignItems: 'center', width: '100%', marginBottom: 24, gap: 12 },
  backBtn: { padding: 4 },
  backArrow: { fontSize: 24, color: Colors.text },
  title: { fontSize: 22, fontWeight: '900', color: Colors.text },
  tabs: { flexDirection: 'row', gap: 8, width: '100%', marginBottom: 32 },
  tab: { flex: 1, paddingVertical: 12, borderRadius: Radius.lg, backgroundColor: Colors.bg3, borderWidth: 1.5, borderColor: Colors.border, alignItems: 'center', gap: 3 },
  tabEmoji: { fontSize: 16 },
  tabText: { fontSize: 11, fontWeight: '700', color: Colors.muted },
  timerContainer: { width: SIZE, height: SIZE, alignItems: 'center', justifyContent: 'center', marginBottom: 28 },
  ring: { position: 'absolute' },
  timerCenter: { alignItems: 'center' },
  timerText: { fontSize: 52, fontWeight: '900', fontVariant: ['tabular-nums'] },
  timerMode: { fontSize: 14, color: Colors.muted, marginTop: 6 },
  taskInput: { width: '100%', backgroundColor: Colors.bg3, borderWidth: 1, borderColor: Colors.border, borderRadius: Radius.md, color: Colors.text, padding: 13, fontSize: 14, textAlign: 'center', marginBottom: 20 },
  controls: { flexDirection: 'row', gap: 12, marginBottom: 24, width: '100%' },
  resetBtn: { paddingHorizontal: 24, paddingVertical: 13, backgroundColor: Colors.bg3, borderWidth: 1, borderColor: Colors.border, borderRadius: Radius.md },
  resetText: { fontSize: 15, fontWeight: '700', color: Colors.text },
  startBtn: { flex: 1, paddingVertical: 14, borderRadius: Radius.md, alignItems: 'center' },
  startText: { fontSize: 16, fontWeight: '800', color: Colors.white },
  dots: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 28 },
  dot: { width: 14, height: 14, borderRadius: 7, backgroundColor: Colors.bg3, borderWidth: 2, borderColor: Colors.border },
  sessionCount: { fontSize: 13, color: Colors.muted, marginLeft: 4 },
  tipCard: { flexDirection: 'row', alignItems: 'center', gap: 14, padding: 16, backgroundColor: Colors.bg2, borderRadius: Radius.lg, borderWidth: 1, borderColor: Colors.border, width: '100%' },
  tipText: { flex: 1, fontSize: 13, color: Colors.text2, lineHeight: 20 },
});
