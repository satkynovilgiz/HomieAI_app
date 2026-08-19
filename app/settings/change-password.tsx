import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { changePassword } from '../../lib/authService';
import { Colors, Radius } from '../../constants/theme';
import { responsive } from '../../constants/responsive';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { EyeIcon, EyeOffIcon } from '../../components/icons';

function strengthOf(pw: string): { label: string; pct: number; color: string } {
  if (!pw) return { label: '', pct: 0, color: Colors.bg4 };
  const hasNumber = /[0-9]/.test(pw);
  const hasUpper = /[A-Z]/.test(pw);
  if (pw.length >= 10 && hasNumber && hasUpper) return { label: 'strong', pct: 1, color: Colors.green };
  if (pw.length >= 6) return { label: 'medium', pct: 0.6, color: Colors.yellow };
  return { label: 'weak', pct: 0.3, color: Colors.red };
}

export default function ChangePasswordScreen() {
  const user = useSelector((s: RootState) => s.user.current);
  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => { if (!user) router.replace('/auth/login'); }, [user]);
  if (!user) return null;

  const strength = strengthOf(newPw);

  const save = async () => {
    if (!currentPw) { setError('enter your current password'); return; }
    if (newPw.length < 6) { setError('new password needs 6+ characters'); return; }
    if (newPw !== confirmPw) { setError("passwords don't match"); return; }
    if (newPw === currentPw) { setError('new password must be different from current'); return; }
    setLoading(true); setError('');
    try {
      const { err } = await changePassword(currentPw, newPw);
      if (err) { setError(err); return; }
      Alert.alert('Done', 'Password updated successfully');
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
        <TouchableOpacity onPress={() => router.back()} style={styles.back} accessibilityLabel="Go back" accessibilityRole="button">
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Change Password</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        {error ? <Text style={styles.error}>{error}</Text> : null}

        <Input
          label="Current Password" placeholder="••••••••" value={currentPw}
          onChangeText={setCurrentPw} secureTextEntry={!showCurrent}
          autoComplete="current-password" textContentType="password" spellCheck={false}
          rightIcon={
            <TouchableOpacity onPress={() => setShowCurrent(v => !v)} hitSlop={10} accessibilityLabel={showCurrent ? 'Hide password' : 'Show password'} accessibilityRole="button">
              {showCurrent ? <EyeOffIcon size={18} /> : <EyeIcon size={18} />}
            </TouchableOpacity>
          }
        />

        <Input
          label="New Password" placeholder="••••••••" value={newPw}
          onChangeText={setNewPw} secureTextEntry={!showNew}
          autoComplete="new-password" textContentType="newPassword" spellCheck={false}
          rightIcon={
            <TouchableOpacity onPress={() => setShowNew(v => !v)} hitSlop={10} accessibilityLabel={showNew ? 'Hide password' : 'Show password'} accessibilityRole="button">
              {showNew ? <EyeOffIcon size={18} /> : <EyeIcon size={18} />}
            </TouchableOpacity>
          }
        />
        {newPw.length > 0 && (
          <View style={styles.strengthWrap}>
            <View style={styles.strengthTrack}>
              <View style={[styles.strengthFill, { width: `${strength.pct * 100}%`, backgroundColor: strength.color }]} />
            </View>
            <Text style={[styles.strengthLabel, { color: strength.color }]}>{strength.label}</Text>
          </View>
        )}

        <Input
          label="Confirm New Password" placeholder="••••••••" value={confirmPw}
          onChangeText={setConfirmPw} secureTextEntry={!showConfirm}
          autoComplete="new-password" textContentType="newPassword" spellCheck={false}
          rightIcon={
            <TouchableOpacity onPress={() => setShowConfirm(v => !v)} hitSlop={10} accessibilityLabel={showConfirm ? 'Hide password' : 'Show password'} accessibilityRole="button">
              {showConfirm ? <EyeOffIcon size={18} /> : <EyeIcon size={18} />}
            </TouchableOpacity>
          }
        />

        <Button title="Update Password" onPress={save} loading={loading} size="lg" style={styles.submitBtn} />
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
  strengthWrap: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: -8, marginBottom: 14 },
  strengthTrack: { flex: 1, height: 4, borderRadius: 2, backgroundColor: Colors.bg4, overflow: 'hidden' },
  strengthFill: { height: '100%', borderRadius: 2 },
  strengthLabel: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
  submitBtn: { height: 54, borderRadius: 14, marginTop: 8 },
});
