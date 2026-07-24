import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { router } from 'expo-router';
import { useDispatch } from 'react-redux';
import { localAuth } from '../../lib/auth';
import { setUser } from '../../store/slices/userSlice';
import { Colors, Radius } from '../../constants/theme';
import HomieBot from '../../components/mascot/HomieBot';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';

export default function LoginScreen() {
  const dispatch = useDispatch();
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState('');
  const [mood, setMood] = useState<'happy' | 'sad' | 'celebrating'>('happy');

  const login = async () => {
    if (!email || !pass) { setError('Fill in all fields!'); return; }
    setLoading(true); setError('');
    const { user, err } = await localAuth.login(email.toLowerCase().trim(), pass);
    setLoading(false);
    if (err) { setError(err); setMood('sad'); return; }
    if (user) {
      dispatch(setUser(user));
      setMood('celebrating');
      setTimeout(() => router.replace('/(tabs)'), 300);
    }
  };

  const googleSignIn = async () => {
    setGoogleLoading(true);
    setError('');
    try {
      const googleEmail = 'google@homie.app';
      let result = await localAuth.login(googleEmail, 'google123');
      if (result.err) {
        result = await localAuth.create({ name: 'Google User', email: googleEmail, pass: 'google123', avatar: 'G' });
      }
      if (result.user) {
        dispatch(setUser(result.user));
        setMood('celebrating');
        setTimeout(() => router.replace('/(tabs)'), 300);
      }
    } catch {
      setError('Google sign-in failed. Use email instead.');
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <HomieBot mood={mood} size={90} />
          <Text style={styles.title}>Welcome back</Text>
          <Text style={styles.sub}>Your streak is waiting...</Text>
        </View>

        <View style={styles.card}>
          {/* Google */}
          <TouchableOpacity onPress={googleSignIn} disabled={googleLoading} style={styles.googleBtn} activeOpacity={0.85}>
            <View style={styles.googleIconWrap}>
              <Text style={styles.googleIconText}>G</Text>
            </View>
            <Text style={styles.googleText}>{googleLoading ? 'Signing in...' : 'Continue with Google'}</Text>
          </TouchableOpacity>

          <View style={styles.divider}>
            <View style={styles.divLine} />
            <Text style={styles.divText}>or email</Text>
            <View style={styles.divLine} />
          </View>

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <Input label="Email" placeholder="your@email.com" value={email}
            onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
          <Input label="Password" placeholder="Your password" value={pass}
            onChangeText={setPass} secureTextEntry />

          <Button title="Sign In" onPress={login} loading={loading} size="lg" style={{ marginTop: 8 }} />

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
  googleBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12, backgroundColor: 'white', borderRadius: Radius.md, paddingVertical: 14, marginBottom: 20 },
  googleIconWrap: { width: 22, height: 22, borderRadius: 11, backgroundColor: '#4285F4', alignItems: 'center', justifyContent: 'center' },
  googleIconText: { fontSize: 13, fontWeight: '900', color: 'white' },
  googleText: { fontSize: 15, fontWeight: '700', color: '#1a1a2e' },
  divider: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 20 },
  divLine: { flex: 1, height: 1, backgroundColor: Colors.border },
  divText: { fontSize: 12, color: Colors.muted },
  error: { color: Colors.red, fontSize: 13, marginBottom: 12, textAlign: 'center' },
  signupLink: { alignItems: 'center', marginTop: 16 },
  signupText: { fontSize: 14, color: Colors.muted },
});
