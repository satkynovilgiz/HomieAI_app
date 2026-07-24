
import { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import * as Speech from 'expo-speech';
import { ExpoSpeechRecognitionModule, useSpeechRecognitionEvent } from 'expo-speech-recognition';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { Colors, Radius } from '../../constants/theme';
import { callGemini, getSystemPrompt } from '../../lib/gemini';
import HomieBot from '../../components/mascot/HomieBot';

type Status = 'idle' | 'listening' | 'thinking' | 'speaking';

export default function VoiceScreen() {
  const user = useSelector((s: RootState) => s.user.current);
  const [status, setStatus] = useState<Status>('idle');
  const [convo, setConvo] = useState<Array<{ role: string; text: string }>>([]);
  const [lastReply, setLastReply] = useState('');
  const [liveTranscript, setLiveTranscript] = useState('');
  const [mood, setMood] = useState<'happy' | 'thinking' | 'celebrating' | 'sad'>('happy');

  const transcriptRef = useRef('');
  const convoRef = useRef<Array<{ role: string; text: string }>>([]);
  const handsFreeRef = useRef(false);

  useEffect(() => { if (!user) router.replace('/auth/login'); }, [user]);
  useEffect(() => { convoRef.current = convo; }, [convo]);
  useEffect(() => () => { Speech.stop(); ExpoSpeechRecognitionModule.stop(); }, []);

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
      setLastReply("Couldn't hear you — check mic permissions and try again 🎤");
    }
    setStatus('idle');
  });

  const send = async (text: string) => {
    setConvo(prev => [...prev, { role: 'you', text }]);
    setStatus('thinking'); setMood('thinking');
    try {
      const history = convoRef.current.map(c => ({ role: c.role === 'you' ? 'user' : 'assistant', content: c.text }));
      history.push({ role: 'user', content: text });
      const prompt = 'You are talking out loud to the student via voice. Reply short and conversational, under 60 words — this will be spoken aloud, not read.';
      const reply = await callGemini(history, getSystemPrompt('General') + '\n' + prompt);
      const clean = reply.replace(/[*_`#]/g, '').trim();
      setLastReply(clean);
      setConvo(prev => [...prev, { role: 'homie', text: clean }]);
      setStatus('speaking'); setMood('happy');
      Speech.speak(clean, {
        rate: 1.02,
        onDone: () => { if (handsFreeRef.current) startListening(); else setStatus('idle'); },
        onStopped: () => setStatus('idle'),
        onError: () => setStatus('idle'),
      });
    } catch (err: any) {
      const failMsg = "my bad bro, couldn't reach HOMIE — try again 😅";
      setLastReply(failMsg);
      setConvo(prev => [...prev, { role: 'homie', text: failMsg }]);
      handsFreeRef.current = false;
      setStatus('idle'); setMood('sad');
    }
  };

  const startListening = async () => {
    const perm = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
    if (!perm.granted) {
      setLastReply('Enable microphone + speech recognition permissions to use Voice Mode 🎤');
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
      ExpoSpeechRecognitionModule.stop();
    } else if (status === 'speaking') {
      handsFreeRef.current = false;
      Speech.stop();
      setStatus('idle');
    }
  };

  const btnColor = status === 'listening' ? Colors.red : status === 'speaking' ? Colors.green : Colors.purple;
  const btnLabel = status === 'listening' ? '⏹' : status === 'thinking' ? '⏳' : status === 'speaking' ? '⏹' : '🎤';

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Voice Mode 🎤</Text>
      </View>

      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <Text style={styles.sub}>Tap once and just talk — HOMIE listens, replies out loud, then listens again</Text>

        <View style={styles.mascotContainer}>
          <HomieBot mood={mood} size={150} />
        </View>

        <View style={styles.statusBox}>
          <Text style={styles.statusText}>
            {status === 'idle' ? 'Tap the mic to start talking' :
             status === 'listening' ? '🎤 Listening...' :
             status === 'thinking' ? '🤔 HOMIE is thinking...' :
             '🔊 HOMIE is talking...'}
          </Text>
          {status === 'listening' && liveTranscript !== '' && (
            <Text style={styles.liveText} numberOfLines={3}>"{liveTranscript}"</Text>
          )}
          {lastReply !== '' && status === 'speaking' && (
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

        <TouchableOpacity
          onPress={handleMic}
          disabled={status === 'thinking'}
          style={[styles.micBtn, { backgroundColor: btnColor, shadowColor: btnColor }]}
          activeOpacity={0.8}>
          <Text style={styles.micBtnText}>{btnLabel}</Text>
        </TouchableOpacity>
        <Text style={styles.micHint}>
          {status === 'idle' ? 'Tap to speak' : status === 'listening' ? 'Tap to stop' : status === 'speaking' ? 'Tap to interrupt' : ''}
        </Text>

        {convo.length > 0 && (
          <View style={styles.convoBox}>
            <Text style={styles.convoTitle}>CONVERSATION</Text>
            {convo.slice(-6).map((m, i) => (
              <View key={i} style={[styles.convoMsg, { alignSelf: m.role === 'you' ? 'flex-end' : 'flex-start' }]}>
                <Text style={styles.convoRole}>{m.role === 'you' ? user?.avatar || '🧑' : '🤖'}</Text>
                <Text style={styles.convoText}>{m.text}</Text>
              </View>
            ))}
          </View>
        )}

        {convo.length > 0 && (
          <TouchableOpacity onPress={() => { setConvo([]); setLastReply(''); }} style={styles.clearBtn}>
            <Text style={styles.clearBtnText}>Clear</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  header: { flexDirection: 'row', alignItems: 'center', padding: 16, paddingBottom: 4, gap: 12 },
  backBtn: { padding: 4 },
  backArrow: { fontSize: 24, color: Colors.text },
  title: { fontSize: 22, fontWeight: '900', color: Colors.text },
  container: { alignItems: 'center', padding: 24 },
  sub: { fontSize: 13, color: Colors.muted, textAlign: 'center', marginBottom: 20, lineHeight: 18 },
  mascotContainer: { marginBottom: 16 },
  statusBox: { minHeight: 60, alignItems: 'center', marginBottom: 16, paddingHorizontal: 20 },
  statusText: { fontSize: 16, fontWeight: '700', color: Colors.text, textAlign: 'center' },
  liveText: { fontSize: 14, color: Colors.purpleL, marginTop: 8, textAlign: 'center', fontStyle: 'italic' },
  replyText: { fontSize: 13, color: Colors.muted, marginTop: 8, textAlign: 'center', lineHeight: 19 },
  waveContainer: { flexDirection: 'row', alignItems: 'center', gap: 6, height: 50, marginBottom: 16 },
  waveBar: { width: 6, borderRadius: 4, backgroundColor: Colors.purpleL },
  micBtn: { width: 100, height: 100, borderRadius: 50, alignItems: 'center', justifyContent: 'center', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.5, shadowRadius: 20, elevation: 10 },
  micBtnText: { fontSize: 40 },
  micHint: { fontSize: 13, color: Colors.muted, marginTop: 12, marginBottom: 24 },
  convoBox: { width: '100%', backgroundColor: Colors.bg2, borderRadius: Radius.lg, padding: 16, borderWidth: 1, borderColor: Colors.border, gap: 10 },
  convoTitle: { fontSize: 10, fontWeight: '700', color: Colors.muted, letterSpacing: 2, marginBottom: 4 },
  convoMsg: { flexDirection: 'row', gap: 7, maxWidth: '85%' },
  convoRole: { fontSize: 16 },
  convoText: { fontSize: 12, color: Colors.text2, backgroundColor: Colors.bg3, padding: 9, borderRadius: 10, flex: 1, lineHeight: 17 },
  clearBtn: { marginTop: 14, paddingHorizontal: 24, paddingVertical: 10, backgroundColor: Colors.bg3, borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.border },
  clearBtnText: { color: Colors.muted, fontSize: 13 },
});
