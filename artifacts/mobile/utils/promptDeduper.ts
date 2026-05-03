import type { GeneratedPrompt } from './aiPromptEngine';

export function normalisePromptText(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function tokenSet(text: string): Set<string> {
  return new Set(normalisePromptText(text).split(' ').filter(w => w.length > 2));
}

const STOP_WORDS = new Set([
  'the', 'and', 'for', 'are', 'but', 'not', 'you', 'all', 'can', 'her',
  'was', 'one', 'our', 'out', 'day', 'get', 'has', 'him', 'his', 'how',
  'its', 'may', 'new', 'now', 'old', 'see', 'two', 'way', 'who', 'did',
  'let', 'put', 'say', 'she', 'too', 'use',
]);

function meaningfulTokens(text: string): Set<string> {
  const all = tokenSet(text);
  return new Set([...all].filter(w => !STOP_WORDS.has(w)));
}

function jaccardSimilarity(a: Set<string>, b: Set<string>): number {
  if (a.size === 0 && b.size === 0) return 1;
  const intersection = new Set([...a].filter(x => b.has(x)));
  const union = new Set([...a, ...b]);
  return union.size === 0 ? 0 : intersection.size / union.size;
}

type PromptLike = Pick<GeneratedPrompt, 'answer' | 'promptText'> & { category?: string };

export function isDuplicatePrompt(candidate: PromptLike, existing: PromptLike[]): boolean {
  const normAnswer = candidate.answer ? normalisePromptText(candidate.answer) : null;
  const normText = normalisePromptText(candidate.promptText + (candidate.category ?? ''));

  for (const p of existing) {
    const eAnswer = p.answer ? normalisePromptText(p.answer) : null;
    const eText = normalisePromptText(p.promptText + (p.category ?? ''));

    if (normAnswer && eAnswer && normAnswer === eAnswer) return true;
    if (normText === eText) return true;
  }
  return false;
}

export function isTooSimilarPrompt(
  candidate: PromptLike,
  existing: PromptLike[],
  threshold = 0.7,
): boolean {
  const candTokens = meaningfulTokens(candidate.promptText + ' ' + (candidate.category ?? '') + ' ' + (candidate.answer ?? ''));

  for (const p of existing) {
    const existTokens = meaningfulTokens(p.promptText + ' ' + (p.category ?? '') + ' ' + (p.answer ?? ''));
    if (jaccardSimilarity(candTokens, existTokens) >= threshold) return true;
  }
  return false;
}
