import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@gamehost_prompt_memory';

export interface PromptRecord {
  lastSeenAt: number;
  timesSeen: number;
  lastGameId: string;
}

export type SeenMap = Record<string, PromptRecord>;

export async function getSeenMap(): Promise<SeenMap> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as SeenMap) : {};
  } catch {
    return {};
  }
}

export async function recordPromptSeen(promptId: string, gameId: string): Promise<void> {
  try {
    const map = await getSeenMap();
    const existing = map[promptId];
    map[promptId] = {
      lastSeenAt: Date.now(),
      timesSeen: (existing?.timesSeen ?? 0) + 1,
      lastGameId: gameId,
    };
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(map));
  } catch {
  }
}

export async function getPromptStats(promptId: string): Promise<PromptRecord | null> {
  const map = await getSeenMap();
  return map[promptId] ?? null;
}

export async function getAllSeenPrompts(): Promise<SeenMap> {
  return getSeenMap();
}
