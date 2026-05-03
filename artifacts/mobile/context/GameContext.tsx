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
import { getSeenMap } from '@/utils/contentMemory';

interface GameContextValue {
  session: GameSession | null;
  startGame: (gameId: string, gameName: string, settings: GameSettings) => Promise<void>;
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
  selectWYROption: (opt: 'A' | 'B') => void;
  bumpTotStreak: () => void;
  addRapidFireCount: (playerId: string) => void;
}

const GameContext = createContext<GameContextValue | null>(null);

export function GameProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<GameSession | null>(null);

  const startGame = useCallback(async (gameId: string, gameName: string, settings: GameSettings) => {
    const seenMap = await getSeenMap();
    setSession(createSession(gameId, gameName, settings, seenMap));
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

  const selectWYROption = useCallback((opt: 'A' | 'B') => {
    setSession(prev => {
      if (!prev?.wouldYouRatherState) return prev;
      return { ...prev, wouldYouRatherState: { ...prev.wouldYouRatherState, selectedOption: opt } };
    });
  }, []);

  const bumpTotStreak = useCallback(() => {
    setSession(prev => {
      if (!prev?.thisOrThatState) return prev;
      const s = prev.thisOrThatState;
      const newStreak = s.streak + 1;
      return { ...prev, thisOrThatState: { ...s, streak: newStreak, bestStreak: Math.max(s.bestStreak, newStreak) } };
    });
  }, []);

  const addRapidFireCount = useCallback((playerId: string) => {
    setSession(prev => {
      if (!prev?.rapidFireState) return prev;
      const cur = prev.rapidFireState.playerAnswerCount[playerId] ?? 0;
      return {
        ...prev,
        rapidFireState: {
          ...prev.rapidFireState,
          playerAnswerCount: { ...prev.rapidFireState.playerAnswerCount, [playerId]: cur + 1 },
        },
        scores: { ...prev.scores, [playerId]: (prev.scores[playerId] ?? 0) + 1 },
      };
    });
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
      selectWYROption,
      bumpTotStreak,
      addRapidFireCount,
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
