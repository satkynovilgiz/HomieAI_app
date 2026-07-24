
import { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Audio } from 'expo-av';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { Colors, Radius } from '../../constants/theme';
import { callGemini, getSystemPrompt } from '../../lib/gemini';
import HomieBot from '../../components/mascot/HomieBot';

export default function VoiceScreen() {
  const user = useSelector((s: RootState) => s.user.current);
  const [status, setStatus] = useState<'idle'|'listening'|'thinking'|'speaking'>('idle');
  const [convo, setConvo] = useState<Array<{role:string;text:string}>>([]);
  const [lastReply, setLastReply] = useState('');
  const [mood, setMood] = useState<'happy'|'thinking'|'celebrating'>('happy');

  useEffect(() => { if (!user) router.replace('/auth/login'); }, [user]);

  const getMicResponse = async () => {
    setStatus('thinking'); setMood('thinking');
    try {
      const prompt = 'The student just spoke to you via voice. Give a short, friendly voice response under 100 words. Be conversational and energetic like a real friend.';
      const apiMsgs = convo.map(c => ({ role: c.role === 'you' ? 'user' : 'assistant', content: c.text }));
      apiMsgs.push({ role: 'user', content: prompt });
      const reply = await callGemini(apiMsgs, getSystemPrompt('General'));
      const clean = reply.replace(/[*_`#]/g, '').substring(0, 300);
      setLastReply(clean);
      setConvo(prev => [...prev, { role: 'homie', text: clean }]);
      setStatus('speaking'); setMood('happy');
      setTimeout(() => setStatus('idle'), 3000);
    } catch(err: any) {
      setLastReply('my bad bro, try again 😅');
      setStatus('idle');
    }
  };

  const handleMic = async () => {
    if (status === 'listening') {
      setConvo(prev => [...prev, { role: 'you', text: '(voice input)' }]);
      setStatus('idle');
      await getMicResponse();
    } else if (status === 'idle') {
      setStatus('listening'); setMood('thinking');
    }
  };

  const btnColor = status === 'listening' ? Colors.red : status === 'speaking' ? Colors.green : Colors.purple;
  const btnLabel = status === 'listening' ? '⏹ Stop' : status === 'thinking' ? '⏳' : status === 'speaking' ? '🔊' : '🎤';

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Voice Mode 🎤</Text>
      </View>

      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <Text style={styles.sub}>Talk to HOMIE — it listens and talks back</Text>

        {/* Mascot */}
        <View style={styles.mascotContainer}>
          <HomieBot mood={mood} size={160}/>
        </View>

        {/* Status */}
        <View style={styles.statusBox}>
          <Text style={styles.statusText}>
            {status === 'idle' ? 'Tap the mic to start talking' :
             status === 'listening' ? '🎤 Listening...' :
             status === 'thinking' ? '🤔 HOMIE is thinking...' :
             '🔊 HOMIE is talking...'}
          </Text>
          {lastReply !== '' && status === 'speaking' && (
            <Text style={styles.replyText} numberOfLines={4}>{lastReply}</Text>
          )}
        </View>

        {/* Wave bars */}
        {status === 'listening' && (
          <View style={styles.waveContainer}>
            {[0,1,2,3,4,5,6,7].map(i => (
              <View key={i} style={[styles.waveBar, { height: 10 + Math.sin(i * 0.9) * 20 }]}/>
            ))}
          </View>
        )}

        {/* Mic button */}
        <TouchableOpacity
          onPress={handleMic}
          disabled={status === 'thinking'}
          style={[styles.micBtn, { backgroundColor: btnColor, shadowColor: btnColor }]}
          activeOpacity={0.8}>
          <Text style={styles.micBtnText}>{btnLabel}</Text>
        </TouchableOpacity>
        <Text style={styles.micHint}>
          {status === 'idle' ? 'Tap to speak' : status === 'listening' ? 'Tap to stop' : ''}
        </Text>

        {/* Conversation history */}
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
  sub: { fontSize: 14, color: Colors.muted, textAlign: 'center', marginBottom: 24 },
  mascotContainer: { marginBottom: 20 },
  statusBox: { minHeight: 70, alignItems: 'center', marginBottom: 16, paddingHorizontal: 20 },
  statusText: { fontSize: 16, fontWeight: '700', color: Colors.text, textAlign: 'center' },
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
