import { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, AppState, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useDispatch, useSelector } from 'react-redux';
import * as Notifications from 'expo-notifications';
import { useKeepAwake } from 'expo-keep-awake';
import Svg, { Path } from 'react-native-svg';
import { RootState } from '../../store';
import {
  startFocusSession, markLeftApp, clearLeftApp, startBreak, endBreak, completeSession, resetFocus, FocusLevel,
} from '../../store/slices/focusSlice';
import { addXP, updateUser } from '../../store/slices/userSlice';
import { updateUser as updateUserRemote } from '../../lib/authService';
import { Colors, Radius } from '../../constants/theme';
import { responsive } from '../../constants/responsive';
import { SUBJECTS } from '../../constants/subjects';
import HomieBot from '../../components/mascot/HomieBot';
import ContentWrapper from '../../components/ui/ContentWrapper';

const DURATIONS: { mins: number; label: string }[] = [
  { mins: 25, label: 'Pomodoro' },
  { mins: 45, label: 'Flow' },
  { mins: 60, label: 'Deep' },
  { mins: 90, label: 'Beast' },
];

const LEVELS: { key: FocusLevel; label: string }[] = [
  { key: 'soft', label: 'Soft — reminders only' },
  { key: 'medium', label: 'Medium — guilt trips' },
  { key: 'hard', label: 'Hard — XP penalty for leaving' },
];

const LEVEL_COPY: Record<FocusLevel, { title: string; sub: string; mood: 'thinking' | 'sad' | 'angry' }> = {
  soft: { title: 'hey you left for a bit', sub: 'no worries, let\'s get back to it', mood: 'thinking' },
  medium: { title: 'bro where did you go', sub: 'i was waiting', mood: 'sad' },
  hard: { title: 'bro seriously?', sub: 'get back now', mood: 'angry' },
};

const BREAK_TIP = 'look away from screen. walk around. drink water. your brain needs this fr';
const BREAK_SECONDS = 5 * 60;

