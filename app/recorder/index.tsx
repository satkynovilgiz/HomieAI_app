import { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, Platform, Alert, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useDispatch, useSelector } from 'react-redux';
import { Audio } from 'expo-av';
import { requireOptionalNativeModule } from 'expo-modules-core';
import * as Haptics from 'expo-haptics';
import { RootState } from '../../store';
import { addXP } from '../../store/slices/userSlice';
import {
  saveLecture, setRecording as setIsRecording, setPaused as setIsPaused,
  loadLectures, persistLectures, loadLecturesFromStorage, deleteLecture,
  LectureNote, Bookmark,
} from '../../store/slices/recorderSlice';
import { generateLectureNotes } from '../../lib/gemini';
import { Colors, Radius } from '../../constants/theme';
import { SUBJECTS } from '../../constants/subjects';
import HomieBot from '../../components/mascot/HomieBot';
import WaveAnimation from '../../components/recorder/WaveAnimation';
import ContentWrapper from '../../components/ui/ContentWrapper';
import TranscriptBubble, { TranscriptLine } from '../../components/recorder/TranscriptBubble';
import { useAchievements } from '../../hooks/useAchievements';

// Same availability probe as app/(tabs)/voice.tsx: importing expo-speech-recognition's
// native module directly throws at module-evaluation time on platforms/builds that
// don't have it (Expo Go, web without browser SpeechRecognition support) — crashing
// the whole screen to blank before it can even render the fallback. Probe first.
const SPEECH_RECOGNITION_AVAILABLE = Platform.OS === 'web'
  ? typeof window !== 'undefined' && !!((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition)
  : !!requireOptionalNativeModule('ExpoSpeechRecognition');

let ExpoSpeechRecognitionModule: any = null;
let useSpeechRecognitionEvent: (eventName: string, handler: (event: any) => void) => void = () => {};
if (SPEECH_RECOGNITION_AVAILABLE) {
  const speechRecognition = require('expo-speech-recognition');
  ExpoSpeechRecognitionModule = speechRecognition.ExpoSpeechRecognitionModule;
  useSpeechRecognitionEvent = speechRecognition.useSpeechRecognitionEvent;
}

type ScreenState = 'idle' | 'recording' | 'paused' | 'processing';

function formatTime(totalSeconds: number): string {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

function RecordingDot() {
  const pulse = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 0.3, duration: 600, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1, duration: 600, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, []);
  return <Animated.View style={[styles.recordingDot, { opacity: pulse }]} />;
}

function ProcessingBar() {
  const x = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(x, { toValue: 1, duration: 1100, useNativeDriver: false }),
        Animated.timing(x, { toValue: 0, duration: 0, useNativeDriver: false }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, []);
  const width = x.interpolate({ inputRange: [0, 1], outputRange: ['10%', '90%'] });
  return (
    <View style={styles.processingTrack}>
      <Animated.View style={[styles.processingFill, { width }]} />
    </View>
  );
}

export default function RecorderScreen() {
  const dispatch = useDispatch();
  const lectures = useSelector((s: RootState) => s.recorder.lectures);
  const { tryUnlock } = useAchievements();

  const [loaded, setLoaded] = useState(false);
  const [screenState, setScreenState] = useState<ScreenState>('idle');
  const [subject, setSubject] = useState('Math');
  const [showSubjects, setShowSubjects] = useState(false);
  const [lectureName, setLectureName] = useState('');
  const [seconds, setSeconds] = useState(0);
  const [transcriptLines, setTranscriptLines] = useState<TranscriptLine[]>([]);
  const [partialText, setPartialText] = useState('');
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);

  const recordingRef = useRef<Audio.Recording | null>(null);
  const shouldListenRef = useRef(false);
  const pendingBookmarkLabelRef = useRef<string | null>(null);

  useEffect(() => {
    loadLecturesFromStorage().then(list => { dispatch(loadLectures(list)); setLoaded(true); });
  }, []);

  useEffect(() => {
    if (!loaded) return;
    persistLectures(lectures);
  }, [lectures, loaded]);

  useEffect(() => () => {
    ExpoSpeechRecognitionModule?.stop();
    recordingRef.current?.stopAndUnloadAsync().catch(() => {});
  }, []);

  useEffect(() => {
    if (screenState !== 'recording') return;
    const t = setInterval(() => setSeconds(s => s + 1), 1000);
    return () => clearInterval(t);
  }, [screenState]);

  useSpeechRecognitionEvent('result', (event: any) => {
    const text = event.results?.[0]?.transcript || '';
    if (event.isFinal) {
      if (text.trim()) {
        const label = pendingBookmarkLabelRef.current;
        pendingBookmarkLabelRef.current = null;
        setTranscriptLines(prev => [...prev, { text: text.trim(), bookmarkLabel: label || undefined }]);
      }
      setPartialText('');
    } else {
      setPartialText(text);
    }
  });

  // Recognition sessions can end on their own (a pause in speech, an OS-level
  // time limit) well before the lecture is over — restart immediately if we're
  // still supposed to be listening, so the transcript covers the whole lecture
  // rather than just its first segment.
  useSpeechRecognitionEvent('end', () => {
    if (shouldListenRef.current) {
      ExpoSpeechRecognitionModule?.start({ lang: 'en-US', interimResults: true, continuous: true });
    }
  });

  useSpeechRecognitionEvent('error', (event: any) => {
    if (shouldListenRef.current && event?.error !== 'no-speech' && event?.error !== 'aborted') {
      ExpoSpeechRecognitionModule?.start({ lang: 'en-US', interimResults: true, continuous: true });
    }
  });

  const startRecording = async () => {
    if (!lectureName.trim()) { Alert.alert('Name your lecture', 'Give this lecture a name first.'); return; }

    try {
      await Audio.requestPermissionsAsync();
      await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });
      const { recording } = await Audio.Recording.createAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
      recordingRef.current = recording;
    } catch {
      // Audio recording failed (e.g. no mic support in this environment) — transcription
      // can still run on its own, so the student still gets notes without the audio file.
    }

    if (SPEECH_RECOGNITION_AVAILABLE) {
      const perm = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
      if (perm.granted) {
        shouldListenRef.current = true;
        ExpoSpeechRecognitionModule.start({ lang: 'en-US', interimResults: true, continuous: true });
      }
    }

    setSeconds(0);
    setTranscriptLines([]);
    setPartialText('');
    setBookmarks([]);
    setScreenState('recording');
    dispatch(setIsRecording(true));
    dispatch(addXP(20));
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  const pauseRecording = async () => {
    shouldListenRef.current = false;
    ExpoSpeechRecognitionModule?.stop();
    try { await recordingRef.current?.pauseAsync(); } catch { /* not supported on this platform — audio track just keeps going */ }
    setScreenState('paused');
    dispatch(setIsPaused(true));
  };

  const resumeRecording = async () => {
    try { await recordingRef.current?.startAsync(); } catch { /* see pauseRecording */ }
    if (SPEECH_RECOGNITION_AVAILABLE) {
      shouldListenRef.current = true;
      ExpoSpeechRecognitionModule.start({ lang: 'en-US', interimResults: true, continuous: true });
    }
    setScreenState('recording');
    dispatch(setIsPaused(false));
  };

  const addBookmark = () => {
    const label = `Bookmark ${bookmarks.length + 1} - ${formatTime(seconds)}`;
    setBookmarks(prev => [...prev, { time: seconds, label }]);
    pendingBookmarkLabelRef.current = label;
    dispatch(addXP(5));
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const stopRecording = async () => {
    shouldListenRef.current = false;
    ExpoSpeechRecognitionModule?.stop();

    let uri = '';
    try {
      await recordingRef.current?.stopAndUnloadAsync();
      uri = recordingRef.current?.getURI() || '';
    } catch { /* recording may never have started successfully — proceed without audio */ }
    recordingRef.current = null;

    dispatch(setIsRecording(false));
    setScreenState('processing');

    const fullTranscript = transcriptLines.map(l => l.text).join(' ').trim();
    const notes = fullTranscript ? await generateLectureNotes(fullTranscript, subject, lectureName) : null;
    if (notes) dispatch(addXP(30));

    const lecture: LectureNote = {
      id: `lecture_${Date.now()}`,
      name: lectureName.trim() || 'Untitled Lecture',
      subject,
      date: new Date().toISOString(),
      duration: seconds,
      transcript: fullTranscript,
      audioUri: uri,
      bookmarks,
      notes,
      createdAt: new Date().toISOString(),
    };
    dispatch(saveLecture(lecture));
    if (lectures.length + 1 >= 5) tryUnlock('lecture_5');

    router.replace({ pathname: '/recorder/notes' as any, params: { id: lecture.id } });
  };

  const confirmDeleteLecture = (lecture: LectureNote) => {
    Alert.alert('Delete lecture?', `"${lecture.name}" will be permanently deleted.`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => dispatch(deleteLecture(lecture.id)) },
    ]);
  };

  const goBack = () => {
    if (screenState === 'idle' || screenState === 'processing') { router.back(); return; }
    Alert.alert('Stop recording?', 'Leaving now will discard this recording.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Discard', style: 'destructive', onPress: () => { shouldListenRef.current = false; ExpoSpeechRecognitionModule?.stop(); recordingRef.current?.stopAndUnloadAsync().catch(() => {}); router.back(); } },
    ]);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={goBack} style={styles.backBtn} accessibilityLabel="Go back" accessibilityRole="button">
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Lecture Recorder</Text>
        {screenState === 'idle' ? (
          <TouchableOpacity onPress={() => setShowSubjects(!showSubjects)} style={styles.subjBtn}>
            <Text style={styles.subjBtnText}>{subject} ▾</Text>
          </TouchableOpacity>
        ) : screenState === 'recording' ? (
          <View style={styles.recordingBadge}>
            <RecordingDot />
            <Text style={styles.recordingBadgeText}>REC {formatTime(seconds)}</Text>
          </View>
        ) : (
          <View style={{ width: 60 }} />
        )}
      </View>

      {showSubjects && screenState === 'idle' && (
        <View style={styles.subjectPicker}>
          {SUBJECTS.map(s => (
            <TouchableOpacity key={s.s} onPress={() => { setSubject(s.s); setShowSubjects(false); }}
              style={[styles.subjectChip, subject === s.s && styles.subjectChipActive]}>
              <Text style={styles.subjectChipText}>{s.s}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {screenState === 'idle' && (
        <ScrollView contentContainerStyle={styles.idleContent} showsVerticalScrollIndicator={false}>
         <ContentWrapper>
          <HomieBot mood="thinking" size={100} />
          <Text style={styles.idleTitle}>Ready to record your lecture</Text>
          <Text style={styles.idleSub}>Make sure your volume is up</Text>

          {!SPEECH_RECOGNITION_AVAILABLE && (
            <View style={styles.warnBanner}>
              <Text style={styles.warnBannerText}>Live transcript needs the full app build, not this preview — the audio still records and you can add notes manually.</Text>
            </View>
          )}

          <TextInput
            value={lectureName} onChangeText={setLectureName}
            placeholder='e.g. "Calc 1 — Derivatives"'
            placeholderTextColor={Colors.muted}
            style={styles.nameInput}
          />

          <TouchableOpacity onPress={startRecording} style={styles.startBtn} activeOpacity={0.85}>
            <Text style={styles.startBtnText}>Start Recording</Text>
          </TouchableOpacity>

          {lectures.length > 0 && (
            <View style={styles.pastWrap}>
              <Text style={styles.pastTitle}>Past Lectures ({lectures.length})</Text>
              {lectures.map(lecture => (
                <TouchableOpacity
                  key={lecture.id}
                  style={styles.lectureCard}
                  onPress={() => router.push({ pathname: '/recorder/notes' as any, params: { id: lecture.id } })}
                  onLongPress={() => confirmDeleteLecture(lecture)}
                  activeOpacity={0.8}
                >
                  <View style={styles.lectureCardTop}>
                    <Text style={styles.lectureCardSubject}>{lecture.subject}</Text>
                    <Text style={styles.lectureCardDate}>{new Date(lecture.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</Text>
                  </View>
                  <Text style={styles.lectureCardName}>{lecture.name}</Text>
                  <Text style={styles.lectureCardMeta}>
                    {Math.round(lecture.duration / 60)} mins · {lecture.notes?.keyPoints.length ?? 0} key points
                  </Text>
                  <Text style={styles.lectureCardLink}>View Notes →</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
         </ContentWrapper>
        </ScrollView>
      )}

      {(screenState === 'recording' || screenState === 'paused') && (
        <View style={styles.recordingBody}>
          <WaveAnimation active={screenState === 'recording'} />
          {screenState === 'paused' && <Text style={styles.pausedText}>Paused — tap Resume to continue</Text>}

          <Text style={styles.transcriptHeading}>LIVE TRANSCRIPT</Text>
          <ScrollView style={styles.transcriptScroll} contentContainerStyle={{ paddingBottom: 20 }}>
            <TranscriptBubble lines={transcriptLines} partialText={screenState === 'recording' ? partialText : ''} />
          </ScrollView>

          <View style={styles.controlsRow}>
            {screenState === 'recording' ? (
              <TouchableOpacity onPress={pauseRecording} style={styles.controlBtn}>
                <Text style={styles.controlBtnText}>Pause</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity onPress={resumeRecording} style={[styles.controlBtn, styles.resumeBtn]}>
                <Text style={styles.controlBtnText}>Resume</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity onPress={addBookmark} disabled={screenState !== 'recording'} style={[styles.controlBtn, screenState !== 'recording' && styles.controlBtnDisabled]}>
              <Text style={styles.controlBtnText}>Add Bookmark</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={stopRecording} style={[styles.controlBtn, styles.stopBtn]}>
              <Text style={styles.stopBtnText}>Stop</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {screenState === 'processing' && (
        <View style={styles.processingWrap}>
          <HomieBot mood="thinking" size={110} />
          <Text style={styles.processingTitle}>Analyzing your lecture...</Text>
          <Text style={styles.processingSub}>Generating smart notes</Text>
          <ProcessingBar />
          <Text style={styles.processingNote}>This takes about 10-20 seconds</Text>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  header: { flexDirection: 'row', alignItems: 'center', padding: 16, paddingBottom: 10, gap: 10, borderBottomWidth: 1, borderBottomColor: Colors.border },
  backBtn: { padding: 4 },
  backArrow: { fontSize: 22, color: Colors.text },
  title: { fontSize: 16, fontWeight: '800', color: Colors.text, flex: 1 },
  subjBtn: { backgroundColor: Colors.bg3, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, borderWidth: 1, borderColor: Colors.border },
  subjBtnText: { fontSize: 12, color: Colors.text },
  subjectPicker: { flexDirection: 'row', flexWrap: 'wrap', gap: 7, padding: 12, backgroundColor: Colors.bg2, borderBottomWidth: 1, borderBottomColor: Colors.border },
  subjectChip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 50, backgroundColor: Colors.bg3, borderWidth: 1, borderColor: Colors.border },
  subjectChipActive: { backgroundColor: 'rgba(124,58,237,0.2)', borderColor: Colors.purpleL },
  subjectChipText: { fontSize: 12, color: Colors.text },
  recordingBadge: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  recordingDot: { width: 9, height: 9, borderRadius: 5, backgroundColor: Colors.red },
  recordingBadgeText: { fontSize: 13, fontWeight: '800', color: Colors.red, fontVariant: ['tabular-nums'] },
  idleContent: { alignItems: 'center', padding: 24, gap: 14 },
  idleTitle: { fontSize: 18, fontWeight: '800', color: Colors.text, textAlign: 'center', marginTop: 4 },
  idleSub: { fontSize: 13, color: Colors.muted, textAlign: 'center', marginTop: -8 },
  warnBanner: { width: '100%', padding: 12, backgroundColor: 'rgba(251,191,36,0.1)', borderRadius: Radius.md, borderWidth: 1, borderColor: 'rgba(251,191,36,0.3)' },
  warnBannerText: { fontSize: 12, color: Colors.yellow, lineHeight: 17, textAlign: 'center' },
  nameInput: { width: '100%', backgroundColor: Colors.bg3, borderWidth: 1, borderColor: Colors.border, borderRadius: Radius.md, color: Colors.text, padding: 14, fontSize: 14 },
  startBtn: { width: '100%', height: 56, borderRadius: Radius.md, backgroundColor: Colors.purple, alignItems: 'center', justifyContent: 'center' },
  startBtnText: { color: Colors.white, fontWeight: '800', fontSize: 16 },
  pastWrap: { width: '100%', marginTop: 10, gap: 10 },
  pastTitle: { fontSize: 13, fontWeight: '700', color: Colors.muted, marginBottom: 2 },
  lectureCard: { backgroundColor: Colors.bg3, borderRadius: Radius.lg, borderWidth: 1, borderColor: Colors.border, padding: 14, gap: 4 },
  lectureCardTop: { flexDirection: 'row', justifyContent: 'space-between' },
  lectureCardSubject: { fontSize: 11, fontWeight: '700', color: Colors.purpleL },
  lectureCardDate: { fontSize: 11, color: Colors.muted },
  lectureCardName: { fontSize: 15, fontWeight: '800', color: Colors.text },
  lectureCardMeta: { fontSize: 12, color: Colors.muted },
  lectureCardLink: { fontSize: 12, fontWeight: '700', color: Colors.purpleL, marginTop: 4 },
  recordingBody: { flex: 1, padding: 16, gap: 14 },
  pausedText: { textAlign: 'center', color: Colors.yellow, fontSize: 13, fontWeight: '600' },
  transcriptHeading: { fontSize: 11, fontWeight: '700', color: Colors.muted, letterSpacing: 1.5, marginTop: 4 },
  transcriptScroll: { flex: 1, backgroundColor: Colors.bg3, borderRadius: Radius.lg, borderWidth: 1, borderColor: Colors.border, padding: 14 },
  controlsRow: { flexDirection: 'row', gap: 8 },
  controlBtn: { flex: 1, paddingVertical: 14, borderRadius: Radius.md, backgroundColor: Colors.bg3, borderWidth: 1, borderColor: Colors.border, alignItems: 'center' },
  controlBtnDisabled: { opacity: 0.4 },
  resumeBtn: { backgroundColor: 'rgba(16,185,129,0.15)', borderColor: Colors.green },
  controlBtnText: { color: Colors.text, fontWeight: '700', fontSize: 13 },
  stopBtn: { backgroundColor: 'rgba(239,68,68,0.15)', borderColor: Colors.red },
  stopBtnText: { color: Colors.red, fontWeight: '800', fontSize: 13 },
  processingWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32, gap: 14 },
  processingTitle: { fontSize: 18, fontWeight: '800', color: Colors.text, marginTop: 8 },
  processingSub: { fontSize: 13, color: Colors.muted, marginTop: -8 },
  processingTrack: { width: '100%', height: 6, backgroundColor: Colors.bg3, borderRadius: 3, overflow: 'hidden', marginTop: 8 },
  processingFill: { height: '100%', backgroundColor: Colors.purple, borderRadius: 3 },
  processingNote: { fontSize: 12, color: Colors.muted, marginTop: 4 },
});
