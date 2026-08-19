import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Share, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { useDispatch, useSelector } from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { RootState } from '../../store';
import { addXP } from '../../store/slices/userSlice';
import { Colors, Radius } from '../../constants/theme';
import HomieBot from '../../components/mascot/HomieBot';
import NoteCard from '../../components/recorder/NoteCard';

const PLANNER_STORAGE_KEY = 'hm_study_plan';

function formatDuration(totalSeconds: number): string {
  const m = Math.round(totalSeconds / 60);
  return `${m} min${m === 1 ? '' : 's'}`;
}

function buildNotesHtml(name: string, subject: string, date: string, notes: NonNullable<import('../../store/slices/recorderSlice').LectureNote['notes']>): string {
  return `
    <html><body style="font-family: -apple-system, sans-serif; padding: 24px; color: #111;">
      <h1>${name}</h1>
      <p style="color:#666;">${subject} · ${date}</p>
      <h2>Summary</h2><p>${notes.summary}</p>
      <h2>Key Points</h2><ul>${notes.keyPoints.map(k => `<li>${k}</li>`).join('')}</ul>
      <h2>Definitions</h2>${notes.definitions.map(d => `<p><b>${d.term}</b> — ${d.definition}</p>`).join('')}
      <h2>Possible Exam Questions</h2><ol>${notes.examQuestions.map(q => `<li>${q}</li>`).join('')}</ol>
      <h2>Flashcards</h2>${notes.flashcards.map(f => `<p><b>Q:</b> ${f.front}<br/><b>A:</b> ${f.back}</p>`).join('')}
    </body></html>
  `;
}

// The date math here intentionally mirrors dateForDay() in app/planner/index.tsx —
// Add to Planner needs to find "today" in the same plan structure that screen
// generates, but that helper isn't exported, so it's reproduced here rather than
// touching the planner file for this feature.
function dayNumberForToday(startDate: string): number {
  const start = new Date(startDate); start.setHours(0, 0, 0, 0);
  const today = new Date(); today.setHours(0, 0, 0, 0);
  return Math.round((today.getTime() - start.getTime()) / 86400000) + 1;
}

