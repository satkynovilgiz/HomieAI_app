
import { useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useSelector } from 'react-redux';
import Svg, { Circle, Path } from 'react-native-svg';
import { RootState } from '../../store';
import { Colors, Radius } from '../../constants/theme';
import HomieBot from '../../components/mascot/HomieBot';
import { getSubjectColor, groupLabel, formatTime, GROUP_ORDER } from '../../components/chat/ChatSidebar';
import { ChatSession } from '../../store/slices/chatHistorySlice';
import ContentWrapper from '../../components/ui/ContentWrapper';

function SearchIcon() {
  return (
    <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
      <Circle cx="10.5" cy="10.5" r="6.5" stroke={Colors.muted} strokeWidth="2"/>
      <Path d="M20 20L15.2 15.2" stroke={Colors.muted} strokeWidth="2" strokeLinecap="round"/>
    </Svg>
  );
}

export default function HistoryScreen() {
  const user = useSelector((s: RootState) => s.user.current);
  const sessions = useSelector((s: RootState) => s.chatHistory.sessions);
  const history = user?.history || [];
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const withMessages = sessions.filter(s => s.messageCount > 0);
    const list = q
      ? withMessages.filter(s =>
          s.title.toLowerCase().includes(q) ||
          s.subject.toLowerCase().includes(q) ||
          s.preview.toLowerCase().includes(q))
      : withMessages;
    return [...list].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  }, [sessions, query]);

  const groups = useMemo(() => {
    const byLabel: Record<string, ChatSession[]> = {};
    filtered.forEach(s => { (byLabel[groupLabel(s.updatedAt)] ||= []).push(s); });
    return GROUP_ORDER.filter(label => byLabel[label]?.length).map(label => ({ label, items: byLabel[label] }));
  }, [filtered]);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} accessibilityLabel="Go back" accessibilityRole="button">
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Study History</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
       <ContentWrapper>
        <View style={styles.statsRow}>
          {[[history.length, 'Sessions'],[history.reduce((a,h) => a + (h.xp_earned||0), 0), 'XP Earned'],[`${Math.round((user?.studyHours||0)*10)/10}h`, 'Hours']].map(([val,label]) => (
            <View key={label as string} style={styles.statBox}>
              <Text style={styles.statValue}>{String(val)}</Text>
              <Text style={styles.statLabel}>{label as string}</Text>
            </View>
          ))}
        </View>

        <View style={styles.searchBar}>
          <SearchIcon/>
          <TextInput
            style={styles.searchInput}
            value={query}
            onChangeText={setQuery}
            placeholder="Search past chats..."
            placeholderTextColor={Colors.muted}
          />
        </View>

        <View style={{ padding: 16, paddingTop: 8, gap: 10 }}>
          {sessions.filter(s => s.messageCount > 0).length === 0 ? (
            <View style={{ alignItems: 'center', paddingVertical: 40 }}>
              <HomieBot mood="sad" size={100}/>
              <Text style={styles.emptyTitle}>nothing here yet</Text>
              <Text style={styles.emptySub}>start chatting with homie</Text>
              <TouchableOpacity onPress={() => router.push('/chat')} style={styles.startBtn}>
                <Text style={styles.startBtnText}>start studying</Text>
              </TouchableOpacity>
            </View>
          ) : groups.length === 0 ? (
            <View style={{ alignItems: 'center', paddingVertical: 40 }}>
              <HomieBot mood="thinking" size={100}/>
              <Text style={styles.emptyTitle}>no results</Text>
              <Text style={styles.emptySub}>try a different search</Text>
            </View>
          ) : groups.map(group => (
            <View key={group.label}>
              <Text style={styles.groupLabel}>{group.label.toUpperCase()}</Text>
              {group.items.map(session => {
                const color = getSubjectColor(session.subject);
                return (
                  <View key={session.id} style={styles.sessionCard}>
                    <View style={styles.sessionTopRow}>
                      <View style={[styles.subjectPill, { backgroundColor: color.bg }]}>
                        <Text style={[styles.subjectPillText, { color: color.text }]}>{session.subject}</Text>
                      </View>
                      <Text style={styles.sessionTime}>{formatTime(session.updatedAt)}</Text>
                    </View>
                    <Text style={styles.sessionTitle} numberOfLines={1}>{session.title}</Text>
                    {!!session.preview && (
                      <Text style={styles.sessionPreview} numberOfLines={1}>&quot;{session.preview}&quot;</Text>
                    )}
                    <Text style={styles.sessionMeta}>{session.messageCount} messages · +{session.totalXP} XP earned</Text>
                    <TouchableOpacity
                      style={styles.continueBtn}
                      onPress={() => router.push({ pathname: '/chat', params: { chatId: session.id } })}
                    >
                      <Text style={styles.continueBtnText}>Continue Chat →</Text>
                    </TouchableOpacity>
                  </View>
                );
              })}
            </View>
          ))}
        </View>
       </ContentWrapper>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  header: { flexDirection: 'row', alignItems: 'center', padding: 16, paddingBottom: 8, gap: 12 },
  backBtn: { padding: 4 },
  backArrow: { fontSize: 24, color: Colors.text },
  title: { fontSize: 22, fontWeight: '900', color: Colors.text },
  statsRow: { flexDirection: 'row', padding: 16, gap: 10 },
  statBox: { flex: 1, backgroundColor: Colors.bg3, borderRadius: Radius.md, padding: 14, alignItems: 'center', borderWidth: 1, borderColor: Colors.border },
  statIcon: { fontSize: 22, marginBottom: 5 },
  statValue: { fontSize: 20, fontWeight: '900', color: Colors.purpleL },
  statLabel: { fontSize: 10, color: Colors.muted, textTransform: 'uppercase' },
  searchBar: {
    flexDirection: 'row', alignItems: 'center', gap: 8, marginHorizontal: 16,
    backgroundColor: Colors.bg3, borderWidth: 1, borderColor: Colors.border,
    borderRadius: Radius.md, paddingHorizontal: 14, paddingVertical: 10,
  },
  searchInput: { flex: 1, fontSize: 14, color: Colors.text },
  groupLabel: { fontSize: 10, color: Colors.muted, fontWeight: '700', letterSpacing: 0.5, marginBottom: 8, marginTop: 4 },
  sessionCard: { backgroundColor: Colors.bg3, borderRadius: Radius.md, padding: 16, borderWidth: 1, borderColor: Colors.border, marginBottom: 10 },
  sessionTopRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  subjectPill: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: Radius.full },
  subjectPillText: { fontSize: 10, fontWeight: '700' },
  sessionTime: { fontSize: 11, color: Colors.muted },
  sessionTitle: { fontSize: 15, fontWeight: '700', color: Colors.text, marginBottom: 4 },
  sessionPreview: { fontSize: 12, color: Colors.muted, marginBottom: 6 },
  sessionMeta: { fontSize: 11, color: Colors.muted, marginBottom: 12 },
  continueBtn: { alignSelf: 'flex-start', paddingHorizontal: 14, paddingVertical: 9, backgroundColor: Colors.purple, borderRadius: Radius.sm },
  continueBtnText: { color: Colors.white, fontWeight: '700', fontSize: 12 },
  emptyTitle: { fontSize: 20, fontWeight: '800', color: Colors.text, marginTop: 14 },
  emptySub: { fontSize: 14, color: Colors.muted, marginTop: 5, marginBottom: 20 },
  startBtn: { paddingHorizontal: 28, paddingVertical: 13, backgroundColor: Colors.purple, borderRadius: Radius.md },
  startBtnText: { color: Colors.white, fontWeight: '700', fontSize: 15 },
});
