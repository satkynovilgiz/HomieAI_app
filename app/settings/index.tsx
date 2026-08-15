
import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useDispatch, useSelector } from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Svg, { Path } from 'react-native-svg';
import { RootState } from '../../store';
import { toggleTheme } from '../../store/slices/themeSlice';
import { setLanguage } from '../../store/slices/languageSlice';
import { Language } from '../../constants/translations';
import { signOutUser } from '../../lib/authService';
import { useDeleteAccount } from '../../hooks/useDeleteAccount';
import { useTranslation } from '../../hooks/useTranslation';
import { Colors, Radius } from '../../constants/theme';
import DeleteAccountModal from '../../components/auth/DeleteAccountModal';

const LANGUAGES: { code: Language; flag: string; name: string; native: string }[] = [
  { code: 'en', flag: '🇺🇸', name: 'English', native: 'English' },
  { code: 'es', flag: '🇪🇸', name: 'Spanish', native: 'Español' },
  { code: 'ru', flag: '🇷🇺', name: 'Russian', native: 'Русский' },
];

function CheckIcon() {
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
      <Path d="M4 12l6 6L20 6" stroke={Colors.purple} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </Svg>
  );
}

export default function SettingsScreen() {
  const dispatch = useDispatch();
  const { t, language } = useTranslation();
  const user = useSelector((s: RootState) => s.user.current);
  const theme = useSelector((s: RootState) => s.theme.mode);
  const [notifications, setNotifications] = useState(true);
  const [sound, setSound] = useState(true);
  const [haptics, setHaptics] = useState(true);
  const { modalVisible, openModal, closeModal, confirmDelete, deleting } = useDeleteAccount();

  const logout = async () => {
    await signOutUser();
    router.replace('/auth/login');
  };

  const resetOnboarding = async () => {
    await AsyncStorage.removeItem('hm_onboarding_done');
    Alert.alert('Onboarding reset', 'Restart the app to see the onboarding flow again.');
  };

  const changeLanguage = async (lang: Language) => {
    dispatch(setLanguage(lang));
    await AsyncStorage.setItem('hm_language', lang);
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
        <Text style={styles.title}>{t('settings_title')}</Text>
      </View>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>

        <Text style={styles.sectionLabel}>{t('settings_account')}</Text>
        <View style={styles.section}>
          <View style={styles.accountRow}>
            <Text style={styles.avatar}>{user?.avatar || '🧑'}</Text>
            <View>
              <Text style={styles.accountName}>{user?.name}</Text>
              <Text style={styles.accountEmail}>{user?.email}</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.row} onPress={() => router.push('/profile')}>
            <Text style={styles.rowLabel}>{t('settings_edit_profile')}</Text>
            <Text style={styles.rowArrow}>→</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionLabel}>{t('settings_language')}</Text>
        <View style={styles.languageSection}>
          {LANGUAGES.map(l => (
            <TouchableOpacity key={l.code} style={styles.languageRow} onPress={() => changeLanguage(l.code)} activeOpacity={0.8}>
              <Text style={styles.languageFlag}>{l.flag}</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.languageName}>{l.name}</Text>
                <Text style={styles.languageNative}>{l.native}</Text>
              </View>
              {language === l.code && <CheckIcon />}
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.sectionLabel}>{t('settings_appearance')}</Text>
        <View style={styles.section}>
          <S label={t('settings_dark_mode')} value={theme==='dark'} onChange={()=>dispatch(toggleTheme())}/>
        </View>

        <Text style={styles.sectionLabel}>{t('settings_notifications')}</Text>
        <View style={styles.section}>
          <S label={t('settings_push')} value={notifications} onChange={setNotifications}/>
          <S label={t('settings_sound')} value={sound} onChange={setSound}/>
          <S label={t('settings_haptics')} value={haptics} onChange={setHaptics}/>
        </View>

        <Text style={styles.sectionLabel}>{t('settings_learning')}</Text>
        <View style={styles.section}>
          <TouchableOpacity style={styles.row}>
            <Text style={styles.rowLabel}>{t('settings_daily_goal')}</Text>
            <Text style={styles.rowValue}>1 lesson/day →</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.row}>
            <Text style={styles.rowLabel}>{t('settings_reminder_time')}</Text>
            <Text style={styles.rowValue}>7:00 PM →</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionLabel}>{t('settings_about_section')}</Text>
        <View style={styles.section}>
          <TouchableOpacity style={styles.row} onPress={() => router.push('/about')}>
            <Text style={styles.rowLabel}>{t('settings_about_app')}</Text>
            <Text style={styles.rowArrow}>→</Text>
          </TouchableOpacity>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>{t('settings_version')}</Text>
            <Text style={styles.rowValue}>1.0.0</Text>
          </View>
        </View>

        {__DEV__ && (
          <>
            <Text style={styles.sectionLabel}>DEVELOPER</Text>
            <View style={styles.section}>
              <TouchableOpacity style={styles.row} onPress={resetOnboarding}>
                <Text style={styles.rowLabel}>Reset Onboarding</Text>
                <Text style={styles.rowArrow}>→</Text>
              </TouchableOpacity>
            </View>
          </>
        )}

        <Text style={styles.sectionLabel}>LEGAL</Text>
        <View style={styles.section}>
          <TouchableOpacity style={styles.row} onPress={() => router.push('/legal/privacy')}>
            <Text style={styles.rowLabel}>Privacy Policy</Text>
            <Text style={styles.rowArrow}>›</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.row} onPress={() => router.push('/legal/terms')}>
            <Text style={styles.rowLabel}>Terms of Service</Text>
            <Text style={styles.rowArrow}>›</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.dangerLabel}>{t('settings_danger_zone')}</Text>
        <View style={styles.dangerSection}>
          <TouchableOpacity style={styles.dangerRow} onPress={logout}>
            <Text style={styles.dangerRowText}>{t('settings_signout_all')}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.dangerRow} onPress={openModal}>
            <Text style={styles.dangerRowText}>{t('settings_delete')}</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity onPress={logout} style={styles.logoutBtn}>
          <Text style={styles.logoutText}>{t('settings_signout')}</Text>
        </TouchableOpacity>
        <View style={{ height:40 }}/>
      </ScrollView>

      <DeleteAccountModal
        visible={modalVisible}
        onClose={closeModal}
        onConfirm={confirmDelete}
        loading={deleting}
        userName={user?.name || ''}
      />
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
  languageSection: { gap: 8 },
  languageRow: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#12102a', borderRadius: 12, paddingVertical: 14, paddingHorizontal: 16 },
  languageFlag: { fontSize: 22 },
  languageName: { fontSize: 15, fontWeight: '600', color: Colors.white },
  languageNative: { fontSize: 12, color: '#9090c0', marginTop: 2 },
  logoutBtn: { marginTop:24, paddingVertical:14, backgroundColor:'rgba(239,68,68,0.1)', borderRadius:Radius.lg, alignItems:'center', borderWidth:1, borderColor:'rgba(239,68,68,0.3)' },
  logoutText: { fontSize:15, fontWeight:'700', color:Colors.red },
  dangerLabel: { fontSize:10, fontWeight:'700', color:Colors.red, letterSpacing:2, marginBottom:8, marginTop:16 },
  dangerSection: { gap:8 },
  dangerRow: { padding:16, backgroundColor:'rgba(239,68,68,0.06)', borderWidth:1, borderColor:'rgba(239,68,68,0.15)', borderRadius:Radius.lg },
  dangerRowText: { fontSize:14, fontWeight:'700', color:Colors.red },
});
