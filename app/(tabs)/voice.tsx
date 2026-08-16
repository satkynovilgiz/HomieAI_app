
import { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform, TextInput, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import * as Speech from 'expo-speech';
import { requireOptionalNativeModule } from 'expo-modules-core';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { Colors, Radius } from '../../constants/theme';
import { responsive } from '../../constants/responsive';
import { callAI } from '../../lib/aiChat';
import { useTranslation } from '../../hooks/useTranslation';
import { SUBJECTS } from '../../constants/subjects';
import HomieBot from '../../components/mascot/HomieBot';
import AvatarCircle from '../../components/ui/AvatarCircle';

// Omnivox (omnivox.ai) is the planned production TTS/STT provider — high quality,
// but not usable yet without an API key. expo-speech is built in and works in
// Expo Go, so it's the real implementation for now. Swap homieSpeak's body for
// this once an Omnivox key exists; the shape of the call is already correct.
// TODO: Replace with Omnivox once API key is available.
async function omnivoxSpeak(text: string): Promise<void> {
  const response = await fetch('https://api.omnivox.ai/v1/tts', {
    method: 'POST',
    headers: {
      Authorization: 'Bearer YOUR_OMNIVOX_KEY',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ text, voice: 'homie', speed: 1.0, pitch: 1.1 }),
  });
  const { url } = await response.json();
  const { Audio } = await import('expo-av');
  const sound = new Audio.Sound();
  await sound.loadAsync({ uri: url });
  await sound.playAsync();
}

// expo-speech-recognition's native module only exists in a custom EAS build, not Expo Go.
// Importing it directly throws at module-evaluation time (before render), crashing the
// screen to a blank page — so we probe availability first and fall back gracefully.
// On web the package uses the browser's own SpeechRecognition API instead of a native
// module, so the native-module probe doesn't apply there — check for browser support instead.
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

type Status = 'idle' | 'listening' | 'thinking' | 'speaking';

