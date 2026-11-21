/** Game colours are slightly warmed/muted so they sit comfortably on the cream background. */
export const GAME_COLORS = {
  alphabet: '#F26B38',
  whatAmI: '#18A39A',
  categoryDash: '#6B54D2',
  forbiddenWord: '#E3A008',
  wouldYouRather: '#E8457E',
  rapidFire: '#2DB872',
  guessTheSound: '#3577D4',
  thisOrThat: '#1C9AC0',
  riddles: '#A24CC8',
} as const;

/** Darker shade of each game colour — used for the chunky "3D" button edge and glyph shadows. */
export const GAME_COLORS_DEEP = {
  alphabet: '#C24A1A',
  whatAmI: '#0E7A73',
  categoryDash: '#4A379E',
  forbiddenWord: '#A87000',
  wouldYouRather: '#B52A5C',
  rapidFire: '#1B8A52',
  guessTheSound: '#22559E',
  thisOrThat: '#13708F',
  riddles: '#7B2F9C',
} as const;

export type GameColorKey = keyof typeof GAME_COLORS;
