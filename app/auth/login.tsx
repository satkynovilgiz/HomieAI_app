import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { router } from 'expo-router';
import { signInWithEmail, signInWithGoogle, isGoogleSignInSupported } from '../../lib/authService';
import { Colors, Radius } from '../../constants/theme';
import HomieBot from '../../components/mascot/HomieBot';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { GoogleIcon } from '../../components/icons';

const GOOGLE_AVAILABLE = isGoogleSignInSupported();

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState('');
  const [mood, setMood] = useState<'happy' | 'sad' | 'celebrating'>('happy');

  const login = async () => {
    if (!email || !pass) { setError('fill in your info'); return; }
    setLoading(true); setError('');
    try {
      const { user, err } = await signInWithEmail(email.toLowerCase().trim(), pass);
      if (err) { setError(err); setMood('sad'); return; }
      if (user) {
        setMood('celebrating');
        setTimeout(() => router.replace('/(tabs)'), 300);
      }
    } catch (e: any) {
      setError('something broke — try again');
      setMood('sad');
    } finally {
      setLoading(false);
    }
  };

  const googleSignIn = async () => {
    setGoogleLoading(true);
    setError('');
    try {
      const { user, err } = await signInWithGoogle();
      if (err) { setError(err); setMood('sad'); return; }
      if (user) {
        setMood('celebrating');
        setTimeout(() => router.replace('/(tabs)'), 300);
      }
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
          <HomieBot mood={mood} size={80} />
          <Text style={styles.title}>Welcome back</Text>
          <Text style={styles.sub}>Your streak is waiting</Text>
        </View>

        <View style={styles.card}>
          <TouchableOpacity onPress={googleSignIn} disabled={googleLoading} style={[styles.googleBtn, !GOOGLE_AVAILABLE && styles.googleBtnDisabled]} activeOpacity={0.85}>
            <GoogleIcon size={20} />
            <Text style={styles.googleText}>{googleLoading ? 'Signing in...' : 'Continue with Google'}</Text>
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

          <Input label="Email" placeholder="your@email.com" value={email}
            onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
          <Input label="Password" placeholder="your password" value={pass}
            onChangeText={setPass} secureTextEntry />

          <Button title="Sign In" onPress={login} loading={loading} size="lg" style={styles.submitBtn} />

          <TouchableOpacity style={styles.signupLink} onPress={() => router.push('/auth/signup')}>
            <Text style={styles.signupText}>
              No account? <Text style={{ color: Colors.purpleL, fontWeight: '700' }}>Sign up free</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  content: { padding: 24, paddingTop: 60, alignItems: 'center' },
  header: { alignItems: 'center', marginBottom: 32 },
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
  submitBtn: { height: 52, borderRadius: 14, marginTop: 8 },
  signupLink: { alignItems: 'center', marginTop: 16 },
  signupText: { fontSize: 14, color: Colors.muted },
});
