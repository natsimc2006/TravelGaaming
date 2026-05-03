import { ALPHABET_CATEGORIES, getRandomCategory, getRandomLetter } from '@/data/alphabetCategories';
import { getRandomDashLetter, getRandomDashRound } from '@/data/categoryDash';
import { getRandomForbiddenCard } from '@/data/forbiddenWord';
import { getRandomWhatAmIItem } from '@/data/whatAmI';

export interface Player {
  id: string;
  name: string;
}

export type GameDifficulty = 'easy' | 'mixed' | 'spicy';
export type RoundLength = 'quick' | 'normal' | 'long';
export type AgeRange = 'easy' | 'mixed' | 'all';

export interface GameSettings {
  playerCount: number;
  players: Player[];
  ageRange: AgeRange;
  roundLength: RoundLength;
  difficulty: GameDifficulty;
  teams: boolean;
}

export interface AlphabetState {
  currentCategory: { id: string; name: string };
  currentLetter: string;
  usedCategoryIds: string[];
  usedLetters: string[];
  timerSeconds: number;
}

export interface WhatAmIState {
  currentItemId: string;
  currentAnswer: string;
  currentClues: [string, string, string, string, string];
  cluesRevealed: number;
  usedItemIds: string[];
  pointsForCorrect: number;
  guessAttempts: number;
}

export interface CategoryDashState {
  currentRoundId: string;
  currentCategories: [string, string, string, string, string];
  currentLetter: string;
  usedRoundIds: string[];
  timerSeconds: number;
}

export interface ForbiddenWordState {
  currentCardId: string;
  targetWord: string;
  forbiddenWords: [string, string, string, string, string];
  usedCardIds: string[];
  timerSeconds: number;
}

export interface GameSession {
  gameId: string;
  gameName: string;
  players: Player[];
  settings: GameSettings;
  scores: Record<string, number>;
  currentPlayerIndex: number;
  round: number;
  totalRounds: number;
  status: 'idle' | 'playing' | 'ended';
  alphabetState?: AlphabetState;
  whatAmIState?: WhatAmIState;
  categoryDashState?: CategoryDashState;
  forbiddenWordState?: ForbiddenWordState;
}

export function getRoundCount(roundLength: RoundLength): number {
  const map: Record<RoundLength, number> = { quick: 5, normal: 10, long: 20 };
  return map[roundLength];
}

export function getTimerSeconds(roundLength: RoundLength): number {
  const map: Record<RoundLength, number> = { quick: 30, normal: 60, long: 90 };
  return map[roundLength];
}

export function getDifficultyKey(difficulty: GameDifficulty): 'easy' | 'medium' | 'hard' {
  const map: Record<GameDifficulty, 'easy' | 'medium' | 'hard'> = {
    easy: 'easy',
    mixed: 'medium',
    spicy: 'hard',
  };
  return map[difficulty];
}

export function createSession(
  gameId: string,
  gameName: string,
  settings: GameSettings
): GameSession {
  const scores: Record<string, number> = {};
  settings.players.forEach(p => { scores[p.id] = 0; });

  const totalRounds = getRoundCount(settings.roundLength);
  const diff = getDifficultyKey(settings.difficulty);
  const timerSecs = getTimerSeconds(settings.roundLength);

  const session: GameSession = {
    gameId,
    gameName,
    players: settings.players,
    settings,
    scores,
    currentPlayerIndex: 0,
    round: 1,
    totalRounds,
    status: 'playing',
  };

  if (gameId === 'alphabet-showdown') {
    const cat = getRandomCategory([], diff);
    const letter = getRandomLetter([]);
    session.alphabetState = {
      currentCategory: { id: cat.id, name: cat.name },
      currentLetter: letter,
      usedCategoryIds: [cat.id],
      usedLetters: [letter],
      timerSeconds: timerSecs,
    };
  } else if (gameId === 'what-am-i') {
    const item = getRandomWhatAmIItem([], diff);
    session.whatAmIState = {
      currentItemId: item.id,
      currentAnswer: item.answer,
      currentClues: item.clues,
      cluesRevealed: 1,
      usedItemIds: [item.id],
      pointsForCorrect: 5,
      guessAttempts: 0,
    };
  } else if (gameId === 'category-dash') {
    const round = getRandomDashRound([], diff);
    const letter = getRandomDashLetter();
    session.categoryDashState = {
      currentRoundId: round.id,
      currentCategories: round.categories,
      currentLetter: letter,
      usedRoundIds: [round.id],
      timerSeconds: timerSecs,
    };
  } else if (gameId === 'forbidden-word') {
    const card = getRandomForbiddenCard([], diff);
    session.forbiddenWordState = {
      currentCardId: card.id,
      targetWord: card.targetWord,
      forbiddenWords: card.forbiddenWords,
      usedCardIds: [card.id],
      timerSeconds: timerSecs,
    };
  }

  return session;
}

export function nextPlayer(session: GameSession): GameSession {
  const nextIndex = (session.currentPlayerIndex + 1) % session.players.length;
  return { ...session, currentPlayerIndex: nextIndex };
}

export function addScore(session: GameSession, playerId: string, points: number): GameSession {
  return {
    ...session,
    scores: {
      ...session.scores,
      [playerId]: (session.scores[playerId] ?? 0) + points,
    },
  };
}

