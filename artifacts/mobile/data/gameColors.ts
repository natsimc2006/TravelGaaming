export const GAME_COLORS = {
  alphabet: '#F26B38',
  whatAmI: '#18A39A',
  categoryDash: '#7A5AF0',
  forbiddenWord: '#E3A008',
  wouldYouRather: '#E8457E',
  rapidFire: '#2DB872',
  guessTheSound: '#2F7DF0',
  thisOrThat: '#12A9D8',
  riddles: '#A24CC8',
} as const;

/** Darker shade of each game colour — used for the chunky "3D" button edge and glyph shadows. */
export const GAME_COLORS_DEEP = {
  alphabet: '#C24A1A',
  whatAmI: '#0E7A73',
  categoryDash: '#5436C4',
  forbiddenWord: '#A87000',
  wouldYouRather: '#B52A5C',
  rapidFire: '#1B8A52',
  guessTheSound: '#1A56B8',
  thisOrThat: '#0A7FA3',
  riddles: '#7B2F9C',
} as const;

export type GameColorKey = keyof typeof GAME_COLORS;
