export const GAME_COLORS = {
  alphabet: '#FF6B35',
  whatAmI: '#4ECDC4',
  categoryDash: '#A78BFA',
  forbiddenWord: '#F97316',
} as const;

export type GameColorKey = keyof typeof GAME_COLORS;
