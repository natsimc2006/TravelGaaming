import { ALPHABET_CATEGORIES, getRandomCategory, getRandomLetter } from '@/data/alphabetCategories';
import { getRandomDashLetter, getRandomDashRound } from '@/data/categoryDash';
import { getRandomForbiddenCard } from '@/data/forbiddenWord';
import { getRandomWhatAmIItem } from '@/data/whatAmI';
import { getRandomWYRCard } from '@/data/wouldYouRather';
import { getRandomRapidFirePrompt } from '@/data/rapidFire';
import { getRandomSoundItem } from '@/data/guessTheSound';
import { getRandomThisOrThat } from '@/data/thisOrThat';
import { getRandomRiddle } from '@/data/riddles';
import type { SeenMap } from '@/utils/contentMemory';

export interface Player {
  id: string;
  name: string;
}

export type GameDifficulty = 'easy' | 'mixed' | 'spicy';
export type RoundLength = 'quick' | 'normal' | 'long';
export type AgeRange = 'easy' | 'mixed' | 'all';
export type PlayStyle = 'turns' | 'free';
export type GameState = 'setup' | 'playing' | 'guessing' | 'roundComplete' | 'gameComplete';

export interface GameSettings {
  playerCount: number;
  players: Player[];
  ageRange: AgeRange;
  roundLength: RoundLength;
  difficulty: GameDifficulty;
  teams: boolean;
  playStyle?: PlayStyle;
}

export interface AlphabetState {
  currentCategory: { id: string; name: string };
  currentLetter: string;
  usedCategoryIds: string[];
  usedLetters: string[];
  timerSeconds: number;
  soloStreak: number;
  bestStreak: number;
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

export interface WouldYouRatherState {
  currentCardId: string;
  optionA: string;
  optionB: string;
  mode: 'silly' | 'thoughtful' | 'chaos';
  usedCardIds: string[];
  selectedOption: 'A' | 'B' | null;
}

export interface RapidFireState {
  currentPromptId: string;
  currentPrompt: string;
  usedPromptIds: string[];
  playerAnswerCount: Record<string, number>;
  timerSeconds: number;
}

export interface GuessSoundState {
  currentItemId: string;
  currentSoundText: string;
  currentAnswer: string;
  acceptedAnswers: string[];
  usedItemIds: string[];
}

export interface ThisOrThatState {
  currentCardId: string;
  optionA: string;
  optionB: string;
  usedCardIds: string[];
  streak: number;
  bestStreak: number;
}

export interface RiddleState {
  currentRiddleId: string;
  currentQuestion: string;
  currentAnswer: string;
  acceptedAnswers: string[];
  usedRiddleIds: string[];
  hintsUsed: number;
  revealed: boolean;
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
  isSoloMode: boolean;
  gameState: GameState;
  seenMap?: SeenMap;
  alphabetState?: AlphabetState;
  whatAmIState?: WhatAmIState;
  categoryDashState?: CategoryDashState;
  forbiddenWordState?: ForbiddenWordState;
  wouldYouRatherState?: WouldYouRatherState;
  rapidFireState?: RapidFireState;
  guessSoundState?: GuessSoundState;
  thisOrThatState?: ThisOrThatState;
  riddleState?: RiddleState;
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
  settings: GameSettings,
  seenMap?: SeenMap,
): GameSession {
  const scores: Record<string, number> = {};
  settings.players.forEach(p => { scores[p.id] = 0; });

  const totalRounds = getRoundCount(settings.roundLength);
  const diff = getDifficultyKey(settings.difficulty);
  const timerSecs = getTimerSeconds(settings.roundLength);
  const isSoloMode = settings.players.length === 1;

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
    isSoloMode,
    gameState: 'playing',
    seenMap,
  };

