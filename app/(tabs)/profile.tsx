import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store';
import { updateUser } from '../../store/slices/userSlice';
import { signOutUser, updateUser as updateUserRemote } from '../../lib/authService';
import { Colors, Radius } from '../../constants/theme';
import { AVATARS } from '../../constants/subjects';
import HomieBot from '../../components/mascot/HomieBot';
import XPBar from '../../components/ui/XPBar';
import Svg, { Path, Circle, Rect } from 'react-native-svg';

function EditIcon() {
  return (
    <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
      <Path d="M11 4H4C3.45 4 3 4.45 3 5V20C3 20.55 3.45 21 4 21H19C19.55 21 20 20.55 20 20V13" stroke={Colors.purpleL} strokeWidth="2" strokeLinecap="round"/>
      <Path d="M18.5 2.5L21.5 5.5L12 15H9V12L18.5 2.5Z" stroke={Colors.purpleL} strokeWidth="2" strokeLinejoin="round" fill="none"/>
    </Svg>
  );
}

function LogoutIcon() {
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
      <Path d="M9 21H5C4.45 21 4 20.55 4 20V4C4 3.45 4.45 3 5 3H9" stroke={Colors.red} strokeWidth="2" strokeLinecap="round"/>
      <Path d="M16 17L21 12L16 7" stroke={Colors.red} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <Path d="M21 12H9" stroke={Colors.red} strokeWidth="2" strokeLinecap="round"/>
    </Svg>
  );
}

function SettingsIcon() {
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="3" stroke={Colors.muted} strokeWidth="2" fill="none"/>
      <Path d="M19.4 15C19.2 15.5 19.3 16.1 19.7 16.5L19.8 16.6C20.5 17.3 20.5 18.4 19.8 19.1C19.1 19.8 18 19.8 17.3 19.1L17.2 19C16.8 18.6 16.2 18.5 15.7 18.7C15.2 18.9 14.9 19.4 14.9 19.9V20.1C14.9 21.1 14.1 21.9 13.1 21.9H10.9C9.9 21.9 9.1 21.1 9.1 20.1V19.9C9.1 19.4 8.8 18.9 8.3 18.7C7.8 18.5 7.2 18.6 6.8 19L6.7 19.1C6 19.8 4.9 19.8 4.2 19.1C3.5 18.4 3.5 17.3 4.2 16.6L4.3 16.5C4.7 16.1 4.8 15.5 4.6 15C4.4 14.5 3.9 14.2 3.4 14.2H3.2C2.2 14.2 1.4 13.4 1.4 12.4V10.2C1.4 9.2 2.2 8.4 3.2 8.4H3.4C3.9 8.4 4.4 8.1 4.6 7.6C4.8 7.1 4.7 6.5 4.3 6.1L4.2 6C3.5 5.3 3.5 4.2 4.2 3.5C4.9 2.8 6 2.8 6.7 3.5L6.8 3.6C7.2 4 7.8 4.1 8.3 3.9C8.8 3.7 9.1 3.2 9.1 2.7V2.5C9.1 1.5 9.9 0.7 10.9 0.7H13.1C14.1 0.7 14.9 1.5 14.9 2.5V2.7C14.9 3.2 15.2 3.7 15.7 3.9C16.2 4.1 16.8 4 17.2 3.6L17.3 3.5C18 2.8 19.1 2.8 19.8 3.5C20.5 4.2 20.5 5.3 19.8 6L19.7 6.1C19.3 6.5 19.2 7.1 19.4 7.6C19.6 8.1 20.1 8.4 20.6 8.4H20.8C21.8 8.4 22.6 9.2 22.6 10.2V12.4C22.6 13.4 21.8 14.2 20.8 14.2H20.6C20.1 14.2 19.6 14.5 19.4 15Z" stroke={Colors.muted} strokeWidth="1.5" fill="none"/>
    </Svg>
  );
}

const STAT_ITEMS = [
  { key: 'sessions', label: 'Sessions', color: Colors.purpleL },
  { key: 'correct', label: 'Correct', color: Colors.green },
  { key: 'streak', label: 'Streak', color: Colors.orange },
  { key: 'xp', label: 'Total XP', color: Colors.blue },
  { key: 'msgsSent', label: 'Messages', color: Colors.pink },
  { key: 'studyHours', label: 'Hours', color: Colors.yellow },
];

