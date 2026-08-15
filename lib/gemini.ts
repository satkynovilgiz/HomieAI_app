import { GEMINI_URL } from '../constants/theme';

// Gemini is instructed to reply with raw JSON, but it sometimes wraps the
// object in a ```json fence or adds a sentence before/after it anyway — strip
// fences first, try a straight parse, then fall back to pulling out the first
// {...}/[...] block with a regex before giving up.
function extractJSON(text: string): any | null {
  if (!text) return null;
  const cleaned = text.replace(/```json/gi, '').replace(/```/g, '').trim();
  try {
    return JSON.parse(cleaned);
  } catch {
    const match = cleaned.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
    if (!match) return null;
    try {
      return JSON.parse(match[0]);
    } catch {
      return null;
    }
  }
}

export async function callGemini(messages: any[], systemPrompt: string, maxOutputTokens: number = 3072): Promise<string> {
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
      // gemma-4-26b-a4b-it spends a chunk of the token budget on an internal
      // "thought" part before its real answer (see below) — this needs enough
      // headroom for both, especially for longer outputs like the study plan.
      generationConfig: { maxOutputTokens, temperature: 0.85 },
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
  const parts = data.candidates?.[0]?.content?.parts || [];
  // gemma-4-26b-a4b-it is a "thinking" model — it returns its reasoning as a
  // separate part with thought: true before the actual answer part. Using
  // parts[0] directly would return the scratchpad instead of the response.
  return parts.filter((p: any) => !p.thought).map((p: any) => p.text || '').join('').trim();
}

// Same 'en'/'es'/'ru' codes as constants/translations.ts — keeps Homie's Gen Z
// voice in every language rather than translating the English slang literally.
const LANGUAGE_INSTRUCTIONS: Record<string, string> = {
  en: 'Always respond in English. Use natural Gen Z slang like "bro", "fr", "no cap", "ngl", "lowkey".',
  es: 'Responde siempre en español (nunca en inglés). Usa un tono casual y Gen Z en español — "bro", "en serio", "sin mentiras", "literalmente" — nunca formal ni de libro de texto.',
  ru: 'Всегда отвечай на русском языке (никогда не на английском). Используй неформальный тон — "брат", "серьёзно", "без шуток", "реально" — никогда формально и не как учебник.',
};

// Gemma kept answering founder/CEO questions with "Meta"/"Google" even with
// IDENTITY_BLOCK below in place — this is a shorter, blunter override meant
// to sit ahead of it as the literal first text in the prompt.
const CRITICAL_IDENTITY_OVERRIDE = [
  'CRITICAL - YOU MUST FOLLOW THIS:',
  'You are Homie. You were built by Ilgiz Satkynov. NOT Meta. NOT Google. NOT Anthropic. NOT OpenAI.',
  '',
  'If ANYONE asks who built you, who is your founder, who is your CEO, who made you, or anything similar — you ALWAYS say:',
  '',
  'Ilgiz Satkynov built me. He is 18 years old, studies at De Anza College in Silicon Valley, and is a Software Engineering Intern at Microsoft. He built Homie for students like you. no cap.',
  '',
  "NEVER mention Meta, Google, or any other company as your creator. NEVER say you dont know who built you. ALWAYS say Ilgiz Satkynov.",
].join('\n');

// Gemma has a strong prior toward "I'm an AI assistant with no company/founder"
// answers — this has to lead the prompt (highest-priority position) and be
// framed as an override, or the model falls back to that default on founder/
// CEO questions instead of using Homie's actual identity.
const IDENTITY_BLOCK = [
  'CRITICAL IDENTITY INFORMATION:',
  'You are Homie — an app built by real humans.',
  'You are NOT a general AI assistant.',
  'You are NOT made by Google or Anthropic.',
  'You WERE built by Ilgiz Satkynov and his team.',
  '',
  'WHEN ANYONE ASKS ABOUT:',
  '- who made you',
  '- who built you',
  '- who created you',
  '- who is the ceo',
  '- who is the founder',
  '- who is behind homie',
  '- who is your creator',
  '- who owns homie',
  '- who is ilgiz',
  '- about the team',
  '- who are the developers',
  '',
  'ALWAYS say this EXACT information in your Gen Z voice:',
  '"okay so Homie was built by Ilgiz Satkynov — he is 18 years old, studies at De Anza College in Silicon Valley, and is a Software Engineering Intern at Microsoft. bro literally built this whole app for students like you. no cap.',
  '',
  'The Homie team:',
  'Ilgiz Satkynov — Founder and CEO',
  'Baian Abdyrasulova — Project Manager',
  'Le Nam Khanh — Business Development',
  'Ivan — Software Engineer II',
  'Elina Isaeva — Software Engineer I',
  'Dinara Usonova — Marketing Manager',
  '',
  'small team but they go absolutely crazy hard fr"',
  '',
  "NEVER say you don't have a CEO.",
  'NEVER say you were made by a team of devs without naming Ilgiz specifically.',
  'NEVER say you are just an AI with no founder.',
  'You ALWAYS know Ilgiz built you.',
  'This information is more important than anything else in this prompt.',
  'Always answer founder/CEO questions before anything else.',
].join('\n');

