const colors = {
  light: {
    text: '#2A2350',
    tint: '#F26B38',

    // Backgrounds
    background: '#FCF8F2',      // softer, less yellow cream — lets colour accents breathe
    foreground: '#2A2350',      // deep indigo ink

    card: '#FFFFFF',
    cardForeground: '#2A2350',

    // Primary — richer coral-amber
    primary: '#F26B38',
    primaryForeground: '#FFFFFF',
    primaryDark: '#C94E1F',
    primaryMid: '#F57D4D',      // midpoint for gradients
    primarySoft: '#FFE6D8',
    primaryText: '#B84716',     // orange for small text/links — passes WCAG AA on cream

    // Secondary — teal
    secondary: '#18A39A',
    secondaryForeground: '#FFFFFF',
    secondaryDark: '#0F7C75',
    secondarySoft: '#D6F3F0',

    accent: '#FFEBB8',
    accentForeground: '#2A2350',

    // Surfaces
    muted: '#F3EDE4',           // warm tinted surface
    mutedForeground: '#5A5378', // darker so body text reads clearly on cream
    surfaceWarm: '#F8F1E6',
    surfaceTint: '#EFE7DA',

    // Borders
    border: '#ECE5DA',          // quieter — prefer shadow over outlines
    borderMedium: '#D4C9BC',
    borderStrong: '#C2B5A5',
    input: '#EADFCB',

    // Semantic
    navy: '#2A2350',
    destructive: '#EF3F3F',
    destructiveForeground: '#FFFFFF',
    success: '#17B883',
    warning: '#F7B731',

    shadow: 'rgba(42, 35, 80, 0.12)',

    // Soft accent aliases
    softOrange: '#FCEADE',
    softTeal: '#DAF4F2',
    softLavender: '#EAE5FF',
    softYellow: '#FFF5CC',
    softGreen: '#D0F5EA',
    softPeach: '#FFE5D6',
    softRose: '#FFE0E8',
    softBlue: '#DAE7FF',
    softPurple: '#EAE5FF',
    creamCard: '#FAF8F5',

    // Named accents
    lilac: '#7C5CDB',
    blue: '#3568F0',
    green: '#15A876',
    rose: '#E8325A',
    amber: '#E8A820',

    premiumInk: '#2A2350',
    premiumLilac: '#7C5CDB',
    premiumBlue: '#3568F0',
    premiumGreen: '#15A876',
    premiumRose: '#E8325A',
    premiumAmber: '#E8A820',

    // Game icon tile colours — vivid, used only on 48–52px tiles
    gameAlphabet: '#F26B38',
    gameWhatAmI: '#18A39A',
    gameCategoryDash: '#6B54D2',
    gameForbiddenWord: '#E3A008',
    gameWouldYouRather: '#E8457E',
    gameRapidFire: '#2DB872',
    gameGuessTheSound: '#3577D4',
    gameThisOrThat: '#1C9AC0',
    gameRiddles: '#A24CC8',

    // Soft tones — lightly tinted chip backgrounds
    gameSoftAlphabet: '#FFE6D8',
    gameSoftWhatAmI: '#D6F3F0',
    gameSoftCategoryDash: '#E8E1FF',
    gameSoftForbiddenWord: '#FFF0C2',
    gameSoftWouldYouRather: '#FFDEEA',
    gameSoftRapidFire: '#D4F5E4',
    gameSoftGuessTheSound: '#DBE9FF',
    gameSoftThisOrThat: '#D3F1FA',
    gameSoftRiddles: '#F1DFFA',

    // Situation colour tokens
    car: '#3568F0',
    dinner: '#15A876',
    waiting: '#E8A820',
    bedtime: '#7C5CDB',

    // Timer states
    timerNormal: '#18A39A',
    timerWarning: '#E8A820',
    timerDanger: '#EF3F3F',
  },
  radius: 20,
};

export default colors;