export default function ProfileScreen() {
  const dispatch = useDispatch();
  const user = useSelector((s: RootState) => s.user.current);
  const streak = useSelector((s: RootState) => s.streak);
  const gems = useSelector((s: RootState) => s.gems.count);
  const [tab, setTab] = useState<'stats' | 'avatar'>('stats');
  const [selAvatar, setSelAvatar] = useState(user?.avatar || '');
  const [editName, setEditName] = useState(false);
  const [name, setName] = useState(user?.name || '');

  useEffect(() => { if (!user) router.replace('/auth/login'); }, [user]);
  if (!user) return null;

  const logout = () => {
    Alert.alert('sign out?', 'see you soon', [
      { text: 'nvm', style: 'cancel' },
      {
        text: 'sign out', style: 'destructive', onPress: async () => {
          await signOutUser();
          router.replace('/auth/login');
        }
      },
    ]);
  };

  const saveAvatar = async () => {
    const updated = await updateUserRemote(user.uid, { avatar: selAvatar });
    if (updated) dispatch(updateUser({ avatar: selAvatar }));
    setTab('stats');
  };

  const saveName = async () => {
    if (!name.trim()) return;
    await updateUserRemote(user.uid, { name: name.trim() });
    dispatch(updateUser({ name: name.trim() }));
    setEditName(false);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profile</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity onPress={() => router.push('/settings')} style={styles.iconBtn}>
            <SettingsIcon />
          </TouchableOpacity>
          <TouchableOpacity onPress={logout} style={styles.iconBtn}>
            <LogoutIcon />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Profile card */}
        <View style={styles.profileCard}>
          <View style={styles.avatarWrap}>
            <HomieBot mood="happy" size={70} />
            <View style={styles.avatarBadge}>
              <Text style={styles.avatarEmoji}>{user.avatar || '?'}</Text>
            </View>
          </View>

          <View style={styles.profileInfo}>
            {editName ? (
              <View style={styles.nameEditRow}>
                <TextInput
                  value={name} onChangeText={setName}
                  style={styles.nameInput} autoFocus
                  onSubmitEditing={saveName}
                />
                <TouchableOpacity onPress={saveName} style={styles.saveNameBtn}>
                  <Text style={styles.saveNameText}>save</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity onPress={() => setEditName(true)} style={styles.nameRow}>
                <Text style={styles.profileName}>{user.name}</Text>
                <EditIcon />
              </TouchableOpacity>
            )}
            <Text style={styles.profileEmail}>{user.email}</Text>
            <Text style={styles.profileJoined}>Joined {new Date(user.createdAt).toLocaleDateString()}</Text>
          </View>

          <View style={styles.levelBlock}>
            <Text style={styles.levelNum}>Lv.{user.level}</Text>
            <Text style={styles.xpNum}>{user.xp} XP</Text>
            <Text style={styles.gemsNum}>{gems} gems</Text>
          </View>
        </View>

        {/* XP Bar */}
        <View style={{ paddingHorizontal: 16, marginBottom: 8 }}>
          <XPBar xp={user.xp} />
        </View>

        {/* Tabs */}
        <View style={styles.tabs}>
          <TouchableOpacity onPress={() => setTab('stats')} style={[styles.tabBtn, tab === 'stats' && styles.tabBtnActive]}>
            <Text style={[styles.tabBtnText, tab === 'stats' && styles.tabBtnTextActive]}>Stats</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setTab('avatar')} style={[styles.tabBtn, tab === 'avatar' && styles.tabBtnActive]}>
            <Text style={[styles.tabBtnText, tab === 'avatar' && styles.tabBtnTextActive]}>Avatar</Text>
          </TouchableOpacity>
        </View>

        {/* Stats tab */}
        {tab === 'stats' && (
          <View style={styles.statsGrid}>
            {[
              { label: 'Sessions',  value: user.sessions || 0,                         color: Colors.purpleL },
              { label: 'Correct',   value: user.correct || 0,                           color: Colors.green },
              { label: 'Streak',    value: `${streak.current}d`,                        color: Colors.orange },
              { label: 'Total XP',  value: user.xp,                                    color: Colors.blue },
              { label: 'Messages',  value: user.msgsSent || 0,                          color: Colors.pink },
              { label: 'Hours',     value: `${Math.round((user.studyHours||0)*10)/10}h`, color: Colors.yellow },
            ].map(({ label, value, color }) => (
              <View key={label} style={styles.statCard}>
                <Text style={[styles.statValue, { color }]}>{value}</Text>
                <Text style={styles.statLabel}>{label}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Avatar tab */}
        {tab === 'avatar' && (
          <View style={styles.avatarPicker}>
            <Text style={styles.avatarPickerTitle}>choose your avatar</Text>
            <View style={styles.avatarGrid}>
              {AVATARS.map(a => (
                <TouchableOpacity
                  key={a} onPress={() => setSelAvatar(a)}
                  style={[styles.avatarOpt, selAvatar === a && styles.avatarOptSel]}
                >
                  <Text style={styles.avatarOptText}>{a}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <TouchableOpacity onPress={saveAvatar} style={styles.saveAvatarBtn}>
              <Text style={styles.saveAvatarText}>save avatar</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  header: { flexDirection: 'row', alignItems: 'center', padding: 16, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: Colors.border },
  headerTitle: { fontSize: 26, fontWeight: '900', color: Colors.text, flex: 1 },
  headerActions: { flexDirection: 'row', gap: 12 },
  iconBtn: { padding: 6 },
  profileCard: { flexDirection: 'row', alignItems: 'center', margin: 16, padding: 18, backgroundColor: Colors.bg2, borderRadius: Radius.xl, borderWidth: 1, borderColor: Colors.border, gap: 14 },
  avatarWrap: { position: 'relative', width: 72, height: 80 },
  avatarBadge: { position: 'absolute', bottom: 0, right: -4, width: 28, height: 28, borderRadius: 14, backgroundColor: Colors.bg3, borderWidth: 2, borderColor: Colors.border, alignItems: 'center', justifyContent: 'center' },
  avatarEmoji: { fontSize: 16 },
  profileInfo: { flex: 1 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  profileName: { fontSize: 17, fontWeight: '900', color: Colors.text },
  profileEmail: { fontSize: 12, color: Colors.muted, marginTop: 2 },
  profileJoined: { fontSize: 11, color: Colors.muted, marginTop: 1 },
  nameEditRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  nameInput: { flex: 1, backgroundColor: Colors.bg3, borderWidth: 1, borderColor: Colors.purpleL, borderRadius: 8, color: Colors.text, padding: 6, fontSize: 15, fontWeight: '700' },
  saveNameBtn: { paddingHorizontal: 10, paddingVertical: 6, backgroundColor: Colors.purple, borderRadius: 8 },
  saveNameText: { color: 'white', fontWeight: '700', fontSize: 12 },
  levelBlock: { alignItems: 'flex-end', gap: 2 },
  levelNum: { fontSize: 24, fontWeight: '900', color: Colors.purpleL },
  xpNum: { fontSize: 12, color: Colors.muted },
  gemsNum: { fontSize: 12, color: Colors.blue },
  tabs: { flexDirection: 'row', paddingHorizontal: 16, gap: 8, marginBottom: 16 },
  tabBtn: { flex: 1, paddingVertical: 10, borderRadius: Radius.md, backgroundColor: Colors.bg2, alignItems: 'center', borderWidth: 1, borderColor: Colors.border },
  tabBtnActive: { backgroundColor: Colors.purple, borderColor: Colors.purple },
  tabBtnText: { fontSize: 13, fontWeight: '700', color: Colors.muted },
  tabBtnTextActive: { color: 'white' },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 12, gap: 10 },
  statCard: { width: '30%', backgroundColor: Colors.bg3, borderRadius: Radius.md, padding: 14, alignItems: 'center', borderWidth: 1, borderColor: Colors.border },
  statValue: { fontSize: 22, fontWeight: '900', marginBottom: 4 },
  statLabel: { fontSize: 10, color: Colors.muted, textTransform: 'uppercase', letterSpacing: 0.5 },
  avatarPicker: { padding: 16 },
  avatarPickerTitle: { fontSize: 15, fontWeight: '700', color: Colors.text, marginBottom: 14 },
  avatarGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 20 },
  avatarOpt: { width: 52, height: 52, borderRadius: 14, borderWidth: 2, borderColor: Colors.border, backgroundColor: Colors.bg3, alignItems: 'center', justifyContent: 'center' },
  avatarOptSel: { borderColor: Colors.purpleL, backgroundColor: 'rgba(124,58,237,0.15)' },
  avatarOptText: { fontSize: 26 },
  saveAvatarBtn: { paddingVertical: 14, backgroundColor: Colors.purple, borderRadius: Radius.md, alignItems: 'center' },
  saveAvatarText: { color: 'white', fontWeight: '700', fontSize: 15 },
});
