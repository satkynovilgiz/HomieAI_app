
import { useState, useCallback, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path, Circle } from 'react-native-svg';
import { router, useLocalSearchParams } from 'expo-router';
import { useDispatch, useSelector } from 'react-redux';
import * as ImagePicker from 'expo-image-picker';
import * as Haptics from 'expo-haptics';
import { RootState } from '../../store';
import store from '../../store';
import { addMsg, clearMsgs, setSubject, setLoading, addSessionXP, setMood, updateMsg, loadMessages, Message } from '../../store/slices/chatSlice';
import { addXP, addCorrect, addHistory } from '../../store/slices/userSlice';
import { saveItem, loadItems, persistSavedItems, loadSavedItemsFromStorage } from '../../store/slices/videosSlice';
import {
  createSession, addMessageToSession, setActiveChat,
  persistChatHistory, ChatMessage,
} from '../../store/slices/chatHistorySlice';
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
import ChatSidebar from '../../components/chat/ChatSidebar';
import { TrashIcon, CameraIcon, MenuIcon, PlusIcon } from '../../components/icons';

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

// Extracts a short topic keyword string from a user message by stripping
// conversational filler — e.g. "explain the chain rule to me pls" -> "chain rule".
// Also strips search-command words ("video", "watch") and topic-reference words
// ("it", "this", "that") so a bare "find video about it" extracts nothing and
// buildSearchQuery falls back to the tracked realTopic instead of searching "it".
function extractTopic(msg: string): string {
  const stopWords = [
    // fillers / commands
    'explain', 'what', 'is', 'are', 'the', 'a', 'an', 'how', 'does', 'work',
    'tell', 'me', 'about', 'can', 'you', 'please', 'bro', 'help', 'understand',
    'define', 'meaning', 'of', 'do', 'and', 'for', 'to', 'in', 'with', 'on',
    'at', 'by', 'give', 'show', 'find', 'get', 'let', 'want', 'need', 'know',
    'think', 'see', 'try', 'use', 'make', 'take', 'go', 'come', 'look', 'also',
    'just', 'like', 'so', 'but', 'if', 'then', 'than', 'too', 'very', 'really',
    'actually', 'basically', 'we', 'they',
    // search-trigger words — so "find video about X" doesn't leave "video" behind
    'video', 'videos', 'youtube', 'watch', 'search', 'up', 'tutorial', 'lecture',
    // topic-reference words — "it"/"this"/"that" mean realTopic, not a literal query
    'it', 'this', 'that', 'these', 'those', 'topic', 'above', 'same', 'one', 'thing',
    // confusion / gen-z filler
    'confused', 'huh', 'fr', 'ngl', 'nah', 'yeah', 'ok', 'okay', 'uh', 'um',
    'hmm', 'pls', 'plz', 'u', 'ur', 'im', 'i', 'my', 'bruh',
  ];

  const words = msg.toLowerCase()
    .replace(/[?!.,]/g, '')
    .split(' ')
    .filter(w => !stopWords.includes(w))
    .filter(w => w.length > 2);

  return words.slice(0, 4).join(' ');
}

// Chain used whenever a search query needs to be built from a live message:
// this message's real content -> last tracked topic -> current subject. Never
// returns empty, and never returns a bare reference word like "it"/"this".
function buildSearchQuery(text: string, realTopic: string, subject: string): string {
  const extracted = extractTopic(text);
  const topic = extracted.length > 2 ? extracted : realTopic;
  return topic.length > 2 ? topic : subject;
}

// Looser, video-specific intent check — deliberately broader than
// detectSearchIntent's VIDEO_PHRASES (e.g. it alone doesn't catch "video cal"
// or "can u find video"), so it's OR'd with detectSearchIntent below rather
// than replacing it, guaranteeing no existing trigger phrase regresses.
const VIDEO_TRIGGERS = [
  'find video', 'find me video', 'find me a video', 'show video', 'show me video',
  'show me a video', 'video about', 'video on', 'video cal', 'video for', 'youtube',
  'watch video', 'get video', 'search video', 'look up video', 'can u find video',
  'can you find video', 'give me video', 'video please',
];

function isVideoRequest(message: string): boolean {
  const lower = message.toLowerCase();
  return VIDEO_TRIGGERS.some(trigger => lower.includes(trigger));
}

// Video-specific topic extraction — a shorter stopword list than extractTopic's
// so short course codes survive ("cal 1" keeps the "1"; extractTopic's own
// w.length > 2 filter would drop it).
const videoStopWords = [
  'can', 'u', 'you', 'find', 'me', 'a', 'an', 'the',
  'show', 'get', 'give', 'look', 'up', 'search',
  'video', 'videos', 'youtube', 'watch', 'about',
  'on', 'for', 'please', 'bro', 'it', 'this',
  'that', 'some', 'any', 'ok', 'pls',
];

