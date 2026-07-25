
import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { router } from 'expo-router';
import { signUpWithEmail, signInWithGoogle, isGoogleSignInSupported } from '../../lib/authService';
import { Colors, Radius } from '../../constants/theme';
import { AVATARS } from '../../constants/subjects';
import HomieBot from '../../components/mascot/HomieBot';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { GoogleIcon } from '../../components/icons';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const GOOGLE_AVAILABLE = isGoogleSignInSupported();

export default function SignupScreen() {
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
      if (user) { router.replace('/(tabs)'); }
    } catch {
      setError("google's not cooperating — use email instead");
    } finally {
      setGoogleLoading(false);
    }
  };

  const signup = async () => {
    if (!form.name || !form.email || !form.pass) { setError('fill in your info'); return; }
    if (!EMAIL_RE.test(form.email)) { setError('that email looks off'); return; }
    if (form.pass !== form.pass2) { setError("passwords don't match"); return; }
    if (form.pass.length < 6) { setError('needs 6+ characters'); return; }
    setLoading(true); setError('');
    try {
      const { user, err } = await signUpWithEmail(form.name.trim(), form.email.toLowerCase().trim(), form.pass, avatar);
      if (err) { setError(err); return; }
      if (user) { router.replace('/(tabs)'); }
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
          <HomieBot mood="happy" size={90}/>
          <Text style={styles.title}>let's get you set up 🚀</Text>
          <Text style={styles.sub}>free forever. no credit card.</Text>
        </View>

        <View style={styles.card}>
          <TouchableOpacity onPress={googleSignUp} disabled={googleLoading} style={[styles.googleBtn, !GOOGLE_AVAILABLE && styles.googleBtnDisabled]} activeOpacity={0.85}>
            <GoogleIcon size={20} />
            <Text style={styles.googleText}>{googleLoading ? 'signing in...' : 'continue with google'}</Text>
          </TouchableOpacity>
          {!GOOGLE_AVAILABLE && (
            <Text style={styles.googleNote}>needs the full app, not Expo Go — use email for now</Text>
          )}

          <View style={styles.divider}>
            <View style={styles.divLine} />
            <Text style={styles.divText}>or use email</Text>
            <View style={styles.divLine} />
          </View>

          {error ? <Text style={styles.error}>{error}</Text> : null}
          <Input label="your name 👋" placeholder="Ilgiz" value={form.name} onChangeText={v => f('name', v)}/>
          <Input label="email" placeholder="your@email.com" value={form.email} onChangeText={v => f('email', v)} keyboardType="email-address" autoCapitalize="none"/>
          <Input label="password" placeholder="6+ characters" value={form.pass} onChangeText={v => f('pass', v)} secureTextEntry/>
          <Input label="confirm password" placeholder="same as above" value={form.pass2} onChangeText={v => f('pass2', v)} secureTextEntry/>

          <Text style={styles.avatarLabel}>pick your avatar</Text>
          <View style={styles.avatarGrid}>
            {AVATARS.map(a => (
              <TouchableOpacity key={a} onPress={() => setAvatar(a)}
                style={[styles.avatarBtn, avatar === a && styles.avatarSelected]}>
                <Text style={styles.avatarEmoji}>{a}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Button title="let's go 🚀" onPress={signup} loading={loading} size="lg" style={{ marginTop: 16 }}/>
          <TouchableOpacity style={styles.loginLink} onPress={() => router.back()}>
            <Text style={styles.loginText}>already have one? <Text style={{ color: Colors.purpleL, fontWeight: '700' }}>sign in</Text></Text>
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
  title: { fontSize: 26, fontWeight: '900', color: Colors.text, marginTop: 14 },
  sub: { fontSize: 13, color: Colors.muted, marginTop: 5 },
  card: { width: '100%', backgroundColor: Colors.bg2, borderRadius: Radius.xl, padding: 24, borderWidth: 1, borderColor: Colors.border },
  googleBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12, backgroundColor: 'white', borderRadius: Radius.md, paddingVertical: 14, marginBottom: 20 },
  googleBtnDisabled: { opacity: 0.55, marginBottom: 8 },
  googleText: { fontSize: 15, fontWeight: '700', color: '#1a1a2e' },
  googleNote: { fontSize: 11, color: Colors.muted, textAlign: 'center', marginBottom: 20 },
  divider: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 20 },
  divLine: { flex: 1, height: 1, backgroundColor: Colors.border },
  divText: { fontSize: 12, color: Colors.muted },
  error: { color: Colors.red, fontSize: 13, marginBottom: 12, textAlign: 'center' },
  avatarLabel: { fontSize: 12, fontWeight: '600', color: Colors.text2, marginBottom: 10, marginTop: 4 },
  avatarGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 4 },
  avatarBtn: { width: 46, height: 46, borderRadius: 12, borderWidth: 2, borderColor: Colors.border, backgroundColor: Colors.bg3, alignItems: 'center', justifyContent: 'center' },
  avatarSelected: { borderColor: Colors.purpleL, backgroundColor: 'rgba(124,58,237,0.15)' },
  avatarEmoji: { fontSize: 22 },
  loginLink: { alignItems: 'center', marginTop: 16 },
  loginText: { fontSize: 13, color: Colors.muted },
});
