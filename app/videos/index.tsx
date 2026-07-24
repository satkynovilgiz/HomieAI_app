import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, Linking, TextInput, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Colors, Radius } from '../../constants/theme';

const YOUTUBE_API_KEY = 'AIzaSyD-9tSrke72PouQMnMX-a7eZSW0jkFMBWY';

const STUDY_SEARCHES = [
  { label: 'Math', query: 'math tutorial for students', color: '#7c3aed' },
  { label: 'Coding', query: 'learn programming beginners', color: '#10b981' },
  { label: 'Science', query: 'science explained simply', color: '#f97316' },
  { label: 'History', query: 'world history explained', color: '#3b82f6' },
  { label: 'Physics', query: 'physics concepts explained', color: '#8b5cf6' },
  { label: 'Chemistry', query: 'chemistry basics tutorial', color: '#fbbf24' },
  { label: 'Biology', query: 'biology explained easy', color: '#34d399' },
  { label: 'Study Tips', query: 'how to study effectively', color: '#ec4899' },
];

interface Video {
  id: string;
  title: string;
  channel: string;
  thumbnail: string;
  duration?: string;
}

export default function VideosScreen() {
  const [cat, setCat] = useState(STUDY_SEARCHES[0]);
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState<Video | null>(null);

  const fetchVideos = async (query: string) => {
    setLoading(true);
    try {
      const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=12&q=${encodeURIComponent(query)}&type=video&videoCategoryId=27&key=${YOUTUBE_API_KEY}`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.items) {
        setVideos(data.items.map((item: any) => ({
          id: item.id.videoId,
          title: item.snippet.title,
          channel: item.snippet.channelTitle,
          thumbnail: item.snippet.thumbnails.medium?.url || item.snippet.thumbnails.default?.url,
        })));
      } else {
        // Fallback to hardcoded if API fails
        setVideos(FALLBACK_VIDEOS.filter(v => v.tags?.includes(query.split(' ')[0].toLowerCase())));
      }
    } catch (e) {
      setVideos(FALLBACK_VIDEOS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchVideos(cat.query); }, [cat]);

  const handleSearch = () => {
    if (search.trim()) fetchVideos(search.trim() + ' tutorial explanation');
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.back}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Video Library</Text>
      </View>

      {/* Search */}
      <View style={styles.searchRow}>
        <TextInput
          value={search} onChangeText={setSearch}
          placeholder="Search any topic..."
          placeholderTextColor={Colors.muted}
          style={styles.searchInput}
          onSubmitEditing={handleSearch}
          returnKeyType="search"
        />
        <TouchableOpacity onPress={handleSearch} style={styles.searchBtn}>
          <Text style={styles.searchBtnText}>Search</Text>
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
            <Text style={[styles.catText, cat.label === item.label && { color: item.color, fontWeight: '700' }]}>{item.label}</Text>
          </TouchableOpacity>
        )}
      />

      {/* Videos grid */}
      {loading ? (
        <View style={styles.loading}>
          <ActivityIndicator size="large" color={Colors.purple}/>
          <Text style={styles.loadingText}>Loading videos...</Text>
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
              onPress={() => Linking.openURL(`https://www.youtube.com/watch?v=${item.id}`)}
              style={styles.videoCard}
              activeOpacity={0.85}>
              <View style={styles.thumbContainer}>
                <Image source={{ uri: item.thumbnail }} style={styles.thumb} resizeMode="cover"/>
                <View style={styles.playOverlay}>
                  <View style={styles.playBtn}>
                    <Text style={styles.playIcon}>▶</Text>
                  </View>
                </View>
              </View>
              <View style={styles.videoInfo}>
                <Text style={styles.videoTitle} numberOfLines={2}>{item.title}</Text>
                <Text style={styles.videoChannel}>{item.channel}</Text>
              </View>
            </TouchableOpacity>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const FALLBACK_VIDEOS = [
  { id: 'NybHckSEQBI', title: "Math isn't hard, it's a language", channel: 'TEDx', thumbnail: 'https://img.youtube.com/vi/NybHckSEQBI/mqdefault.jpg', tags: ['math'] },
  { id: 'rfscVS0vtbw', title: 'Learn Python Full Course', channel: 'freeCodeCamp', thumbnail: 'https://img.youtube.com/vi/rfscVS0vtbw/mqdefault.jpg', tags: ['coding'] },
  { id: 'zR3Igc3Rhfg', title: 'What Is Quantum Mechanics?', channel: 'Kurzgesagt', thumbnail: 'https://img.youtube.com/vi/zR3Igc3Rhfg/mqdefault.jpg', tags: ['physics', 'science'] },
  { id: 'vSskbQ_ETEY', title: 'How to Study Effectively', channel: 'Thomas Frank', thumbnail: 'https://img.youtube.com/vi/vSskbQ_ETEY/mqdefault.jpg', tags: ['study'] },
];

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  header: { flexDirection: 'row', alignItems: 'center', padding: 16, gap: 12 },
  back: { padding: 4 },
  backArrow: { fontSize: 24, color: Colors.text },
  title: { fontSize: 22, fontWeight: '900', color: Colors.text },
  searchRow: { flexDirection: 'row', gap: 10, paddingHorizontal: 16, marginBottom: 12 },
  searchInput: { flex: 1, backgroundColor: Colors.bg3, borderWidth: 1, borderColor: Colors.border, borderRadius: Radius.md, color: Colors.text, padding: 11, fontSize: 14 },
  searchBtn: { paddingHorizontal: 16, backgroundColor: Colors.purple, borderRadius: Radius.md, justifyContent: 'center' },
  searchBtnText: { color: 'white', fontWeight: '700', fontSize: 13 },
  catScroll: { marginBottom: 8 },
  catChip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 50, backgroundColor: Colors.bg3, borderWidth: 1.5, borderColor: Colors.border },
  catText: { fontSize: 13, color: Colors.muted },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16 },
  loadingText: { fontSize: 14, color: Colors.muted },
  videoCard: { backgroundColor: Colors.bg3, borderRadius: Radius.lg, overflow: 'hidden', borderWidth: 1, borderColor: Colors.border },
  thumbContainer: { position: 'relative' },
  thumb: { width: '100%', height: 200 },
  playOverlay: { position: 'absolute', inset: 0, alignItems: 'center', justifyContent: 'center' },
  playBtn: { width: 56, height: 56, borderRadius: 28, backgroundColor: 'rgba(124,58,237,0.9)', alignItems: 'center', justifyContent: 'center' },
  playIcon: { color: 'white', fontSize: 22 },
  videoInfo: { padding: 14 },
  videoTitle: { fontSize: 14, fontWeight: '700', color: Colors.text, marginBottom: 5, lineHeight: 20 },
  videoChannel: { fontSize: 12, color: Colors.muted },
});
