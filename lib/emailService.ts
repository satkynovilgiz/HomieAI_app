import AsyncStorage from '@react-native-async-storage/async-storage';

const VERIFY_CODE_KEY = 'hm_verify_code';
const CODE_TTL_MS = 10 * 60 * 1000;

function generateCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

interface StoredCode { code: string; expiresAt: number; }

// EmailJS can't be reached from Expo Go (it requires a real browser Origin,
// which a React Native fetch never has) — that only works once the app is
// built with `eas build`. Until then we generate the code locally and hand
// it back so the verify screen can display it on-device.
export async function sendVerificationCode(_userEmail: string, _userName: string): Promise<{ ok: boolean; code?: string; err?: string }> {
  const code = generateCode();
  const stored: StoredCode = { code, expiresAt: Date.now() + CODE_TTL_MS };
  await AsyncStorage.setItem(VERIFY_CODE_KEY, JSON.stringify(stored));
  return { ok: true, code };
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
