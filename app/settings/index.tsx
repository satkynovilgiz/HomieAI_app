
import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store';
import { clearUser } from '../../store/slices/userSlice';
import { toggleTheme } from '../../store/slices/themeSlice';
import { localAuth } from '../../lib/auth';
import { Colors, Radius } from '../../constants/theme';

export default function SettingsScreen() {
  const dispatch = useDispatch();
  const user = useSelector((s: RootState) => s.user.current);
  const theme = useSelector((s: RootState) => s.theme.mode);
  const [notifications, setNotifications] = useState(true);
  const [sound, setSound] = useState(true);
  const [haptics, setHaptics] = useState(true);

  const logout = async () => {
    await localAuth.logout();
    dispatch(clearUser());
    router.replace('/auth/login');
  };

  const S = ({ label, value, onChange }: { label:string; value:boolean; onChange:(v:boolean)=>void }) => (
    <View style={styles.toggleRow}>
      <Text style={styles.toggleLabel}>{label}</Text>
      <Switch value={value} onValueChange={onChange} trackColor={{ false:Colors.bg4, true:Colors.purple }} thumbColor="white"/>
    </View>
  );

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.back}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Settings ⚙️</Text>
      </View>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>

        <Text style={styles.sectionLabel}>ACCOUNT</Text>
        <View style={styles.section}>
          <View style={styles.accountRow}>
            <Text style={styles.avatar}>{user?.avatar || '🧑'}</Text>
            <View>
              <Text style={styles.accountName}>{user?.name}</Text>
              <Text style={styles.accountEmail}>{user?.email}</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.row} onPress={() => router.push('/profile/index')}>
            <Text style={styles.rowLabel}>Edit Profile</Text>
            <Text style={styles.rowArrow}>→</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionLabel}>APPEARANCE</Text>
        <View style={styles.section}>
          <S label="Dark Mode" value={theme==='dark'} onChange={()=>dispatch(toggleTheme())}/>
        </View>

        <Text style={styles.sectionLabel}>NOTIFICATIONS</Text>
        <View style={styles.section}>
          <S label="Push Notifications" value={notifications} onChange={setNotifications}/>
          <S label="Sound Effects" value={sound} onChange={setSound}/>
          <S label="Haptic Feedback" value={haptics} onChange={setHaptics}/>
        </View>

        <Text style={styles.sectionLabel}>LEARNING</Text>
        <View style={styles.section}>
          <TouchableOpacity style={styles.row}>
            <Text style={styles.rowLabel}>Daily Goal</Text>
            <Text style={styles.rowValue}>1 lesson/day →</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.row}>
            <Text style={styles.rowLabel}>Reminder Time</Text>
            <Text style={styles.rowValue}>7:00 PM →</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionLabel}>ABOUT</Text>
        <View style={styles.section}>
          <TouchableOpacity style={styles.row} onPress={() => router.push('/about/index')}>
            <Text style={styles.rowLabel}>About HOMIE AI</Text>
            <Text style={styles.rowArrow}>→</Text>
          </TouchableOpacity>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Version</Text>
            <Text style={styles.rowValue}>1.0.0</Text>
          </View>
        </View>

        <TouchableOpacity onPress={logout} style={styles.logoutBtn}>
          <Text style={styles.logoutText}>Sign Out</Text>
        </TouchableOpacity>
        <View style={{ height:40 }}/>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex:1, backgroundColor:Colors.bg },
  header: { flexDirection:'row', alignItems:'center', padding:16, gap:12 },
  back: { padding:4 },
  backArrow: { fontSize:24, color:Colors.text },
  title: { fontSize:22, fontWeight:'900', color:Colors.text },
  content: { padding:16 },
  sectionLabel: { fontSize:10, fontWeight:'700', color:Colors.muted, letterSpacing:2, marginBottom:8, marginTop:16 },
  section: { backgroundColor:Colors.bg2, borderRadius:Radius.lg, borderWidth:1, borderColor:Colors.border, overflow:'hidden' },
  accountRow: { flexDirection:'row', alignItems:'center', gap:12, padding:16, borderBottomWidth:1, borderBottomColor:Colors.border },
  avatar: { fontSize:40 },
  accountName: { fontSize:16, fontWeight:'800', color:Colors.text },
  accountEmail: { fontSize:12, color:Colors.muted, marginTop:2 },
  row: { flexDirection:'row', alignItems:'center', justifyContent:'space-between', padding:16, borderTopWidth:1, borderTopColor:Colors.border },
  rowLabel: { fontSize:14, color:Colors.text },
  rowArrow: { fontSize:16, color:Colors.muted },
  rowValue: { fontSize:13, color:Colors.muted },
  toggleRow: { flexDirection:'row', alignItems:'center', justifyContent:'space-between', padding:16, borderTopWidth:1, borderTopColor:Colors.border },
  toggleLabel: { fontSize:14, color:Colors.text },
  logoutBtn: { marginTop:24, paddingVertical:14, backgroundColor:'rgba(239,68,68,0.1)', borderRadius:Radius.lg, alignItems:'center', borderWidth:1, borderColor:'rgba(239,68,68,0.3)' },
  logoutText: { fontSize:15, fontWeight:'700', color:Colors.red },
});
