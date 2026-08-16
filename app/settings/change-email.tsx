import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { changeEmail } from '../../lib/authService';
import { Colors, Radius } from '../../constants/theme';
import { responsive } from '../../constants/responsive';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function ChangeEmailScreen() {
  const user = useSelector((s: RootState) => s.user.current);
  const [newEmail, setNewEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => { if (!user) router.replace('/auth/login'); }, [user]);
  if (!user) return null;

  const save = async () => {
    const email = newEmail.toLowerCase().trim();
    if (!EMAIL_RE.test(email)) { setError('that email looks off'); return; }
    if (email === user.email.toLowerCase()) { setError('that is already your email'); return; }
    if (!password) { setError('enter your password to confirm'); return; }
    setLoading(true); setError('');
    try {
      const { err } = await changeEmail(password, email);
      if (err) { setError(err); return; }
      Alert.alert(
        'Confirmation sent',
        `We sent a link to ${email}. Open it to finish the change — until then, keep signing in with your current email.`
      );
      router.back();
    } catch {
      setError('something broke — try again');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.back}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Change Email</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        {error ? <Text style={styles.error}>{error}</Text> : null}

        <Text style={styles.label}>Current email</Text>
        <View style={styles.currentEmailBox}>
          <Text style={styles.currentEmailText}>{user.email}</Text>
        </View>

        <Input
          label="New Email" placeholder="new@email.com" value={newEmail}
          onChangeText={setNewEmail} keyboardType="email-address" autoCapitalize="none"
        />
        <Input
          label="Confirm Password" placeholder="Enter password to confirm" value={password}
          onChangeText={setPassword} secureTextEntry
        />

        <Button title="Update Email" onPress={save} loading={loading} size="lg" style={styles.submitBtn} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  header: { flexDirection: 'row', alignItems: 'center', padding: responsive.padding, gap: 12 },
  back: { padding: 4 },
  backArrow: { fontSize: 24, color: Colors.text },
  title: { fontSize: responsive.fontSize.xxl, fontWeight: '900', color: Colors.text },
  content: { padding: responsive.padding, width: '100%', maxWidth: responsive.maxWidth, alignSelf: 'center' },
  error: { color: Colors.red, fontSize: 13, marginBottom: 12, textAlign: 'center' },
  label: { fontSize: 12, fontWeight: '600', color: Colors.text2, marginBottom: 7 },
  currentEmailBox: { backgroundColor: Colors.bg4, borderWidth: 1, borderColor: Colors.border, borderRadius: 12, height: 52, paddingHorizontal: 14, justifyContent: 'center', marginBottom: 14 },
  currentEmailText: { color: Colors.muted, fontSize: 14 },
  submitBtn: { height: 54, borderRadius: 14, marginTop: 8 },
});
