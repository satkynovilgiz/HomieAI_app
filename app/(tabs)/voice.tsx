import { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Speech from 'expo-speech';
import { requireOptionalNativeModule } from 'expo-modules-core';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { Colors, Radius } from '../../constants/theme';
import { callAI } from '../../lib/aiChat';
import { useTranslation } from '../../hooks/useTranslation';
import { SUBJECTS } from '../../constants/subjects';
import HomieTalking from '../../components/mascot/HomieTalking';
import SoundWave from '../../components/voice/SoundWave';

// Omnivox (omnivox.ai) is the planned production TTS/STT provider — high quality,
// but not usable yet without an API key. expo-speech is built in and works in
// Expo Go, so it's the real implementation for now. Swap speakResponse's body
// for this once an Omnivox key exists; the shape of the call is already correct.
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

type VoiceState = 'idle' | 'listening' | 'thinking' | 'speaking';

const STATUS_TEXT: Record<Exclude<VoiceState, 'idle'>, string> = {
  listening: 'listening...',
  thinking: 'let me think...',
  speaking: 'talking...',
};

const IDLE_MESSAGES = [
  'what are we studying today?',
  'ask me anything bro',
  'i am ready when you are',
  'what do you need help with?',
  "let's get it fr",
];

const VOICE_ID_KEY = 'hm_voice_id';
// Known good-sounding voice identifiers to prefer if the device has them (real
// iOS devices only — these IDs don't exist on web/Android, the lookup just no-ops there).
const PREFERRED_VOICE_IDS = [
  'com.apple.ttsbundle.Samantha-compact',
  'com.apple.voice.compact.en-US.Samantha',
  'com.apple.ttsbundle.siri_female_en-US_compact',
];

export default function VoiceScreen() {
  const user = useSelector((s: RootState) => s.user.current);
  const { language } = useTranslation();
  const [state, setState] = useState<VoiceState>('idle');
  const [subject, setSubject] = useState('General');
  const [showSubjects, setShowSubjects] = useState(false);
  const [idleMsg] = useState(() => IDLE_MESSAGES[Math.floor(Math.random() * IDLE_MESSAGES.length)]);
  const [homieText, setHomieText] = useState('');
  const [userText, setUserText] = useState('');
  const [voiceId, setVoiceId] = useState<string | undefined>(undefined);

  const transcriptRef = useRef('');
  const bgAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => { if (!user) router.replace('/auth/login'); }, [user]);
  useEffect(() => () => { Speech.stop(); ExpoSpeechRecognitionModule?.stop(); }, []);

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(bgAnim, { toValue: 1, duration: 3000, useNativeDriver: false }),
        Animated.timing(bgAnim, { toValue: 0, duration: 3000, useNativeDriver: false }),
      ])
    ).start();
  }, []);

  // Auto-pick a decent-sounding voice on load instead of exposing a picker —
  // this screen is deliberately chrome-free. A previously saved choice (from
  // when this screen had a manual picker) still wins if it's still available.
  useEffect(() => {
    (async () => {
      try {
        const all = await Speech.getAvailableVoicesAsync();
        const saved = await AsyncStorage.getItem(VOICE_ID_KEY);
        if (saved && all.some(v => v.identifier === saved)) { setVoiceId(saved); return; }
        const byPreferred = all.find(v => PREFERRED_VOICE_IDS.includes(v.identifier));
        const english = all.filter(v => v.language?.toLowerCase().startsWith('en'));
        const enhanced = english.find((v: any) => v.quality === 'Enhanced');
        const pick = byPreferred || enhanced || english[0];
        if (pick) setVoiceId(pick.identifier);
      } catch {}
    })();
  }, []);

  const bgColor = bgAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['rgba(124,58,237,0.04)', 'rgba(124,58,237,0.10)'],
  });

  const speakResponse = (text: string) => {
    setState('speaking');
    Speech.stop();
    // TODO: Replace with Omnivox — swap this Speech.speak call for omnivoxSpeak(text)
    // once an Omnivox API key is available; see omnivoxSpeak() above.
    Speech.speak(text, {
      voice: voiceId,
      pitch: 1.15,
      rate: 1.05,
      onDone: () => setState('idle'),
      onStopped: () => setState('idle'),
      onError: () => setState('idle'),
    });
  };

  const getResponse = async (userMsg: string) => {
    setState('thinking');
    try {
      const reply = await callAI([{ role: 'user', content: userMsg }], subject, true, language);
      const clean = reply.replace(/[*_`#]/g, '').trim();
      setHomieText(clean);
      speakResponse(clean);
    } catch {
      const failMsg = 'something went wrong bro try again';
      setHomieText(failMsg);
      speakResponse(failMsg);
    }
  };

  const startListening = async () => {
    if (!SPEECH_RECOGNITION_AVAILABLE) {
      setHomieText('voice needs the full app, not Expo Go — ask for that build link');
      setState('idle');
      return;
    }
    const perm = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
    if (!perm.granted) {
      setHomieText('enable microphone + speech recognition permissions to use voice mode');
      setState('idle');
      return;
    }
    setUserText('');
    setHomieText('');
    setState('listening');
    ExpoSpeechRecognitionModule.start({ lang: 'en-US', interimResults: true, continuous: false });
  };

  useSpeechRecognitionEvent('result', (event: any) => {
    transcriptRef.current = event.results?.[0]?.transcript || '';
  });

  useSpeechRecognitionEvent('end', () => {
    const text = transcriptRef.current.trim();
    transcriptRef.current = '';
    if (text) {
      setUserText(text);
      getResponse(text);
    } else {
      setState('idle');
    }
  });

  useSpeechRecognitionEvent('error', (event: any) => {
    if (event?.error !== 'no-speech' && event?.error !== 'aborted') {
      setHomieText("couldn't hear you — check mic permissions and try again");
    }
    setState('idle');
  });

  const handleTapHomie = () => {
    if (state === 'speaking') {
      Speech.stop();
      setState('idle');
      return;
    }
    if (state === 'thinking') return;
    if (state === 'idle') {
      startListening();
      return;
    }
    if (state === 'listening') {
      ExpoSpeechRecognitionModule?.stop();
    }
  };

  const getMascotMood = (): 'happy' | 'thinking' | 'celebrating' => {
    if (state === 'thinking') return 'thinking';
    if (state === 'speaking') return 'celebrating';
    return 'happy';
  };

  return (
    <SafeAreaView style={styles.safe}>
      {/* Top bar */}
      <View style={styles.topBar}>
        <View style={{ width: 40 }} />
        <TouchableOpacity style={styles.subjectPill} onPress={() => setShowSubjects(v => !v)}>
          <Text style={styles.subjectText}>{subject}</Text>
          <Text style={styles.subjectArrow}>{showSubjects ? '▲' : '▼'}</Text>
        </TouchableOpacity>
        <View style={{ width: 40 }} />
      </View>

      {showSubjects && (
        <View style={styles.subjectDropdown}>
          {SUBJECTS.map(s => (
            <TouchableOpacity
              key={s.s}
              style={[styles.subjectOption, subject === s.s && styles.subjectOptionActive]}
              onPress={() => { setSubject(s.s); setShowSubjects(false); }}
            >
              <Text style={[styles.subjectOptionText, subject === s.s && { color: Colors.white }]}>{s.s}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      <Animated.View style={[styles.content, { backgroundColor: bgColor }]}>
        {userText ? (
          <View style={styles.userBubble}>
            <Text style={styles.userBubbleText}>{userText}</Text>
          </View>
        ) : null}

        <TouchableOpacity onPress={handleTapHomie} activeOpacity={0.9} style={styles.mascotWrap}>
          <HomieTalking
            isTalking={state === 'speaking'}
            isListening={state === 'listening'}
            size={200}
            mood={getMascotMood()}
          />
        </TouchableOpacity>

        {(state === 'speaking' || state === 'listening') && (
          <View style={styles.waveWrap}>
            <SoundWave
              isActive
              color={state === 'listening' ? Colors.green : Colors.purpleL}
            />
          </View>
        )}

        {homieText ? (
          <View style={styles.homieBubble}>
            <Text style={styles.homieBubbleText} numberOfLines={4}>{homieText}</Text>
          </View>
        ) : null}

        <Text style={[
          styles.statusText,
          state === 'listening' && { color: Colors.green },
          state === 'speaking' && { color: Colors.purpleL },
        ]}>
          {state === 'idle' ? idleMsg : STATUS_TEXT[state]}
        </Text>

        {state === 'idle' && <Text style={styles.hintText}>tap Homie to speak</Text>}
        {state === 'speaking' && <Text style={styles.hintText}>tap to stop</Text>}
        {state === 'listening' && <Text style={styles.hintText}>tap to stop listening</Text>}
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12 },
  subjectPill: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: Colors.bg2, borderWidth: 1, borderColor: Colors.border, borderRadius: Radius.full, paddingHorizontal: 16, paddingVertical: 8 },
  subjectText: { fontSize: 14, fontWeight: '700', color: Colors.text },
  subjectArrow: { fontSize: 10, color: Colors.muted },
  subjectDropdown: { position: 'absolute', top: 60, left: '50%', transform: [{ translateX: -80 }], width: 160, backgroundColor: Colors.bg2, borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.border, zIndex: 100, overflow: 'hidden' },
  subjectOption: { padding: 14, borderBottomWidth: 1, borderBottomColor: Colors.border },
  subjectOptionActive: { backgroundColor: Colors.purple },
  subjectOptionText: { fontSize: 14, fontWeight: '600', color: Colors.muted, textAlign: 'center' },
  content: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24, gap: 16 },
  mascotWrap: { alignItems: 'center', justifyContent: 'center' },
  waveWrap: { height: 60, alignItems: 'center', justifyContent: 'center' },
  userBubble: { backgroundColor: Colors.purple, borderRadius: 18, borderBottomRightRadius: 4, paddingHorizontal: 16, paddingVertical: 10, maxWidth: '80%', alignSelf: 'flex-end' },
  userBubbleText: { fontSize: 14, color: Colors.white, lineHeight: 20 },
  homieBubble: { backgroundColor: Colors.bg2, borderRadius: 18, borderBottomLeftRadius: 4, paddingHorizontal: 16, paddingVertical: 12, maxWidth: '85%', borderWidth: 1, borderColor: Colors.border },
  homieBubbleText: { fontSize: 14, color: Colors.text, lineHeight: 22, textAlign: 'center' },
  statusText: { fontSize: 16, fontWeight: '600', color: Colors.muted, textAlign: 'center' },
  hintText: { fontSize: 12, color: Colors.muted, opacity: 0.5, textAlign: 'center' },
});
