export type SearchType = 'video' | 'article' | 'image' | 'general' | null;

const VIDEO_PHRASES = [
  'explain with video', 'show me how', 'how to',
  'video', 'youtube', 'watch', 'tutorial', 'lecture',
];

const ARTICLE_PHRASES = [
  'search google', 'find me info', 'find information', 'tell me about',
  'what is', 'article', 'read', 'news', 'blog', 'website',
];

const GENERAL_PHRASES = [
  'can you find', 'look up', 'get me', 'show me', 'search', 'find', 'browse',
];

const STRIP_WORDS = new Set([
  'find', 'me', 'a', 'an', 'the', 'video', 'videos', 'article', 'articles',
  'about', 'on', 'of', 'show', 'can', 'you', 'search', 'for', 'look', 'up',
  'give', 'youtube', 'watch', 'tutorial', 'how', 'to', 'some', 'please',
  'bro', 'information', 'info', 'read', 'news', 'website', 'google', 'browser',
]);

function extractQuery(message: string): string {
  return message
    .split(/\s+/)
    .filter(tok => {
      const clean = tok.toLowerCase().replace(/[^a-z0-9]/g, '');
      return clean.length > 0 && !STRIP_WORDS.has(clean);
    })
    .map(tok => tok.replace(/^[^\w]+|[^\w]+$/g, ''))
    .filter(Boolean)
    .join(' ')
    .trim();
}

export function detectSearchIntent(message: string): { type: SearchType; query: string } {
  const lower = message.toLowerCase();

  let type: SearchType = null;

  if (VIDEO_PHRASES.some(p => lower.includes(p))) {
    type = 'video';
  } else if (lower.includes('can you find')) {
    // "can you find" reads as a general search request even though it contains
    // "find" — checked ahead of the article phrases below so it doesn't get
    // mistaken for the more specific "find information" / "find me info".
    type = 'general';
  } else if (ARTICLE_PHRASES.some(p => lower.includes(p))) {
    type = 'article';
  } else if (GENERAL_PHRASES.some(p => lower.includes(p))) {
    type = 'general';
  }

  if (!type) return { type: null, query: '' };

  const query = extractQuery(message);
  if (!query) return { type: null, query: '' };

  return { type, query };
}
