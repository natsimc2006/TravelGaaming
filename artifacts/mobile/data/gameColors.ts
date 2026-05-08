export const GAME_COLORS = {
  alphabet: '#D95F2B',      // coral-amber — matches new primary
  whatAmI: '#2DAAA0',       // teal
  categoryDash: '#7C5CDB',  // violet
  forbiddenWord: '#E8A820', // amber
  wouldYouRather: '#E8325A', // rose
  rapidFire: '#15A876',     // emerald
  guessTheSound: '#3568F0', // royal blue
  thisOrThat: '#3568F0',    // royal blue
  riddles: '#7C5CDB',       // violet
} as const;

export type GameColorKey = keyof typeof GAME_COLORS;
