import type { SeenMap } from './contentMemory';

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

export type FreshnessTag = 'new' | 'returning' | 'favourite' | null;

function shuffled<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function selectFreshPrompt<T extends { id: string }>(
  items: T[],
  sessionUsedIds: string[],
  seenMap: SeenMap,
): T {
  const now = Date.now();
  const pool = items.filter(i => !sessionUsedIds.includes(i.id));
  if (pool.length === 0) return items[Math.floor(Math.random() * items.length)];

  const neverSeen = pool.filter(i => !seenMap[i.id]);
  if (neverSeen.length > 0) return shuffled(neverSeen)[0];

  const oldSeen = pool.filter(i => seenMap[i.id] && now - seenMap[i.id].lastSeenAt >= SEVEN_DAYS_MS);
  if (oldSeen.length > 0) {
    const sorted = [...oldSeen].sort((a, b) => seenMap[a.id].lastSeenAt - seenMap[b.id].lastSeenAt);
    const topHalf = sorted.slice(0, Math.max(1, Math.ceil(sorted.length / 2)));
    return shuffled(topHalf)[0];
  }

  const recentSeen = pool.filter(i => seenMap[i.id] && now - seenMap[i.id].lastSeenAt < SEVEN_DAYS_MS);
  const sorted = [...recentSeen].sort((a, b) => seenMap[a.id].lastSeenAt - seenMap[b.id].lastSeenAt);
  return sorted[0] ?? pool[0];
}

export function getFreshnessTag(promptId: string, seenMap: SeenMap): FreshnessTag {
  const record = seenMap[promptId];
  if (!record) return 'new';
  if (Date.now() - record.lastSeenAt >= SEVEN_DAYS_MS) return 'returning';
  if (record.timesSeen >= 3) return 'favourite';
  return null;
}
