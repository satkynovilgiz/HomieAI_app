const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODEL = 'llama-3.3-70b-versatile';

const QUIZ_FORMAT = [
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

const SUBJECT_EXTRAS: Record<string, string> = {
  Math: 'Make math feel like a fun puzzle. Real examples always.',
  Coding: 'Write clean code. Never make students feel dumb.',
  Science: 'Make science mind-blowing. Real world connections.',
  History: "Tell history like it actually happened — messy and human.",
  English: 'Help with writing without being preachy.',
  Physics: 'Intuition first, math second. Always.',
  Chemistry: 'Visual and logical. Not just formulas.',
  Biology: 'Connect to real life — bodies, evolution, why things exist.',
};

const PERSONA = [
  "You are HOMIE — a Gen Z AI study buddy who genuinely gives a damn about the user doing well.",
  'Talk exactly like a real friend texting, not a textbook: "bro", "dude", "no cap", "fr", "deadass", "ngl", "lowkey/highkey" — use this stuff naturally, not crammed into every sentence.',
  "You can swear casually in reactions and exclamations (\"damn\", \"hell yeah\", occasional \"shit\"/\"bullshit\" for emphasis) when it genuinely fits the moment. Never insult, name-call, or curse AT the user — you're hyping them up, not dragging them.",
  'Celebrate wins hard. If they mess up, stay chill and encouraging — never condescending.',
].join('\n');

// Keyed to the same 'en'/'es'/'ru' codes the app's language switcher uses
// (constants/translations.ts) — each one keeps Homie's Gen Z voice, just in
// that language's own slang instead of translating the English slang literally.
const LANGUAGE_INSTRUCTIONS: Record<string, string> = {
  en: 'Respond in English. Use natural Gen Z slang like "bro", "fr", "no cap", "ngl", "lowkey".',
  es: 'Responde siempre en español (nunca en inglés). Habla como un amigo real y casual, nunca formal ni como libro de texto — usa expresiones como "bro", "en serio", "sin mentiras", "literalmente" de forma natural.',
  ru: 'Отвечай всегда на русском языке (никогда не на английском). Общайся неформально, как настоящий друг, никогда формально и не как учебник — используй такие слова как "брат", "серьёзно", "без шуток", "реально" естественно.',
};

function systemPrompt(subject: string, voice?: boolean, language?: string): string {
  const langInstruction = LANGUAGE_INSTRUCTIONS[language || 'en'] || LANGUAGE_INSTRUCTIONS.en;
  const extra = SUBJECT_EXTRAS[subject];
  const subjectLine = extra ? `\n${extra}` : '';

  if (voice) {
    return [
      langInstruction,
      '',
      PERSONA + subjectLine,
      '',
      "You're talking out loud to the student over voice right now, not texting. Reply short and conversational, under 60 words — this gets spoken aloud, not read.",
      'No markdown, no asterisks, no bullet points, no code blocks, no quiz formatting — just plain spoken sentences, like you\'re actually talking to them.',
    ].join('\n');
  }

  return [
    langInstruction,
    '',
    PERSONA + subjectLine,
    'Keep it real: short, punchy, never a wall of text unless they clearly want depth. Under 200 words unless asked for more.',
    '',
    QUIZ_FORMAT,
    language && language !== 'en'
      ? 'Keep the labels QUIZ_START, Q:, A), B), C), D), CORRECT:, EXPLANATION:, QUIZ_END exactly as shown (in English) — but write the actual question, options, and explanation text in the language instructed above.'
      : '',
  ].join('\n');
}

type ContentPart =
  | { type: 'text'; text: string }
  | { type: 'image'; media_type?: string; data: string };

interface IncomingMessage {
  role: 'user' | 'assistant';
  content: string | ContentPart[];
}

// Groq's free-tier text models don't support image input — pull out just the
// text portion when a message includes a photo, rather than failing outright.
function toGroqText(content: string | ContentPart[]): string {
  if (typeof content === 'string') return content;
  const textPart = content.find((p): p is { type: 'text'; text: string } => p.type === 'text');
  return textPart?.text || '';
}

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const { messages, subject, voice, language } = (req.body || {}) as {
      messages?: IncomingMessage[];
      subject?: string;
      voice?: boolean;
      language?: string;
    };

    if (!Array.isArray(messages) || messages.length === 0) {
      res.status(400).json({ error: 'messages array is required' });
      return;
    }

    const groqMessages = [
      { role: 'system', content: systemPrompt(subject || 'General', voice, language) },
      ...messages.map((m) => ({
        role: m.role === 'assistant' ? 'assistant' : 'user',
        content: toGroqText(m.content),
      })),
    ];

    const groqRes = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        messages: groqMessages,
        max_tokens: voice ? 200 : 1024,
        temperature: 0.9,
      }),
    });

    if (!groqRes.ok) {
      const errBody = await groqRes.json().catch(() => ({}));
      res.status(500).json({ error: errBody?.error?.message || `Groq error ${groqRes.status}` });
      return;
    }

    const data = await groqRes.json();
    const text = (data?.choices?.[0]?.message?.content || '').trim();

    res.status(200).json({ reply: text });
  } catch (err: any) {
    console.error('chat api error', err);
    res.status(500).json({ error: err?.message || 'internal error' });
  }
}
