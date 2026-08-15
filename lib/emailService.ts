import AsyncStorage from '@react-native-async-storage/async-storage';

const VERIFY_CODE_KEY = 'hm_verify_code';
const CODE_TTL_MS = 10 * 60 * 1000;
const SEND_CODE_URL = 'https://homie-chat-api.vercel.app/api/send-code';

interface StoredCode { code: string; expiresAt: number; }

export function generateCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Stores the code locally so verifyCode() can check it without a round trip,
// and returns its expiry so callers can drive the countdown UI without a
// separate getCodeExpiry() read right after writing.
export async function storeCode(code: string): Promise<number> {
  const expiresAt = Date.now() + CODE_TTL_MS;
  const stored: StoredCode = { code, expiresAt };
  await AsyncStorage.setItem(VERIFY_CODE_KEY, JSON.stringify(stored));
  return expiresAt;
}

// Sends the code through homie-chat-api's /api/send-code proxy rather than
// calling Resend directly — Resend blocks browser fetch() via CORS by design,
// and a direct call would ship the API key inside the app bundle. The proxy
// holds RESEND_API_KEY server-side, same pattern as the chat endpoint holding
// GROQ_API_KEY.
export async function sendVerificationEmail(toEmail: string, toName: string, code: string): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await fetch(SEND_CODE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ toEmail, toName, code }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data.success) {
      return { success: false, error: data.error || 'Failed to send email' };
    }
    return { success: true };
  } catch (e: any) {
    return { success: false, error: e.message || 'Network error' };
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
