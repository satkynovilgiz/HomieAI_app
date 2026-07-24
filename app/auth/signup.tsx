
import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { router } from 'expo-router';
import { useDispatch } from 'react-redux';
import { localAuth } from '../../lib/auth';
import { setUser } from '../../store/slices/userSlice';
import { Colors, Radius } from '../../constants/theme';
import { AVATARS } from '../../constants/subjects';
import HomieBot from '../../components/mascot/HomieBot';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';

export default function SignupScreen() {
  const dispatch = useDispatch();
  const [form, setForm] = useState({ name: '', email: '', pass: '', pass2: '' });
  const [avatar, setAvatar] = useState('🧑');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const f = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }));

  const signup = async () => {
    if (!form.name || !form.email || !form.pass) { setError('Fill in all fields!'); return; }
    if (form.pass !== form.pass2) { setError("Passwords don't match!"); return; }
    if (form.pass.length < 6) { setError('Password needs 6+ characters'); return; }
    setLoading(true); setError('');
    try {
      const { user, err } = await localAuth.create({ name: form.name, email: form.email.toLowerCase().trim(), pass: form.pass, avatar });
      if (err) { setError(err); return; }
      if (user) { dispatch(setUser(user)); router.replace('/(tabs)'); }
    } catch (e: any) {
      setError('Something went wrong: ' + (e?.message || 'please try again'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <HomieBot mood="happy" size={90}/>
          <Text style={styles.title}>Join HOMIE AI 🚀</Text>
          <Text style={styles.sub}>Free forever. No credit card.</Text>
        </View>

        <View style={styles.card}>
          {error ? <Text style={styles.error}>{error}</Text> : null}
          <Input label="Your name 👋" placeholder="Ilgiz" value={form.name} onChangeText={v => f('name', v)}/>
          <Input label="Email" placeholder="your@email.com" value={form.email} onChangeText={v => f('email', v)} keyboardType="email-address" autoCapitalize="none"/>
          <Input label="Password" placeholder="6+ characters" value={form.pass} onChangeText={v => f('pass', v)} secureTextEntry/>
          <Input label="Confirm Password" placeholder="Same as above" value={form.pass2} onChangeText={v => f('pass2', v)} secureTextEntry/>

          <Text style={styles.avatarLabel}>Pick your avatar</Text>
          <View style={styles.avatarGrid}>
            {AVATARS.map(a => (
              <TouchableOpacity key={a} onPress={() => setAvatar(a)}
                style={[styles.avatarBtn, avatar === a && styles.avatarSelected]}>
                <Text style={styles.avatarEmoji}>{a}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Button title="🚀 Create Account" onPress={signup} loading={loading} size="lg" style={{ marginTop: 16 }}/>
          <TouchableOpacity style={styles.loginLink} onPress={() => router.back()}>
            <Text style={styles.loginText}>Have an account? <Text style={{ color: Colors.purpleL, fontWeight: '700' }}>Sign in</Text></Text>
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
  error: { color: Colors.red, fontSize: 13, marginBottom: 12, textAlign: 'center' },
  avatarLabel: { fontSize: 12, fontWeight: '600', color: Colors.text2, marginBottom: 10, marginTop: 4 },
  avatarGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 4 },
  avatarBtn: { width: 46, height: 46, borderRadius: 12, borderWidth: 2, borderColor: Colors.border, backgroundColor: Colors.bg3, alignItems: 'center', justifyContent: 'center' },
  avatarSelected: { borderColor: Colors.purpleL, backgroundColor: 'rgba(124,58,237,0.15)' },
  avatarEmoji: { fontSize: 22 },
  loginLink: { alignItems: 'center', marginTop: 16 },
  loginText: { fontSize: 13, color: Colors.muted },
});
