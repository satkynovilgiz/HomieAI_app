import { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Animated, ActivityIndicator, NativeSyntheticEvent, TextInputKeyPressEventData } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import Svg, { Path } from 'react-native-svg';
import { generateCode, storeCode, sendVerificationEmail, verifyCode, clearVerificationCode } from '../../lib/emailService';
import { Colors, Radius } from '../../constants/theme';
import HomieBot from '../../components/mascot/HomieBot';

const CODE_LENGTH = 6;
const CODE_TTL_MS = 10 * 60 * 1000;
const COOLDOWN_S = 60;

function BackArrowIcon() {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
      <Path d="M19 12H5" stroke={Colors.white} strokeWidth="2" strokeLinecap="round"/>
      <Path d="M11 6L5 12L11 18" stroke={Colors.white} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
    </Svg>
  );
}

function formatMMSS(ms: number): string {
  const totalSec = Math.max(0, Math.ceil(ms / 1000));
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export default function VerifyScreen() {
  const { email, name } = useLocalSearchParams<{ email?: string; name?: string }>();
  const [mood, setMood] = useState<'thinking' | 'sad' | 'celebrating'>('thinking');
  const [code, setCode] = useState<string[]>(Array(CODE_LENGTH).fill(''));
  const [status, setStatus] = useState<'idle' | 'wrong' | 'success'>('idle');
  const [verifying, setVerifying] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState('');
  const [cooldown, setCooldown] = useState(0);
  const [expiresAt, setExpiresAt] = useState<number | null>(null);
  const [now, setNow] = useState(Date.now());
  const [sending, setSending] = useState(true);
  const [sendError, setSendError] = useState('');
  const [fallbackCode, setFallbackCode] = useState('');

  const inputRefs = useRef<(TextInput | null)[]>([]);
  const shakeAnim = useRef(new Animated.Value(0)).current;

  const sendCode = async () => {
    if (!email) {
      setSending(false);
      setSendError('No email found. Go back.');
      return;
    }
    setSending(true);
    setSendError('');
    setFallbackCode('');
    const code = generateCode();
    const exp = await storeCode(code);
    setExpiresAt(exp);
    const result = await sendVerificationEmail(email, name || 'there', code);
    setSending(false);
    if (!result.success) {
      setFallbackCode(code);
      setSendError(result.error ? `Could not send email: ${result.error}` : 'Could not send email. Use the code below:');
    }
    setCooldown(COOLDOWN_S);
  };

  useEffect(() => { sendCode(); }, []);

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown(c => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  const remainingMs = expiresAt ? expiresAt - now : CODE_TTL_MS;
  const expired = expiresAt !== null && remainingMs <= 0;
  const progress = Math.max(0, Math.min(1, remainingMs / CODE_TTL_MS));

  const runShake = () => {
    shakeAnim.setValue(0);
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 1, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -1, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 1, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
    ]).start();
  };

  const handleInput = (text: string, index: number) => {
    const digit = text.slice(-1).replace(/[^0-9]/g, '');
    const next = [...code];
    next[index] = digit;
    setCode(next);
    setStatus('idle');
    setError('');
    if (digit && index < CODE_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
    if (digit && index === CODE_LENGTH - 1 && next.every(d => d)) {
      verify(next.join(''));
    }
  };

  const handleKeyPress = (e: NativeSyntheticEvent<TextInputKeyPressEventData>, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const verify = async (entered: string) => {
    if (verifying || expired) return;
    setVerifying(true);
    try {
      const ok = await verifyCode(entered);
      if (ok) {
        setMood('celebrating');
        setStatus('success');
        await clearVerificationCode();
        setTimeout(() => router.replace('/auth/welcome'), 900);
      } else {
        setMood('sad');
        setStatus('wrong');
        setError(expired ? 'Code expired.' : 'Wrong code. Try again.');
        runShake();
        setCode(Array(CODE_LENGTH).fill(''));
        inputRefs.current[0]?.focus();
      }
    } finally {
      setVerifying(false);
    }
  };

  const resend = async () => {
    if (resending) return;
    setResending(true);
    try {
      setMood('thinking');
      setStatus('idle');
      setError('');
      setCode(Array(CODE_LENGTH).fill(''));
      await sendCode();
      inputRefs.current[0]?.focus();
    } finally {
      setResending(false);
    }
  };

  const canVerify = code.every(d => d) && !verifying && !expired;

  return (
    <SafeAreaView style={styles.safe}>
      <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
        <BackArrowIcon />
      </TouchableOpacity>

      <View style={styles.content}>
        <HomieBot mood={mood} size={90} />
        <Text style={styles.title}>Check your Gmail</Text>
        <Text style={styles.desc}>We sent a 6-digit code to</Text>

        <View style={styles.emailCard}>
          <Text style={styles.emailText}>{email || 'your email'}</Text>
        </View>

        {sending ? (
          <View style={styles.sendingWrap}>
            <ActivityIndicator color={Colors.purpleL} />
            <Text style={styles.sendingText}>Sending code to your email...</Text>
          </View>
        ) : sendError ? (
          <View style={styles.fallbackCard}>
            <Text style={styles.fallbackError}>{sendError}</Text>
            {fallbackCode ? (
              <>
                <Text style={styles.fallbackCode}>{fallbackCode}</Text>
                <TouchableOpacity
                  style={styles.autoFillBtn}
                  onPress={() => {
                    const digits = fallbackCode.split('');
                    setCode(Array.from({ length: CODE_LENGTH }, (_, i) => digits[i] || ''));
                  }}
                >
                  <Text style={styles.autoFillText}>Auto-fill code</Text>
                </TouchableOpacity>
              </>
            ) : null}
          </View>
        ) : (
          <View style={styles.sentCard}>
            <Text style={styles.sentText}>Code sent to your email!</Text>
            <Text style={styles.sentSub}>Check your inbox and spam folder</Text>
          </View>
        )}

        <Text style={styles.enterLabel}>Enter the code below:</Text>

        <Animated.View style={[styles.codeRow, { transform: [{ translateX: shakeAnim.interpolate({ inputRange: [-1, 1], outputRange: [-8, 8] }) }] }]}>
          {code.map((digit, i) => (
            <TextInput
              key={i}
              ref={r => { inputRefs.current[i] = r; }}
              value={digit}
              onChangeText={t => handleInput(t, i)}
              onKeyPress={e => handleKeyPress(e, i)}
              keyboardType="number-pad"
              maxLength={1}
              style={[
                styles.codeBox,
                digit && styles.codeBoxFilled,
                status === 'wrong' && styles.codeBoxWrong,
                status === 'success' && styles.codeBoxSuccess,
              ]}
            />
          ))}
        </Animated.View>

        {expired ? (
          <Text style={styles.expiredText}>Code expired</Text>
        ) : (
          <View style={styles.progressRow}>
            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
            </View>
            <Text style={styles.expiryText}>Expires in {formatMMSS(remainingMs)}</Text>
          </View>
        )}

        {error ? <Text style={styles.error}>{error}</Text> : null}

        {expired ? (
          <TouchableOpacity style={styles.primaryBtn} onPress={resend} disabled={resending} activeOpacity={0.85}>
            <Text style={styles.primaryBtnText}>{resending ? 'Sending...' : 'Get new code'}</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.primaryBtn, !canVerify && styles.primaryBtnDisabled]}
            onPress={() => verify(code.join(''))}
            disabled={!canVerify}
            activeOpacity={0.85}
          >
            <Text style={styles.primaryBtnText}>{verifying ? 'Verifying...' : 'Verify Code'}</Text>
          </TouchableOpacity>
        )}

        <Text style={styles.resendPrompt}>Did not get the code?</Text>
        <TouchableOpacity onPress={resend} disabled={cooldown > 0 || resending || expired}>
          <Text style={[styles.resendText, (cooldown > 0 || expired) && styles.resendTextDisabled]}>
            {cooldown > 0 ? `Resend in ${cooldown}s` : resending ? 'Sending...' : 'Resend code'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.backLink} onPress={() => router.back()}>
          <Text style={styles.backLinkText}>Wrong email? Go back</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  backBtn: { position: 'absolute', top: 16, left: 16, zIndex: 1, padding: 4 },
  content: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 28 },
  title: { fontSize: 28, fontWeight: '900', color: Colors.white, marginTop: 16, textAlign: 'center' },
  desc: { fontSize: 14, color: '#9090c0', textAlign: 'center', marginTop: 6 },
  emailCard: { backgroundColor: '#12102a', borderWidth: 1, borderColor: 'rgba(167,139,250,0.2)', borderRadius: 12, paddingVertical: 12, paddingHorizontal: 20, marginVertical: 16, alignSelf: 'stretch' },
  emailText: { color: '#a78bfa', fontSize: 14, fontWeight: '700', textAlign: 'center' },
  sendingWrap: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 16 },
  sendingText: { fontSize: 13, color: Colors.muted },
  sentCard: { width: '100%', backgroundColor: 'rgba(16,185,129,0.08)', borderWidth: 1, borderColor: 'rgba(16,185,129,0.25)', borderRadius: 12, padding: 14, alignItems: 'center', marginBottom: 16 },
  sentText: { fontSize: 14, fontWeight: '700', color: Colors.green },
  sentSub: { fontSize: 12, color: Colors.muted, marginTop: 4 },
  fallbackCard: { width: '100%', backgroundColor: 'rgba(124,58,237,0.08)', borderWidth: 1, borderColor: 'rgba(124,58,237,0.25)', borderRadius: 12, padding: 16, alignItems: 'center', marginBottom: 16 },
  fallbackError: { fontSize: 13, color: Colors.muted, textAlign: 'center', marginBottom: 12 },
  fallbackCode: { fontSize: 42, fontWeight: '900', color: Colors.purpleL, letterSpacing: 8, marginBottom: 12 },
  autoFillBtn: { backgroundColor: Colors.purple, paddingHorizontal: 24, paddingVertical: 10, borderRadius: 20 },
  autoFillText: { color: Colors.white, fontSize: 13, fontWeight: '700' },
  enterLabel: { fontSize: 13, color: '#9090c0', marginBottom: 16, alignSelf: 'flex-start' },
  codeRow: { flexDirection: 'row', gap: 8, justifyContent: 'center' },
  codeBox: { width: 48, height: 58, backgroundColor: '#12102a', borderWidth: 1.5, borderColor: '#2a2060', borderRadius: 12, fontSize: 24, fontWeight: '700', color: Colors.white, textAlign: 'center' },
  codeBoxFilled: { borderColor: '#a78bfa' },
  codeBoxWrong: { borderColor: Colors.red },
  codeBoxSuccess: { borderColor: Colors.green, backgroundColor: 'rgba(16,185,129,0.08)' },
  progressRow: { alignSelf: 'stretch', marginTop: 16, alignItems: 'center', gap: 6 },
  progressTrack: { alignSelf: 'stretch', height: 4, borderRadius: 2, backgroundColor: 'rgba(167,139,250,0.15)', overflow: 'hidden' },
  progressFill: { height: 4, backgroundColor: '#7c3aed', borderRadius: 2 },
  expiryText: { fontSize: 12, color: '#9090c0' },
  expiredText: { fontSize: 13, color: Colors.red, fontWeight: '700', marginTop: 16 },
  error: { color: Colors.red, fontSize: 13, textAlign: 'center', marginTop: 14 },
  primaryBtn: { width: '100%', height: 54, borderRadius: 14, backgroundColor: '#7c3aed', alignItems: 'center', justifyContent: 'center', marginTop: 20 },
  primaryBtnDisabled: { backgroundColor: '#1a1a2e' },
  primaryBtnText: { color: Colors.white, fontWeight: '700', fontSize: 16 },
  resendPrompt: { fontSize: 13, color: '#9090c0', marginTop: 22, textAlign: 'center' },
  resendText: { fontSize: 13, color: '#a78bfa', fontWeight: '600', marginTop: 6 },
  resendTextDisabled: { color: '#9090c0' },
  backLink: { marginTop: 20 },
  backLinkText: { fontSize: 13, color: '#9090c0' },
});