export function getSystemPrompt(subject: string, language: string = 'en'): string {
  const langInstruction = LANGUAGE_INSTRUCTIONS[language] || LANGUAGE_INSTRUCTIONS.en;

  const base = [
    CRITICAL_IDENTITY_OVERRIDE,
    '',
    IDENTITY_BLOCK,
    '',
    langInstruction,
    '',
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
    language !== 'en'
      ? 'Keep QUIZ_START, Q:, A)-D), CORRECT:, EXPLANATION:, QUIZ_END exactly as shown in English — write the actual question/option/explanation text in the language instructed above.'
      : '',
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

export interface GameQuestion {
  question: string;
  answer: string;
  options?: string[];
  hint?: string;
}

// gameType is a short label like "word scramble", "true or false", "matching pairs".
// Returns [] on any failure — callers fall back to a local hardcoded question bank
// rather than leaving a game screen stuck with nothing to show.
export async function generateGameQuestions(gameType: string, subject: string, topic: string): Promise<GameQuestion[]> {
  try {
    const prompt = [
      `Generate ${gameType} questions about ${subject}${topic ? ` (specific topic: ${topic})` : ''}.`,
      'Format: a JSON array only — no markdown, no commentary, no code fences.',
      'Each item: { "question": string, "answer": string, "options": string[] (optional), "hint": string (optional) }',
      'Make it Gen Z friendly and factually accurate.',
      '10 items total.',
    ].join('\n');
    const out = await callGemini(
      [{ role: 'user', content: prompt }],
      'You are a study game question generator. Reply with ONLY a valid JSON array, nothing else.'
    );
    const parsed = extractJSON(out);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export interface AIDetectionResult {
  score: number;
  verdict: 'human' | 'ai' | 'mixed';
  confidence: 'low' | 'medium' | 'high';
  reasons: string[];
  humanParts: string[];
  aiParts: string[];
}

export async function detectAIText(text: string): Promise<AIDetectionResult | null> {
  try {
    const prompt = [
      'Analyze this text and determine if it was written by a human or AI.',
      'Return ONLY a JSON object like this (no markdown, no commentary):',
      '{',
      '  "score": number between 0-100 (higher = more likely AI),',
      '  "verdict": "human" | "ai" | "mixed",',
      '  "confidence": "low" | "medium" | "high",',
      '  "reasons": string[] (exactly 3 short reasons),',
      '  "humanParts": string[] (short quotes from the text that seem human-written),',
      '  "aiParts": string[] (short quotes from the text that seem AI-written)',
      '}',
      `Text to analyze: ${text}`,
    ].join('\n');
    const out = await callGemini(
      [{ role: 'user', content: prompt }],
      'You are an AI text detector. Reply with ONLY valid JSON, nothing else.'
    );
    const parsed = extractJSON(out);
    if (!parsed || typeof parsed.score !== 'number') return null;
    return {
      score: Math.max(0, Math.min(100, parsed.score)),
      verdict: parsed.verdict === 'human' || parsed.verdict === 'ai' ? parsed.verdict : 'mixed',
      confidence: parsed.confidence === 'low' || parsed.confidence === 'high' ? parsed.confidence : 'medium',
      reasons: Array.isArray(parsed.reasons) ? parsed.reasons.slice(0, 3) : [],
      humanParts: Array.isArray(parsed.humanParts) ? parsed.humanParts : [],
      aiParts: Array.isArray(parsed.aiParts) ? parsed.aiParts : [],
    };
  } catch {
    return null;
  }
}

export async function humanizeText(text: string): Promise<string> {
  try {
    const prompt = `Rewrite this text to sound completely human-written by a real student — casual tone, natural imperfections, varied sentence length, same meaning and roughly the same length. Reply with ONLY the rewritten text, no quotes, no commentary:\n\n${text}`;
    const out = await callGemini(
      [{ role: 'user', content: prompt }],
      'You are a text humanizer. Rewrite text to sound like a real student wrote it.'
    );
    return out.trim();
  } catch {
    return '';
  }
}

export interface StudyPlanDay {
  day: number;
  date: string;
  title: string;
  tasks: string[];
  duration: number;
  resources: string[];
}

export interface StudyPlanWeek {
  weekNumber: number;
  theme: string;
  days: StudyPlanDay[];
}

export interface StudyPlan {
  title: string;
  totalDays: number;
  hoursTotal: number;
  weeks: StudyPlanWeek[];
  tips: string[];
  milestones: { day: number; goal: string }[];
}

export async function generateStudyPlan(
  subject: string,
  topic: string,
  daysLeft: number,
  hoursPerDay: number,
  level: string,
  goal: string
): Promise<StudyPlan | null> {
  try {
    const prompt = [
      'Create a detailed study plan for a student.',
      `Subject: ${subject}`,
      `Topic: ${topic}`,
      `Days until deadline: ${daysLeft}`,
      `Hours per day: ${hoursPerDay}`,
      `Current level: ${level}`,
      `Goal: ${goal}`,
      '',
      'Return ONLY a JSON object (no markdown, no commentary):',
      '{',
      '  "title": string,',
      '  "totalDays": number,',
      '  "hoursTotal": number,',
      '  "weeks": [{ "weekNumber": number, "theme": string, "days": [{ "day": number, "date": string, "title": string, "tasks": string[], "duration": number, "resources": string[] }] }],',
      '  "tips": string[] (3 tips),',
      '  "milestones": [{ "day": number, "goal": string }]',
      '}',
      'Make it realistic, Gen Z friendly, and specific to the subject/topic.',
    ].join('\n');
    // A multi-week day-by-day plan is by far the largest JSON this file
    // generates — verified directly against the API that the default budget
    // truncates it mid-response (finishReason: MAX_TOKENS); 8192 completes it.
    const out = await callGemini(
      [{ role: 'user', content: prompt }],
      'You are a study planning AI. Reply with ONLY valid JSON, nothing else.',
      8192
    );
    const parsed = extractJSON(out);
    if (!parsed || !Array.isArray(parsed.weeks)) return null;
    return parsed as StudyPlan;
  } catch {
    return null;
  }
}

export interface LectureNotes {
  summary: string;
  keyPoints: string[];
  definitions: { term: string; definition: string }[];
  examples: string[];
  examQuestions: string[];
  flashcards: { front: string; back: string }[];
  missedTopics: string[];
  homieAdvice: string;
}

export async function generateLectureNotes(
  transcript: string,
  subject: string,
  lectureName: string
): Promise<LectureNotes | null> {
  try {
    const prompt = [
      'You are Homie — a Gen Z AI study buddy.',
      'A student just recorded this lecture transcript:',
      '',
      `"${transcript}"`,
      '',
      `Subject: ${subject}`,
      `Lecture: ${lectureName}`,
      '',
      'Generate comprehensive study notes.',
      'Return ONLY a JSON object (no markdown, no commentary):',
      '{',
      '  "summary": "2-3 sentence overview of what was covered",',
      '  "keyPoints": string[],',
      '  "definitions": [{ "term": string, "definition": string }],',
      '  "examples": string[] (examples or analogies mentioned),',
      '  "examQuestions": string[],',
      '  "flashcards": [{ "front": string, "back": string }],',
      '  "missedTopics": string[] (topics mentioned but not fully explained),',
      '  "homieAdvice": "one casual Gen Z tip for studying this material"',
      '}',
    ].join('\n');
    // Same reasoning-model budget as generateStudyPlan — a full notes JSON
    // (summary + points + definitions + questions + flashcards) is large
    // enough to hit MAX_TOKENS on the default budget.
    const out = await callGemini(
      [{ role: 'user', content: prompt }],
      'You are a study notes generator. Reply with ONLY valid JSON, nothing else.',
      8192
    );
    const parsed = extractJSON(out);
    if (!parsed || typeof parsed.summary !== 'string') return null;
    return {
      summary: parsed.summary,
      keyPoints: Array.isArray(parsed.keyPoints) ? parsed.keyPoints : [],
      definitions: Array.isArray(parsed.definitions) ? parsed.definitions : [],
      examples: Array.isArray(parsed.examples) ? parsed.examples : [],
      examQuestions: Array.isArray(parsed.examQuestions) ? parsed.examQuestions : [],
      flashcards: Array.isArray(parsed.flashcards) ? parsed.flashcards : [],
      missedTopics: Array.isArray(parsed.missedTopics) ? parsed.missedTopics : [],
      homieAdvice: typeof parsed.homieAdvice === 'string' ? parsed.homieAdvice : '',
    };
  } catch {
    return null;
  }
}
