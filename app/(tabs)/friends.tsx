import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store';
import { Colors, Radius } from '../../constants/theme';
import FriendCard from '../../components/friends/FriendCard';
import ChallengeCard from '../../components/features/ChallengeCard';
import { useChallenges } from '../../hooks/useChallenges';
import { Friend } from '../../store/slices/friendsSlice';
import { ensureConversation } from '../../store/slices/messagesSlice';

export default function FriendsTab() {
  const dispatch = useDispatch();
  const friends = useSelector((s: RootState) => s.friends.list);
  const { challenges, pending, accept } = useChallenges();

  const openConversation = (f: Friend) => {
    dispatch(ensureConversation({ id: f.id, friendName: f.name, friendAvatar: f.avatar }));
    router.push({ pathname: '/messages/conversation', params: { id: f.id } });
  };
  const [tab, setTab] = useState<'friends' | 'challenges' | 'leaderboard'>('friends');
  const [search, setSearch] = useState('');
  const leaderboard = [...friends].sort((a, b) => b.xp - a.xp);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.topbar}>
        <Text style={styles.title}>Squad</Text>
        {pending.length > 0 && (
          <View style={styles.notifBadge}><Text style={styles.notifText}>{pending.length}</Text></View>
        )}
      </View>

      <View style={styles.tabs}>
        {([['friends','Friends'],['challenges','Battles'],['leaderboard','Rankings']] as const).map(([id, label]) => (
          <TouchableOpacity key={id} onPress={() => setTab(id)} style={[styles.tab, tab === id && styles.tabActive]}>
            <Text style={[styles.tabText, tab === id && styles.tabTextActive]}>{label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {tab === 'friends' && (
          <>
            <TextInput
              value={search} onChangeText={setSearch}
              placeholder="Search friends..."
              placeholderTextColor={Colors.muted}
              style={styles.searchInput}
            />
            <Text style={styles.sectionLabel}>ONLINE NOW ({friends.filter(f => f.status !== 'offline').length})</Text>
            {friends.filter(f => f.status !== 'offline' && f.name.toLowerCase().includes(search.toLowerCase())).map(f => (
              <FriendCard key={f.id} friend={f}
                onMessage={() => openConversation(f)}
                onChallenge={() => {}}
              />
            ))}
            <Text style={[styles.sectionLabel, { marginTop: 12 }]}>OFFLINE ({friends.filter(f => f.status === 'offline').length})</Text>
            {friends.filter(f => f.status === 'offline' && f.name.toLowerCase().includes(search.toLowerCase())).map(f => (
              <FriendCard key={f.id} friend={f} onMessage={() => openConversation(f)} onChallenge={() => {}}/>
            ))}
            <TouchableOpacity style={styles.addFriendBtn} onPress={() => router.push('/friends/add')}>
              <Text style={styles.addFriendText}>+ add friends</Text>
            </TouchableOpacity>
          </>
        )}

        {tab === 'challenges' && (
          <>
            {pending.length > 0 && (
              <>
                <Text style={styles.sectionLabel}>PENDING ({pending.length})</Text>
                {pending.map(c => <ChallengeCard key={c.id} challenge={c} onAccept={() => accept(c.id)}/>)}
              </>
            )}
            <Text style={styles.sectionLabel}>ACTIVE BATTLES</Text>
            {challenges.filter(c => c.status === 'active').map(c => (
              <ChallengeCard key={c.id} challenge={c}/>
            ))}
            {challenges.filter(c => ['won','lost','draw'].includes(c.status)).length > 0 && (
              <>
                <Text style={[styles.sectionLabel, { marginTop: 12 }]}>PAST BATTLES</Text>
                {challenges.filter(c => ['won','lost','draw'].includes(c.status)).map(c => (
                  <ChallengeCard key={c.id} challenge={c}/>
                ))}
              </>
            )}
            <TouchableOpacity style={styles.newChallengeBtn}>
              <Text style={styles.newChallengeBtnText}>challenge a friend</Text>
            </TouchableOpacity>
          </>
        )}

        {tab === 'leaderboard' && (
          <>
            <Text style={styles.leaderboardTitle}>Weekly XP Rankings</Text>
            <Text style={styles.leaderboardSub}>Top studiers this week</Text>
            {leaderboard.map((f, i) => (
              <View key={f.id} style={[styles.rankRow, i === 0 && styles.rankRow1, i === 1 && styles.rankRow2, i === 2 && styles.rankRow3]}>
                <Text style={styles.rankNum}>{['🥇','🥈','🥉'][i] || `#${i+1}`}</Text>
                <Text style={styles.rankAvatar}>{f.avatar}</Text>
                <View style={styles.rankInfo}>
                  <Text style={styles.rankName}>{f.name}</Text>
                  <Text style={styles.rankStreak}>{f.streak} day streak</Text>
                </View>
                <Text style={styles.rankXP}>{f.xp} XP</Text>
              </View>
            ))}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  topbar: { flexDirection: 'row', alignItems: 'center', padding: 16, paddingBottom: 8, gap: 10 },
  title: { fontSize: 24, fontWeight: '900', color: Colors.text, flex: 1 },
  notifBadge: { width: 24, height: 24, borderRadius: 12, backgroundColor: Colors.red, alignItems: 'center', justifyContent: 'center' },
  notifText: { fontSize: 12, fontWeight: '900', color: 'white' },
  tabs: { flexDirection: 'row', paddingHorizontal: 16, gap: 6, marginBottom: 4 },
  tab: { flex: 1, paddingVertical: 9, borderRadius: Radius.md, backgroundColor: Colors.bg2, alignItems: 'center', borderWidth: 1, borderColor: Colors.border },
  tabActive: { backgroundColor: Colors.purple, borderColor: Colors.purple },
  tabText: { fontSize: 11, fontWeight: '700', color: Colors.muted },
  tabTextActive: { color: 'white' },
  content: { padding: 16, gap: 12 },
  searchInput: { backgroundColor: Colors.bg3, borderWidth: 1, borderColor: Colors.border, borderRadius: Radius.md, color: Colors.text, padding: 12, fontSize: 14, marginBottom: 4 },
  sectionLabel: { fontSize: 10, fontWeight: '700', color: Colors.muted, letterSpacing: 2, marginBottom: 8 },
  addFriendBtn: { paddingVertical: 14, backgroundColor: 'rgba(124,58,237,0.1)', borderRadius: Radius.md, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(124,58,237,0.25)', marginTop: 8 },
  addFriendText: { color: Colors.purpleL, fontWeight: '700', fontSize: 15 },
  newChallengeBtn: { paddingVertical: 14, backgroundColor: Colors.purple, borderRadius: Radius.md, alignItems: 'center', marginTop: 8 },
  newChallengeBtnText: { color: 'white', fontWeight: '800', fontSize: 15 },
  leaderboardTitle: { fontSize: 22, fontWeight: '900', color: Colors.text, textAlign: 'center' },
  leaderboardSub: { fontSize: 13, color: Colors.muted, textAlign: 'center', marginBottom: 16 },
  rankRow: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, backgroundColor: Colors.bg3, borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.border },
  rankRow1: { borderColor: 'rgba(251,191,36,0.5)', backgroundColor: 'rgba(251,191,36,0.05)' },
  rankRow2: { borderColor: 'rgba(148,163,184,0.5)' },
  rankRow3: { borderColor: 'rgba(180,83,9,0.5)' },
  rankNum: { fontSize: 22, width: 36, textAlign: 'center' },
  rankAvatar: { fontSize: 28 },
  rankInfo: { flex: 1 },
  rankName: { fontSize: 14, fontWeight: '800', color: Colors.text },
  rankStreak: { fontSize: 12, color: Colors.orange, marginTop: 2 },
  rankXP: { fontSize: 16, fontWeight: '900', color: Colors.purpleL },
});
