import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert, Share } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useDispatch } from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors, Radius } from '../../constants/theme';
import { addXP } from '../../store/slices/userSlice';
import { generateStudyPlan, StudyPlan } from '../../lib/gemini';
import HomieBot from '../../components/mascot/HomieBot';

const STORAGE_KEY = 'hm_study_plan';
const SUBJECTS = ['Math', 'Coding', 'Science', 'History', 'English', 'Physics', 'Chemistry', 'Biology'];
const LEVELS = ['Beginner', 'Mid', 'Advanced'] as const;
const GOALS = ['Pass exam', 'Get A', 'Deep learn'] as const;

interface SavedPlanState {
  plan: StudyPlan;
  startDate: string; // ISO date the plan was generated — day 1 of the plan
  completedTasks: Record<string, boolean>;
  xpAwardedFor: Record<string, boolean>;
}

function daysUntil(dateStr: string): number {
  const target = new Date(dateStr);
  if (isNaN(target.getTime())) return -1;
  const today = new Date(); today.setHours(0, 0, 0, 0);
  target.setHours(0, 0, 0, 0);
  return Math.round((target.getTime() - today.getTime()) / 86400000);
}

// The plan's own "date" strings from Gemini aren't reliable enough to build a
// real calendar off of — dates are computed here from the day the plan was
// generated instead, so the calendar view and day labels are always valid.
function dateForDay(startDate: string, dayNumber: number): Date {
  const d = new Date(startDate);
  d.setDate(d.getDate() + dayNumber - 1);
  return d;
}

