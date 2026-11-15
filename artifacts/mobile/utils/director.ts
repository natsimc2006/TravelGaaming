import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * The Director — Pip's adaptive "intelligence layer".
 *
 * Each player has a skill LEVEL (1–5) per game. Levels move up when a player keeps
 * solving quickly and down when they struggle, so a 5-year-old and a 10-year-old at
 * the same table are each served prompts that fit them. Levels persist across sessions.
 */

export type Tier = 'easy' | 'medium' | 'hard';
export type Outcome = 'ace' | 'solved' | 'struggled' | 'missed';

export const MIN_LEVEL = 1;
export const MAX_LEVEL = 5;

export interface LevelEvent {
  playerId: string;
  playerName: string;
  from: number;
  to: number;
}

export interface DirectorState {
  levels: Record<string, number>;
  momentum: Record<string, number>;
  events: LevelEvent[];
}

const clamp = (n: number) => Math.max(MIN_LEVEL, Math.min(MAX_LEVEL, n));

/* ─── Level → content tier ─── */

const TIER_WEIGHTS: Record<number, [number, number, number]> = {
  // [easy, medium, hard]
  1: [0.85, 0.15, 0],
  2: [0.55, 0.4, 0.05],
  3: [0.25, 0.55, 0.2],
  4: [0.1, 0.45, 0.45],
  5: [0, 0.3, 0.7],
};

export function tierForLevel(level: number, rng: () => number = Math.random): Tier {
  const [e, m] = TIER_WEIGHTS[clamp(Math.round(level))];
  const r = rng();
  if (r < e) return 'easy';
  if (r < e + m) return 'medium';
  return 'hard';
}

const FALLBACK: Record<Tier, Tier[]> = {
  easy: ['easy', 'medium', 'hard'],
  medium: ['medium', 'easy', 'hard'],
  hard: ['hard', 'medium', 'easy'],
};

/** Strict tier match, falling back to the nearest tier that still has unused content. */
export function filterByTier<T extends { difficulty?: Tier }>(pool: T[], tier?: Tier): T[] {
  if (!tier) return pool;
  for (const t of FALLBACK[tier]) {
    const hit = pool.filter(p => (p.difficulty ?? 'easy') === t);
    if (hit.length > 0) return hit;
  }
  return pool;
}

/* ─── Starting level ─── */

export function startingLevel(
  ageRange: 'easy' | 'mixed' | 'all',
  difficulty: 'easy' | 'mixed' | 'spicy',
  saved?: number,
): number {
  const ageBase = ageRange === 'easy' ? 1 : ageRange === 'mixed' ? 2 : 3;
  const diffOffset = difficulty === 'easy' ? -1 : difficulty === 'spicy' ? 1 : 0;
  let level = saved !== undefined ? saved + diffOffset : ageBase + diffOffset + (difficulty === 'spicy' ? 1 : 0);
  if (ageRange === 'easy') level = Math.min(level, 3); // never overwhelm the little ones
  if (ageRange === 'all') level = Math.max(level, 2); // never bore the big ones
  return clamp(level);
}

export function initDirector(
  players: { id: string; name: string }[],
  ageRange: 'easy' | 'mixed' | 'all',
  difficulty: 'easy' | 'mixed' | 'spicy',
  saved: Record<string, number> = {},
): DirectorState {
  const levels: Record<string, number> = {};
  const momentum: Record<string, number> = {};
  players.forEach(p => {
    levels[p.id] = startingLevel(ageRange, difficulty, saved[skillKey(p.name)]);
    momentum[p.id] = 0;
  });
  return { levels, momentum, events: [] };
}

/* ─── Outcomes → momentum → level changes ─── */

const OUTCOME_VALUE: Record<Outcome, number> = { ace: 1, solved: 0.25, struggled: -0.5, missed: -1 };

export function applyOutcome(
  d: DirectorState,
  player: { id: string; name: string },
  outcome: Outcome,
): DirectorState {
  const level = d.levels[player.id];
  if (level === undefined) return d;
  let m = (d.momentum[player.id] ?? 0) + OUTCOME_VALUE[outcome];
  let next = level;
  const events = d.events;
  let newEvents = events;
  if (m >= 1.5 && level < MAX_LEVEL) {
    next = level + 1; m = 0;
  } else if (m <= -1.5 && level > MIN_LEVEL) {
    next = level - 1; m = 0;
  } else if (m >= 1.5 || m <= -1.5) {
    m = 0; // pinned at an edge — reset so it can't snowball
  }
  if (next !== level) {
    newEvents = [...events, { playerId: player.id, playerName: player.name, from: level, to: next }];
  }
  return {
    levels: { ...d.levels, [player.id]: next },
    momentum: { ...d.momentum, [player.id]: m },
    events: newEvents,
  };
}

export function levelFor(d: DirectorState | undefined, playerIds: string[]): number {
  if (!d || playerIds.length === 0) return 2;
  const vals = playerIds.map(id => d.levels[id]).filter((v): v is number => v !== undefined);
  if (vals.length === 0) return 2;
  return clamp(Math.round(vals.reduce((a, b) => a + b, 0) / vals.length));
}

/* ─── Persistence (per player name, per game) ─── */

const STORE_KEY = 'gh_skill_v1';
export const skillKey = (name: string) => name.trim().toLowerCase();
type Store = Record<string, Record<string, number>>; // gameId -> playerKey -> level

async function readStore(): Promise<Store> {
  try {
    const raw = await AsyncStorage.getItem(STORE_KEY);
    return raw ? (JSON.parse(raw) as Store) : {};
  } catch {
    return {};
  }
}

export async function loadSavedLevels(gameId: string): Promise<Record<string, number>> {
  return (await readStore())[gameId] ?? {};
}

export async function saveLevels(
  gameId: string,
  players: { id: string; name: string }[],
  d: DirectorState,
): Promise<void> {
  try {
    const store = await readStore();
    const forGame = store[gameId] ?? {};
    players.forEach(p => {
      // Generic default names ("Player 2") are not worth remembering.
      if (/^player \d+$/i.test(p.name.trim()) || p.name === 'Solo Player') return;
      forGame[skillKey(p.name)] = d.levels[p.id];
    });
    store[gameId] = forGame;
    await AsyncStorage.setItem(STORE_KEY, JSON.stringify(store));
  } catch {
    /* best effort */
  }
}

export const LEVEL_NAMES = ['', 'Starter', 'Explorer', 'Thinker', 'Champion', 'Legend'];