function formatClock(totalSeconds: number): string {
  const m = Math.floor(Math.max(0, totalSeconds) / 60).toString().padStart(2, '0');
  const s = (Math.max(0, totalSeconds) % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

function formatAway(ms: number): string {
  const totalSec = Math.max(0, Math.round(ms / 1000));
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  if (m <= 0) return `${s} secs`;
  return `${m} minute${m !== 1 ? 's' : ''} ${s} secs`;
}

function formatHoursMins(totalMins: number): string {
  const h = Math.floor(totalMins / 60);
  const m = Math.round(totalMins % 60);
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

interface XPBreakdown {
  base: number;
  noBreaksBonus: number;
  noDistractionBonus: number;
  hardBonus: number;
  beastBonus: number;
  total: number;
}

function computeXP(opts: {
  elapsedSeconds: number; level: FocusLevel; durationMins: number;
  distractions: number; breaksTaken: number; endedEarly: boolean;
}): XPBreakdown {
  const minutesStudied = opts.elapsedSeconds / 60;
  if (opts.endedEarly) {
    const base = Math.round(minutesStudied * 2 * 0.5);
    return { base, noBreaksBonus: 0, noDistractionBonus: 0, hardBonus: 0, beastBonus: 0, total: base };
  }
  const base = Math.round(minutesStudied * 2);
  const noBreaksBonus = opts.breaksTaken === 0 ? 20 : 0;
  const noDistractionBonus = opts.distractions === 0 ? 30 : 0;
  const hardBonus = opts.level === 'hard' ? 50 : 0;
  const beastBonus = opts.durationMins === 90 ? 100 : 0;
  return { base, noBreaksBonus, noDistractionBonus, hardBonus, beastBonus, total: base + noBreaksBonus + noDistractionBonus + hardBonus + beastBonus };
}

function focusScore(distractions: number, breaksTaken: number): number {
  return Math.max(0, Math.min(100, 100 - distractions * 10 - breaksTaken * 5));
}

function BackArrowIcon() {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
      <Path d="M19 12H5" stroke={Colors.white} strokeWidth="2" strokeLinecap="round"/>
      <Path d="M11 6L5 12L11 18" stroke={Colors.white} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
    </Svg>
  );
}

export default function FocusScreen() {
  useKeepAwake();
  const dispatch = useDispatch();
  const focus = useSelector((s: RootState) => s.focus);
  const user = useSelector((s: RootState) => s.user.current);

  const [durationMins, setDurationMins] = useState(25);
  const [subject, setSubject] = useState(SUBJECTS[0].s);
  const [level, setLevel] = useState<FocusLevel>('medium');
  const [showDistracted, setShowDistracted] = useState(false);
  const [awayMs, setAwayMs] = useState(0);
  const [showQuitModal, setShowQuitModal] = useState(false);
  const [xpBreakdown, setXpBreakdown] = useState<XPBreakdown | null>(null);
  const [, setTick] = useState(0);
  const finalizedRef = useRef(false);

  useEffect(() => {
    if (focus.phase !== 'active' && focus.phase !== 'break') return;
    const id = setInterval(() => setTick(t => t + 1), 1000);
    return () => clearInterval(id);
  }, [focus.phase]);

  useEffect(() => {
    const sub = AppState.addEventListener('change', async (nextState) => {
      if (focus.phase !== 'active') return;
      if (nextState === 'background' || nextState === 'inactive') {
        if (focus.leftAt) return;
        dispatch(markLeftApp(Date.now()));
        try {
          await Notifications.scheduleNotificationAsync({
            content: { title: 'hey get back to studying bro', body: 'your focus session is still running. lock in.', sound: true },
            trigger: { seconds: 30 } as any,
          });
        } catch {}
      } else if (nextState === 'active' && focus.leftAt) {
        const away = Date.now() - focus.leftAt;
        setAwayMs(away);
        dispatch(clearLeftApp());
        setShowDistracted(true);
        try { await Notifications.cancelAllScheduledNotificationsAsync(); } catch {}
        if (focus.level === 'hard') dispatch(addXP(-10));
      }
    });
    return () => sub.remove();
  }, [focus.phase, focus.leftAt, focus.level, dispatch]);

  const remainingSeconds = focus.phase === 'active' && focus.endsAt
    ? Math.round((focus.endsAt - Date.now()) / 1000)
    : focus.durationMins * 60;
  const breakRemainingSeconds = focus.phase === 'break' && focus.breakEndsAt
    ? Math.round((focus.breakEndsAt - Date.now()) / 1000)
    : BREAK_SECONDS;

  const finalizeSession = (earlyEnd: boolean) => {
    if (finalizedRef.current) return;
    finalizedRef.current = true;
    const totalSeconds = focus.durationMins * 60;
    const remainingMs = focus.endsAt ? Math.max(0, focus.endsAt - Date.now()) : 0;
    const elapsedSeconds = earlyEnd ? Math.max(0, totalSeconds - Math.round(remainingMs / 1000)) : totalSeconds;
    const xp = computeXP({
      elapsedSeconds, level: focus.level, durationMins: focus.durationMins,
      distractions: focus.distractions, breaksTaken: focus.breaksTaken, endedEarly: earlyEnd,
    });
    setXpBreakdown(xp);
    dispatch(completeSession({ endedEarly: earlyEnd, elapsedSeconds }));
    dispatch(addXP(xp.total));

    if (user) {
      const minutesStudied = Math.round(elapsedSeconds / 60);
      const today = new Date().toDateString();
      const sameDay = user.focusMinutesDate === today;
      const updates = {
        bestFocusSessionMins: Math.max(user.bestFocusSessionMins || 0, minutesStudied),
        focusMinutesToday: (sameDay ? (user.focusMinutesToday || 0) : 0) + minutesStudied,
        focusMinutesDate: today,
      };
      dispatch(updateUser(updates));
      updateUserRemote(user.uid, updates).catch(() => {});
    }
  };

  useEffect(() => {
    if (focus.phase !== 'active' || !focus.endsAt || showDistracted) return;
    if (Date.now() >= focus.endsAt) finalizeSession(false);
  });

  const endBreakNow = async () => {
    dispatch(endBreak());
    try {
      await Notifications.scheduleNotificationAsync({
        content: { title: "break's over", body: 'back to studying, lock in.', sound: true },
        trigger: null,
      });
    } catch {}
  };

  useEffect(() => {
    if (focus.phase !== 'break' || !focus.breakEndsAt) return;
    if (Date.now() >= focus.breakEndsAt) endBreakNow();
  });

  const startSession = async () => {
    try { await Notifications.requestPermissionsAsync(); } catch {}
    finalizedRef.current = false;
    dispatch(startFocusSession({ durationMins, subject, level }));
  };

  const startAnother = () => {
    finalizedRef.current = false;
    setXpBreakdown(null);
    dispatch(resetFocus());
  };

  const goHome = () => {
    finalizedRef.current = false;
    dispatch(resetFocus());
    router.replace('/(tabs)');
  };

  if (!user) return null;

  const todayFocusMins = user.focusMinutesDate === new Date().toDateString() ? (user.focusMinutesToday || 0) : 0;

  // ── SETUP ──
  if (focus.phase === 'idle') {
    return (
      <SafeAreaView style={styles.safe}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32 }}>
         <ContentWrapper>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} accessibilityLabel="Go back" accessibilityRole="button">
              <BackArrowIcon />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Deep Study Mode</Text>
          </View>

          <View style={styles.hero}>
            <HomieBot mood="cool" size={100} />
            <Text style={styles.title}>Deep Study Mode</Text>
            <Text style={styles.sub}>Lock in. No distractions.</Text>
          </View>

          <Text style={styles.sectionLabel}>How long do you want to study?</Text>
          <View style={styles.durationGrid}>
            {DURATIONS.map(d => (
              <TouchableOpacity
                key={d.mins}
                onPress={() => setDurationMins(d.mins)}
                style={[styles.durationCard, durationMins === d.mins && styles.durationCardSelected]}
                activeOpacity={0.85}
              >
                <Text style={[styles.durationMins, durationMins === d.mins && styles.durationTextSelected]}>{d.mins} min</Text>
                <Text style={[styles.durationLabel, durationMins === d.mins && styles.durationTextSelected]}>{d.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.sectionLabel}>Subject for this session:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.subjectRow}>
            {SUBJECTS.map(s => (
              <TouchableOpacity
                key={s.s}
                onPress={() => setSubject(s.s)}
                style={[styles.subjectChip, subject === s.s && { backgroundColor: s.color + '2a', borderColor: s.color }]}
                activeOpacity={0.85}
              >
                <Text style={[styles.subjectChipText, subject === s.s && { color: s.color }]}>{s.s}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <Text style={styles.sectionLabel}>Focus level:</Text>
          <View style={styles.levelList}>
            {LEVELS.map(l => (
              <TouchableOpacity key={l.key} onPress={() => setLevel(l.key)} style={styles.levelRow} activeOpacity={0.8}>
                <View style={[styles.radio, level === l.key && styles.radioSelected]}>
                  {level === l.key && <View style={styles.radioDot} />}
                </View>
                <Text style={styles.levelLabel}>{l.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity style={styles.startBtn} onPress={startSession} activeOpacity={0.85}>
            <Text style={styles.startBtnText}>Start Deep Study</Text>
          </TouchableOpacity>

          <View style={styles.statsFooter}>
            <Text style={styles.statsFooterText}>Your best session: {user.bestFocusSessionMins || 0} mins</Text>
            <Text style={styles.statsFooterText}>Total focus time today: {formatHoursMins(todayFocusMins)}</Text>
          </View>
         </ContentWrapper>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ── DISTRACTED (user returned from background) ──
  if (focus.phase === 'active' && showDistracted) {
    const copy = LEVEL_COPY[focus.level];
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.centerFill}>
          <HomieBot mood={copy.mood} size={100} />
          <Text style={styles.title}>{copy.title}</Text>
          <Text style={styles.sub}>you left for {formatAway(awayMs)}</Text>
          <Text style={styles.distractionCount}>distraction #{focus.distractions} this session</Text>

          {focus.level === 'hard' && (
            <View style={styles.penaltyBox}>
              <Text style={styles.penaltyText}>Hard mode: -10 XP deducted</Text>
            </View>
          )}

          <TouchableOpacity style={styles.startBtn} onPress={() => setShowDistracted(false)} activeOpacity={0.85}>
            <Text style={styles.startBtnText}>Get back to studying</Text>
          </TouchableOpacity>

          <Text style={styles.orText}>or</Text>

          <TouchableOpacity
            style={styles.outlineBtn}
            onPress={() => { setShowDistracted(false); finalizeSession(true); }}
            activeOpacity={0.85}
          >
            <Text style={styles.outlineBtnText}>End session early</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // ── ACTIVE SESSION ──
  if (focus.phase === 'active') {
    const pct = 1 - remainingSeconds / (focus.durationMins * 60);
    return (
      <SafeAreaView style={styles.safe}>
        <TouchableOpacity onPress={() => setShowQuitModal(true)} style={styles.quitBtn}>
          <Text style={styles.quitBtnText}>Quit?</Text>
        </TouchableOpacity>

        <View style={styles.centerFill}>
          <HomieBot mood="cool" size={80} />
          <Text style={styles.lockedInText}>locked in</Text>

          <View style={styles.timerBox}>
            <Text style={styles.timerText}>{formatClock(remainingSeconds)}</Text>
          </View>
          <Text style={styles.timerCaption}>time remaining</Text>

          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${Math.max(0, Math.min(1, pct)) * 100}%` }]} />
          </View>
          <Text style={styles.progressPct}>{Math.round(Math.max(0, Math.min(1, pct)) * 100)}%</Text>

          <Text style={styles.sessionMeta}>{focus.subject} · Deep Study</Text>

          <View style={styles.countersRow}>
            <Text style={styles.counterText}>Distractions: {focus.distractions}</Text>
            <Text style={styles.counterText}>Breaks: {focus.breaksTaken}</Text>
          </View>

          <TouchableOpacity style={styles.chatBtn} onPress={() => router.push('/chat' as any)} activeOpacity={0.85}>
            <Text style={styles.chatBtnText}>Open Homie Chat →</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.breakLink} onPress={() => dispatch(startBreak())}>
            <Text style={styles.breakLinkText}>Take a Break</Text>
          </TouchableOpacity>
        </View>

        <Modal visible={showQuitModal} transparent animationType="fade" onRequestClose={() => setShowQuitModal(false)}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalCard}>
              <HomieBot mood="sad" size={70} />
              <Text style={styles.modalTitle}>you want to quit? for real?</Text>
              <Text style={styles.modalSub}>you still have {Math.ceil(remainingSeconds / 60)} minutes left. you got this bro.</Text>
              <TouchableOpacity style={styles.startBtn} onPress={() => setShowQuitModal(false)} activeOpacity={0.85}>
                <Text style={styles.startBtnText}>Keep going</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.outlineBtn}
                onPress={() => { setShowQuitModal(false); finalizeSession(true); }}
                activeOpacity={0.85}
              >
                <Text style={styles.outlineBtnText}>End session</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    );
  }

  // ── BREAK ──
  if (focus.phase === 'break') {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.centerFill}>
          <HomieBot mood="happy" size={80} />
          <Text style={styles.title}>Break time!</Text>
          <Text style={styles.sub}>Rest your brain for 5 minutes</Text>

          <View style={styles.timerBox}>
            <Text style={styles.timerText}>{formatClock(breakRemainingSeconds)}</Text>
          </View>
          <Text style={styles.timerCaption}>break timer</Text>

          <TouchableOpacity style={styles.startBtn} onPress={endBreakNow} activeOpacity={0.85}>
            <Text style={styles.startBtnText}>End break — back to work</Text>
          </TouchableOpacity>

          <View style={styles.tipCard}>
            <Text style={styles.tipLabel}>Break tip:</Text>
            <Text style={styles.tipText}>{BREAK_TIP}</Text>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  // ── COMPLETE ──
  const xp = xpBreakdown ?? { base: 0, noBreaksBonus: 0, noDistractionBonus: 0, hardBonus: 0, beastBonus: 0, total: 0 };
  const minutesStudied = Math.round(focus.elapsedSeconds / 60);
  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.centerFillScroll}>
        <HomieBot mood="celebrating" size={120} />
        <Text style={styles.title}>Session Complete!</Text>

        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>
            {focus.endedEarly ? `${minutesStudied} minutes of deep study (ended early)` : `${focus.durationMins} minutes of deep study`}
          </Text>
          <Text style={styles.summarySub}>{focus.subject}</Text>
          <View style={{ height: 10 }} />
          <Text style={styles.summaryRow}>Distractions: {focus.distractions}</Text>
          <Text style={styles.summaryRow}>Breaks taken: {focus.breaksTaken}</Text>
          <Text style={styles.summaryRow}>Focus score: {focusScore(focus.distractions, focus.breaksTaken)}%</Text>
        </View>

        <View style={styles.xpCard}>
          <Text style={styles.xpLabel}>XP Earned:</Text>
          <View style={styles.xpRow}>
            <Text style={styles.xpRowLabel}>Base</Text>
            <Text style={styles.xpRowValue}>+{xp.base} XP</Text>
          </View>
          {xp.noBreaksBonus > 0 && (
            <View style={styles.xpRow}>
              <Text style={styles.xpRowLabel}>No breaks bonus</Text>
              <Text style={styles.xpRowValue}>+{xp.noBreaksBonus} XP</Text>
            </View>
          )}
          {xp.noDistractionBonus > 0 && (
            <View style={styles.xpRow}>
              <Text style={styles.xpRowLabel}>No distraction bonus</Text>
              <Text style={styles.xpRowValue}>+{xp.noDistractionBonus} XP</Text>
            </View>
          )}
          {xp.hardBonus > 0 && (
            <View style={styles.xpRow}>
              <Text style={styles.xpRowLabel}>Hard mode bonus</Text>
              <Text style={styles.xpRowValue}>+{xp.hardBonus} XP</Text>
            </View>
          )}
          {xp.beastBonus > 0 && (
            <View style={styles.xpRow}>
              <Text style={styles.xpRowLabel}>Beast mode bonus</Text>
              <Text style={styles.xpRowValue}>+{xp.beastBonus} XP</Text>
            </View>
          )}
          <View style={styles.xpDivider} />
          <View style={styles.xpRow}>
            <Text style={styles.xpTotalLabel}>Total</Text>
            <Text style={styles.xpTotalValue}>+{xp.total} XP</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.startBtn} onPress={startAnother} activeOpacity={0.85}>
          <Text style={styles.startBtnText}>Awesome. Start another</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.outlineBtn} onPress={goHome} activeOpacity={0.85}>
          <Text style={styles.outlineBtnText}>Go to Home</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  header: { flexDirection: 'row', alignItems: 'center', padding: 16, paddingBottom: 8, gap: 12 },
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 20, fontWeight: '900', color: Colors.white },
  hero: { alignItems: 'center', paddingVertical: 16, gap: 6 },
  title: { fontSize: 26, fontWeight: '900', color: Colors.white, marginTop: 12, textAlign: 'center' },
  sub: { fontSize: 14, color: Colors.muted, textAlign: 'center' },

  sectionLabel: { fontSize: 13, color: Colors.muted, marginHorizontal: 16, marginTop: 20, marginBottom: 10 },
  durationGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 16, gap: 10, justifyContent: 'center' },
  durationCard: { width: '30%', backgroundColor: '#12102a', borderWidth: 1.5, borderColor: '#2a2060', borderRadius: 14, paddingVertical: 16, alignItems: 'center', gap: 4 },
  durationCardSelected: { borderColor: '#7c3aed', backgroundColor: 'rgba(124,58,237,0.12)' },
  durationMins: { fontSize: 16, fontWeight: '800', color: Colors.text },
  durationLabel: { fontSize: 11, color: Colors.muted },
  durationTextSelected: { color: '#a78bfa' },

  subjectRow: { paddingHorizontal: 16, gap: 8 },
  subjectChip: { paddingHorizontal: 14, paddingVertical: 9, borderRadius: Radius.full, backgroundColor: Colors.bg3, borderWidth: 1, borderColor: Colors.border },
  subjectChipText: { fontSize: 13, fontWeight: '700', color: Colors.muted },

  levelList: { paddingHorizontal: 16, gap: 12 },
  levelRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  radio: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: Colors.border, alignItems: 'center', justifyContent: 'center' },
  radioSelected: { borderColor: '#7c3aed' },
  radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#7c3aed' },
  levelLabel: { fontSize: 14, color: Colors.text },

  startBtn: { height: 54, borderRadius: 14, backgroundColor: '#7c3aed', alignItems: 'center', justifyContent: 'center', marginHorizontal: 16, marginTop: 24 },
  startBtnText: { color: Colors.white, fontWeight: '700', fontSize: 16 },
  outlineBtn: { height: 50, borderRadius: 14, borderWidth: 1, borderColor: Colors.red, alignItems: 'center', justifyContent: 'center', marginHorizontal: 16, marginTop: 12 },
  outlineBtnText: { color: Colors.red, fontWeight: '700', fontSize: 15 },

  statsFooter: { alignItems: 'center', marginTop: 24, gap: 4 },
  statsFooterText: { fontSize: 12, color: Colors.muted },

  centerFill: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, width: '100%', maxWidth: responsive.maxWidth, alignSelf: 'center' },
  centerFillScroll: { flexGrow: 1, alignItems: 'center', padding: 24, paddingTop: 40, width: '100%', maxWidth: responsive.maxWidth, alignSelf: 'center' },

  quitBtn: { position: 'absolute', top: 16, right: 16, zIndex: 1, paddingHorizontal: 12, paddingVertical: 6 },
  quitBtnText: { fontSize: 13, color: Colors.muted, fontWeight: '600' },

  lockedInText: { fontSize: 14, color: '#a78bfa', fontWeight: '700', marginTop: 14, letterSpacing: 1 },
  timerBox: { marginTop: 20 },
  timerText: { fontSize: 52, fontWeight: '900', color: Colors.white, fontVariant: ['tabular-nums'] },
  timerCaption: { fontSize: 12, color: Colors.muted, marginTop: 4 },
  progressTrack: { width: '100%', height: 8, borderRadius: 4, backgroundColor: 'rgba(167,139,250,0.15)', overflow: 'hidden', marginTop: 20 },
  progressFill: { height: 8, backgroundColor: '#7c3aed', borderRadius: 4 },
  progressPct: { fontSize: 12, color: Colors.muted, marginTop: 6 },
  sessionMeta: { fontSize: 13, color: Colors.muted, marginTop: 20 },
  countersRow: { flexDirection: 'row', gap: 24, marginTop: 14 },
  counterText: { fontSize: 13, color: Colors.text },
  chatBtn: { marginTop: 28, paddingHorizontal: 20, paddingVertical: 14, borderRadius: 14, backgroundColor: Colors.bg3, borderWidth: 1, borderColor: Colors.border, alignSelf: 'stretch', alignItems: 'center' },
  chatBtnText: { fontSize: 14, fontWeight: '700', color: Colors.text },
  breakLink: { marginTop: 18, padding: 8 },
  breakLinkText: { fontSize: 12, color: Colors.muted },

  distractionCount: { fontSize: 13, color: Colors.muted, marginTop: 14 },
  penaltyBox: { marginTop: 18, paddingHorizontal: 18, paddingVertical: 12, borderRadius: 12, backgroundColor: 'rgba(239,68,68,0.1)', borderWidth: 1, borderColor: 'rgba(239,68,68,0.3)' },
  penaltyText: { color: Colors.red, fontWeight: '700', fontSize: 13 },
  orText: { fontSize: 12, color: Colors.muted, marginVertical: 10 },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', alignItems: 'center', justifyContent: 'center', padding: 28 },
  modalCard: { width: '100%', backgroundColor: '#12102a', borderRadius: 20, borderWidth: 1, borderColor: Colors.border, padding: 24, alignItems: 'center' },
  modalTitle: { fontSize: 18, fontWeight: '800', color: Colors.white, marginTop: 14, textAlign: 'center' },
  modalSub: { fontSize: 13, color: Colors.muted, marginTop: 8, textAlign: 'center', lineHeight: 19 },

  tipCard: { marginTop: 28, padding: 16, borderRadius: 14, backgroundColor: Colors.bg3, borderWidth: 1, borderColor: Colors.border, alignSelf: 'stretch' },
  tipLabel: { fontSize: 12, color: Colors.muted, fontWeight: '700', marginBottom: 6 },
  tipText: { fontSize: 13, color: Colors.text2, lineHeight: 19 },

  summaryCard: { alignSelf: 'stretch', backgroundColor: Colors.bg3, borderRadius: 16, borderWidth: 1, borderColor: Colors.border, padding: 18, marginTop: 20 },
  summaryTitle: { fontSize: 15, fontWeight: '800', color: Colors.text },
  summarySub: { fontSize: 13, color: Colors.muted, marginTop: 2 },
  summaryRow: { fontSize: 13, color: Colors.text2, marginTop: 4 },

  xpCard: { alignSelf: 'stretch', backgroundColor: 'rgba(124,58,237,0.08)', borderRadius: 16, borderWidth: 1, borderColor: 'rgba(124,58,237,0.25)', padding: 18, marginTop: 14 },
  xpLabel: { fontSize: 12, fontWeight: '700', color: Colors.muted, marginBottom: 10, letterSpacing: 1 },
  xpRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 },
  xpRowLabel: { fontSize: 13, color: Colors.text2 },
  xpRowValue: { fontSize: 13, color: Colors.text2, fontWeight: '600' },
  xpDivider: { height: 1, backgroundColor: Colors.border, marginVertical: 10 },
  xpTotalLabel: { fontSize: 15, fontWeight: '800', color: Colors.white },
  xpTotalValue: { fontSize: 15, fontWeight: '800', color: '#a78bfa' },
});
