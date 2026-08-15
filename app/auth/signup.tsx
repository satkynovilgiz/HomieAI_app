import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { signUpWithEmail, signInWithGoogle, isGoogleSignInSupported } from '../../lib/authService';
import { useTranslation } from '../../hooks/useTranslation';
import { Colors, Radius } from '../../constants/theme';
import { AVATARS } from '../../constants/subjects';
import HomieBot from '../../components/mascot/HomieBot';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { GoogleIcon } from '../../components/icons';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const GOOGLE_AVAILABLE = isGoogleSignInSupported();

export default function SignupScreen() {
  const { t } = useTranslation();
  const [form, setForm] = useState({ name: '', email: '', pass: '', pass2: '' });
  const [avatar, setAvatar] = useState('🧑');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState('');
  const f = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }));

  const googleSignUp = async () => {
    setGoogleLoading(true); setError('');
    try {
      const { user, err } = await signInWithGoogle();
      if (err) { setError(err); return; }
      if (user) {
        // Google accounts are pre-verified — no verify screen, straight to
        // welcome (or home if this browser/device has already seen it).
        const welcomeShown = await AsyncStorage.getItem('hm_welcome_shown');
        router.replace(welcomeShown ? '/(tabs)' : '/auth/welcome');
      }
    } catch {
      setError("google's not cooperating — use email instead");
    } finally {
      setGoogleLoading(false);
    }
  };

  const clearAppData = async () => {
    await AsyncStorage.multiRemove([
      'hm_session', 'hm_user_cache', 'hm_chat_history', 'hm_saved_items',
      'hm_saved_videos', 'hm_study_plan', 'hm_lectures', 'hm_verify_code',
      'hm_welcome_shown', 'hm_onboarding_done',
    ]);
    setForm({ name: '', email: '', pass: '', pass2: '' });
    setError("local data cleared. if an email still says taken, it's genuinely registered — sign in instead or use a different one");
  };

  const signup = async () => {
    if (!form.name || !form.email || !form.pass) { setError('fill in your info'); return; }
    if (!EMAIL_RE.test(form.email)) { setError('that email looks off'); return; }
    if (form.pass !== form.pass2) { setError("passwords don't match"); return; }
    if (form.pass.length < 6) { setError('needs 6+ characters'); return; }
    setLoading(true); setError('');
    try {
      const email = form.email.toLowerCase().trim();
      const name = form.name.trim();
      const { user, err } = await signUpWithEmail(name, email, form.pass, avatar);
      if (err) { setError(err); return; }
      if (user) { router.push({ pathname: '/auth/verify', params: { email, name } }); }
    } catch (e: any) {
      setError('something broke — try again');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <HomieBot mood="wink" size={80} />
          <Text style={styles.title}>{t('signup_title')}</Text>
          <Text style={styles.sub}>{t('signup_sub')}</Text>
        </View>

        <View style={styles.card}>
          <TouchableOpacity onPress={googleSignUp} disabled={googleLoading} style={[styles.googleBtn, !GOOGLE_AVAILABLE && styles.googleBtnDisabled]} activeOpacity={0.85}>
            <GoogleIcon size={20} />
            <Text style={styles.googleText}>{googleLoading ? '...' : t('signup_google')}</Text>
          </TouchableOpacity>
          {!GOOGLE_AVAILABLE && (
            <Text style={styles.googleNote}>needs the full app, not Expo Go — use email for now</Text>
          )}

          <View style={styles.divider}>
            <View style={styles.divLine} />
            <Text style={styles.divText}>{t('login_or')}</Text>
            <View style={styles.divLine} />
          </View>

          {error ? <Text style={styles.error}>{error}</Text> : null}
          <Input label={t('signup_name')} placeholder="Ilgiz" value={form.name} onChangeText={v => f('name', v)} />
          <Input label={t('signup_email')} placeholder="your@email.com" value={form.email} onChangeText={v => f('email', v)} keyboardType="email-address" autoCapitalize="none" />
          <Input label={t('signup_password')} placeholder="6+ characters" value={form.pass} onChangeText={v => f('pass', v)} secureTextEntry />
          <Input label={t('signup_confirm')} placeholder="same as above" value={form.pass2} onChangeText={v => f('pass2', v)} secureTextEntry />

          <Text style={styles.avatarLabel}>{t('signup_avatar')}</Text>
          <View style={styles.avatarGrid}>
            {AVATARS.map(a => (
              <TouchableOpacity key={a} onPress={() => setAvatar(a)}
                style={[styles.avatarBtn, avatar === a && styles.avatarSelected]}>
                <Text style={styles.avatarEmoji}>{a}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Button title={t('signup_btn')} onPress={signup} loading={loading} size="lg" style={styles.submitBtn} />
          <TouchableOpacity style={styles.loginLink} onPress={() => router.back()}>
            <Text style={styles.loginText}>{t('signup_have_account')} <Text style={{ color: Colors.purpleL, fontWeight: '700' }}>{t('signup_login_link')}</Text></Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.clearLink} onPress={clearAppData}>
            <Text style={styles.clearText}>Having issues signing up? Reset app data</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  content: { padding: 24, paddingTop: 60, alignItems: 'center' },
  header: { alignItems: 'center', marginBottom: 28 },
  title: { fontSize: 28, fontWeight: '900', color: Colors.text, marginTop: 16 },
  sub: { fontSize: 14, color: Colors.muted, marginTop: 6 },
  card: { width: '100%', backgroundColor: Colors.bg2, borderRadius: Radius.xl, padding: 24, borderWidth: 1, borderColor: Colors.border },
  googleBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12, backgroundColor: 'white', height: 52, borderRadius: 14, marginBottom: 20 },
  googleBtnDisabled: { opacity: 0.55, marginBottom: 8 },
  googleText: { fontSize: 15, fontWeight: '700', color: '#1a1a2e' },
  googleNote: { fontSize: 11, color: Colors.muted, textAlign: 'center', marginBottom: 20 },
  divider: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 20 },
  divLine: { flex: 1, height: 1, backgroundColor: Colors.border },
  divText: { fontSize: 12, color: Colors.muted },
  error: { color: Colors.red, fontSize: 13, marginBottom: 12, textAlign: 'center' },
  avatarLabel: { fontSize: 12, fontWeight: '600', color: Colors.text2, marginBottom: 10, marginTop: 4 },
  avatarGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 4 },
  avatarBtn: { width: 52, height: 52, borderRadius: 12, borderWidth: 2, borderColor: Colors.border, backgroundColor: Colors.bg3, alignItems: 'center', justifyContent: 'center' },
  avatarSelected: { borderColor: Colors.purple, backgroundColor: 'rgba(124,58,237,0.15)' },
  avatarEmoji: { fontSize: 24 },
  submitBtn: { height: 52, borderRadius: 14, marginTop: 16 },
  loginLink: { alignItems: 'center', marginTop: 16 },
  loginText: { fontSize: 13, color: Colors.muted },
  clearLink: { alignItems: 'center', marginTop: 12 },
  clearText: { fontSize: 11, color: Colors.muted, textDecorationLine: 'underline' },
});
