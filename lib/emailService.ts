import AsyncStorage from '@react-native-async-storage/async-storage';

const EMAILJS_SERVICE_ID = 'service_asarm0b';
const EMAILJS_TEMPLATE_ID = 'template_i5q05bu';
const EMAILJS_PUBLIC_KEY = 'gUKNwGJtBAzzbzG_O';
// EmailJS's Strict Origin Check rejects requests with no matching browser Origin
// header, which a React Native fetch call never has — the private key as
// accessToken is EmailJS's documented way to authenticate non-browser clients.
const EMAILJS_PRIVATE_KEY = '7dZSgKOzQIbNBrUXG1hZD';
const EMAILJS_ENDPOINT = 'https://api.emailjs.com/api/v1.0/email/send';

const VERIFY_CODE_KEY = 'hm_verify_code';
const CODE_TTL_MS = 10 * 60 * 1000;

function generateCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

interface StoredCode { code: string; expiresAt: number; }

// Standalone code-based verification utility, sent through EmailJS's REST API
// directly (no SDK — the official @emailjs/browser package assumes a DOM and
// doesn't work in React Native). This IS the live verification step in the
// signup flow — app/auth/verify.tsx calls this on mount.
export async function sendVerificationCode(userEmail: string, userName: string): Promise<{ ok: boolean; err?: string }> {
  const code = generateCode();
  try {
    const res = await fetch(EMAILJS_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        service_id: EMAILJS_SERVICE_ID,
        template_id: EMAILJS_TEMPLATE_ID,
        user_id: EMAILJS_PUBLIC_KEY,
        accessToken: EMAILJS_PRIVATE_KEY,
        template_params: {
          to_email: userEmail,
          to_name: userName,
          verification_code: code,
          app_name: 'Homie',
          expiry: '10 minutes',
        },
      }),
    });
    if (!res.ok) {
      const detail = await res.text().catch(() => '');
      return { ok: false, err: detail || 'could not send the email — try again' };
    }
    const stored: StoredCode = { code, expiresAt: Date.now() + CODE_TTL_MS };
    await AsyncStorage.setItem(VERIFY_CODE_KEY, JSON.stringify(stored));
    return { ok: true };
  } catch {
    return { ok: false, err: 'no connection — try again' };
  }
}

// Returns the code's expiry timestamp (ms epoch), or null if none is pending.
export async function getCodeExpiry(): Promise<number | null> {
  const saved = await AsyncStorage.getItem(VERIFY_CODE_KEY);
  if (!saved) return null;
  try {
    const parsed: StoredCode = JSON.parse(saved);
    return parsed.expiresAt;
  } catch {
    return null;
  }
}

export async function verifyCode(input: string): Promise<boolean> {
  const saved = await AsyncStorage.getItem(VERIFY_CODE_KEY);
  if (!saved) return false;
  try {
    const parsed: StoredCode = JSON.parse(saved);
    if (Date.now() > parsed.expiresAt) return false;
    return parsed.code === input.trim();
  } catch {
    return false;
  }
}

export async function clearVerificationCode(): Promise<void> {
  await AsyncStorage.removeItem(VERIFY_CODE_KEY);
}