function extractVideoTopic(message: string): string {
  const lower = message.toLowerCase();
  const words = lower
    .replace(/[?!.,]/g, '')
    .split(' ')
    .filter(w => w.length > 0 && !videoStopWords.includes(w));
  return words.join(' ').trim();
}

// Reduces a live chat message (rich content: image arrays, quiz objects, resource
// bar flags) down to the flat shape the sidebar/history screen persist — only the
// text survives, since that's all ChatMessage.content supports.
function toHistoryMessage(m: Message, type: ChatMessage['type'], xpEarned?: number): ChatMessage {
  const content = typeof m.content === 'string'
    ? m.content
    : m.content?.find?.((c: any) => c.type === 'text')?.text || 'Sent a photo';
  return {
    id: m.id,
    role: m.role,
    content,
    timestamp: new Date(m.timestamp).toISOString(),
    type,
    ...(xpEarned ? { xpEarned } : {}),
  };
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
  const { sessions: chatSessions, activeChatId, loaded: chatHistoryLoaded } = useSelector((s: RootState) => s.chatHistory);
  const user = useSelector((s: RootState) => s.user.current);
  const savedItems = useSelector((s: RootState) => s.videos.items);
  const { chatId: chatIdParam } = useLocalSearchParams<{ chatId?: string }>();
  const [input, setInput] = useState('');
  const [imgB64, setImgB64] = useState<string | null>(null);
  const [imgPreview, setImgPreview] = useState<string | null>(null);
  const [showSubjects, setShowSubjects] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const [messageCount, setMessageCount] = useState(0);
  const [shownResources, setShownResources] = useState(false);
  const [realTopic, setRealTopic] = useState('');
  const listRef = useRef<FlatList>(null);
  const sessionStartRef = useRef(Date.now());
  const latestRef = useRef({ sessionXP, subject, messages, user });
  const restoredRef = useRef(false);

  useEffect(() => { if (!user) router.replace('/auth/login'); }, [user]);
  useEffect(() => { latestRef.current = { sessionXP, subject, messages, user }; });
  useEffect(() => { loadSavedItemsFromStorage().then(items => dispatch(loadItems(items))); }, []);

  // Sessions themselves are loaded from AsyncStorage once, app-wide, by
  // ChatHistorySync in the root layout (so History/sidebar have them no matter
  // which screen opens first). Once that load lands, resume the previously
  // active session's messages here — but only if this chat is still empty, so
  // it doesn't clobber a conversation already in progress.
  useEffect(() => {
    if (!chatHistoryLoaded || restoredRef.current || messages.length > 0) return;
    restoredRef.current = true;
    const active = activeChatId && chatSessions.find(s => s.id === activeChatId);
    if (active) {
      dispatch(setSubject(active.subject));
      dispatch(loadMessages(active.messages.map(m => ({
        id: m.id, role: m.role, content: m.content, timestamp: new Date(m.timestamp).getTime(),
      }))));
    }
  }, [chatHistoryLoaded]);

  // Persist sessions/activeChatId on every change — same fire-and-forget pattern
  // as saved videos/articles. Skipped until the initial load lands so we don't
  // immediately overwrite storage with the pre-load empty state.
  useEffect(() => {
    if (!chatHistoryLoaded) return;
    persistChatHistory(chatSessions, activeChatId);
  }, [chatSessions, activeChatId, chatHistoryLoaded]);

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

  const handleNewChat = () => {
    dispatch(createSession(subject));
    dispatch(clearMsgs());
    setMessageCount(0);
    setRealTopic('');
    setShownResources(false);
    setShowSidebar(false);
  };

  const handleSelectChat = (chatId: string) => {
    const session = chatSessions.find(s => s.id === chatId);
    if (!session) return;
    dispatch(setActiveChat(chatId));
    dispatch(setSubject(session.subject));
    dispatch(loadMessages(session.messages.map(m => ({
      id: m.id, role: m.role, content: m.content, timestamp: new Date(m.timestamp).getTime(),
    }))));
    setRealTopic('');
    setShownResources(false);
    setShowSidebar(false);
    setTimeout(() => listRef.current?.scrollToEnd({ animated: false }), 100);
  };

  // "Continue Chat" from the history screen navigates here with ?chatId=... —
  // load it once when the param shows up (and only if it isn't already active,
  // so re-rendering this screen doesn't re-trigger the load on every render).
  useEffect(() => {
    if (chatIdParam && chatIdParam !== activeChatId) handleSelectChat(chatIdParam);
  }, [chatIdParam]);

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

    // Every conversation lives in a chatHistory session so the sidebar/history
    // screen can list and resume it — create one lazily on the first message
    // instead of eagerly on mount, so an unused chat never shows up as a saved
    // session. store.getState() reads the id synchronously right after dispatch,
    // the same pattern already used for saved videos/articles above.
    let chatId = activeChatId;
    if (!chatId) {
      dispatch(createSession(subject));
      chatId = store.getState().chatHistory.activeChatId;
    }
    if (!chatId) return;
    dispatch(addMessageToSession({ chatId, message: toHistoryMessage(userMsg, img ? 'image' : 'text') }));

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

    // isVideoRequest is OR'd with detectSearchIntent rather than replacing it —
    // it catches phrasings ("video cal", "can u find video") detectSearchIntent's
    // own VIDEO_PHRASES misses, without dropping anything it already caught.
    const isVideo = !img && isVideoRequest(text);
    const { type: detectedType } = !img ? detectSearchIntent(text) : { type: null };
    const searchType = isVideo ? 'video' : detectedType;

    if (searchType) {
      // Video requests get their own topic extraction (shorter stopword list so
      // short course codes like "cal 1" survive) and fallback chain: this
      // message -> resourceTopic -> subject — never an empty or literal "it".
      // Everything else keeps the existing buildSearchQuery chain.
      const topic = searchType === 'video'
        ? (extractVideoTopic(text) || resourceTopic || subject)
        : buildSearchQuery(text, resourceTopic, subject);
      const searchQuery = searchType === 'video' ? `${topic} explained tutorial` : topic;
      const loadingId = `search_loading_${Date.now()}`;
      const loadingMsg: any = { id: loadingId, role: 'assistant', type: 'loading', content: `Searching for "${topic}"...`, timestamp: Date.now() };
      dispatch(addMsg(loadingMsg));

      try {
        const { videos, articles } = await smartSearch(searchQuery, searchType);
        const resultContent = `here's what I found on ${topic}`;
        dispatch(updateMsg({
          id: loadingId, type: 'search_results', content: resultContent,
          videos, articles, query: topic,
        } as any));
        dispatch(setMood('happy'));
        dispatch(addSessionXP(5));
        dispatch(addXP(5));
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        dispatch(addMessageToSession({
          chatId, message: toHistoryMessage({ id: loadingId, role: 'assistant', content: resultContent, timestamp: Date.now() }, 'search_results', 5),
        }));

        try {
          const apiMsgs = [...messages, userMsg].map(m => ({ role: m.role, content: m.content }));
          apiMsgs.push({ role: 'user', content: `Give me a brief 2 sentence summary about ${topic} so the student knows what they are looking at` });
          const reply = await callAI(apiMsgs, subject);
          const summaryMsg = { id: (Date.now() + 1).toString(), role: 'assistant' as const, content: reply.trim(), timestamp: Date.now() };
          dispatch(addMsg(summaryMsg));
          dispatch(addMessageToSession({ chatId, message: toHistoryMessage(summaryMsg, 'text') }));
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
      const xpEarned = 5 + (quiz ? 10 : 0);
      dispatch(addSessionXP(xpEarned));
      dispatch(addXP(5));
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      dispatch(addMessageToSession({ chatId, message: toHistoryMessage(assistantMsg, quiz ? 'quiz' : 'text', xpEarned) }));
    } catch (err: any) {
      dispatch(addMsg({ id: (Date.now() + 1).toString(), role: 'assistant', content: 'my bad bro 😅 — try again', timestamp: Date.now() }));
      dispatch(setMood('sad'));
    } finally {
      dispatch(setLoading(false));
      setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);
    }
  }, [input, imgB64, messages, subject, dispatch, messageCount, shownResources, realTopic, activeChatId]);

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
      <ChatSidebar
        isOpen={showSidebar}
        onClose={() => setShowSidebar(false)}
        onNewChat={handleNewChat}
        onSelectChat={handleSelectChat}
      />

      {/* Topbar */}
      <View style={styles.topbar}>
        <TouchableOpacity onPress={() => setShowSidebar(true)} style={styles.iconBtnSm}>
          <MenuIcon color={Colors.muted} size={20} />
        </TouchableOpacity>
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
        <TouchableOpacity onPress={handleNewChat} style={styles.iconBtnSm}>
          <PlusIcon color={Colors.muted} size={18} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => dispatch(clearMsgs())} style={styles.clearBtn}>
          <TrashIcon color={Colors.muted} size={18} />
        </TouchableOpacity>
      </View>

      {/* Subject picker */}
      {showSubjects && (
        <View style={styles.subjectPicker}>
          {SUBJECTS.map(s => (
            <TouchableOpacity key={s.s} onPress={() => { dispatch(setSubject(s.s)); dispatch(setActiveChat(null)); setShowSubjects(false); }}
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
  iconBtnSm: { padding: 4 },
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
