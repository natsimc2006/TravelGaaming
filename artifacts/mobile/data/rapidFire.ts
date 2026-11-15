import { filterByTier } from '@/utils/director';
import type { SeenMap } from '@/utils/contentMemory';
import { selectFreshPrompt } from '@/utils/freshPrompt';

export interface RapidFirePrompt {
  id: string;
  prompt: string;
  difficulty: 'easy' | 'medium' | 'hard';
  tags?: string[];
}

export const RAPID_FIRE_PROMPTS: RapidFirePrompt[] = [
  { id: 'rf1', prompt: 'Name 5 animals', difficulty: 'easy', tags: ['animals', 'kids'] },
  { id: 'rf2', prompt: 'Name 5 foods', difficulty: 'easy', tags: ['food', 'kids'] },
  { id: 'rf3', prompt: 'Name 5 things in a car', difficulty: 'easy', tags: ['car', 'everyday'] },
  { id: 'rf4', prompt: 'Name 5 colours', difficulty: 'easy', tags: ['colour', 'kids'] },
  { id: 'rf5', prompt: 'Name 5 things at school', difficulty: 'easy', tags: ['school', 'kids'] },
  { id: 'rf6', prompt: 'Name 5 sports', difficulty: 'easy', tags: ['sports', 'active'] },
  { id: 'rf7', prompt: 'Name 5 fruits', difficulty: 'easy', tags: ['food', 'healthy'] },
  { id: 'rf8', prompt: 'Name 5 countries', difficulty: 'medium', tags: ['geography', 'knowledge'] },
  { id: 'rf9', prompt: 'Name 5 things that are round', difficulty: 'easy', tags: ['shapes', 'everyday'] },
  { id: 'rf10', prompt: 'Name 5 things in a bedroom', difficulty: 'easy', tags: ['home', 'everyday'] },
  { id: 'rf11', prompt: 'Name 5 things at the beach', difficulty: 'easy', tags: ['beach', 'summer'] },
  { id: 'rf12', prompt: 'Name 5 sea creatures', difficulty: 'easy', tags: ['animals', 'ocean'] },
  { id: 'rf13', prompt: 'Name 5 types of transport', difficulty: 'easy', tags: ['transport', 'everyday'] },
  { id: 'rf14', prompt: 'Name 5 jobs', difficulty: 'easy', tags: ['jobs', 'everyday'] },
  { id: 'rf15', prompt: 'Name 5 famous people', difficulty: 'medium', tags: ['famous', 'knowledge'] },
  { id: 'rf16', prompt: 'Name 5 types of weather', difficulty: 'easy', tags: ['weather', 'nature'] },
  { id: 'rf17', prompt: 'Name 5 things that fly', difficulty: 'easy', tags: ['flying', 'nature'] },
  { id: 'rf18', prompt: 'Name 5 musical instruments', difficulty: 'easy', tags: ['music', 'arts'] },
  { id: 'rf19', prompt: 'Name 5 things in a kitchen', difficulty: 'easy', tags: ['home', 'food'] },
  { id: 'rf20', prompt: 'Name 5 things that are hot', difficulty: 'easy', tags: ['temperature', 'everyday'] },
  { id: 'rf21', prompt: 'Name 5 superheroes', difficulty: 'easy', tags: ['superheroes', 'movies'] },
  { id: 'rf22', prompt: 'Name 5 dinosaurs', difficulty: 'medium', tags: ['science', 'history'] },
  { id: 'rf23', prompt: 'Name 5 things that are sticky', difficulty: 'easy', tags: ['texture', 'funny'] },
  { id: 'rf24', prompt: 'Name 5 Australian animals', difficulty: 'easy', tags: ['animals', 'australia'] },
  { id: 'rf25', prompt: 'Name 5 things you do before breakfast', difficulty: 'easy', tags: ['daily', 'routine'] },
  { id: 'rf90', prompt: 'Name 5 words that rhyme with "cat"', difficulty: 'medium' },
  { id: 'rf91', prompt: 'Name 5 things with wheels that are not cars', difficulty: 'medium' },
  { id: 'rf92', prompt: 'Name 5 animals with more than four legs', difficulty: 'hard' },
  { id: 'rf93', prompt: 'Name 5 countries that start with a vowel', difficulty: 'hard' },
  { id: 'rf94', prompt: 'Name 5 things you can fold', difficulty: 'medium' },
  { id: 'rf95', prompt: 'Name 5 words that start and end with the same letter', difficulty: 'hard' },
  { id: 'rf96', prompt: 'Name 5 things you can only do once', difficulty: 'hard' },
  { id: 'rf97', prompt: 'Name 5 things that come in pairs', difficulty: 'medium' },
  { id: 'rf98', prompt: 'Name 5 jobs that start with the letter T', difficulty: 'hard' },
  { id: 'rf99', prompt: 'Name 5 things that are both round and edible', difficulty: 'medium' },
];

export function getRandomRapidFirePrompt(
  usedIds: string[],
  difficulty?: 'easy' | 'medium' | 'hard',
  seenMap?: SeenMap,
): RapidFirePrompt {
  let pool = filterByTier(RAPID_FIRE_PROMPTS.filter(p => !usedIds.includes(p.id)), difficulty);
  if (pool.length === 0) pool = RAPID_FIRE_PROMPTS;
  if (seenMap) return selectFreshPrompt(pool, usedIds, seenMap);
  return pool[Math.floor(Math.random() * pool.length)];
}
