import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { signInWithEmail, signInWithGoogle, isGoogleSignInSupported } from '../../lib/authService';
import { useTranslation } from '../../hooks/useTranslation';
import { Colors, Radius } from '../../constants/theme';
import { responsive } from '../../constants/responsive';
import HomieBot from '../../components/mascot/HomieBot';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { GoogleIcon } from '../../components/icons';

const GOOGLE_AVAILABLE = isGoogleSignInSupported();

export default function LoginScreen() {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState('');
  const [mood, setMood] = useState<'happy' | 'sad' | 'celebrating'>('happy');

  // Welcome screen shows exactly once ever, gated on this flag — not tied to
  // signup specifically, so a returning user's very first successful login
  // (from any provider) still gets it, but never again after.
  const afterAuth = async () => {
    const welcomeShown = await AsyncStorage.getItem('hm_welcome_shown');
    setMood('celebrating');
    setTimeout(() => router.replace(welcomeShown ? '/(tabs)' : '/auth/welcome'), 300);
  };

  const login = async () => {
    if (!email || !pass) { setError('fill in your info'); return; }
    setLoading(true); setError('');
    try {
      const { user, err } = await signInWithEmail(email.toLowerCase().trim(), pass);
      if (err) { setError(err); setMood('sad'); return; }
      if (user) { await afterAuth(); }
    } catch (e: any) {
      setError('something broke — try again');
      setMood('sad');
    } finally {
      setLoading(false);
    }
  };

  const clearAppData = async () => {
    await AsyncStorage.multiRemove([
      'hm_session', 'hm_user_cache', 'hm_chat_history', 'hm_saved_items',
      'hm_saved_videos', 'hm_study_plan', 'hm_lectures', 'hm_verify_code',
      'hm_welcome_shown', 'hm_onboarding_done',
    ]);
    setEmail('');
    setPass('');
    setError('local data cleared — sign in again, or sign up fresh');
  };

  const googleSignIn = async () => {
    setGoogleLoading(true);
    setError('');
    try {
      const { user, err } = await signInWithGoogle();
      if (err) { setError(err); setMood('sad'); return; }
      if (user) { await afterAuth(); }
    } catch {
      setError("google's not cooperating — use email instead");
      setMood('sad');
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <HomieBot mood={mood} size={responsive.mascotSize.sm} />
          <Text style={styles.title}>{t('login_title')}</Text>
          <Text style={styles.sub}>{t('login_sub')}</Text>
        </View>

        <View style={styles.card}>
          <TouchableOpacity onPress={googleSignIn} disabled={googleLoading} style={[styles.googleBtn, !GOOGLE_AVAILABLE && styles.googleBtnDisabled]} activeOpacity={0.85}>
            <GoogleIcon size={20} />
            <Text style={styles.googleText}>{googleLoading ? '...' : t('login_google')}</Text>
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

          <Input label={t('login_email')} placeholder="your@email.com" value={email}
            onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
          <Input label={t('login_password')} placeholder="your password" value={pass}
            onChangeText={setPass} secureTextEntry />

          <TouchableOpacity style={styles.forgotLink} onPress={() => router.push('/auth/forgot')}>
            <Text style={styles.forgotText}>Forgot password?</Text>
          </TouchableOpacity>

          <Button title={t('login_btn')} onPress={login} loading={loading} size="lg" style={styles.submitBtn} />

          <TouchableOpacity style={styles.signupLink} onPress={() => router.push('/auth/signup')}>
            <Text style={styles.signupText}>
              {t('login_no_account')} <Text style={{ color: Colors.purpleL, fontWeight: '700' }}>{t('login_signup_link')}</Text>
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.clearLink} onPress={clearAppData}>
            <Text style={styles.clearText}>Trouble signing in? Reset app data</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  content: { padding: responsive.padding, paddingTop: 60, alignItems: 'center' },
  header: { alignItems: 'center', marginBottom: 32 },
  title: { fontSize: responsive.fontSize.title, fontWeight: '900', color: Colors.text, marginTop: 16 },
  sub: { fontSize: responsive.fontSize.md, color: Colors.muted, marginTop: 6 },
  card: { width: '100%', maxWidth: responsive.maxWidth, backgroundColor: Colors.bg2, borderRadius: Radius.xl, padding: 24, borderWidth: 1, borderColor: Colors.border },
  googleBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12, backgroundColor: 'white', height: 52, borderRadius: 14, marginBottom: 20 },
  googleBtnDisabled: { opacity: 0.55, marginBottom: 8 },
  googleText: { fontSize: 15, fontWeight: '700', color: '#1a1a2e' },
  googleNote: { fontSize: 11, color: Colors.muted, textAlign: 'center', marginBottom: 20 },
  divider: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 20 },
  divLine: { flex: 1, height: 1, backgroundColor: Colors.border },
  divText: { fontSize: 12, color: Colors.muted },
  error: { color: Colors.red, fontSize: 13, marginBottom: 12, textAlign: 'center' },
  forgotLink: { alignItems: 'flex-end', marginBottom: 4 },
  forgotText: { fontSize: 13, color: Colors.purpleL, fontWeight: '600' },
  submitBtn: { height: 52, borderRadius: 14, marginTop: 8 },
  signupLink: { alignItems: 'center', marginTop: 16 },
  signupText: { fontSize: 14, color: Colors.muted },
  clearLink: { alignItems: 'center', marginTop: 12 },
  clearText: { fontSize: 11, color: Colors.muted, textDecorationLine: 'underline' },
});