export function nextRound(session: GameSession): GameSession {
  const newRound = session.round + 1;
  if (newRound > session.totalRounds) {
    return { ...session, status: 'ended' };
  }

  const diff = getDifficultyKey(session.settings.difficulty);
  const timerSecs = getTimerSeconds(session.settings.roundLength);
  let updated = { ...session, round: newRound };

  if (session.gameId === 'alphabet-showdown' && session.alphabetState) {
    const s = session.alphabetState;
    const letter = getRandomLetter(s.usedLetters);
    updated.alphabetState = {
      ...s,
      currentLetter: letter,
      usedLetters: [...s.usedLetters, letter],
      timerSeconds: timerSecs,
    };
  } else if (session.gameId === 'what-am-i' && session.whatAmIState) {
    const s = session.whatAmIState;
    const item = getRandomWhatAmIItem(s.usedItemIds, diff);
    updated.whatAmIState = {
      currentItemId: item.id,
      currentAnswer: item.answer,
      currentClues: item.clues,
      cluesRevealed: 1,
      usedItemIds: [...s.usedItemIds, item.id],
      pointsForCorrect: 5,
      guessAttempts: 0,
    };
    updated = nextPlayer(updated);
  } else if (session.gameId === 'category-dash' && session.categoryDashState) {
    const s = session.categoryDashState;
    const round = getRandomDashRound(s.usedRoundIds, diff);
    const letter = getRandomDashLetter();
    updated.categoryDashState = {
      currentRoundId: round.id,
      currentCategories: round.categories,
      currentLetter: letter,
      usedRoundIds: [...s.usedRoundIds, round.id],
      timerSeconds: timerSecs,
    };
  } else if (session.gameId === 'forbidden-word' && session.forbiddenWordState) {
    const s = session.forbiddenWordState;
    const card = getRandomForbiddenCard(s.usedCardIds, diff);
    updated.forbiddenWordState = {
      currentCardId: card.id,
      targetWord: card.targetWord,
      forbiddenWords: card.forbiddenWords,
      usedCardIds: [...s.usedCardIds, card.id],
      timerSeconds: timerSecs,
    };
    updated = nextPlayer(updated);
  }

  return updated;
}

export function nextLetter(session: GameSession): GameSession {
  if (!session.alphabetState) return session;
  const s = session.alphabetState;
  const letter = getRandomLetter(s.usedLetters);
  return {
    ...session,
    alphabetState: {
      ...s,
      currentLetter: letter,
      usedLetters: [...s.usedLetters, letter],
    },
  };
}

export function nextCategory(session: GameSession): GameSession {
  if (!session.alphabetState) return session;
  const s = session.alphabetState;
  const diff = getDifficultyKey(session.settings.difficulty);
  const cat = getRandomCategory(s.usedCategoryIds, diff);
  return {
    ...session,
    alphabetState: {
      ...s,
      currentCategory: { id: cat.id, name: cat.name },
      usedCategoryIds: [...s.usedCategoryIds, cat.id],
    },
  };
}

export function revealNextClue(session: GameSession): GameSession {
  if (!session.whatAmIState) return session;
  const s = session.whatAmIState;
  const newRevealed = Math.min(s.cluesRevealed + 1, 5);
  return {
    ...session,
    whatAmIState: {
      ...s,
      cluesRevealed: newRevealed,
      pointsForCorrect: Math.max(1, 6 - newRevealed),
    },
  };
}

export function endGame(session: GameSession): GameSession {
  return { ...session, status: 'ended' };
}

export function getWinners(session: GameSession): Player[] {
  const maxScore = Math.max(...Object.values(session.scores));
  return session.players.filter(p => session.scores[p.id] === maxScore);
}

export function getHostLine(type: 'roundStart' | 'correct' | 'skip' | 'gameEnd' | 'nextPlayer', name?: string, n?: number): string {
  const lines: Record<string, string[]> = {
    roundStart: [
      `Round ${n}. No pressure. Except there absolutely is.`,
      `Round ${n}. This is where legends are made. Apparently.`,
      `Round ${n} coming in hot. Stay sharp.`,
      `Right then. Round ${n}. Let's do this.`,
    ],
    correct: [
      'That one was either genius or deeply suspicious.',
      'Correct! The crowd goes wild. Metaphorically.',
      'Points awarded. Family peace maintained.',
      'Brilliant! Nobody saw that coming.',
      'Nailed it. Outstanding work.',
    ],
    skip: [
      'Fair enough. Moving on.',
      'Next time, maybe.',
      'Skipped. Absolutely no shame in that.',
      'Onward. The show must go on.',
    ],
    gameEnd: [
      'Family peace has been restored. Mostly.',
      "That's a wrap! Well played, everyone.",
      "And that's the game! Not bad at all.",
      'Done! Someone call a trophy company.',
    ],
    nextPlayer: [
      `${name}, you're up. No pressure.`,
      `The spotlight is yours, ${name}.`,
      `Over to you, ${name}.`,
      `${name} steps up. Interesting.`,
    ],
  };
  const arr = lines[type] ?? lines.correct;
  return arr[Math.floor(Math.random() * arr.length)];
}
