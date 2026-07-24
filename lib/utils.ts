export function parseQuiz(text: string) {
  if (!text?.includes('QUIZ_START')) return null;
  const block = text.match(/QUIZ_START([\s\S]+?)QUIZ_END/);
  if (!block) return null;
  const raw = block[1];
  const qm = raw.match(/Q:\s*(.+)/);
  if (!qm) return null;
  const opts: string[] = [];
  ['A','B','C','D'].forEach(l => {
    const m = raw.match(new RegExp(l + '[)]\\s*(.+)'));
    if (m) opts.push(m[1].trim());
  });
  const am = raw.match(/CORRECT:\s*([A-D])/i);
  const em = raw.match(/EXPLANATION:\s*(.+)/);
  if (!qm || opts.length < 2) return null;
  const ansIdx = am ? ['A','B','C','D'].indexOf(am[1].toUpperCase()) : 0;
  return { q: qm[1].trim(), opts, ans: ansIdx, exp: em?.[1]?.trim() || '' };
}

export function detectAI(text: string) {
  const t = text.toLowerCase();
  const aiPhrases = ['in conclusion','it is important','furthermore','in todays world',
    'it is essential','in summary','to summarize','delve into','as mentioned earlier'];
  const humanPhrases = ['lol','bro','tbh','ngl','fr','omg','idk','gonna','wanna','kinda','lowkey'];
  let ai = 0, human = 0;
  aiPhrases.forEach(p => { if (t.includes(p)) ai++; });
  humanPhrases.forEach(p => { if (t.includes(p)) human++; });
  const words = text.split(' ').length;
  const avgLen = text.replace(/[^a-zA-Z ]/g,'').split(' ').reduce((a,w)=>a+w.length,0)/words;
  if (avgLen > 6.5) ai += 2;
  if (avgLen < 4.5) human += 2;
  const total = Math.max(ai + human, 1);
  const aiPct = Math.round((ai/total)*100);
  return { aiPct, humanPct: 100 - aiPct, verdict: aiPct > 65 ? 'ai' : 100 - aiPct > 65 ? 'human' : 'mixed' };
}

export function levelFromXP(xp: number): number {
  return Math.floor(xp / 100) + 1;
}

export function xpProgress(xp: number): number {
  return (xp % 100) / 100;
}

export function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0');
  const s = (seconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

export function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
}
