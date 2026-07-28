import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, TextInput, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store';
import store from '../../store';
import { Colors, Radius } from '../../constants/theme';
import { SavedItem, removeItem, loadItems, persistSavedItems, loadSavedItemsFromStorage } from '../../store/slices/videosSlice';
import HomieBot from '../../components/mascot/HomieBot';
import InAppPlayer from '../../components/ui/InAppPlayer';
import InAppBrowser from '../../components/ui/InAppBrowser';

const YOUTUBE_API_KEY = 'AIzaSyCbq92JLyP5TGtI9bidgOaqOBtwHv-vXdg';

const STUDY_SEARCHES = [
  { label: 'Math', query: 'math tutorial for students', color: '#7c3aed', emoji: '📐' },
  { label: 'Coding', query: 'learn programming beginners', color: '#10b981', emoji: '💻' },
  { label: 'Science', query: 'science explained simply', color: '#f97316', emoji: '🔭' },
  { label: 'History', query: 'world history explained', color: '#3b82f6', emoji: '🏛️' },
  { label: 'Physics', query: 'physics concepts explained', color: '#8b5cf6', emoji: '⚛️' },
  { label: 'Chemistry', query: 'chemistry basics tutorial', color: '#fbbf24', emoji: '🧪' },
  { label: 'Biology', query: 'biology explained easy', color: '#34d399', emoji: '🧬' },
  { label: 'Study Tips', query: 'how to study effectively', color: '#ec4899', emoji: '💡' },
];

interface Video {
  id: string;
  title: string;
  channel: string;
  thumbnail: string;
  duration?: string;
}