function formatShortDate(d: Date): string {
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

export default function PlannerScreen() {
  const dispatch = useDispatch();
  const [saved, setSaved] = useState<SavedPlanState | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [view, setView] = useState<'list' | 'calendar'>('list');
  const [expandedWeeks, setExpandedWeeks] = useState<Record<number, boolean>>({ 1: true });
  const [showForm, setShowForm] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');

  const [subject, setSubject] = useState('Math');
  const [topic, setTopic] = useState('');
  const [examDate, setExamDate] = useState('');
  const [hoursPerDay, setHoursPerDay] = useState(2);
  const [level, setLevel] = useState<typeof LEVELS[number]>('Beginner');
  const [goal, setGoal] = useState<typeof GOALS[number]>('Pass exam');

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then(raw => {
      if (raw) { try { setSaved(JSON.parse(raw)); } catch { /* ignore corrupt save */ } }
      setLoaded(true);
    });
  }, []);

  const persist = (next: SavedPlanState | null) => {
    setSaved(next);
    if (next) AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    else AsyncStorage.removeItem(STORAGE_KEY);
  };

  const doGenerate = async (days: number) => {
    setGenerating(true); setError('');
    const result = await generateStudyPlan(subject, topic.trim() || subject, days, hoursPerDay, level, goal);
    setGenerating(false);
    if (!result || !result.weeks?.length) { setError("couldn't generate a plan right now — try again"); return; }
    persist({ plan: result, startDate: new Date().toISOString(), completedTasks: {}, xpAwardedFor: {} });
    dispatch(addXP(20));
    setShowForm(false);
    setExpandedWeeks({ 1: true });
  };

  const handleGenerate = () => {
    if (!subject.trim() || !examDate.trim()) { setError('pick a subject and exam date'); return; }
    const days = daysUntil(examDate);
    if (days < 1) { setError('enter a valid future date (YYYY-MM-DD)'); return; }
    if (saved) {
      Alert.alert('Replace current plan?', 'You already have an active study plan — generating a new one replaces it.', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Replace', style: 'destructive', onPress: () => doGenerate(days) },
      ]);
    } else {
      doGenerate(days);
    }
  };

  const toggleTask = (weekNumber: number, dayNumber: number, tasks: string[], taskIdx: number) => {
    if (!saved) return;
    const key = `${weekNumber}-${dayNumber}-${taskIdx}`;
    const nowDone = !saved.completedTasks[key];
    const completedTasks = { ...saved.completedTasks, [key]: nowDone };
    const xpAwardedFor = { ...saved.xpAwardedFor };
    let xpGain = 0;

    if (nowDone && !xpAwardedFor[key]) { xpAwardedFor[key] = true; xpGain += 5; }

    const dayKeys = tasks.map((_, i) => `${weekNumber}-${dayNumber}-${i}`);
    const allDone = dayKeys.every(k => completedTasks[k]);
    const dayBonusKey = `daybonus-${weekNumber}-${dayNumber}`;
    if (allDone && !xpAwardedFor[dayBonusKey]) {
      xpAwardedFor[dayBonusKey] = true; xpGain += 20;
      const milestone = saved.plan.milestones?.find(m => m.day === dayNumber);
      if (milestone) {
        const mKey = `milestone-${milestone.day}`;
        if (!xpAwardedFor[mKey]) { xpAwardedFor[mKey] = true; xpGain += 50; }
      }
    }

    if (xpGain > 0) dispatch(addXP(xpGain));
    persist({ ...saved, completedTasks, xpAwardedFor });
  };

  const sharePlan = async () => {
    if (!saved) return;
    const { plan } = saved;
    const lines = [
      plan.title,
      `${plan.weeks.length} weeks - ${plan.hoursTotal} hours total`,
      '',
      ...plan.weeks.map(w => `Week ${w.weekNumber}: ${w.theme}`),
      '',
      'Tips:',
      ...plan.tips.map(t => `- ${t}`),
    ];
    await Share.share({ message: lines.join('\n') });
  };

  if (!loaded) return <SafeAreaView style={styles.safe} />;

  if (!saved || showForm) {
    return (
      <SafeAreaView style={styles.safe}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => (showForm ? setShowForm(false) : router.back())} style={styles.backBtn}>
              <Text style={styles.backArrow}>←</Text>
            </TouchableOpacity>
            <Text style={styles.title}>Generate Study Plan</Text>
          </View>

          <View style={styles.form}>
            <HomieBot mood="thinking" size={70} />

            <Text style={styles.label}>What subject?</Text>
            <View style={styles.chipRow}>
              {SUBJECTS.map(s => (
                <TouchableOpacity key={s} onPress={() => setSubject(s)} style={[styles.chip, subject === s && styles.chipActive]}>
                  <Text style={[styles.chipText, subject === s && styles.chipTextActive]}>{s}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.label}>What topic specifically?</Text>
            <TextInput value={topic} onChangeText={setTopic} placeholder="e.g. Calculus 1, WW2, DNA" placeholderTextColor={Colors.muted} style={styles.input} />

            <Text style={styles.label}>When is your exam / deadline?</Text>
            <TextInput value={examDate} onChangeText={setExamDate} placeholder="YYYY-MM-DD" placeholderTextColor={Colors.muted} style={styles.input} />

            <Text style={styles.label}>Hours per day available?</Text>
            <View style={styles.chipRow}>
              {[1, 2, 3, 4, 5].map(h => (
                <TouchableOpacity key={h} onPress={() => setHoursPerDay(h)} style={[styles.hourChip, hoursPerDay === h && styles.chipActive]}>
                  <Text style={[styles.chipText, hoursPerDay === h && styles.chipTextActive]}>{h}h</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.label}>Current level?</Text>
            <View style={styles.chipRow}>
              {LEVELS.map(l => (
                <TouchableOpacity key={l} onPress={() => setLevel(l)} style={[styles.chip, level === l && styles.chipActive]}>
                  <Text style={[styles.chipText, level === l && styles.chipTextActive]}>{l}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.label}>Goal?</Text>
            <View style={styles.chipRow}>
              {GOALS.map(g => (
                <TouchableOpacity key={g} onPress={() => setGoal(g)} style={[styles.chip, goal === g && styles.chipActive]}>
                  <Text style={[styles.chipText, goal === g && styles.chipTextActive]}>{g}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {!!error && <Text style={styles.errorText}>{error}</Text>}

            <TouchableOpacity onPress={handleGenerate} disabled={generating} style={[styles.generateBtn, generating && styles.btnDisabled]}>
              <Text style={styles.generateBtnText}>{generating ? 'building your plan...' : 'Generate My Plan'}</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  const { plan, startDate, completedTasks } = saved;
  const totalTasks = plan.weeks.reduce((sum, w) => sum + w.days.reduce((s, d) => s + d.tasks.length, 0), 0);
  const doneTasks = Object.values(completedTasks).filter(Boolean).length;
  const progress = totalTasks ? Math.round((doneTasks / totalTasks) * 100) : 0;
  const examDateComputed = dateForDay(startDate, plan.totalDays);

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} accessibilityLabel="Go back" accessibilityRole="button">
            <Text style={styles.backArrow}>←</Text>
          </TouchableOpacity>
          <Text style={styles.title} numberOfLines={1}>{plan.title}</Text>
        </View>

        <View style={{ paddingHorizontal: 16 }}>
          <View style={styles.planHeaderCard}>
            <Text style={styles.planHeaderTitle}>{plan.title}</Text>
            <Text style={styles.planHeaderMeta}>{plan.weeks.length} weeks - {hoursPerDay}hrs/day - {plan.hoursTotal} hours</Text>
            <Text style={styles.planHeaderMeta}>Exam: {formatShortDate(examDateComputed)}</Text>
            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: `${progress}%` }]} />
            </View>
            <Text style={styles.progressLabel}>Progress: {progress}%</Text>
          </View>

          <View style={styles.actionRow}>
            <TouchableOpacity onPress={() => setView(view === 'list' ? 'calendar' : 'list')} style={styles.actionBtn}>
              <Text style={styles.actionBtnText}>{view === 'list' ? 'Calendar View' : 'List View'}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={sharePlan} style={styles.actionBtn}>
              <Text style={styles.actionBtnText}>Share</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setShowForm(true)} style={styles.actionBtn}>
              <Text style={styles.actionBtnText}>New Plan</Text>
            </TouchableOpacity>
          </View>

          {view === 'calendar' ? (
            <View style={styles.calendarGrid}>
              {plan.weeks.flatMap(w => w.days).map(d => {
                const date = dateForDay(startDate, d.day);
                const dayKeys = d.tasks.map((_, i) => `${plan.weeks.find(w => w.days.includes(d))?.weekNumber}-${d.day}-${i}`);
                const isDone = dayKeys.length > 0 && dayKeys.every(k => completedTasks[k]);
                const todayStr = new Date().toDateString();
                const isToday = date.toDateString() === todayStr;
                const isPast = date < new Date(new Date().setHours(0, 0, 0, 0));
                const bg = isDone ? Colors.green : isToday ? Colors.orange : isPast ? Colors.bg4 : Colors.purple;
                return (
                  <View key={d.day} style={[styles.calCell, { backgroundColor: bg + (isDone || isToday ? '' : '55') }]}>
                    <Text style={styles.calDayNum}>{d.day}</Text>
                    <Text style={styles.calDateLabel}>{date.getDate()}/{date.getMonth() + 1}</Text>
                  </View>
                );
              })}
            </View>
          ) : (
            <View style={{ gap: 10, marginTop: 4 }}>
              {plan.weeks.map(w => (
                <View key={w.weekNumber} style={styles.weekCard}>
                  <TouchableOpacity onPress={() => setExpandedWeeks(e => ({ ...e, [w.weekNumber]: !e[w.weekNumber] }))} style={styles.weekHeader}>
                    <Text style={styles.weekTitle}>Week {w.weekNumber} - {w.theme}</Text>
                    <Text style={styles.weekArrow}>{expandedWeeks[w.weekNumber] ? '▴' : '▾'}</Text>
                  </TouchableOpacity>

                  {expandedWeeks[w.weekNumber] && (
                    <View style={{ gap: 14, marginTop: 10 }}>
                      {w.days.map(d => {
                        const date = dateForDay(startDate, d.day);
                        const milestone = plan.milestones?.find(m => m.day === d.day);
                        return (
                          <View key={d.day} style={styles.dayBlock}>
                            <Text style={styles.dayHeader}>Day {d.day} - {formatShortDate(date)}</Text>
                            <Text style={styles.dayTitle}>{d.title}</Text>
                            {milestone && (
                              <View style={styles.milestoneBadge}>
                                <Text style={styles.milestoneText}>Milestone: {milestone.goal}</Text>
                              </View>
                            )}
                            {d.tasks.map((task, ti) => {
                              const key = `${w.weekNumber}-${d.day}-${ti}`;
                              const checked = !!completedTasks[key];
                              return (
                                <TouchableOpacity key={ti} onPress={() => toggleTask(w.weekNumber, d.day, d.tasks, ti)} style={styles.taskRow}>
                                  <View style={[styles.checkbox, checked && styles.checkboxChecked]}>
                                    {checked && <Text style={styles.checkboxMark}>✓</Text>}
                                  </View>
                                  <Text style={[styles.taskText, checked && styles.taskTextDone]}>{task}</Text>
                                </TouchableOpacity>
                              );
                            })}
                            {!!d.duration && <Text style={styles.durationText}>{d.duration} min</Text>}
                          </View>
                        );
                      })}
                    </View>
                  )}
                </View>
              ))}
            </View>
          )}

          {!!plan.tips?.length && (
            <View style={styles.tipsCard}>
              <Text style={styles.tipsTitle}>Study Tips</Text>
              {plan.tips.map((t, i) => (
                <Text key={i} style={styles.tipText}>- {t}</Text>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  header: { flexDirection: 'row', alignItems: 'center', padding: 16, paddingBottom: 8, gap: 12 },
  backBtn: { padding: 4 },
  backArrow: { fontSize: 24, color: Colors.text },
  title: { fontSize: 20, fontWeight: '900', color: Colors.text, flex: 1 },
  form: { paddingHorizontal: 16, paddingBottom: 40, alignItems: 'center', gap: 4 },
  label: { alignSelf: 'flex-start', fontSize: 13, fontWeight: '700', color: Colors.text2, marginTop: 16, marginBottom: 8 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, alignSelf: 'flex-start' },
  chip: { paddingHorizontal: 14, paddingVertical: 9, borderRadius: Radius.full, backgroundColor: Colors.bg3, borderWidth: 1, borderColor: Colors.border },
  hourChip: { width: 44, height: 40, alignItems: 'center', justifyContent: 'center', borderRadius: Radius.md, backgroundColor: Colors.bg3, borderWidth: 1, borderColor: Colors.border },
  chipActive: { backgroundColor: 'rgba(124,58,237,0.2)', borderColor: Colors.purpleL },
  chipText: { fontSize: 13, color: Colors.text2, fontWeight: '600' },
  chipTextActive: { color: Colors.purpleL, fontWeight: '800' },
  input: { width: '100%', backgroundColor: Colors.bg3, borderWidth: 1, borderColor: Colors.border, borderRadius: Radius.md, color: Colors.text, padding: 13, fontSize: 14 },
  errorText: { color: Colors.red, fontSize: 13, marginTop: 14, textAlign: 'center' },
  generateBtn: { width: '100%', backgroundColor: Colors.purple, paddingVertical: 15, borderRadius: Radius.md, alignItems: 'center', marginTop: 22 },
  btnDisabled: { opacity: 0.5 },
  generateBtnText: { color: Colors.white, fontWeight: '800', fontSize: 15 },
  planHeaderCard: { backgroundColor: Colors.bg3, borderRadius: Radius.lg, borderWidth: 1, borderColor: Colors.border, padding: 18, gap: 6 },
  planHeaderTitle: { fontSize: 17, fontWeight: '900', color: Colors.text },
  planHeaderMeta: { fontSize: 12, color: Colors.muted },
  progressTrack: { height: 8, backgroundColor: Colors.bg4, borderRadius: 4, overflow: 'hidden', marginTop: 8 },
  progressFill: { height: '100%', backgroundColor: Colors.purple, borderRadius: 4 },
  progressLabel: { fontSize: 11, color: Colors.muted, marginTop: 2 },
  actionRow: { flexDirection: 'row', gap: 8, marginTop: 14, marginBottom: 4 },
  actionBtn: { flex: 1, paddingVertical: 10, borderRadius: Radius.md, backgroundColor: Colors.bg3, borderWidth: 1, borderColor: Colors.border, alignItems: 'center' },
  actionBtnText: { fontSize: 12, fontWeight: '700', color: Colors.text2 },
  weekCard: { backgroundColor: Colors.bg3, borderRadius: Radius.lg, borderWidth: 1, borderColor: Colors.border, padding: 16 },
  weekHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  weekTitle: { fontSize: 15, fontWeight: '800', color: Colors.text, flex: 1 },
  weekArrow: { fontSize: 13, color: Colors.muted, marginLeft: 8 },
  dayBlock: { gap: 8, paddingTop: 10, borderTopWidth: 1, borderTopColor: Colors.border },
  dayHeader: { fontSize: 11, color: Colors.muted, fontWeight: '700' },
  dayTitle: { fontSize: 14, fontWeight: '800', color: Colors.text, marginBottom: 2 },
  milestoneBadge: { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: Radius.full, backgroundColor: 'rgba(249,115,22,0.15)', borderWidth: 1, borderColor: 'rgba(249,115,22,0.4)' },
  milestoneText: { fontSize: 11, fontWeight: '700', color: Colors.orange },
  taskRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  checkbox: { width: 20, height: 20, borderRadius: 5, borderWidth: 1.5, borderColor: Colors.border2, alignItems: 'center', justifyContent: 'center' },
  checkboxChecked: { backgroundColor: Colors.green, borderColor: Colors.green },
  checkboxMark: { color: Colors.white, fontSize: 12, fontWeight: '900' },
  taskText: { fontSize: 13, color: Colors.text2, flex: 1 },
  taskTextDone: { color: Colors.muted, textDecorationLine: 'line-through' },
  durationText: { fontSize: 11, color: Colors.muted, marginLeft: 30 },
  calendarGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 4 },
  calCell: { width: '13%', aspectRatio: 1, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  calDayNum: { fontSize: 13, fontWeight: '900', color: Colors.text },
  calDateLabel: { fontSize: 8, color: Colors.text },
  tipsCard: { backgroundColor: Colors.bg3, borderRadius: Radius.lg, borderWidth: 1, borderColor: Colors.border, padding: 16, marginTop: 16, marginBottom: 30, gap: 8 },
  tipsTitle: { fontSize: 15, fontWeight: '800', color: Colors.text, marginBottom: 4 },
  tipText: { fontSize: 13, color: Colors.text2, lineHeight: 19 },
});
