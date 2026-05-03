import React, { createContext, useCallback, useContext, useState } from 'react';
import {
  GameSession,
  GameSettings,
  addScore,
  createSession,
  endGame,
  incrementSoloStreak,
  nextCategory,
  nextLetter,
  nextPlayer,
  nextRound,
  resetSoloStreak,
  revealNextClue,
} from '@/utils/gameEngine';

interface GameContextValue {
  session: GameSession | null;
  startGame: (gameId: string, gameName: string, settings: GameSettings) => void;
  addPlayerScore: (playerId: string, points: number) => void;
  advanceRound: () => void;
  advancePlayer: () => void;
  newLetter: () => void;
  newCategory: () => void;
  revealClue: () => void;
  finishGame: () => void;
  resetGame: () => void;
  bumpStreak: () => void;
  breakStreak: () => void;
}

const GameContext = createContext<GameContextValue | null>(null);

export function GameProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<GameSession | null>(null);

  const startGame = useCallback((gameId: string, gameName: string, settings: GameSettings) => {
    setSession(createSession(gameId, gameName, settings));
  }, []);

  const addPlayerScore = useCallback((playerId: string, points: number) => {
    setSession(prev => prev ? addScore(prev, playerId, points) : prev);
  }, []);

  const advanceRound = useCallback(() => {
    setSession(prev => prev ? nextRound(prev) : prev);
  }, []);

  const advancePlayer = useCallback(() => {
    setSession(prev => prev ? nextPlayer(prev) : prev);
  }, []);

  const newLetter = useCallback(() => {
    setSession(prev => prev ? nextLetter(prev) : prev);
  }, []);

  const newCategory = useCallback(() => {
    setSession(prev => prev ? nextCategory(prev) : prev);
  }, []);

  const revealClue = useCallback(() => {
    setSession(prev => prev ? revealNextClue(prev) : prev);
  }, []);

  const finishGame = useCallback(() => {
    setSession(prev => prev ? endGame(prev) : prev);
  }, []);

  const resetGame = useCallback(() => {
    setSession(null);
  }, []);

  const bumpStreak = useCallback(() => {
    setSession(prev => prev ? incrementSoloStreak(prev) : prev);
  }, []);

  const breakStreak = useCallback(() => {
    setSession(prev => prev ? resetSoloStreak(prev) : prev);
  }, []);

  return (
    <GameContext.Provider value={{
      session,
      startGame,
      addPlayerScore,
      advanceRound,
      advancePlayer,
      newLetter,
      newCategory,
      revealClue,
      finishGame,
      resetGame,
      bumpStreak,
      breakStreak,
    }}>
      {children}
    </GameContext.Provider>
  );
}

export function useGame(): GameContextValue {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGame must be used within GameProvider');
  return ctx;
}
