
import { useState, useCallback, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path, Circle } from 'react-native-svg';
import { router } from 'expo-router';
import { useDispatch, useSelector } from 'react-redux';
import * as ImagePicker from 'expo-image-picker';
import * as Haptics from 'expo-haptics';
import { RootState } from '../../store';
import store from '../../store';
import { addMsg, clearMsgs, setSubject, setLoading, addSessionXP, setMood, updateMsg } from '../../store/slices/chatSlice';
import { addXP, addCorrect, addHistory } from '../../store/slices/userSlice';
import { saveItem, loadItems, persistSavedItems, loadSavedItemsFromStorage } from '../../store/slices/videosSlice';
import { addToHistory } from '../../lib/firestoreService';
import { callAI } from '../../lib/aiChat';
import { parseQuiz } from '../../lib/utils';
import { detectSearchIntent } from '../../lib/searchDetector';
import { smartSearch, searchWeb, VideoResult, ArticleResult } from '../../lib/searchService';
import { Colors, Radius } from '../../constants/theme';
import { SUBJECTS } from '../../constants/subjects';
import HomieBot from '../../components/mascot/HomieBot';
import QuizCard from '../../components/ui/QuizCard';
import SearchVideoCard from '../../components/chat/VideoCard';
import SearchArticleCard from '../../components/chat/ArticleCard';
import { TrashIcon, CameraIcon } from '../../components/icons';

const CASUAL_STARTS = ['hi', 'hey', 'hello', 'yo', 'sup', 'thanks', 'thank you', 'ok', 'okay', 'lol', 'bye', 'cool', 'nice', 'k'];

// Substring-matched deliberately (not word-boundary) so contractions, typos, and
// trailing slang ("i don't get it fr") all still hit — see isConfusionMessage.
const CONFUSION_PHRASES = [
  "i don't understand", "i don't get it", "don't get it", "i don't get", "don't understand",
  "i still don't", "still don't", 'not making sense', 'makes no sense', 'what do you mean',
  'explain again', 'explain more', 'more detail', 'go deeper', 'tell me more', 'more info',
  "i'm confused", 'im confused', 'confused', 'huh', 'what', '???', '??', "don't get",
  'ngl', 'fr', 'bruh', 'bro what', 'what bro',
];

function isConfusionMessage(msg: string): boolean {
  const lower = msg.toLowerCase().trim();
  return CONFUSION_PHRASES.some(phrase => lower.includes(phrase));
}

// Extracts a short topic keyword string from a real (non-confusion) user message
// by stripping conversational filler — e.g. "explain the chain rule to me pls" -> "chain rule".
function extractTopic(msg: string): string {
  const stopWords = [
    'explain', 'what', 'is', 'are', 'the', 'a', 'an',
    'how', 'does', 'work', 'tell', 'me', 'about', 'can',
    'you', 'please', 'bro', 'help', 'understand', 'define',
    'meaning', 'of', 'do', 'and', 'for', 'to', 'in',
    'it', 'this', 'that', 'with', 'on', 'at', 'by',
    'give', 'show', 'find', 'get', 'let', 'want',
    'need', 'know', 'think', 'see', 'try', 'use',
    'make', 'take', 'go', 'come', 'look', 'also',
    'just', 'like', 'so', 'but', 'if', 'then',
    'than', 'too', 'very', 'really', 'actually',
    'basically', 'fr', 'ngl', 'nah', 'yeah', 'ok',
    'okay', 'uh', 'um', 'hmm', 'huh', 'pls', 'plz',
    'u', 'ur', 'im', 'i', 'my', 'me', 'we', 'they',
  ];

  const words = msg.toLowerCase()
    .replace(/[?!.,]/g, '')
    .split(' ')
    .filter(w => !stopWords.includes(w))
    .filter(w => w.length > 2);

  return words.slice(0, 4).join(' ');
}

// Only a bare greeting/acknowledgement counts as a reset — "cool now walk me
// through X" legitimately starts with "cool" but is a real follow-up question,
// so this must match the WHOLE message, not just a leading word.
function isGreetingMessage(text: string): boolean {
  const normalized = text.trim().toLowerCase().replace(/[.!?]+$/, '');
  return CASUAL_STARTS.includes(normalized);
}

