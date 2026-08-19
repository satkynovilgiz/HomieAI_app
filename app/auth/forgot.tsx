import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { router } from 'expo-router';
import Svg, { Path } from 'react-native-svg';
import { sendPasswordReset } from '../../lib/authService';
import { Colors, Radius } from '../../constants/theme';
import { responsive } from '../../constants/responsive';
import HomieBot from '../../components/mascot/HomieBot';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const COOLDOWN_S = 60;

function BackArrowIcon() {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
      <Path d="M19 12H5" stroke={Colors.white} strokeWidth="2" strokeLinecap="round"/>
      <Path d="M11 6L5 12L11 18" stroke={Colors.white} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
    </Svg>
  );
}

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  const send = async () => {
    if (!EMAIL_RE.test(email)) { setError('that email looks off'); return; }
    setLoading(true); setError('');
    try {
      const { err } = await sendPasswordReset(email.toLowerCase().trim());
      if (err) { setError(err); return; }
      setSent(true);
      setCooldown(COOLDOWN_S);
      const timer = setInterval(() => {
        setCooldown(c => {
          if (c <= 1) { clearInterval(timer); return 0; }
          return c - 1;
        });
      }, 1000);
    } catch {
      setError('something broke — try again');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} accessibilityLabel="Go back" accessibilityRole="button">
          <BackArrowIcon />
        </TouchableOpacity>

        <View style={styles.header}>
          <HomieBot mood="thinking" size={responsive.mascotSize.sm} />
          <Text style={styles.title}>Forgot your password?</Text>
          <Text style={styles.sub}>no worries bro we got you</Text>
        </View>

        <View style={styles.card}>
          {sent ? (
            <>
              <Text style={styles.sentTitle}>Check your email</Text>
              <Text style={styles.sentText}>
                We sent a password reset link to {email.toLowerCase().trim()}. Open it on this device to set a new password.
              </Text>
              {error ? <Text style={styles.error}>{error}</Text> : null}
              <Button
                title={cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend link'}
                onPress={send}
                loading={loading}
                disabled={cooldown > 0}
                variant="secondary"
                size="lg"
                style={styles.submitBtn}
              />
              <TouchableOpacity style={styles.backLink} onPress={() => router.replace('/auth/login')}>
                <Text style={styles.backLinkText}>Back to sign in</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <Text style={styles.desc}>Enter your email and we will send you a reset link</Text>
              {error ? <Text style={styles.error}>{error}</Text> : null}
              <Input
                label="Email" placeholder="your@email.com" value={email}
                onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none"
                autoComplete="email" textContentType="emailAddress" spellCheck={false}
              />
              <Button title="Send Reset Code" onPress={send} loading={loading} size="lg" style={styles.submitBtn} />
              <TouchableOpacity style={styles.backLink} onPress={() => router.back()}>
                <Text style={styles.backLinkText}>
                  Remember it? <Text style={{ color: Colors.purpleL, fontWeight: '700' }}>Sign in</Text>
                </Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  content: { padding: responsive.padding, paddingTop: 60, alignItems: 'center' },
  backBtn: { position: 'absolute', top: 16, left: 16, zIndex: 1, padding: 4 },
  header: { alignItems: 'center', marginBottom: 28 },
  title: { fontSize: responsive.fontSize.title, fontWeight: '900', color: Colors.text, marginTop: 16, textAlign: 'center' },
  sub: { fontSize: responsive.fontSize.md, color: Colors.muted, marginTop: 6 },
  card: { width: '100%', maxWidth: responsive.maxWidth, backgroundColor: Colors.bg2, borderRadius: Radius.xl, padding: 24, borderWidth: 1, borderColor: Colors.border },
  desc: { fontSize: 13, color: Colors.muted, textAlign: 'center', marginBottom: 18, lineHeight: 19 },
  error: { color: Colors.red, fontSize: 13, marginBottom: 12, textAlign: 'center' },
  submitBtn: { height: 52, borderRadius: 14, marginTop: 8 },
  backLink: { alignItems: 'center', marginTop: 16 },
  backLinkText: { fontSize: 14, color: Colors.muted },
  sentTitle: { fontSize: 18, fontWeight: '800', color: Colors.green, textAlign: 'center', marginBottom: 8 },
  sentText: { fontSize: 13, color: Colors.muted, textAlign: 'center', lineHeight: 19, marginBottom: 16 },
});
