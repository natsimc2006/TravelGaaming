import AsyncStorage from '@react-native-async-storage/async-storage';
import { GAMES } from '@/data/games';

const KEYS = {
  TOTAL_GAMES: 'gh_prog_total_games',
  TOTAL_ROUNDS: 'gh_prog_total_rounds',
  GAME_PLAY_COUNTS: 'gh_prog_game_play_counts',
  HIGH_SCORES: 'gh_prog_high_scores',
  LONGEST_STREAK: 'gh_prog_longest_streak',
};

export interface FamilyStats {
  totalGamesPlayed: number;
  totalRoundsPlayed: number;
  favouriteGameId: string | null;
  favouriteGameName: string | null;
  highestScore: number;
  longestStreak: number;
}

const DEFAULT_STATS: FamilyStats = {
  totalGamesPlayed: 0,
  totalRoundsPlayed: 0,
  favouriteGameId: null,
  favouriteGameName: null,
  highestScore: 0,
  longestStreak: 0,
};

export async function loadFamilyStats(): Promise<FamilyStats> {
  try {
    const [total, rounds, countsRaw, scoresRaw, streak] = await Promise.all([
      AsyncStorage.getItem(KEYS.TOTAL_GAMES),
      AsyncStorage.getItem(KEYS.TOTAL_ROUNDS),
      AsyncStorage.getItem(KEYS.GAME_PLAY_COUNTS),
      AsyncStorage.getItem(KEYS.HIGH_SCORES),
      AsyncStorage.getItem(KEYS.LONGEST_STREAK),
    ]);

    const playCounts: Record<string, number> = countsRaw ? JSON.parse(countsRaw) : {};
    const highScores: Record<string, number> = scoresRaw ? JSON.parse(scoresRaw) : {};

    let favouriteGameId: string | null = null;
    let maxPlays = 0;
    for (const [id, count] of Object.entries(playCounts)) {
      if (count > maxPlays) { maxPlays = count; favouriteGameId = id; }
    }

    const favouriteGame = favouriteGameId ? GAMES.find(g => g.id === favouriteGameId) : null;
    const highestScore = Object.values(highScores).reduce((m, v) => Math.max(m, v), 0);

    return {
      totalGamesPlayed: total ? parseInt(total, 10) : 0,
      totalRoundsPlayed: rounds ? parseInt(rounds, 10) : 0,
      favouriteGameId,
      favouriteGameName: favouriteGame?.name ?? null,
      highestScore,
      longestStreak: streak ? parseInt(streak, 10) : 0,
    };
  } catch {
    return DEFAULT_STATS;
  }
}

export async function recordGameCompleted(gameId: string, totalScore: number, roundsPlayed: number): Promise<void> {
  try {
    const [totalRaw, roundsRaw, countsRaw, scoresRaw] = await Promise.all([
      AsyncStorage.getItem(KEYS.TOTAL_GAMES),
      AsyncStorage.getItem(KEYS.TOTAL_ROUNDS),
      AsyncStorage.getItem(KEYS.GAME_PLAY_COUNTS),
      AsyncStorage.getItem(KEYS.HIGH_SCORES),
    ]);

    const total = totalRaw ? parseInt(totalRaw, 10) : 0;
    const rounds = roundsRaw ? parseInt(roundsRaw, 10) : 0;
    const playCounts: Record<string, number> = countsRaw ? JSON.parse(countsRaw) : {};
    const highScores: Record<string, number> = scoresRaw ? JSON.parse(scoresRaw) : {};

    playCounts[gameId] = (playCounts[gameId] ?? 0) + 1;
    highScores[gameId] = Math.max(highScores[gameId] ?? 0, totalScore);

    await Promise.all([
      AsyncStorage.setItem(KEYS.TOTAL_GAMES, String(total + 1)),
      AsyncStorage.setItem(KEYS.TOTAL_ROUNDS, String(rounds + roundsPlayed)),
      AsyncStorage.setItem(KEYS.GAME_PLAY_COUNTS, JSON.stringify(playCounts)),
      AsyncStorage.setItem(KEYS.HIGH_SCORES, JSON.stringify(highScores)),
    ]);
  } catch {}
}

export async function recordStreak(length: number): Promise<void> {
  try {
    const raw = await AsyncStorage.getItem(KEYS.LONGEST_STREAK);
    const current = raw ? parseInt(raw, 10) : 0;
    if (length > current) {
      await AsyncStorage.setItem(KEYS.LONGEST_STREAK, String(length));
    }
  } catch {}
}

export function getSoloPerformanceMessage(totalScore: number, totalRounds: number): string {
  const avg = totalRounds > 0 ? totalScore / totalRounds : 0;
  if (avg >= 4) return 'Sharp work. Suspiciously sharp.';
  if (avg >= 3) return 'Respectable. Very respectable indeed.';
  if (avg >= 2) return 'We got there. Effort was undeniable.';
  if (totalScore > 0) return 'Points were scored. That is the important thing.';
  return 'Character-building session. A classic.';
}

export function getSoloStreakMessage(streak: number): string {
  if (streak >= 5) return `${streak} in a row! Absolute legend.`;
  if (streak >= 3) return `${streak} in a row! On a roll.`;
  if (streak === 2) return '2 in a row! Keep it going.';
  return '';
}
