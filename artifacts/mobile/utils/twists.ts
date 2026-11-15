import type { Tier } from './director';

/**
 * Twists change HOW a round is played, not just what the prompt is — the main source of
 * variety within a single game. Higher levels see twists more often and pick harder ones.
 */
export interface Twist {
  id: string;
  title: string;
  rule: string;
  /** Points multiplier applied to scores awarded this round. */
  multiplier: number;
  /** Scales the round timer (e.g. 0.6 = 40% less time). */
  timerScale?: number;
  minLevel: number;
}

const T = (
  id: string, title: string, rule: string, minLevel: number, multiplier = 2, timerScale?: number,
): Twist => ({ id, title, rule, minLevel, multiplier, timerScale });

export const TWISTS: Record<string, Twist[]> = {
  'alphabet-showdown': [
    T('no-repeat', 'No Copycats', 'Nobody may repeat an answer someone already said.', 2, 1),
    T('end-with', 'Backwards Day', 'Answers must END with the letter instead of starting with it.', 3),
    T('chain', 'Chain Reaction', 'Each answer must start with the last letter of the one before.', 4),
    T('speed', 'Lightning', 'Same game, much less time.', 3, 2, 0.6),
    T('long-words', 'Big Words Only', 'Every answer needs 6 or more letters.', 4),
  ],
  'what-am-i': [
    T('double', 'Double Points', 'Every point counts twice this round — but only one guess allowed.', 2),
    T('one-shot', 'One Shot', 'Only one guess allowed. Make it count.', 3),
    T('silent', 'Whisper Round', 'The reader whispers every clue. No one may repeat a clue out loud.', 2, 1),
  ],
  'category-dash': [
    T('bonus', 'Jackpot Category', 'The last category is worth triple. Save your best idea for it.', 2, 3),
    T('unique', 'Be Original', 'Only answers nobody else said score.', 3, 2),
    T('speed', 'Lightning', 'Same five categories, a lot less time.', 3, 2, 0.6),
  ],
  'forbidden-word': [
    T('five-words', 'Five Word Limit', 'Describe the word in five words or fewer. Total.', 3),
    T('whisper', 'Whisper Mode', 'Describe it in a whisper. Loud guessers lose the point.', 2, 1),
    T('no-hands', 'Statue Mode', 'No gestures. Hands stay in your lap.', 3, 2),
  ],
  'rapid-fire': [
    T('no-repeat', 'No Copycats', 'Nobody may repeat an answer someone already said.', 2, 1),
    T('rhyme', 'Rhyme Time', 'Every answer must rhyme with the one before it.', 4, 2),
    T('speed', 'Lightning', 'Same prompt, much less time.', 3, 2, 0.6),
  ],
  'riddles': [
    T('no-hints', 'No Hints', 'No hints this round. Pure brain.', 2, 2),
    T('explain', 'Prove It', 'Explain WHY your answer fits before you get the point.', 3, 2),
  ],
  'would-you-rather': [
    T('defend', 'Defend It', 'Give one real reason for your choice. Everyone else votes if it was good.', 1, 1),
    T('opposite', 'Devil’s Advocate', 'Argue for the choice you did NOT pick.', 3, 1),
    T('guess-who', 'Mind Reader', 'Everyone guesses what the youngest player will pick first.', 2, 1),
  ],
  'this-or-that': [
    T('predict', 'Mind Reader', 'Guess what the person next to you will choose.', 1, 1),
    T('why', 'Say Why', 'Everyone must give a reason — in three words.', 2, 1),
  ],
  'guess-the-sound': [
    T('act', 'Act It Out', 'The reader acts out the sound. No words allowed.', 2, 1),
    T('three-guesses', 'Three Guesses', 'Only three guesses in total for the whole table.', 3, 2),
  ],
};

const CHANCE_BY_LEVEL = [0, 0, 0.2, 0.35, 0.5, 0.6];

export function pickTwist(
  gameId: string,
  level: number,
  round: number,
  lastTwistId?: string,
  rng: () => number = Math.random,
): Twist | undefined {
  if (round <= 1) return undefined; // warm-up round is always clean
  const chance = CHANCE_BY_LEVEL[Math.max(1, Math.min(5, level))];
  // Gentle games (WYR / This or That) are social — twists are their whole depth, so use them more.
  const social = gameId === 'would-you-rather' || gameId === 'this-or-that';
  if (rng() > (social ? Math.max(chance, 0.4) : chance)) return undefined;
  const pool = (TWISTS[gameId] ?? []).filter(t => t.minLevel <= level && t.id !== lastTwistId);
  if (pool.length === 0) return undefined;
  return pool[Math.floor(rng() * pool.length)];
}

export const TIER_LABEL: Record<Tier, string> = { easy: 'Easy', medium: 'Medium', hard: 'Hard' };