  if (gameId === 'alphabet-showdown') {
    const cat = getRandomCategory([], diff, seenMap);
    const letter = getRandomLetter([]);
    session.alphabetState = {
      currentCategory: { id: cat.id, name: cat.name },
      currentLetter: letter,
      usedCategoryIds: [cat.id],
      usedLetters: [letter],
      timerSeconds: timerSecs,
      soloStreak: 0,
      bestStreak: 0,
    };
  } else if (gameId === 'what-am-i') {
    const item = getRandomWhatAmIItem([], diff, seenMap);
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
    const round = getRandomDashRound([], diff, seenMap);
    const letter = getRandomDashLetter();
    session.categoryDashState = {
      currentRoundId: round.id,
      currentCategories: round.categories,
      currentLetter: letter,
      usedRoundIds: [round.id],
      timerSeconds: timerSecs,
    };
  } else if (gameId === 'forbidden-word') {
    const card = getRandomForbiddenCard([], diff, seenMap);
    session.forbiddenWordState = {
      currentCardId: card.id,
      targetWord: card.targetWord,
      forbiddenWords: card.forbiddenWords,
      usedCardIds: [card.id],
      timerSeconds: timerSecs,
    };
  } else if (gameId === 'would-you-rather') {
    const card = getRandomWYRCard([], undefined, seenMap);
    session.wouldYouRatherState = {
      currentCardId: card.id,
      optionA: card.optionA,
      optionB: card.optionB,
      mode: card.mode,
      usedCardIds: [card.id],
      selectedOption: null,
    };
  } else if (gameId === 'rapid-fire') {
    const prompt = getRandomRapidFirePrompt([], diff, seenMap);
    const playerAnswerCount: Record<string, number> = {};
    settings.players.forEach(p => { playerAnswerCount[p.id] = 0; });
    session.rapidFireState = {
      currentPromptId: prompt.id,
      currentPrompt: prompt.prompt,
      usedPromptIds: [prompt.id],
      playerAnswerCount,
      timerSeconds: timerSecs,
    };
  } else if (gameId === 'guess-the-sound') {
    const item = getRandomSoundItem([], diff, seenMap);
    session.guessSoundState = {
      currentItemId: item.id,
      currentSoundText: item.soundText,
      currentAnswer: item.answer,
      acceptedAnswers: item.acceptedAnswers,
      usedItemIds: [item.id],
    };
  } else if (gameId === 'this-or-that') {
    const card = getRandomThisOrThat([], seenMap);
    session.thisOrThatState = {
      currentCardId: card.id,
      optionA: card.optionA,
      optionB: card.optionB,
      usedCardIds: [card.id],
      streak: 0,
      bestStreak: 0,
    };
  } else if (gameId === 'riddles') {
    const riddle = getRandomRiddle([], diff, seenMap);
    session.riddleState = {
      currentRiddleId: riddle.id,
      currentQuestion: riddle.question,
      currentAnswer: riddle.answer,
      acceptedAnswers: riddle.acceptedAnswers,
      usedRiddleIds: [riddle.id],
      hintsUsed: 0,
      revealed: false,
    };
  }

  return session;
}

