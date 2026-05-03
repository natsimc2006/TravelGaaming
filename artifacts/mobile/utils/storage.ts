import AsyncStorage from '@react-native-async-storage/async-storage';

const KEYS = {
  PLAYER_NAMES: 'gamehost_player_names',
  AGE_RANGE: 'gamehost_age_range',
  SOUND_ON: 'gamehost_sound_on',
  VOICE_ON: 'gamehost_voice_on',
  RECENT_GAMES: 'gamehost_recent_games',
};

export interface SavedSettings {
  playerNames: string[];
  ageRange: 'easy' | 'mixed' | 'all';
  soundOn: boolean;
  voiceOn: boolean;
}

const DEFAULT_SETTINGS: SavedSettings = {
  playerNames: [],
  ageRange: 'mixed',
  soundOn: true,
  voiceOn: false,
};

export async function loadSettings(): Promise<SavedSettings> {
  try {
    const [names, ageRange, sound, voice] = await Promise.all([
      AsyncStorage.getItem(KEYS.PLAYER_NAMES),
      AsyncStorage.getItem(KEYS.AGE_RANGE),
      AsyncStorage.getItem(KEYS.SOUND_ON),
      AsyncStorage.getItem(KEYS.VOICE_ON),
    ]);
    return {
      playerNames: names ? JSON.parse(names) : DEFAULT_SETTINGS.playerNames,
      ageRange: (ageRange as SavedSettings['ageRange']) ?? DEFAULT_SETTINGS.ageRange,
      soundOn: sound !== null ? JSON.parse(sound) : DEFAULT_SETTINGS.soundOn,
      voiceOn: voice !== null ? JSON.parse(voice) : DEFAULT_SETTINGS.voiceOn,
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export async function savePlayerNames(names: string[]): Promise<void> {
  try {
    await AsyncStorage.setItem(KEYS.PLAYER_NAMES, JSON.stringify(names));
  } catch {}
}

export async function saveAgeRange(range: SavedSettings['ageRange']): Promise<void> {
  try {
    await AsyncStorage.setItem(KEYS.AGE_RANGE, range);
  } catch {}
}

export async function saveVoiceOn(value: boolean): Promise<void> {
  try {
    await AsyncStorage.setItem(KEYS.VOICE_ON, JSON.stringify(value));
  } catch {}
}

export async function saveRecentGame(gameId: string): Promise<void> {
  try {
    const raw = await AsyncStorage.getItem(KEYS.RECENT_GAMES);
    const recent: string[] = raw ? JSON.parse(raw) : [];
    const updated = [gameId, ...recent.filter(g => g !== gameId)].slice(0, 5);
    await AsyncStorage.setItem(KEYS.RECENT_GAMES, JSON.stringify(updated));
  } catch {}
}

export async function loadRecentGames(): Promise<string[]> {
  try {
    const raw = await AsyncStorage.getItem(KEYS.RECENT_GAMES);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}