function SavedItemRow({ item, onPlay, onRead, onRemove }: {
  item: SavedItem; onPlay: () => void; onRead: () => void; onRemove: () => void;
}) {
  const isVideo = item.type === 'video';
  return (
    <View style={styles.savedCard}>
      {isVideo && !!item.thumbnail && (
        <Image source={{ uri: item.thumbnail }} style={styles.savedThumb} resizeMode="cover"/>
      )}
      <View style={styles.savedBody}>
        {!isVideo && (
          <View style={styles.savedBadge}><Text style={styles.savedBadgeText}>{item.source}</Text></View>
        )}
        <Text style={styles.savedTitle} numberOfLines={2}>{item.title}</Text>
        <Text style={styles.savedSub} numberOfLines={isVideo ? 1 : 2}>{isVideo ? item.channelTitle : item.source}</Text>
        <View style={styles.savedActions}>
          <TouchableOpacity onPress={isVideo ? onPlay : onRead} style={styles.savedActionBtn}>
            <Text style={styles.savedActionText}>{isVideo ? 'Play' : 'Read'}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={onRemove} style={styles.savedRemoveBtn}>
            <Text style={styles.savedRemoveText}>Remove</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

export default function VideosScreen() {
  const dispatch = useDispatch();
  const savedItems = useSelector((s: RootState) => s.videos.items);
  const [tab, setTab] = useState<'search' | 'library'>('search');
  const [cat, setCat] = useState(STUDY_SEARCHES[0]);
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [playerVideoId, setPlayerVideoId] = useState<string | null>(null);
  const [browserItem, setBrowserItem] = useState<SavedItem | null>(null);

  useEffect(() => { loadSavedItemsFromStorage().then(items => dispatch(loadItems(items))); }, []);

  const fetchVideos = async (query: string, categoryLabel?: string) => {
    setLoading(true);
    try {
      const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=12&q=${encodeURIComponent(query)}&type=video&videoCategoryId=27&key=${YOUTUBE_API_KEY}`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.items && data.items.length > 0) {
        setVideos(data.items.map((item: any) => ({
          id: item.id.videoId,
          title: item.snippet.title,
          channel: item.snippet.channelTitle,
          thumbnail: item.snippet.thumbnails.medium?.url || item.snippet.thumbnails.default?.url,
        })));
      } else {
        // Live API unavailable or returned nothing — fall back to hardcoded videos for this category
        setVideos((categoryLabel && FALLBACK_BY_CATEGORY[categoryLabel]) || ALL_FALLBACK_VIDEOS);
      }
    } catch (e) {
      setVideos((categoryLabel && FALLBACK_BY_CATEGORY[categoryLabel]) || ALL_FALLBACK_VIDEOS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchVideos(cat.query, cat.label); }, [cat]);

  const handleSearch = () => {
    if (search.trim()) fetchVideos(search.trim() + ' tutorial explanation');
  };

  const handleRemove = (item: SavedItem) => {
    Alert.alert('remove from library?', item.title, [
      { text: 'cancel', style: 'cancel' },
      { text: 'remove', style: 'destructive', onPress: () => {
        dispatch(removeItem(item.id));
        persistSavedItems(store.getState().videos.items);
      }},
    ]);
  };

  const sortedSavedItems = [...savedItems].sort((a, b) => b.savedAt.localeCompare(a.savedAt));

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.back}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Video Library 🎬</Text>
      </View>

      <View style={styles.tabs}>
        <TouchableOpacity onPress={() => setTab('search')} style={[styles.tabBtn, tab === 'search' && styles.tabBtnActive]}>
          <Text style={[styles.tabText, tab === 'search' && styles.tabTextActive]}>Search</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setTab('library')} style={[styles.tabBtn, tab === 'library' && styles.tabBtnActive]}>
          <Text style={[styles.tabText, tab === 'library' && styles.tabTextActive]}>Library ({savedItems.length})</Text>
        </TouchableOpacity>
      </View>

      {tab === 'search' ? (
        <>
          {/* Search */}
          <View style={styles.searchRow}>
            <View style={styles.searchInputWrap}>
              <Text style={styles.searchIcon}>🔍</Text>
              <TextInput
                value={search} onChangeText={setSearch}
                placeholder="search any topic..."
                placeholderTextColor={Colors.muted}
                style={styles.searchInput}
                onSubmitEditing={handleSearch}
                returnKeyType="search"
              />
            </View>
            <TouchableOpacity onPress={handleSearch} style={styles.searchBtn}>
              <Text style={styles.searchBtnText}>search</Text>
            </TouchableOpacity>
          </View>

          {/* Category chips */}
          <FlatList
            horizontal showsHorizontalScrollIndicator={false}
            data={STUDY_SEARCHES}
            keyExtractor={item => item.label}
            style={styles.catScroll}
            contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() => { setCat(item); setSearch(''); }}
                style={[styles.catChip, cat.label === item.label && { backgroundColor: item.color + '22', borderColor: item.color }]}>
                <Text style={styles.catEmoji}>{item.emoji}</Text>
                <Text style={[styles.catText, cat.label === item.label && { color: item.color, fontWeight: '700' }]}>{item.label}</Text>
              </TouchableOpacity>
            )}
          />

          {/* Videos grid */}
          {loading ? (
            <View style={styles.loading}>
              <ActivityIndicator size="large" color={Colors.purple}/>
              <Text style={styles.loadingText}>hold on...</Text>
            </View>
          ) : videos.length === 0 ? (
            <View style={styles.loading}>
              <Text style={styles.loadingText}>nothing found — try another search</Text>
            </View>
          ) : (
            <FlatList
              data={videos}
              keyExtractor={item => item.id}
              numColumns={1}
              contentContainerStyle={{ padding: 16, gap: 14 }}
              showsVerticalScrollIndicator={false}
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() => setPlayerVideoId(item.id)}
                  style={styles.videoCard}
                  activeOpacity={0.85}>
                  <View style={styles.thumbContainer}>
                    <Image source={{ uri: item.thumbnail }} style={styles.thumb} resizeMode="cover"/>
                    <LinearGradient
                      colors={['transparent', 'rgba(7,7,15,0.85)']}
                      style={styles.thumbScrim}
                    />
                    <View style={styles.playOverlay}>
                      <View style={styles.playBtn}>
                        <Text style={styles.playIcon}>▶</Text>
                      </View>
                    </View>
                    <Text style={styles.thumbChannel} numberOfLines={1}>{item.channel}</Text>
                  </View>
                  <View style={styles.videoInfo}>
                    <Text style={styles.videoTitle} numberOfLines={2}>{item.title}</Text>
                  </View>
                </TouchableOpacity>
              )}
            />
          )}
        </>
      ) : (
        sortedSavedItems.length === 0 ? (
          <View style={styles.loading}>
            <HomieBot mood="thinking" size={90}/>
            <Text style={styles.loadingText}>nothing saved yet — save a video or article from chat</Text>
          </View>
        ) : (
          <FlatList
            data={sortedSavedItems}
            keyExtractor={item => item.id}
            contentContainerStyle={{ padding: 16, gap: 12 }}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => (
              <SavedItemRow
                item={item}
                onPlay={() => item.videoId && setPlayerVideoId(item.videoId)}
                onRead={() => setBrowserItem(item)}
                onRemove={() => handleRemove(item)}
              />
            )}
          />
        )
      )}

      {playerVideoId && <InAppPlayer videoId={playerVideoId} onClose={() => setPlayerVideoId(null)}/>}
      {browserItem && <InAppBrowser url={browserItem.url} title={browserItem.title} onClose={() => setBrowserItem(null)}/>}
    </SafeAreaView>
  );
}

const thumb = (id: string) => `https://img.youtube.com/vi/${id}/mqdefault.jpg`;

const FALLBACK_BY_CATEGORY: Record<string, Video[]> = {
  Math: [{ id: 'NybHckSEQBI', title: "Math isn't hard, it's a language", channel: 'TEDx', thumbnail: thumb('NybHckSEQBI') }],
  Coding: [{ id: 'rfscVS0vtbw', title: 'Learn Python Full Course', channel: 'freeCodeCamp', thumbnail: thumb('rfscVS0vtbw') }],
  Science: [{ id: 'zR3Igc3Rhfg', title: 'What Is Quantum Mechanics?', channel: 'Kurzgesagt', thumbnail: thumb('zR3Igc3Rhfg') }],
  History: [{ id: 'Yocja_N5s1I', title: 'The Agricultural Revolution: Crash Course World History #1', channel: 'CrashCourse', thumbnail: thumb('Yocja_N5s1I') }],
  Physics: [{ id: 'zR3Igc3Rhfg', title: 'What Is Quantum Mechanics?', channel: 'Kurzgesagt', thumbnail: thumb('zR3Igc3Rhfg') }],
  Chemistry: [{ id: 'FSyAehMdpyI', title: 'The Nucleus: Crash Course Chemistry #1', channel: 'CrashCourse', thumbnail: thumb('FSyAehMdpyI') }],
  Biology: [{ id: 'tZE_fQFK8EY', title: 'Introduction to Biology: Crash Course Biology #1', channel: 'CrashCourse', thumbnail: thumb('tZE_fQFK8EY') }],
  'Study Tips': [{ id: 'AL08YZCYShc', title: 'Study LESS Study SMART', channel: 'Motivation2Study', thumbnail: thumb('AL08YZCYShc') }],
};
const ALL_FALLBACK_VIDEOS: Video[] = Object.values(FALLBACK_BY_CATEGORY).flat();

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  header: { flexDirection: 'row', alignItems: 'center', padding: 16, gap: 12 },
  back: { padding: 4 },
  backArrow: { fontSize: 24, color: Colors.text },
  title: { fontSize: 22, fontWeight: '900', color: Colors.text },
  tabs: { flexDirection: 'row', gap: 8, paddingHorizontal: 16, marginBottom: 12 },
  tabBtn: { flex: 1, paddingVertical: 10, borderRadius: Radius.md, backgroundColor: Colors.bg3, borderWidth: 1, borderColor: Colors.border, alignItems: 'center' },
  tabBtnActive: { backgroundColor: 'rgba(124,58,237,0.2)', borderColor: Colors.purpleL },
  tabText: { fontSize: 13, fontWeight: '700', color: Colors.muted },
  tabTextActive: { color: Colors.purpleL },
  searchRow: { flexDirection: 'row', gap: 10, paddingHorizontal: 16, marginBottom: 12 },
  searchInputWrap: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: Colors.bg3, borderWidth: 1, borderColor: Colors.border, borderRadius: Radius.md, paddingHorizontal: 12 },
  searchIcon: { fontSize: 14 },
  searchInput: { flex: 1, color: Colors.text, paddingVertical: 11, fontSize: 14 },
  searchBtn: { paddingHorizontal: 16, backgroundColor: Colors.purple, borderRadius: Radius.md, justifyContent: 'center' },
  searchBtnText: { color: 'white', fontWeight: '700', fontSize: 13 },
  catScroll: { flexGrow: 0, height: 44, marginBottom: 12 },
  catChip: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 9, borderRadius: 50, backgroundColor: Colors.bg3, borderWidth: 1.5, borderColor: Colors.border },
  catEmoji: { fontSize: 13 },
  catText: { fontSize: 13, color: Colors.muted },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16, padding: 24 },
  loadingText: { fontSize: 14, color: Colors.muted, textAlign: 'center' },
  videoCard: { backgroundColor: Colors.bg3, borderRadius: Radius.xl, overflow: 'hidden', borderWidth: 1, borderColor: Colors.border },
  thumbContainer: { position: 'relative' },
  thumb: { width: '100%', height: 190 },
  thumbScrim: { position: 'absolute', left: 0, right: 0, bottom: 0, height: 70 },
  playOverlay: { position: 'absolute', inset: 0, alignItems: 'center', justifyContent: 'center' },
  playBtn: { width: 52, height: 52, borderRadius: 26, backgroundColor: 'rgba(124,58,237,0.9)', alignItems: 'center', justifyContent: 'center' },
  playIcon: { color: 'white', fontSize: 20 },
  thumbChannel: { position: 'absolute', left: 12, bottom: 10, fontSize: 12, fontWeight: '700', color: 'white' },
  videoInfo: { padding: 14 },
  videoTitle: { fontSize: 14, fontWeight: '700', color: Colors.text, lineHeight: 20 },
  savedCard: { flexDirection: 'row', backgroundColor: Colors.bg3, borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.border, overflow: 'hidden' },
  savedThumb: { width: 110, height: 90 },
  savedBody: { flex: 1, padding: 10, gap: 4 },
  savedBadge: { alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 50, backgroundColor: Colors.bg4 },
  savedBadgeText: { fontSize: 10, fontWeight: '700', color: Colors.muted },
  savedTitle: { fontSize: 13, fontWeight: '700', color: Colors.text, lineHeight: 18 },
  savedSub: { fontSize: 11, color: Colors.muted },
  savedActions: { flexDirection: 'row', gap: 8, marginTop: 4 },
  savedActionBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, backgroundColor: Colors.purple },
  savedActionText: { color: 'white', fontSize: 11, fontWeight: '700' },
  savedRemoveBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, borderWidth: 1, borderColor: Colors.border },
  savedRemoveText: { color: Colors.muted, fontSize: 11, fontWeight: '700' },
});
