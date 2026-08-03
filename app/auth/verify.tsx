import { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { checkEmailVerified, resendVerificationEmail } from '../../lib/authService';
import { useTranslation } from '../../hooks/useTranslation';
import { Colors, Radius } from '../../constants/theme';
import HomieBot from '../../components/mascot/HomieBot';

const POLL_MS = 5000;
const MAX_POLLS = 120; // 120 * 5s = 10 minutes
const COOLDOWN_S = 60;

export default function VerifyScreen() {
  const { t } = useTranslation();
  const { email } = useLocalSearchParams<{ email?: string; name?: string }>();
  const [mood, setMood] = useState<'thinking' | 'sad'>('thinking');
  const [checking, setChecking] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState('');
  const [toast, setToast] = useState('');
  const [cooldown, setCooldown] = useState(0);
  const pollCountRef = useRef(0);

  useEffect(() => {
    const interval = setInterval(async () => {
      pollCountRef.current += 1;
      if (pollCountRef.current > MAX_POLLS) { clearInterval(interval); return; }
      const verified = await checkEmailVerified();
      if (verified) { clearInterval(interval); router.replace('/auth/welcome'); }
    }, POLL_MS);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown(c => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(''), 2500);
    return () => clearTimeout(timer);
  }, [toast]);

  const checkVerification = async () => {
    setChecking(true); setError('');
    try {
      const verified = await checkEmailVerified();
      if (verified) {
        router.replace('/auth/welcome');
      } else {
        setError(t('verify_not_verified'));
        setMood('sad');
      }
    } catch {
      setError('something broke — try again');
      setMood('sad');
    } finally {
      setChecking(false);
    }
  };

  const resendEmail = async () => {
    if (cooldown > 0 || resending) return;
    setResending(true);
    try {
      const { err } = await resendVerificationEmail();
      if (err) { setToast(err); } else { setToast(t('verify_email_sent')); setCooldown(COOLDOWN_S); }
    } finally {
      setResending(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <Text style={styles.autoCheck}>{t('verify_autochecking')}</Text>

      <View style={styles.content}>
        <HomieBot mood={mood} size={100} />
        <Text style={styles.title}>{t('verify_title')}</Text>
        <Text style={styles.desc}>{t('verify_sent_to')}</Text>

        <View style={styles.emailCard}>
          <Text style={styles.emailText}>{email || 'your email'}</Text>
        </View>

        <Text style={styles.desc}>{t('verify_sub')}</Text>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <TouchableOpacity style={styles.primaryBtn} onPress={checkVerification} disabled={checking} activeOpacity={0.85}>
          <Text style={styles.primaryBtnText}>{checking ? t('verify_checking') : t('verify_btn')}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.secondaryBtn} onPress={resendEmail} disabled={cooldown > 0 || resending} activeOpacity={0.85}>
          <Text style={styles.secondaryBtnText}>
            {cooldown > 0 ? `${t('verify_resend_in')} ${cooldown}s...` : resending ? t('verify_sending') : t('verify_resend')}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.backLink} onPress={() => router.back()}>
          <Text style={styles.backLinkText}>{t('verify_wrong')}</Text>
        </TouchableOpacity>
      </View>

      {toast ? (
        <View style={styles.toast}>
          <Text style={styles.toastText}>{toast}</Text>
        </View>
      ) : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  autoCheck: { position: 'absolute', top: 16, right: 20, fontSize: 11, color: Colors.muted },
  content: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 28 },
  title: { fontSize: 28, fontWeight: '900', color: Colors.white, marginTop: 20, textAlign: 'center' },
  desc: { fontSize: 14, color: '#9090c0', textAlign: 'center', lineHeight: 22, marginTop: 12 },
  emailCard: { backgroundColor: '#12102a', borderWidth: 1, borderColor: 'rgba(167,139,250,0.2)', borderRadius: 12, paddingVertical: 14, paddingHorizontal: 20, marginVertical: 16, alignSelf: 'stretch' },
  emailText: { color: '#a78bfa', fontSize: 15, fontWeight: '700', textAlign: 'center' },
  error: { color: Colors.red, fontSize: 13, textAlign: 'center', marginTop: 14 },
  primaryBtn: { width: '100%', height: 54, borderRadius: 14, backgroundColor: '#7c3aed', alignItems: 'center', justifyContent: 'center', marginTop: 24 },
  primaryBtnText: { color: Colors.white, fontWeight: '700', fontSize: 16 },
  secondaryBtn: { width: '100%', height: 48, borderRadius: 14, backgroundColor: 'transparent', borderWidth: 1, borderColor: 'rgba(167,139,250,0.2)', alignItems: 'center', justifyContent: 'center', marginTop: 12 },
  secondaryBtnText: { color: '#a78bfa', fontSize: 14, fontWeight: '600' },
  backLink: { marginTop: 20 },
  backLinkText: { fontSize: 13, color: '#9090c0' },
  toast: { position: 'absolute', bottom: 40, alignSelf: 'center', backgroundColor: Colors.bg3, borderWidth: 1, borderColor: Colors.border, borderRadius: Radius.md, paddingHorizontal: 18, paddingVertical: 10 },
  toastText: { color: Colors.text, fontSize: 13, fontWeight: '600' },
});