export default function LectureNotesScreen() {
  const dispatch = useDispatch();
  const { id } = useLocalSearchParams<{ id: string }>();
  const lecture = useSelector((s: RootState) => s.recorder.lectures.find(l => l.id === id));
  const [askedHomie, setAskedHomie] = useState(false);

  if (!lecture) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} accessibilityLabel="Go back" accessibilityRole="button">
            <Text style={styles.backArrow}>←</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Lecture not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  const { notes } = lecture;

  const sharePlain = async () => {
    if (!notes) return;
    const text = [
      lecture.name, `${lecture.subject} · ${new Date(lecture.date).toLocaleDateString()}`, '',
      'Summary:', notes.summary, '',
      'Key Points:', ...notes.keyPoints.map(k => `- ${k}`),
    ].join('\n');
    await Share.share({ message: text });
  };

  const saveAsPdf = async () => {
    if (!notes) return;
    try {
      const html = buildNotesHtml(lecture.name, lecture.subject, new Date(lecture.date).toLocaleDateString(), notes);
      const { uri } = await Print.printToFileAsync({ html });
      const canShare = await Sharing.isAvailableAsync();
      if (canShare) await Sharing.shareAsync(uri);
      else Alert.alert('PDF saved', `Saved to ${uri}`);
    } catch {
      Alert.alert("Couldn't generate PDF", 'Try again in a bit.');
    }
  };

  const addToPlanner = async () => {
    if (!notes || notes.examQuestions.length === 0) {
      Alert.alert("No topics to add", "This lecture doesn't have generated notes to pull tasks from.");
      return;
    }
    try {
      const raw = await AsyncStorage.getItem(PLANNER_STORAGE_KEY);
      if (!raw) {
        Alert.alert('No active study plan', 'Create a study plan first, then add lecture topics to it.', [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Go to Planner', onPress: () => router.push('/planner') },
        ]);
        return;
      }
      const saved = JSON.parse(raw);
      const dayNum = Math.min(Math.max(dayNumberForToday(saved.startDate), 1), saved.plan.totalDays);
      let added = false;
      for (const week of saved.plan.weeks) {
        const day = week.days.find((d: any) => d.day === dayNum);
        if (day) {
          day.tasks.push(...notes.examQuestions.slice(0, 3).map(q => `Review from "${lecture.name}": ${q}`));
          added = true;
          break;
        }
      }
      if (!added) { Alert.alert("Couldn't find today in your plan", 'Your plan may have already ended.'); return; }
      await AsyncStorage.setItem(PLANNER_STORAGE_KEY, JSON.stringify(saved));
      Alert.alert('Added to planner', `Added ${Math.min(notes.examQuestions.length, 3)} tasks to today.`);
    } catch {
      Alert.alert("Couldn't update your plan", 'Try again in a bit.');
    }
  };

  const askHomie = () => {
    if (!askedHomie) { dispatch(addXP(10)); setAskedHomie(true); }
    const context = notes
      ? `Here's the summary: ${notes.summary}`
      : lecture.transcript
        ? `Here's the transcript: ${lecture.transcript.slice(0, 500)}`
        : "I don't have notes for it yet";
    const prefill = `I just recorded a lecture called "${lecture.name}" for ${lecture.subject}. ${context} Can you help me understand this better?`;
    router.push({ pathname: '/chat', params: { subject: lecture.subject, prefill } });
  };

  const studyFlashcards = () => {
    dispatch(addXP(10));
    router.push({ pathname: '/games/flashcardflip', params: { subject: lecture.subject, lectureId: lecture.id } });
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} accessibilityLabel="Go back" accessibilityRole="button">
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.title} numberOfLines={1}>{lecture.name}</Text>
          <View style={styles.metaRow}>
            <View style={styles.subjectPill}><Text style={styles.subjectPillText}>{lecture.subject}</Text></View>
            <Text style={styles.metaText}>{new Date(lecture.date).toLocaleDateString()} · {formatDuration(lecture.duration)}</Text>
          </View>
        </View>
      </View>

      <View style={styles.actionRow}>
        <TouchableOpacity onPress={sharePlain} style={styles.headerActionBtn}><Text style={styles.headerActionText}>Share</Text></TouchableOpacity>
        <TouchableOpacity onPress={saveAsPdf} style={styles.headerActionBtn}><Text style={styles.headerActionText}>Save</Text></TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {!notes ? (
          <View style={styles.noNotesBox}>
            <Text style={styles.noNotesText}>Notes couldn't be generated for this lecture — here's the raw transcript instead.</Text>
          </View>
        ) : (
          <>
            <NoteCard title="Summary">
              <Text style={styles.bodyText}>{notes.summary}</Text>
            </NoteCard>

            <NoteCard title="Key Points" count={notes.keyPoints.length}>
              {notes.keyPoints.map((k, i) => <Text key={i} style={styles.bulletText}>• {k}</Text>)}
            </NoteCard>

            <NoteCard title="Definitions" count={notes.definitions.length}>
              {notes.definitions.map((d, i) => (
                <View key={i} style={{ marginBottom: 6 }}>
                  <Text style={styles.defTerm}>{d.term}</Text>
                  <Text style={styles.bodyText}>{d.definition}</Text>
                </View>
              ))}
            </NoteCard>

            <NoteCard title="Possible Exam Questions" count={notes.examQuestions.length}>
              {notes.examQuestions.map((q, i) => <Text key={i} style={styles.bulletText}>{i + 1}. {q}</Text>)}
            </NoteCard>

            <NoteCard title="Flashcards" count={notes.flashcards.length} defaultExpanded={false}>
              <TouchableOpacity onPress={studyFlashcards} style={styles.flashcardBtn}>
                <Text style={styles.flashcardBtnText}>Study Flashcards →</Text>
              </TouchableOpacity>
            </NoteCard>

            {notes.missedTopics.length > 0 && (
              <NoteCard title="Topics To Follow Up On" count={notes.missedTopics.length} defaultExpanded={false}>
                {notes.missedTopics.map((t, i) => <Text key={i} style={styles.bulletText}>• {t}</Text>)}
              </NoteCard>
            )}

            {!!notes.homieAdvice && (
              <View style={styles.adviceCard}>
                <HomieBot mood="happy" size={40} />
                <Text style={styles.adviceText}>{notes.homieAdvice}</Text>
              </View>
            )}
          </>
        )}

        <NoteCard title="Full Transcript" defaultExpanded={false}>
          {lecture.bookmarks.length > 0 && (
            <View style={styles.bookmarksRow}>
              {lecture.bookmarks.map((b, i) => (
                <View key={i} style={styles.bookmarkChip}>
                  <Text style={styles.bookmarkChipText}>{b.label}</Text>
                </View>
              ))}
            </View>
          )}
          <Text style={styles.transcriptText}>{lecture.transcript || 'No transcript recorded.'}</Text>
        </NoteCard>

        <View style={styles.bottomActions}>
          <TouchableOpacity onPress={askHomie} style={styles.bottomBtn}>
            <Text style={styles.bottomBtnText}>Ask Homie about this</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={addToPlanner} style={[styles.bottomBtn, styles.bottomBtnSecondary]}>
            <Text style={styles.bottomBtnSecondaryText}>Add to Planner</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  header: { flexDirection: 'row', alignItems: 'flex-start', padding: 16, paddingBottom: 10, gap: 10 },
  backBtn: { padding: 4 },
  backArrow: { fontSize: 22, color: Colors.text },
  title: { fontSize: 17, fontWeight: '900', color: Colors.text },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 6 },
  subjectPill: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: Radius.full, backgroundColor: 'rgba(124,58,237,0.2)' },
  subjectPillText: { fontSize: 10, fontWeight: '700', color: Colors.purpleL },
  metaText: { fontSize: 11, color: Colors.muted },
  actionRow: { flexDirection: 'row', gap: 8, paddingHorizontal: 16, marginBottom: 10 },
  headerActionBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: Radius.md, backgroundColor: Colors.bg3, borderWidth: 1, borderColor: Colors.border },
  headerActionText: { fontSize: 12, fontWeight: '700', color: Colors.text2 },
  content: { paddingHorizontal: 16, paddingBottom: 30 },
  noNotesBox: { padding: 16, backgroundColor: Colors.bg3, borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.border, marginBottom: 12 },
  noNotesText: { color: Colors.muted, fontSize: 13, lineHeight: 19 },
  bodyText: { fontSize: 13, color: Colors.text2, lineHeight: 20 },
  bulletText: { fontSize: 13, color: Colors.text2, lineHeight: 21 },
  defTerm: { fontSize: 13, fontWeight: '800', color: Colors.text },
  flashcardBtn: { paddingVertical: 12, borderRadius: Radius.md, backgroundColor: Colors.purple, alignItems: 'center' },
  flashcardBtnText: { color: Colors.white, fontWeight: '800', fontSize: 13 },
  adviceCard: { flexDirection: 'row', gap: 12, padding: 14, backgroundColor: 'rgba(124,58,237,0.08)', borderRadius: Radius.lg, borderWidth: 1, borderColor: 'rgba(124,58,237,0.2)', marginBottom: 12, alignItems: 'center' },
  adviceText: { flex: 1, fontSize: 13, color: Colors.text2, lineHeight: 19, fontStyle: 'italic' },
  bookmarksRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 10 },
  bookmarkChip: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: Radius.sm, backgroundColor: 'rgba(249,115,22,0.15)', borderWidth: 1, borderColor: 'rgba(249,115,22,0.4)' },
  bookmarkChipText: { fontSize: 10, fontWeight: '700', color: Colors.orange },
  transcriptText: { fontSize: 13, color: Colors.muted, lineHeight: 20 },
  bottomActions: { gap: 10, marginTop: 8 },
  bottomBtn: { paddingVertical: 15, borderRadius: Radius.md, backgroundColor: Colors.purple, alignItems: 'center' },
  bottomBtnText: { color: Colors.white, fontWeight: '800', fontSize: 14 },
  bottomBtnSecondary: { backgroundColor: Colors.bg3, borderWidth: 1, borderColor: Colors.border },
  bottomBtnSecondaryText: { color: Colors.text2, fontWeight: '700', fontSize: 14 },
});
