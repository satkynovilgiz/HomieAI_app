
import { useState, useCallback, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useDispatch, useSelector } from 'react-redux';
import * as ImagePicker from 'expo-image-picker';
import * as Haptics from 'expo-haptics';
import { RootState } from '../../store';
import { addMsg, clearMsgs, setSubject, setLoading, addSessionXP, setMood, updateMsg } from '../../store/slices/chatSlice';
import { addXP, addCorrect, addHistory } from '../../store/slices/userSlice';
import { addToHistory } from '../../lib/firestoreService';
import { callAI } from '../../lib/aiChat';
import { parseQuiz } from '../../lib/utils';
import { Colors, Radius } from '../../constants/theme';
import { SUBJECTS, VIDEO_DB } from '../../constants/subjects';
import HomieBot from '../../components/mascot/HomieBot';
import QuizCard from '../../components/ui/QuizCard';
import VideoCard from '../../components/ui/VideoCard';
import { TrashIcon, CameraIcon } from '../../components/icons';

const QUICK_PROMPTS = ['quiz me', 'explain simply', 'give an example', 'challenge me', 'real world use?'];

export default function ChatScreen() {
  const dispatch = useDispatch();
  const { messages, loading, subject, mood, sessionXP } = useSelector((s: RootState) => s.chat);
  const user = useSelector((s: RootState) => s.user.current);
  const [input, setInput] = useState('');
  const [imgB64, setImgB64] = useState<string | null>(null);
  const [imgPreview, setImgPreview] = useState<string | null>(null);
  const [showSubjects, setShowSubjects] = useState(false);
  const listRef = useRef<FlatList>(null);
  const sessionStartRef = useRef(Date.now());
  const latestRef = useRef({ sessionXP, subject, messages, user });

  useEffect(() => { if (!user) router.replace('/auth/login'); }, [user]);
  useEffect(() => { latestRef.current = { sessionXP, subject, messages, user }; });

  // Record this chat session into history when leaving the screen, not per-message —
  // one meaningful entry per visit instead of spamming a row for every reply.
  useEffect(() => {
    return () => {
      const { sessionXP: xp, subject: subj, messages: msgs, user: u } = latestRef.current;
      if (xp <= 0 || !u) return;
      const lastAiMsg = [...msgs].reverse().find(m => m.role === 'assistant');
      const preview = typeof lastAiMsg?.content === 'string' ? lastAiMsg.content.slice(0, 100) : 'AI chat session';
      const duration_mins = Math.max(1, Math.round((Date.now() - sessionStartRef.current) / 60000));
      dispatch(addHistory({ subject: subj, preview, xp_earned: xp, duration_mins }));
      addToHistory(u.uid, { subject: subj, preview, xp_earned: xp, duration_mins });
    };
  }, []);

  const send = useCallback(async (overText?: string, overImg?: string | null) => {
    const text = overText ?? input.trim();
    const img = overImg !== undefined ? overImg : imgB64;
    if (!text && !img) return;

    setInput(''); setImgPreview(null); setImgB64(null);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    const content = img
      ? [{ type: 'image', media_type: 'image/jpeg', data: img }, { type: 'text', text: text || 'Explain this for me bro' }]
      : text;

    const userMsg = { id: Date.now().toString(), role: 'user' as const, content, timestamp: Date.now() };
    dispatch(addMsg(userMsg));
    dispatch(setLoading(true));
    dispatch(setMood('thinking'));

    try {
      const apiMsgs = [...messages, userMsg].map(m => ({ role: m.role, content: m.content }));
      const reply = await callAI(apiMsgs, subject);
      const quiz = parseQuiz(reply);
      const clean = reply.replace(/QUIZ_START[\s\S]+?QUIZ_END/, '').trim();
      const video = Math.random() > 0.5 ? VIDEO_DB[Math.floor(Math.random() * VIDEO_DB.length)] : null;

      dispatch(addMsg({ id: (Date.now() + 1).toString(), role: 'assistant', content: clean, quiz, video, timestamp: Date.now() }));
      dispatch(setMood('happy'));
      dispatch(addSessionXP(5 + (quiz ? 10 : 0)));
      dispatch(addXP(5));
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (err: any) {
      dispatch(addMsg({ id: (Date.now() + 1).toString(), role: 'assistant', content: 'my bad bro 😅 — try again', timestamp: Date.now() }));
      dispatch(setMood('sad'));
    } finally {
      dispatch(setLoading(false));
      setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);
    }
  }, [input, imgB64, messages, subject, dispatch]);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({ base64: true, quality: 0.7 });
    if (!result.canceled && result.assets[0].base64) {
      setImgB64(result.assets[0].base64);
      setImgPreview(result.assets[0].uri);
    }
  };

  const handleQuizAnswer = (msgId: string, idx: number, correct: boolean) => {
    dispatch(updateMsg({ id: msgId, answered: idx, showExp: true }));
    if (correct) {
      dispatch(addXP(20)); dispatch(addCorrect());
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      dispatch(setMood('celebrating'));
    } else {
      dispatch(setMood('sad'));
    }
    setTimeout(() => dispatch(setMood('happy')), 2000);
  };

  const renderMsg = ({ item }: { item: any }) => {
    const isUser = item.role === 'user';
    const textContent = typeof item.content === 'string' ? item.content : item.content?.find?.((c: any) => c.type === 'text')?.text || '';

    return (
      <View style={[styles.msgRow, isUser && styles.msgRowUser]}>
        {!isUser && <HomieBot mood="happy" size={28}/>}
        <View style={styles.msgCol}>
          <View style={[styles.bubble, isUser ? styles.bubbleUser : styles.bubbleAI]}>
            <Text style={[styles.bubbleText, isUser && styles.bubbleTextUser]}>{textContent}</Text>
          </View>
          {item.quiz && !isUser && (
            <QuizCard quiz={item.quiz} onAnswer={(idx, correct) => handleQuizAnswer(item.id, idx, correct)}/>
          )}
          {item.video && !isUser && (
            <VideoCard video={item.video} onPress={() => {}}/>
          )}
        </View>
        {isUser && <Text style={styles.avatar}>{user?.avatar || '🧑'}</Text>}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Topbar */}
      <View style={styles.topbar}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <HomieBot mood={mood as any} size={32}/>
        <View style={styles.topbarInfo}>
          <Text style={styles.topbarTitle}>Homie</Text>
          <Text style={styles.topbarSub}>⭐{user?.xp} · Lv.{user?.level} · +{sessionXP}XP</Text>
        </View>
        <TouchableOpacity onPress={() => setShowSubjects(!showSubjects)} style={styles.subjBtn}>
          <Text style={styles.subjBtnText}>{SUBJECTS.find(s => s.s === subject)?.e} {subject} ▾</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => dispatch(clearMsgs())} style={styles.clearBtn}>
          <TrashIcon color={Colors.muted} size={18} />
        </TouchableOpacity>
      </View>

      {/* Subject picker */}
      {showSubjects && (
        <View style={styles.subjectPicker}>
          {SUBJECTS.map(s => (
            <TouchableOpacity key={s.s} onPress={() => { dispatch(setSubject(s.s)); setShowSubjects(false); }}
              style={[styles.subjectChip, subject === s.s && styles.subjectChipActive]}>
              <Text style={styles.subjectChipText}>{s.e} {s.s}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        {/* Messages */}
        {messages.length === 0 ? (
          <View style={styles.welcome}>
            <HomieBot mood="happy" size={100}/>
            <Text style={styles.welcomeTitle}>yo {user?.name?.split(' ')[0]}! what are we studying? 📚</Text>
            <Text style={styles.welcomeSub}>ask anything, upload homework, or just talk</Text>
            <View style={styles.prompts}>
              {QUICK_PROMPTS.map(p => (
                <TouchableOpacity key={p} onPress={() => send(p)} style={styles.promptBtn}>
                  <Text style={styles.promptText}>{p}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ) : (
          <FlatList
            ref={listRef} data={messages} renderItem={renderMsg} keyExtractor={m => m.id}
            contentContainerStyle={styles.msgList} showsVerticalScrollIndicator={false}
            ListFooterComponent={loading ? (
              <View style={styles.typingRow}>
                <HomieBot mood="thinking" size={28}/>
                <View style={styles.typingBubble}>
                  <Text style={styles.typingText}>thinking...</Text>
                </View>
              </View>
            ) : null}
          />
        )}

        {/* Image preview */}
        {imgPreview && (
          <View style={styles.imgPreview}>
            <Image source={{ uri: imgPreview }} style={styles.imgPreviewImg}/>
            <Text style={styles.imgPreviewText}>📸 photo's in — ask something or just send</Text>
            <TouchableOpacity onPress={() => { setImgPreview(null); setImgB64(null); }}>
              <Text style={styles.imgPreviewClose}>✕</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Input bar */}
        <View style={styles.inputBar}>
          <TouchableOpacity onPress={pickImage} style={[styles.iconBtn, imgPreview && styles.iconBtnActive]}>
            <CameraIcon color={imgPreview ? Colors.purpleL : Colors.muted} size={20} />
          </TouchableOpacity>
          <TextInput
            style={styles.textInput}
            value={input} onChangeText={setInput}
            placeholder={`Ask about ${subject}...`}
            placeholderTextColor={Colors.muted}
            multiline maxLength={500}
            onSubmitEditing={() => send()}
            returnKeyType="send"
          />
          <TouchableOpacity
            onPress={() => send()} disabled={loading || (!input.trim() && !imgB64)}
            style={[styles.sendBtn, (loading || (!input.trim() && !imgB64)) && styles.sendBtnDisabled]}>
            <Text style={styles.sendBtnText}>→</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  topbar: { flexDirection: 'row', alignItems: 'center', padding: 10, gap: 8, borderBottomWidth: 1, borderBottomColor: Colors.border, backgroundColor: Colors.bg2 },
  backBtn: { padding: 4 },
  backArrow: { fontSize: 22, color: Colors.text },
  topbarInfo: { flex: 1 },
  topbarTitle: { fontSize: 14, fontWeight: '800', color: Colors.text },
  topbarSub: { fontSize: 10, color: Colors.muted },
  subjBtn: { backgroundColor: Colors.bg3, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, borderWidth: 1, borderColor: Colors.border },
  subjBtnText: { fontSize: 12, color: Colors.text },
  clearBtn: { padding: 4 },
  clearBtnText: { fontSize: 18 },
  subjectPicker: { flexDirection: 'row', flexWrap: 'wrap', gap: 7, padding: 12, backgroundColor: Colors.bg2, borderBottomWidth: 1, borderBottomColor: Colors.border },
  subjectChip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 50, backgroundColor: Colors.bg3, borderWidth: 1, borderColor: Colors.border },
  subjectChipActive: { backgroundColor: 'rgba(124,58,237,0.2)', borderColor: Colors.purpleL },
  subjectChipText: { fontSize: 12, color: Colors.text },
  welcome: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  welcomeTitle: { fontSize: 18, fontWeight: '800', color: Colors.text, marginTop: 16, textAlign: 'center' },
  welcomeSub: { fontSize: 13, color: Colors.muted, marginTop: 6, textAlign: 'center' },
  prompts: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'center', marginTop: 20 },
  promptBtn: { paddingHorizontal: 14, paddingVertical: 9, backgroundColor: Colors.bg3, borderRadius: 50, borderWidth: 1, borderColor: Colors.border },
  promptText: { fontSize: 13, color: Colors.text2 },
  msgList: { padding: 14, gap: 12 },
  msgRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 8 },
  msgRowUser: { flexDirection: 'row-reverse' },
  msgCol: { flex: 1, gap: 8 },
  bubble: { maxWidth: '85%', padding: 12, borderRadius: 18 },
  bubbleUser: { backgroundColor: Colors.purple, borderBottomRightRadius: 4, alignSelf: 'flex-end' },
  bubbleAI: { backgroundColor: Colors.bg3, borderWidth: 1, borderColor: Colors.border, borderBottomLeftRadius: 4 },
  bubbleText: { fontSize: 14, color: Colors.text, lineHeight: 21 },
  bubbleTextUser: { color: Colors.white },
  avatar: { fontSize: 20 },
  typingRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 8, padding: 4 },
  typingBubble: { backgroundColor: Colors.bg3, borderWidth: 1, borderColor: Colors.border, borderRadius: 18, borderBottomLeftRadius: 4, padding: 12 },
  typingText: { fontSize: 13, color: Colors.muted },
  imgPreview: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 10, backgroundColor: Colors.bg2, borderTopWidth: 1, borderTopColor: Colors.border },
  imgPreviewImg: { width: 52, height: 52, borderRadius: 8 },
  imgPreviewText: { flex: 1, fontSize: 12, color: Colors.text2 },
  imgPreviewClose: { fontSize: 18, color: Colors.muted, padding: 4 },
  inputBar: { flexDirection: 'row', alignItems: 'flex-end', gap: 8, padding: 10, backgroundColor: Colors.bg2, borderTopWidth: 1, borderTopColor: Colors.border },
  iconBtn: { width: 42, height: 42, borderRadius: 12, backgroundColor: Colors.bg3, borderWidth: 1, borderColor: Colors.border, alignItems: 'center', justifyContent: 'center' },
  iconBtnActive: { borderColor: Colors.purpleL, backgroundColor: 'rgba(124,58,237,0.15)' },
  iconBtnText: { fontSize: 20 },
  textInput: { flex: 1, backgroundColor: Colors.bg3, borderWidth: 1, borderColor: Colors.border, borderRadius: 14, color: Colors.text, paddingHorizontal: 14, paddingVertical: 10, fontSize: 14, maxHeight: 100 },
  sendBtn: { width: 42, height: 42, borderRadius: 12, backgroundColor: Colors.purple, alignItems: 'center', justifyContent: 'center' },
  sendBtnDisabled: { opacity: 0.5 },
  sendBtnText: { fontSize: 20, color: Colors.white, fontWeight: '700' },
});
