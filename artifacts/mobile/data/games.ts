import type { GameColorKey } from './gameColors';

export type GameSetting = 'Car' | 'Dinner' | 'Waiting' | 'Bedtime';
export type EnergyLevel = 'Calm' | 'Medium' | 'Chaotic';
export type HostType = 'App hosts' | 'Reader needed';

export interface GameMeta {
  id: string;
  name: string;
  description: string;
  settings: GameSetting[];
  ageRange: string;
  minAge: number;
  energyLevel: EnergyLevel;
  hostType: HostType;
  estimatedRoundLength: string;
  minPlayers: number;
  maxPlayers: number;
  colorKey: GameColorKey;
  iconName: string;
}

export const GAMES: GameMeta[] = [
  {
    id: 'alphabet-showdown',
    name: 'Alphabet Showdown',
    description: 'Name something from the category that starts with the letter. Points for every valid answer.',
    settings: ['Car', 'Dinner', 'Waiting'],
    ageRange: '6+',
    minAge: 6,
    energyLevel: 'Medium',
    hostType: 'App hosts',
    estimatedRoundLength: '5–10 min',
    minPlayers: 2,
    maxPlayers: 8,
    colorKey: 'alphabet',
    iconName: 'star',
  },
  {
    id: 'what-am-i',
    name: 'What Am I?',
    description: 'Clues are revealed one by one. Guess the mystery answer — fewer clues means more points.',
    settings: ['Car', 'Dinner', 'Bedtime', 'Waiting'],
    ageRange: '5+',
    minAge: 5,
    energyLevel: 'Calm',
    hostType: 'App hosts',
    estimatedRoundLength: '10–15 min',
    minPlayers: 2,
    maxPlayers: 10,
    colorKey: 'whatAmI',
    iconName: 'help-circle',
  },
  {
    id: 'category-dash',
    name: 'Category Dash',
    description: 'One letter, five categories. Race to think of answers before anyone else does.',
    settings: ['Dinner', 'Waiting', 'Car'],
    ageRange: '8+',
    minAge: 8,
    energyLevel: 'Chaotic',
    hostType: 'App hosts',
    estimatedRoundLength: '10–20 min',
    minPlayers: 2,
    maxPlayers: 8,
    colorKey: 'categoryDash',
    iconName: 'zap',
  },
  {
    id: 'forbidden-word',
    name: 'Forbidden Word',
    description: "Get your team to guess the word — without saying the forbidden words. A reader is needed.",
    settings: ['Dinner', 'Waiting'],
    ageRange: '8+',
    minAge: 8,
    energyLevel: 'Chaotic',
    hostType: 'Reader needed',
    estimatedRoundLength: '15–25 min',
    minPlayers: 3,
    maxPlayers: 10,
    colorKey: 'forbiddenWord',
    iconName: 'slash',
  },
];

export const GAME_PACK_PREVIEWS = [
  { id: 'road-trip', name: 'Road Trip Pack', description: '20 car-friendly games for long drives', icon: 'navigation', coming: true },
  { id: 'dinner-table', name: 'Dinner Table Pack', description: 'Perfect for family meals', icon: 'coffee', coming: true },
  { id: 'silly-kids', name: 'Silly Kids Pack', description: 'Maximum chaos, maximum fun', icon: 'smile', coming: true },
  { id: 'calm-bedtime', name: 'Calm Bedtime Pack', description: 'Wind-down games for tired families', icon: 'moon', coming: true },
  { id: 'big-family', name: 'Big Family Pack', description: 'Games for 6+ players', icon: 'users', coming: true },
];
