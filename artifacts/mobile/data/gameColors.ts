/**
 * Game UI colours (headers, Play buttons, timers). Deliberately only three tones —
 * coral, lagoon teal and sea — so the app reads as one palette, not a rainbow.
 * Games are told apart by their sticker, not their colour.
 */
export const GAME_COLORS = {
  alphabet: '#D45A3E',
  whatAmI: '#2F8C7E',
  categoryDash: '#1D5C78',
  forbiddenWord: '#D45A3E',
  wouldYouRather: '#2F8C7E',
  rapidFire: '#1D5C78',
  guessTheSound: '#D45A3E',
  thisOrThat: '#2F8C7E',
  riddles: '#1D5C78',
} as const;

/** Darker shade of each game colour — the chunky "3D" button lip. */
export const GAME_COLORS_DEEP = {
  alphabet: '#A9432C',
  whatAmI: '#1F6B60',
  categoryDash: '#123E52',
  forbiddenWord: '#A9432C',
  wouldYouRather: '#1F6B60',
  rapidFire: '#123E52',
  guessTheSound: '#A9432C',
  thisOrThat: '#1F6B60',
  riddles: '#123E52',
} as const;

/** Sticker fills — the only place sunshine and lagoon appear as big shapes. */
export const STICKER_FILL = {
  alphabet: { bg: '#D45A3E', fg: '#FFFFFF' },
  whatAmI: { bg: '#9ED3D6', fg: '#1B2A33' },
  categoryDash: { bg: '#F2B84B', fg: '#1B2A33' },
  forbiddenWord: { bg: '#1D5C78', fg: '#FFFFFF' },
  wouldYouRather: { bg: '#D45A3E', fg: '#FFFFFF' },
  rapidFire: { bg: '#2F8C7E', fg: '#FFFFFF' },
  guessTheSound: { bg: '#F2B84B', fg: '#1B2A33' },
  thisOrThat: { bg: '#9ED3D6', fg: '#1B2A33' },
  riddles: { bg: '#1D5C78', fg: '#FFFFFF' },
} as const;

export type GameColorKey = keyof typeof GAME_COLORS;
