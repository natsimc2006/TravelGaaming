/**
 * Forgiving-but-not-silly answer matching. Replaces bidirectional substring checks
 * (which accepted "a" for "map" and "cl" for "clock").
 */
const ARTICLES = /^(a|an|the|my|your|some)\s+/;

export function normalise(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(ARTICLES, '');
}

function lev(a: string, b: string): number {
  const m = a.length, n = b.length;
  if (Math.abs(m - n) > 2) return 3;
  const dp = Array.from({ length: m + 1 }, (_, i) => [i, ...Array(n).fill(0)]);
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    }
  }
  return dp[m][n];
}

const plural = (s: string) => s.replace(/(es|s)$/, '');

export function isAnswerMatch(userAnswer: string, accepted: string[]): boolean {
  const u = normalise(userAnswer);
  if (u.length < 2) return false;
  for (const raw of accepted) {
    const a = normalise(raw);
    if (!a) continue;
    if (u === a || plural(u) === plural(a)) return true;
    // typo tolerance scales with word length
    const tol = a.length >= 9 ? 2 : a.length >= 5 ? 1 : 0;
    if (tol > 0 && lev(u, a) <= tol) return true;
    // "it's a big clock" → contains the whole answer as a word (multi-word guesses only)
    if (u.split(' ').length > 1 && a.length >= 3 && new RegExp(`\\b${a.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`).test(u)) return true;
  }
  return false;
}
