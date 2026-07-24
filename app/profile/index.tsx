
import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store';
import { clearUser, updateUser } from '../../store/slices/userSlice';
import { localAuth } from '../../lib/auth';
import { Colors, Radius } from '../../constants/theme';
import { AVATARS } from '../../constants/subjects';
import HomieBot from '../../components/mascot/HomieBot';
import XPBar from '../../components/ui/XPBar';
import StatCard from '../../components/ui/StatCard';

const GOALS = ['Get straight As 📚','Ace finals 🎯','Learn to code 💻','Improve GPA 📈','Get into college 🏫'];

export default function ProfileScreen() {
  const dispatch = useDispatch();
  const user = useSelector((s: RootState) => s.user.current);
  const [tab, setTab] = useState<'stats'|'cards'|'goals'>('stats');
  const [editing, setEditing] = useState(false);
  const [selAvatar, setSelAvatar] = useState(user?.avatar || '🧑');

  useEffect(() => { if (!user) router.replace('/auth/login'); }, [user]);
  if (!user) return null;

  const saveAvatar = async () => {
    const updated = await localAuth.update(user.email, { avatar: selAvatar });
    if (updated) { dispatch(updateUser({ avatar: selAvatar })); setEditing(false); }
  };

  const logout = () => {
    Alert.alert('Sign Out', 'See you soon bro! 👋', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: async () => {
        await localAuth.logout();
        dispatch(clearUser());
        router.replace('/auth/login');
      }},
    ]);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Text style={styles.backArrow}>←</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Profile 🧑</Text>
          <TouchableOpacity onPress={logout} style={styles.logoutBtn}>
            <Text style={styles.logoutText}>Sign Out</Text>
          </TouchableOpacity>
        </View>

        {/* Profile card */}
        <View style={styles.profileCard}>
          <TouchableOpacity onPress={() => setEditing(!editing)}>
            <Text style={styles.avatarBig}>{user.avatar}</Text>
            <Text style={styles.editHint}>tap to change</Text>
          </TouchableOpacity>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{user.name}</Text>
            <Text style={styles.profileEmail}>{user.email}</Text>
            <Text style={styles.profileJoined}>Joined {user.joined}</Text>
          </View>
          <View style={styles.levelDisplay}>
            <Text style={styles.levelBig}>Lv.{user.level}</Text>
            <Text style={styles.xpSmall}>⭐{user.xp} XP</Text>
          </View>
        </View>

        {/* Avatar picker */}
        {editing && (
          <View style={styles.avatarPicker}>
            <View style={styles.avatarGrid}>
              {AVATARS.map(a => (
                <TouchableOpacity key={a} onPress={() => setSelAvatar(a)}
                  style={[styles.avatarOpt, selAvatar === a && styles.avatarOptSelected]}>
                  <Text style={styles.avatarOptText}>{a}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <TouchableOpacity onPress={saveAvatar} style={styles.saveBtn}>
              <Text style={styles.saveBtnText}>Save Avatar</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* XP bar */}
        <View style={{ paddingHorizontal: 16 }}>
          <XPBar xp={user.xp}/>
        </View>

        {/* Tabs */}
        <View style={styles.tabs}>
          {(['stats','cards','goals'] as const).map(t => (
            <TouchableOpacity key={t} onPress={() => setTab(t)}
              style={[styles.tab, tab === t && styles.tabActive]}>
              <Text style={[styles.tabText, tab === t && styles.tabTextActive]}>
                {t === 'stats' ? '📊 Stats' : t === 'cards' ? '🃏 Cards' : '🎯 Goals'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={{ padding: 16 }}>
          {tab === 'stats' && (
            <>
              <View style={styles.statsGrid}>
                <StatCard icon="📚" value={user.sessions || 0} label="Sessions" color={Colors.purpleL}/>
                <StatCard icon="✅" value={user.correct || 0} label="Correct" color={Colors.green}/>
              </View>
              <View style={styles.statsGrid}>
                <StatCard icon="🔥" value={`${user.streak || 0}d`} label="Streak" color={Colors.orange}/>
                <StatCard icon="⏱️" value={`${Math.round((user.studyHours || 0) * 10) / 10}h`} label="Hours" color={Colors.blue}/>
              </View>
              <View style={styles.statsGrid}>
                <StatCard icon="💬" value={user.msgsSent || 0} label="Messages" color={Colors.pink}/>
                <StatCard icon="⭐" value={user.xp || 0} label="XP Total" color={Colors.yellow}/>
              </View>
            </>
          )}
          {tab === 'cards' && (
            <View style={{ alignItems: 'center', paddingVertical: 30 }}>
              <HomieBot mood="sad" size={80}/>
              <Text style={{ fontSize: 16, fontWeight: '700', color: Colors.text, marginTop: 12 }}>No flashcards yet!</Text>
              <Text style={{ fontSize: 13, color: Colors.muted, marginTop: 6 }}>Ask HOMIE to create flashcards in chat</Text>
            </View>
          )}
          {tab === 'goals' && (
            <View style={{ gap: 10 }}>
              {GOALS.map(g => (
                <TouchableOpacity key={g} style={[styles.goalItem, user.goals?.includes(g) && styles.goalItemActive]}>
                  <Text style={styles.goalText}>{g}</Text>
                  {user.goals?.includes(g) && <Text style={{ color: Colors.green }}>✓</Text>}
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, paddingBottom: 8 },
  backBtn: { padding: 4 },
  backArrow: { fontSize: 24, color: Colors.text },
  title: { fontSize: 20, fontWeight: '900', color: Colors.text },
  logoutBtn: { padding: 8 },
  logoutText: { fontSize: 13, color: Colors.red, fontWeight: '600' },
  profileCard: { flexDirection: 'row', alignItems: 'center', gap: 14, margin: 16, padding: 20, backgroundColor: Colors.bg2, borderRadius: Radius.xl, borderWidth: 1, borderColor: Colors.border },
  avatarBig: { fontSize: 52, textAlign: 'center' },
  editHint: { fontSize: 10, color: Colors.muted, textAlign: 'center' },
  profileInfo: { flex: 1 },
  profileName: { fontSize: 18, fontWeight: '900', color: Colors.text },
  profileEmail: { fontSize: 12, color: Colors.muted, marginTop: 2 },
  profileJoined: { fontSize: 11, color: Colors.muted, marginTop: 2 },
  levelDisplay: { alignItems: 'flex-end' },
  levelBig: { fontSize: 26, fontWeight: '900', color: Colors.purpleL },
  xpSmall: { fontSize: 12, color: Colors.muted },
  avatarPicker: { margin: 16, padding: 16, backgroundColor: Colors.bg2, borderRadius: Radius.lg, borderWidth: 1, borderColor: Colors.border },
  avatarGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 14 },
  avatarOpt: { width: 46, height: 46, borderRadius: 12, borderWidth: 2, borderColor: Colors.border, backgroundColor: Colors.bg3, alignItems: 'center', justifyContent: 'center' },
  avatarOptSelected: { borderColor: Colors.purpleL, backgroundColor: 'rgba(124,58,237,0.15)' },
  avatarOptText: { fontSize: 24 },
  saveBtn: { paddingVertical: 12, backgroundColor: Colors.purple, borderRadius: Radius.md, alignItems: 'center' },
  saveBtnText: { color: Colors.white, fontWeight: '700', fontSize: 14 },
  tabs: { flexDirection: 'row', gap: 6, paddingHorizontal: 16, marginTop: 16, marginBottom: 4 },
  tab: { flex: 1, paddingVertical: 9, borderRadius: Radius.md, backgroundColor: Colors.bg2, alignItems: 'center', borderWidth: 1, borderColor: Colors.border },
  tabActive: { backgroundColor: Colors.purple, borderColor: Colors.purple },
  tabText: { fontSize: 12, fontWeight: '700', color: Colors.muted },
  tabTextActive: { color: Colors.white },
  statsGrid: { flexDirection: 'row', gap: 10, marginBottom: 10 },
  goalItem: { padding: 14, backgroundColor: Colors.bg3, borderRadius: Radius.md, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderWidth: 1, borderColor: Colors.border },
  goalItemActive: { borderColor: Colors.green, backgroundColor: 'rgba(16,185,129,0.08)' },
  goalText: { fontSize: 14, color: Colors.text },
});
