import AsyncStorage from '@react-native-async-storage/async-storage';

const EMAILJS_SERVICE_ID = 'service_asarm0b';
const EMAILJS_TEMPLATE_ID = 'template_i5q05bu';
const EMAILJS_PUBLIC_KEY = 'gUKNwGJtBAzzbzG_';
const EMAILJS_ENDPOINT = 'https://api.emailjs.com/api/v1.0/email/send';

const VERIFY_CODE_KEY = 'hm_verify_code';

function generateCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Standalone code-based verification utility, sent through EmailJS's REST API
// directly (no SDK — the official @emailjs/browser package assumes a DOM and
// doesn't work in React Native). This app's actual signup flow verifies
// through Firebase's own email-link flow instead (see lib/authService.ts) —
// this exists for any screen that wants a 6-digit-code flow rather than a
// link, e.g. a future non-Firebase account path.
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
        template_params: {
          to_email: userEmail,
          to_name: userName,
          verification_code: code,
          app_name: 'Homie',
        },
      }),
    });
    if (!res.ok) return { ok: false, err: 'could not send the email — try again' };
    await AsyncStorage.setItem(VERIFY_CODE_KEY, code);
    return { ok: true };
  } catch {
    return { ok: false, err: 'no connection — try again' };
  }
}

export async function verifyCode(input: string): Promise<boolean> {
  const saved = await AsyncStorage.getItem(VERIFY_CODE_KEY);
  return !!saved && saved === input.trim();
}