export default function VoiceScreen() {
  const user = useSelector((s: RootState) => s.user.current);
  const { language } = useTranslation();
  const [status, setStatus] = useState<Status>('idle');
  const [convo, setConvo] = useState<Array<{ role: string; text: string }>>([]);
  const [lastReply, setLastReply] = useState('');
  const [liveTranscript, setLiveTranscript] = useState('');
  const [mood, setMood] = useState<'happy' | 'thinking' | 'celebrating' | 'sad' | 'cool'>('happy');
  const [subject, setSubject] = useState('General');
  const [showSubjects, setShowSubjects] = useState(false);
  const [inputText, setInputText] = useState('');

  const transcriptRef = useRef('');
  const convoRef = useRef<Array<{ role: string; text: string }>>([]);
  const handsFreeRef = useRef(false);
  const pulse = useRef(new Animated.Value(1)).current;

  useEffect(() => { if (!user) router.replace('/auth/login'); }, [user]);
  useEffect(() => { convoRef.current = convo; }, [convo]);
  useEffect(() => () => { Speech.stop(); ExpoSpeechRecognitionModule?.stop(); }, []);

  useEffect(() => {
    if (status !== 'listening') { pulse.setValue(1); return; }
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1.12, duration: 500, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1, duration: 500, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [status]);

  useSpeechRecognitionEvent('result', (event: any) => {
    const text = event.results?.[0]?.transcript || '';
    transcriptRef.current = text;
    setLiveTranscript(text);
  });

  useSpeechRecognitionEvent('end', () => {
    const text = transcriptRef.current.trim();
    transcriptRef.current = '';
    setLiveTranscript('');
    if (text) {
      send(text);
    } else {
      handsFreeRef.current = false;
      setStatus('idle');
    }
  });

  useSpeechRecognitionEvent('error', (event: any) => {
    handsFreeRef.current = false;
    setLiveTranscript('');
    if (event?.error !== 'no-speech' && event?.error !== 'aborted') {
      setLastReply("couldn't hear you — check mic permissions and try again");
    }
    setStatus('idle');
  });

  const send = async (text: string) => {
    setConvo(prev => [...prev, { role: 'you', text }]);
    setStatus('thinking'); setMood('thinking');
    try {
      const history = convoRef.current.map(c => ({ role: c.role === 'you' ? 'user' : 'assistant', content: c.text }));
      history.push({ role: 'user', content: text });
      const reply = await callAI(history, subject, true, language);
      const clean = reply.replace(/[*_`#]/g, '').trim();
      setLastReply(clean);
      setConvo(prev => [...prev, { role: 'homie', text: clean }]);
      setStatus('speaking'); setMood('cool');
      // TODO: Replace with Omnivox — swap this Speech.speak call for omnivoxSpeak(clean)
      // once an Omnivox API key is available; see omnivoxSpeak() above.
      Speech.speak(clean, {
        rate: 1.02,
        onDone: () => { if (handsFreeRef.current) startListening(); else { setStatus('idle'); setMood('happy'); } },
        onStopped: () => { setStatus('idle'); setMood('happy'); },
        onError: () => { setStatus('idle'); setMood('happy'); },
      });
    } catch (err: any) {
      const failMsg = "my bad bro, couldn't reach homie — try again";
      setLastReply(failMsg);
      setConvo(prev => [...prev, { role: 'homie', text: failMsg }]);
      handsFreeRef.current = false;
      setStatus('idle'); setMood('sad');
    }
  };

  const startListening = async () => {
    if (!SPEECH_RECOGNITION_AVAILABLE) {
      setLastReply("voice needs the full app, not Expo Go — ask for that build link");
      handsFreeRef.current = false;
      setStatus('idle');
      return;
    }
    const perm = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
    if (!perm.granted) {
      setLastReply('enable microphone + speech recognition permissions to use voice mode');
      handsFreeRef.current = false;
      setStatus('idle');
      return;
    }
    setMood('thinking');
    setStatus('listening');
    ExpoSpeechRecognitionModule.start({ lang: 'en-US', interimResults: true, continuous: false });
  };

  const handleMic = () => {
    if (status === 'idle') {
      handsFreeRef.current = true;
      startListening();
    } else if (status === 'listening') {
      handsFreeRef.current = false;
      ExpoSpeechRecognitionModule?.stop();
    } else if (status === 'speaking') {
      handsFreeRef.current = false;
      Speech.stop();
      setStatus('idle'); setMood('happy');
    }
  };

  const sendTyped = () => {
    const text = inputText.trim();
    if (!text) return;
    setInputText('');
    send(text);
  };

  const btnColor = status === 'listening' ? Colors.red : status === 'speaking' ? Colors.green : Colors.purple;
  const btnLabel = status === 'listening' ? '⏹' : status === 'thinking' ? '⏳' : status === 'speaking' ? '⏹' : 'mic';

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.title}>Voice Mode</Text>
        <TouchableOpacity onPress={() => setShowSubjects(!showSubjects)} style={styles.subjBtn}>
          <Text style={styles.subjBtnText}>{subject} ▾</Text>
        </TouchableOpacity>
      </View>

      {showSubjects && (
        <View style={styles.subjectPicker}>
          {SUBJECTS.map(s => (
            <TouchableOpacity key={s.s} onPress={() => { setSubject(s.s); setShowSubjects(false); }}
              style={[styles.subjectChip, subject === s.s && styles.subjectChipActive]}>
              <Text style={styles.subjectChipText}>{s.s}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {!SPEECH_RECOGNITION_AVAILABLE && (
          <View style={styles.unavailableBanner}>
            <Text style={styles.unavailableText}>voice needs the full app build, not Expo Go — ask for that build link</Text>
          </View>
        )}

        <Text style={styles.sub}>tap once and just talk — homie listens, replies out loud, then listens again</Text>

        <View style={styles.mascotContainer}>
          <HomieBot mood={mood} size={120} />
        </View>

        <View style={styles.statusBox}>
          <Text style={styles.statusText}>
            {status === 'idle' ? 'tap the mic to start talking' :
             status === 'listening' ? 'listening...' :
             status === 'thinking' ? 'homie is thinking...' :
             'homie is talking...'}
          </Text>
          {status === 'listening' && liveTranscript !== '' && (
            <Text style={styles.liveText} numberOfLines={3}>"{liveTranscript}"</Text>
          )}
          {lastReply !== '' && (status === 'speaking' || status === 'idle') && (
            <Text style={styles.replyText} numberOfLines={4}>{lastReply}</Text>
          )}
        </View>

        {status === 'listening' && (
          <View style={styles.waveContainer}>
            {[0, 1, 2, 3, 4, 5, 6, 7].map(i => (
              <View key={i} style={[styles.waveBar, { height: 10 + Math.sin(i * 0.9) * 20 }]} />
            ))}
          </View>
        )}

        <Animated.View style={{ transform: [{ scale: pulse }] }}>
          <TouchableOpacity
            onPress={handleMic}
            disabled={status === 'thinking'}
            style={[styles.micBtn, { backgroundColor: btnColor, shadowColor: btnColor }]}
            activeOpacity={0.8}>
            <Text style={styles.micBtnText}>{btnLabel}</Text>
          </TouchableOpacity>
        </Animated.View>
        <Text style={styles.micHint}>
          {status === 'idle' ? 'Hold to speak. Release to send.' : status === 'listening' ? 'tap to stop' : status === 'speaking' ? 'tap to interrupt' : ''}
        </Text>

        <View style={styles.inputRow}>
          <TextInput
            style={styles.voiceInput}
            value={inputText}
            onChangeText={setInputText}
            placeholder="type your question..."
            placeholderTextColor={Colors.muted}
            editable={status === 'idle'}
          />
          <TouchableOpacity style={styles.sendBtn} onPress={sendTyped} disabled={status !== 'idle'}>
            <Text style={styles.sendBtnText}>Send</Text>
          </TouchableOpacity>
        </View>

        {convo.length > 0 && (
          <View style={styles.convoBox}>
            <Text style={styles.convoTitle}>CONVERSATION</Text>
            {convo.slice(-6).map((m, i) => (
              <View key={i} style={[styles.convoMsg, { alignSelf: m.role === 'you' ? 'flex-end' : 'flex-start' }]}>
                <AvatarCircle name={m.role === 'you' ? (user?.name || '?') : 'Homie'} color={m.role === 'you' ? user?.avatar : Colors.purple} size={20} />
                <Text style={styles.convoText}>{m.text}</Text>
              </View>
            ))}
          </View>
        )}

        {convo.length > 0 && (
          <TouchableOpacity onPress={() => { setConvo([]); setLastReply(''); }} style={styles.clearBtn}>
            <Text style={styles.clearBtnText}>clear</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: Colors.border },
  title: { fontSize: 26, fontWeight: '900', color: Colors.text },
  subjBtn: { paddingHorizontal: 14, paddingVertical: 8, backgroundColor: Colors.bg3, borderRadius: Radius.full, borderWidth: 1, borderColor: Colors.border },
  subjBtnText: { fontSize: 13, color: Colors.text, fontWeight: '700' },
  subjectPicker: { flexDirection: 'row', flexWrap: 'wrap', gap: 7, paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: Colors.border },
  subjectChip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: Radius.full, backgroundColor: Colors.bg3, borderWidth: 1, borderColor: Colors.border },
  subjectChipActive: { backgroundColor: 'rgba(124,58,237,0.2)', borderColor: Colors.purpleL },
  subjectChipText: { fontSize: 12, color: Colors.text },
  container: { alignItems: 'center', padding: 24 },
  sub: { fontSize: 13, color: Colors.muted, textAlign: 'center', marginBottom: 20, lineHeight: 18 },
  unavailableBanner: { width: '100%', padding: 12, backgroundColor: 'rgba(251,191,36,0.1)', borderRadius: Radius.md, borderWidth: 1, borderColor: 'rgba(251,191,36,0.3)', marginBottom: 16 },
  unavailableText: { fontSize: 12, color: Colors.yellow, textAlign: 'center', lineHeight: 17 },
  mascotContainer: { marginBottom: 16 },
  statusBox: { minHeight: 60, alignItems: 'center', marginBottom: 16, paddingHorizontal: 20 },
  statusText: { fontSize: 16, fontWeight: '700', color: Colors.text, textAlign: 'center' },
  liveText: { fontSize: 14, color: Colors.purpleL, marginTop: 8, textAlign: 'center', fontStyle: 'italic' },
  replyText: { fontSize: 13, color: Colors.muted, marginTop: 8, textAlign: 'center', lineHeight: 19 },
  waveContainer: { flexDirection: 'row', alignItems: 'center', gap: 6, height: 50, marginBottom: 16 },
  waveBar: { width: 6, borderRadius: 4, backgroundColor: Colors.purpleL },
  micBtn: { width: 90, height: 90, borderRadius: 45, alignItems: 'center', justifyContent: 'center', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.5, shadowRadius: 20, elevation: 10 },
  micBtnText: { fontSize: 36 },
  micHint: { fontSize: 13, color: Colors.muted, marginTop: 12, marginBottom: 20 },
  inputRow: { flexDirection: 'row', gap: 10, width: '100%', maxWidth: responsive.maxWidth, marginBottom: 24 },
  voiceInput: { flex: 1, height: 48, backgroundColor: Colors.bg3, borderWidth: 1, borderColor: Colors.border, borderRadius: Radius.md, paddingHorizontal: 14, fontSize: 14, color: Colors.text },
  sendBtn: { paddingHorizontal: 20, borderRadius: Radius.md, backgroundColor: Colors.purple, alignItems: 'center', justifyContent: 'center' },
  sendBtnText: { color: Colors.white, fontWeight: '700', fontSize: 14 },
  convoBox: { width: '100%', backgroundColor: Colors.bg2, borderRadius: Radius.lg, padding: 16, borderWidth: 1, borderColor: Colors.border, gap: 10 },
  convoTitle: { fontSize: 10, fontWeight: '700', color: Colors.muted, letterSpacing: 2, marginBottom: 4 },
  convoMsg: { flexDirection: 'row', gap: 7, maxWidth: '85%' },
  convoRole: { fontSize: 16 },
  convoText: { fontSize: 12, color: Colors.text2, backgroundColor: Colors.bg3, padding: 9, borderRadius: 10, flex: 1, lineHeight: 17 },
  clearBtn: { marginTop: 14, paddingHorizontal: 24, paddingVertical: 10, backgroundColor: Colors.bg3, borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.border },
  clearBtnText: { color: Colors.muted, fontSize: 13 },
});