export function nextPlayer(session: GameSession): GameSession {
  if (session.isSoloMode || session.settings.playStyle === 'free') return session;
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

export function incrementSoloStreak(session: GameSession): GameSession {
  if (!session.alphabetState) return session;
  const newStreak = session.alphabetState.soloStreak + 1;
  return {
    ...session,
    alphabetState: {
      ...session.alphabetState,
      soloStreak: newStreak,
      bestStreak: Math.max(session.alphabetState.bestStreak, newStreak),
    },
  };
}

export function resetSoloStreak(session: GameSession): GameSession {
  if (!session.alphabetState) return session;
  return {
    ...session,
    alphabetState: { ...session.alphabetState, soloStreak: 0 },
  };
}

export function nextRound(session: GameSession): GameSession {
  const newRound = session.round + 1;
  if (newRound > session.totalRounds) {
    return { ...session, status: 'ended', gameState: 'gameComplete' };
  }

  const diff = getDifficultyKey(session.settings.difficulty);
  const timerSecs = getTimerSeconds(session.settings.roundLength);
  let updated = { ...session, round: newRound, gameState: 'playing' as GameState };

  const sm = session.seenMap;
  if (session.gameId === 'alphabet-showdown' && session.alphabetState) {
    const s = session.alphabetState;
    const letter = getRandomLetter(s.usedLetters);
    const cat = getRandomCategory(s.usedCategoryIds, diff, sm);
    updated.alphabetState = {
      ...s,
      currentCategory: { id: cat.id, name: cat.name },
      usedCategoryIds: [...s.usedCategoryIds, cat.id],
      currentLetter: letter,
      usedLetters: [...s.usedLetters, letter],
      timerSeconds: timerSecs,
      soloStreak: s.soloStreak,
      bestStreak: s.bestStreak,
    };
  } else if (session.gameId === 'what-am-i' && session.whatAmIState) {
    const s = session.whatAmIState;
    const item = getRandomWhatAmIItem(s.usedItemIds, diff, sm);
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
    const round = getRandomDashRound(s.usedRoundIds, diff, sm);
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
    const card = getRandomForbiddenCard(s.usedCardIds, diff, sm);
    updated.forbiddenWordState = {
      currentCardId: card.id,
      targetWord: card.targetWord,
      forbiddenWords: card.forbiddenWords,
      usedCardIds: [...s.usedCardIds, card.id],
      timerSeconds: timerSecs,
    };
    updated = nextPlayer(updated);
  } else if (session.gameId === 'would-you-rather' && session.wouldYouRatherState) {
    const s = session.wouldYouRatherState;
    const card = getRandomWYRCard(s.usedCardIds, s.mode, sm);
    updated.wouldYouRatherState = {
      currentCardId: card.id,
      optionA: card.optionA,
      optionB: card.optionB,
      mode: card.mode,
      usedCardIds: [...s.usedCardIds, card.id],
      selectedOption: null,
    };
    updated = nextPlayer(updated);
  } else if (session.gameId === 'rapid-fire' && session.rapidFireState) {
    const s = session.rapidFireState;
    const prompt = getRandomRapidFirePrompt(s.usedPromptIds, diff, sm);
    const playerAnswerCount: Record<string, number> = {};
    session.players.forEach(p => { playerAnswerCount[p.id] = 0; });
    updated.rapidFireState = {
      currentPromptId: prompt.id,
      currentPrompt: prompt.prompt,
      usedPromptIds: [...s.usedPromptIds, prompt.id],
      playerAnswerCount,
      timerSeconds: timerSecs,
    };
    updated = nextPlayer(updated);
  } else if (session.gameId === 'guess-the-sound' && session.guessSoundState) {
    const s = session.guessSoundState;
    const item = getRandomSoundItem(s.usedItemIds, diff, sm);
    updated.guessSoundState = {
      currentItemId: item.id,
      currentSoundText: item.soundText,
      currentAnswer: item.answer,
      acceptedAnswers: item.acceptedAnswers,
      usedItemIds: [...s.usedItemIds, item.id],
    };
    updated = nextPlayer(updated);
  } else if (session.gameId === 'this-or-that' && session.thisOrThatState) {
    const s = session.thisOrThatState;
    const card = getRandomThisOrThat(s.usedCardIds, sm);
    updated.thisOrThatState = {
      currentCardId: card.id,
      optionA: card.optionA,
      optionB: card.optionB,
      usedCardIds: [...s.usedCardIds, card.id],
      streak: s.streak,
      bestStreak: s.bestStreak,
    };
  } else if (session.gameId === 'riddles' && session.riddleState) {
    const s = session.riddleState;
    const riddle = getRandomRiddle(s.usedRiddleIds, diff, sm);
    updated.riddleState = {
      currentRiddleId: riddle.id,
      currentQuestion: riddle.question,
      currentAnswer: riddle.answer,
      acceptedAnswers: riddle.acceptedAnswers,
      usedRiddleIds: [...s.usedRiddleIds, riddle.id],
      hintsUsed: 0,
      revealed: false,
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
    alphabetState: { ...s, currentLetter: letter, usedLetters: [...s.usedLetters, letter] },
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
  return { ...session, status: 'ended', gameState: 'gameComplete' };
}

export function getWinners(session: GameSession): Player[] {
  const maxScore = Math.max(...Object.values(session.scores));
  return session.players.filter(p => session.scores[p.id] === maxScore);
}

export function getTotalScore(session: GameSession): number {
  return Object.values(session.scores).reduce((sum, s) => sum + s, 0);
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
