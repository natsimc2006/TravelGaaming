export const GAME_COLORS = {
  alphabet: '#FF6B35',
  whatAmI: '#4ECDC4',
  categoryDash: '#A78BFA',
  forbiddenWord: '#F97316',
  wouldYouRather: '#F43F5E',
  rapidFire: '#EF4444',
  guessTheSound: '#10B981',
  thisOrThat: '#3B82F6',
  riddles: '#A855F7',
} as const;

export type GameColorKey = keyof typeof GAME_COLORS;
