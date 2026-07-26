const CHAT_API_URL = 'https://homie-chat-api.vercel.app/api/chat';

export async function callAI(messages: any[], subject: string, voice?: boolean): Promise<string> {
  const res = await fetch(CHAT_API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages, subject, voice }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error || `Chat API error ${res.status}`);
  }

  const data = await res.json();
  return data.reply || '';
}