function PlayIcon() {
  return (
    <Svg width={12} height={12} viewBox="0 0 24 24" fill="none">
      <Path d="M6 4L20 12L6 20V4Z" fill="#ef4444"/>
    </Svg>
  );
}

function SearchIcon() {
  return (
    <Svg width={12} height={12} viewBox="0 0 24 24" fill="none">
      <Circle cx="10.5" cy="10.5" r="6.5" stroke="#3b82f6" strokeWidth="2"/>
      <Path d="M20 20L15.2 15.2" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round"/>
    </Svg>
  );
}

function DocIcon() {
  return (
    <Svg width={12} height={12} viewBox="0 0 24 24" fill="none">
      <Path d="M6 3H14L19 8V21H6V3Z" stroke="#10b981" strokeWidth="2" strokeLinejoin="round"/>
      <Path d="M9 12H15M9 16H15" stroke="#10b981" strokeWidth="1.6" strokeLinecap="round"/>
    </Svg>
  );
}

function ResourceBar({ onWatchVideo, onSearchWeb, onArticle }: { onWatchVideo: () => void; onSearchWeb: () => void; onArticle: () => void }) {
  return (
    <View style={styles.resourceBar}>
      <Text style={styles.resourceBarTitle}>want to go deeper on this?</Text>
      <View style={styles.resourceBtnRow}>
        <TouchableOpacity onPress={onWatchVideo} style={[styles.resourceBtn, styles.resourceBtnVideo]}>
          <PlayIcon/>
          <Text style={styles.resourceBtnTextVideo}>Watch Video</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={onSearchWeb} style={[styles.resourceBtn, styles.resourceBtnWeb]}>
          <SearchIcon/>
          <Text style={styles.resourceBtnTextWeb}>Search Web</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={onArticle} style={[styles.resourceBtn, styles.resourceBtnArticle]}>
          <DocIcon/>
          <Text style={styles.resourceBtnTextArticle}>Article</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const QUICK_PROMPTS = ['quiz me', 'explain simply', 'give an example', 'challenge me', 'real world use?'];

export default function ChatScreen() {
  const dispatch = useDispatch();
  const { messages, loading, subject, mood, sessionXP } = useSelector((s: RootState) => s.chat);
  const user = useSelector((s: RootState) => s.user.current);
  const savedItems = useSelector((s: RootState) => s.videos.items);
  const [input, setInput] = useState('');
  const [imgB64, setImgB64] = useState<string | null>(null);
  const [imgPreview, setImgPreview] = useState<string | null>(null);
  const [showSubjects, setShowSubjects] = useState(false);
  const [messageCount, setMessageCount] = useState(0);
  const [shownResources, setShownResources] = useState(false);
  const [realTopic, setRealTopic] = useState('');
  const listRef = useRef<FlatList>(null);
  const sessionStartRef = useRef(Date.now());
  const latestRef = useRef({ sessionXP, subject, messages, user });

  useEffect(() => { if (!user) router.replace('/auth/login'); }, [user]);
  useEffect(() => { latestRef.current = { sessionXP, subject, messages, user }; });
  useEffect(() => { loadSavedItemsFromStorage().then(items => dispatch(loadItems(items))); }, []);

  // New chat session (cleared or subject switched) — reset topic-depth tracking.
  useEffect(() => {
    if (messages.length === 0) { setMessageCount(0); setShownResources(false); setRealTopic(''); }
  }, [messages.length]);

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

  const isItemSaved = (url: string) => savedItems.some(i => i.url === url);

  const handleSaveVideo = (video: VideoResult, query: string) => {
    dispatch(saveItem({
      id: `v_${video.videoId}`, type: 'video', title: video.title, url: video.url,
      thumbnail: video.thumbnail, source: video.source, channelTitle: video.channelTitle,
      videoId: video.videoId, savedAt: new Date().toISOString(), query,
    }));
    persistSavedItems(store.getState().videos.items);
  };

  const handleSaveArticle = (article: ArticleResult, query: string) => {
    dispatch(saveItem({
      id: `a_${article.id}_${Date.now()}`, type: 'article', title: article.title, url: article.url,
      thumbnail: article.thumbnail, source: article.source, savedAt: new Date().toISOString(), query,
    }));
    persistSavedItems(store.getState().videos.items);
  };

  const handleResourceAction = async (msgId: string, kind: 'video' | 'web' | 'article', query: string) => {
    dispatch(updateMsg({ id: msgId, showResourceBar: false, resourceLoading: kind } as any));
    // query is realTopic captured when the resource bar was shown — it's never a
    // confusion phrase (see the tracking block in send()). If realTopic is still
    // empty (e.g. the very first message was confusion), fall back to the subject.
    try {
      if (kind === 'video') {
        const searchQuery = query ? `${query} explained` : `${subject} tutorial`;
        // smartSearch falls back to a "search YouTube for X" link in `articles`
        // when zero videos come back — must keep it or the bar just vanishes
        // with nothing to show in its place.
        const { videos, articles } = await smartSearch(searchQuery, 'video');
        dispatch(updateMsg({ id: msgId, resourceLoading: null, videos, articles, resourceQuery: query } as any));
      } else if (kind === 'web') {
        const articles = await searchWeb(query || subject);
        dispatch(updateMsg({ id: msgId, resourceLoading: null, articles, resourceQuery: query } as any));
      } else {
        const articles = await searchWeb(`${query || subject} explained`);
        dispatch(updateMsg({ id: msgId, resourceLoading: null, articles, resourceQuery: query } as any));
      }
    } catch {
      dispatch(updateMsg({ id: msgId, resourceLoading: null } as any));
    }
  };

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

    // Track conversation depth on the current topic — a resource bar (Watch Video /
    // Search Web / Article) is offered once a topic has been discussed for a few
    // messages, or immediately if the user signals confusion. A greeting resets it.
    //
    // resourceTopic defaults to the already-tracked realTopic (not this message's
    // text) so that a confusion message ("i don't get it fr") never becomes the
    // search query — it only gets replaced below when this message is a genuine,
    // non-confused topic statement. We compute it into a local instead of reading
    // realTopic state after the setState call below, since state updates aren't
    // visible until the next render.
    let triggerResourceBar = false;
    let resourceTopic = realTopic;
    if (!img && text) {
      if (isGreetingMessage(text)) {
        setMessageCount(0); setShownResources(false); setRealTopic('');
        resourceTopic = '';
      } else {
        const nextCount = messageCount + 1;
        setMessageCount(nextCount);
        const isConfused = isConfusionMessage(text);
        if (!isConfused && text.length > 10) {
          const extracted = extractTopic(text);
          if (extracted.length > 2) {
            resourceTopic = extracted;
            setRealTopic(extracted);
          }
        }
        triggerResourceBar = !shownResources && (isConfused || nextCount >= 3);
      }
    }

    const { type: searchType, query } = !img ? detectSearchIntent(text) : { type: null, query: '' };

    if (searchType) {
      const loadingId = `search_loading_${Date.now()}`;
      const loadingMsg: any = { id: loadingId, role: 'assistant', type: 'loading', content: `Searching for "${query}"...`, timestamp: Date.now() };
      dispatch(addMsg(loadingMsg));

      try {
        const { videos, articles } = await smartSearch(query, searchType);
        dispatch(updateMsg({
          id: loadingId, type: 'search_results', content: `here's what I found on ${query}`,
          videos, articles, query,
        } as any));
        dispatch(setMood('happy'));
        dispatch(addSessionXP(5));
        dispatch(addXP(5));
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

        try {
          const apiMsgs = [...messages, userMsg].map(m => ({ role: m.role, content: m.content }));
          apiMsgs.push({ role: 'user', content: `Give me a brief 2 sentence summary about ${query} so the student knows what they are looking at` });
          const reply = await callAI(apiMsgs, subject);
          dispatch(addMsg({ id: (Date.now() + 1).toString(), role: 'assistant', content: reply.trim(), timestamp: Date.now() }));
        } catch {
          // summary is a nice-to-have — the results are already shown, so a failure here is silent
        }
      } catch (err: any) {
        dispatch(updateMsg({ id: loadingId, type: undefined, content: "couldn't search right now — try again" } as any));
        dispatch(setMood('sad'));
      } finally {
        dispatch(setLoading(false));
        setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);
      }
      return;
    }

    try {
      const apiMsgs = [...messages, userMsg].map(m => ({ role: m.role, content: m.content }));
      const reply = await callAI(apiMsgs, subject);
      const quiz = parseQuiz(reply);
      const clean = reply.replace(/QUIZ_START[\s\S]+?QUIZ_END/, '').trim();

      const assistantMsg: any = { id: (Date.now() + 1).toString(), role: 'assistant', content: clean, quiz, timestamp: Date.now() };
      if (triggerResourceBar) { assistantMsg.showResourceBar = true; assistantMsg.resourceQuery = resourceTopic; setShownResources(true); }
      dispatch(addMsg(assistantMsg));
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
  }, [input, imgB64, messages, subject, dispatch, messageCount, shownResources, realTopic]);

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

    if (item.type === 'loading') {
      return (
        <View style={styles.msgRow}>
          <HomieBot mood="thinking" size={28}/>
          <View style={styles.msgCol}>
            <View style={[styles.bubble, styles.bubbleAI]}>
              <Text style={styles.bubbleText}>{item.content}</Text>
            </View>
          </View>
        </View>
      );
    }

    if (item.type === 'search_results') {
      return (
        <View style={styles.msgRow}>
          <HomieBot mood="happy" size={28}/>
          <View style={styles.msgCol}>
            <View style={[styles.bubble, styles.bubbleAI]}>
              <Text style={styles.bubbleText}>{item.content}</Text>
            </View>
            {(item.videos as VideoResult[] || []).map(v => (
              <SearchVideoCard key={v.id} video={v} isSaved={isItemSaved(v.url)} onSave={() => handleSaveVideo(v, item.query)}/>
            ))}
            {(item.articles as ArticleResult[] || []).map(a => (
              <SearchArticleCard key={a.id} article={a} isSaved={isItemSaved(a.url)} onSave={() => handleSaveArticle(a, item.query)}/>
            ))}
            {!item.videos?.length && !item.articles?.length && (
              <View style={[styles.bubble, styles.bubbleAI]}>
                <Text style={styles.bubbleText}>couldn't find anything for that — try rephrasing</Text>
              </View>
            )}
          </View>
        </View>
      );
    }

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
          {!isUser && item.resourceLoading && (
            <Text style={styles.resourceLoadingText}>looking that up...</Text>
          )}
          {!isUser && (item.videos as VideoResult[] || []).map((v: VideoResult) => (
            <SearchVideoCard key={v.id} video={v} isSaved={isItemSaved(v.url)} onSave={() => handleSaveVideo(v, item.resourceQuery || '')}/>
          ))}
          {!isUser && (item.articles as ArticleResult[] || []).map((a: ArticleResult) => (
            <SearchArticleCard key={a.id} article={a} isSaved={isItemSaved(a.url)} onSave={() => handleSaveArticle(a, item.resourceQuery || '')}/>
          ))}
          {!isUser && item.showResourceBar && (
            <ResourceBar
              onWatchVideo={() => handleResourceAction(item.id, 'video', item.resourceQuery)}
              onSearchWeb={() => handleResourceAction(item.id, 'web', item.resourceQuery)}
              onArticle={() => handleResourceAction(item.id, 'article', item.resourceQuery)}
            />
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
  resourceLoadingText: { fontSize: 12, color: Colors.muted, fontStyle: 'italic' },
  resourceBar: { backgroundColor: 'rgba(124,58,237,0.08)', borderWidth: 1, borderColor: 'rgba(124,58,237,0.18)', borderRadius: 12, padding: 12, marginTop: 6 },
  resourceBarTitle: { fontSize: 11, color: '#9090c0', marginBottom: 8 },
  resourceBtnRow: { flexDirection: 'row', gap: 6 },
  resourceBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 7, borderRadius: 8, borderWidth: 1 },
  resourceBtnVideo: { backgroundColor: 'rgba(239,68,68,0.12)', borderColor: 'rgba(239,68,68,0.25)' },
  resourceBtnWeb: { backgroundColor: 'rgba(59,130,246,0.12)', borderColor: 'rgba(59,130,246,0.25)' },
  resourceBtnArticle: { backgroundColor: 'rgba(16,185,129,0.12)', borderColor: 'rgba(16,185,129,0.25)' },
  resourceBtnTextVideo: { color: '#ef4444', fontSize: 11, fontWeight: '700' },
  resourceBtnTextWeb: { color: '#3b82f6', fontSize: 11, fontWeight: '700' },
  resourceBtnTextArticle: { color: '#10b981', fontSize: 11, fontWeight: '700' },
});
