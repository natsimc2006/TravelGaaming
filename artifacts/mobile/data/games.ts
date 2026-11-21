import type { GameColorKey } from './gameColors';

export type GameSetting = 'Car' | 'Dinner' | 'Waiting' | 'Bedtime';
export type EnergyLevel = 'Calm' | 'Medium' | 'Chaotic';
export type HostType = 'App hosts' | 'Reader needed';

export interface GameMeta {
  id: string;
  name: string;
  description: string;
  /** One-line hook for cards — must fit on a single line. */
  hook: string;
  settings: GameSetting[];
  ageRange: string;
  minAge: number;
  energyLevel: EnergyLevel;
  hostType: HostType;
  estimatedRoundLength: string;
  estimatedMinutes: number;
  minPlayers: number;
  maxPlayers: number;
  soloSupported: boolean;
  addedAt: string;
  colorKey: GameColorKey;
  iconName: string;
}

export const GAMES: GameMeta[] = [
  {
    id: 'alphabet-showdown',
    name: 'Alphabet Showdown',
    description: 'Name something from the category that starts with the letter. Points for every valid answer.',
    hook: 'Beat the clock from A to Z.',
    settings: ['Car', 'Dinner', 'Waiting'],
    ageRange: '6+',
    minAge: 6,
    energyLevel: 'Medium',
    hostType: 'App hosts',
    estimatedRoundLength: '5–10 min',
    estimatedMinutes: 5,
    minPlayers: 2,
    maxPlayers: 8,
    soloSupported: true,
    addedAt: '2024-03-01',
    colorKey: 'alphabet',
    iconName: 'star',
  },
  {
    id: 'what-am-i',
    name: 'What Am I?',
    description: 'Clues are revealed one by one. Guess the mystery answer — fewer clues means more points.',
    hook: 'Fewer clues, more points.',
    settings: ['Car', 'Dinner', 'Bedtime', 'Waiting'],
    ageRange: '5+',
    minAge: 5,
    energyLevel: 'Calm',
    hostType: 'App hosts',
    estimatedRoundLength: '10–15 min',
    estimatedMinutes: 10,
    minPlayers: 2,
    maxPlayers: 10,
    soloSupported: true,
    addedAt: '2024-01-01',
    colorKey: 'whatAmI',
    iconName: 'help-circle',
  },
  {
    id: 'category-dash',
    name: 'Category Dash',
    description: 'One letter, five categories. Race to think of answers before anyone else does.',
    hook: 'One letter. Five categories. Go!',
    settings: ['Dinner', 'Waiting', 'Car'],
    ageRange: '8+',
    minAge: 8,
    energyLevel: 'Chaotic',
    hostType: 'App hosts',
    estimatedRoundLength: '10–20 min',
    estimatedMinutes: 10,
    minPlayers: 2,
    maxPlayers: 8,
    soloSupported: true,
    addedAt: '2024-06-01',
    colorKey: 'categoryDash',
    iconName: 'zap',
  },
  {
    id: 'forbidden-word',
    name: 'Forbidden Word',
    description: "Get your team to guess the word — without saying the forbidden words. A reader is needed.",
    hook: "Describe it. Don't say it.",
    settings: ['Dinner', 'Waiting'],
    ageRange: '8+',
    minAge: 8,
    energyLevel: 'Chaotic',
    hostType: 'Reader needed',
    estimatedRoundLength: '15–25 min',
    estimatedMinutes: 15,
    minPlayers: 3,
    maxPlayers: 10,
    soloSupported: false,
    addedAt: '2024-09-01',
    colorKey: 'forbiddenWord',
    iconName: 'slash',
  },
  {
    id: 'would-you-rather',
    name: 'Would You Rather',
    description: 'Two impossible choices. Everyone picks one and defends it. No wrong answers — only questionable ones.',
    hook: 'Pick one. Defend it.',
    settings: ['Car', 'Dinner', 'Waiting', 'Bedtime'],
    ageRange: '5+',
    minAge: 5,
    energyLevel: 'Calm',
    hostType: 'App hosts',
    estimatedRoundLength: '5–15 min',
    estimatedMinutes: 5,
    minPlayers: 1,
    maxPlayers: 10,
    soloSupported: true,
    addedAt: '2025-01-01',
    colorKey: 'wouldYouRather',
    iconName: 'git-branch',
  },
  {
    id: 'rapid-fire',
    name: 'Rapid Fire',
    description: 'Name as many as you can before the timer runs out. Fast, frantic, and surprisingly competitive.',
    hook: 'As many as you can, fast.',
    settings: ['Car', 'Dinner', 'Waiting'],
    ageRange: '5+',
    minAge: 5,
    energyLevel: 'Chaotic',
    hostType: 'App hosts',
    estimatedRoundLength: '5–10 min',
    estimatedMinutes: 5,
    minPlayers: 1,
    maxPlayers: 8,
    soloSupported: true,
    addedAt: '2025-01-01',
    colorKey: 'rapidFire',
    iconName: 'activity',
  },
  {
    id: 'guess-the-sound',
    name: 'Guess the Sound',
    description: 'A sound is described. First to guess what makes it wins the round.',
    hook: 'Guess what makes the noise.',
    settings: ['Car', 'Dinner', 'Waiting', 'Bedtime'],
    ageRange: '4+',
    minAge: 4,
    energyLevel: 'Calm',
    hostType: 'App hosts',
    estimatedRoundLength: '5–10 min',
    estimatedMinutes: 5,
    minPlayers: 1,
    maxPlayers: 10,
    soloSupported: true,
    addedAt: '2025-01-01',
    colorKey: 'guessTheSound',
    iconName: 'volume-2',
  },
  {
    id: 'this-or-that',
    name: 'This or That',
    description: 'Two options. No time to think. Just choose — and see if the family agrees.',
    hook: 'No thinking. Just choose.',
    settings: ['Car', 'Dinner', 'Waiting'],
    ageRange: '5+',
    minAge: 5,
    energyLevel: 'Medium',
    hostType: 'App hosts',
    estimatedRoundLength: '5–10 min',
    estimatedMinutes: 5,
    minPlayers: 1,
    maxPlayers: 10,
    soloSupported: true,
    addedAt: '2025-01-01',
    colorKey: 'thisOrThat',
    iconName: 'shuffle',
  },
  {
    id: 'riddles',
    name: 'Riddles',
    description: 'Classic riddles read aloud. Guess before anyone else — or stump the whole family.',
    hook: 'Stump the whole family.',
    settings: ['Car', 'Dinner', 'Waiting', 'Bedtime'],
    ageRange: '6+',
    minAge: 6,
    energyLevel: 'Calm',
    hostType: 'App hosts',
    estimatedRoundLength: '5–15 min',
    estimatedMinutes: 5,
    minPlayers: 1,
    maxPlayers: 10,
    soloSupported: true,
    addedAt: '2025-01-01',
    colorKey: 'riddles',
    iconName: 'cpu',
  },
];

export const GAME_PACK_PREVIEWS = [
  { id: 'road-trip', name: 'Road Trip Pack', description: '20 car-friendly games for long drives', icon: 'navigation', coming: true },
  { id: 'dinner-table', name: 'Dinner Table Pack', description: 'Perfect for family meals', icon: 'coffee', coming: true },
  { id: 'silly-kids', name: 'Silly Kids Pack', description: 'Maximum chaos, maximum fun', icon: 'smile', coming: true },
  { id: 'calm-bedtime', name: 'Calm Bedtime Pack', description: 'Wind-down games for tired families', icon: 'moon', coming: true },
  { id: 'big-family', name: 'Big Family Pack', description: 'Games for 6+ players', icon: 'users', coming: true },
];
