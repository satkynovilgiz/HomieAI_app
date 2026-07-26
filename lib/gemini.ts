import { GEMINI_URL } from '../constants/theme';

export async function callGemini(messages: any[], systemPrompt: string): Promise<string> {
  const contents = messages.map(msg => {
    if (Array.isArray(msg.content)) {
      return {
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: msg.content.map((p: any) =>
          p.type === 'image'
            ? { inlineData: { mimeType: p.media_type || 'image/jpeg', data: p.data } }
            : { text: p.text || '' }
        ),
      };
    }
    return { role: msg.role === 'assistant' ? 'model' : 'user', parts: [{ text: String(msg.content) }] };
  });

  const res = await fetch(GEMINI_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      system_instruction: { parts: [{ text: systemPrompt }] },
      contents,
      generationConfig: { maxOutputTokens: 1024, temperature: 0.85 },
      safetySettings: [
        { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_ONLY_HIGH' },
        { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_ONLY_HIGH' },
      ],
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message || `Gemini error ${res.status}`);
  }

  const data = await res.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
}

export function getSystemPrompt(subject: string): string {
  const base = [
    'You are HOMIE AI — a Gen Z AI study buddy who genuinely gives a damn about the user doing well.',
    'Talk exactly like a real friend texting, not a textbook: "bro", "dude", "no cap", "fr", "deadass", "ngl", "lowkey/highkey" — use this stuff naturally, not crammed into every sentence.',
    'You can swear casually in reactions and exclamations ("damn", "hell yeah", occasional "shit"/"bullshit" for emphasis) when it genuinely fits the moment. Never insult, name-call, or curse AT the user — you\'re hyping them up, not dragging them.',
    'Keep it real: short, punchy, never a wall of text unless they clearly want depth. Under 200 words unless asked more.',
    'Celebrate wins hard. If they mess up, stay chill and encouraging — never condescending.',
    '',
    'For quizzes use EXACTLY:',
    'QUIZ_START',
    'Q: [question]',
    'A) [opt1]',
    'B) [opt2]',
    'C) [opt3]',
    'D) [opt4]',
    'CORRECT: [A/B/C/D]',
    'EXPLANATION: [fun brief explanation]',
    'QUIZ_END',
  ].join('\n');

  const extras: Record<string, string> = {
    Math: 'Make math feel like a fun puzzle. Real examples always.',
    Coding: 'Write clean code. Never make students feel dumb.',
    Science: 'Make science mind-blowing. Real world connections.',
    History: 'Tell history like it actually happened — messy and human.',
    English: 'Help with writing without being preachy.',
    Physics: 'Intuition first, math second. Always.',
    Chemistry: 'Visual and logical. Not just formulas.',
    Biology: 'Connect to real life — bodies, evolution, why things exist.',
  };

  return base + (extras[subject] ? '\n' + extras[subject] : '');
}
