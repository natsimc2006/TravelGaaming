import type { SeenMap } from '@/utils/contentMemory';
import { selectFreshPrompt } from '@/utils/freshPrompt';

export interface Riddle {
  id: string;
  question: string;
  answer: string;
  acceptedAnswers: string[];
  difficulty: 'easy' | 'medium' | 'hard';
  category?: string;
  tags?: string[];
}

export const RIDDLES: Riddle[] = [
  { id: 'rd1', question: 'I have keys but no locks. I have space but no room. You can enter but cannot go inside. What am I?', answer: 'Keyboard', acceptedAnswers: ['keyboard', 'a keyboard'], difficulty: 'medium', category: 'Objects', tags: ['tech', 'everyday'] },
  { id: 'rd2', question: 'The more you take, the more you leave behind. What am I?', answer: 'Footsteps', acceptedAnswers: ['footsteps', 'steps', 'footprints', 'footstep'], difficulty: 'medium', category: 'Nature', tags: ['riddle classic', 'thinking'] },
  { id: 'rd3', question: 'I have a head and a tail, but no body. What am I?', answer: 'Coin', acceptedAnswers: ['coin', 'a coin'], difficulty: 'easy', category: 'Objects', tags: ['money', 'everyday'] },
  { id: 'rd4', question: 'I speak without a mouth and hear without ears. I have no body, but I come alive with wind. What am I?', answer: 'Echo', acceptedAnswers: ['echo', 'an echo'], difficulty: 'hard', category: 'Nature', tags: ['nature', 'sound'] },
  { id: 'rd5', question: 'What has hands but cannot clap?', answer: 'Clock', acceptedAnswers: ['clock', 'a clock', 'watch', 'a watch'], difficulty: 'easy', category: 'Objects', tags: ['time', 'everyday'] },
  { id: 'rd6', question: 'I am light as a feather, but the strongest person cannot hold me for more than five minutes. What am I?', answer: 'Breath', acceptedAnswers: ['breath', 'air', 'breathing'], difficulty: 'medium', category: 'Body', tags: ['body', 'thinking'] },
  { id: 'rd7', question: 'I get wetter the more I dry. What am I?', answer: 'Towel', acceptedAnswers: ['towel', 'a towel'], difficulty: 'easy', category: 'Home', tags: ['home', 'everyday'] },
  { id: 'rd8', question: 'I have cities but no houses live in them. I have mountains but no trees grow on them. I have water but no fish swim in it. What am I?', answer: 'Map', acceptedAnswers: ['map', 'a map'], difficulty: 'medium', category: 'Objects', tags: ['geography', 'thinking'] },
  { id: 'rd9', question: 'What can travel around the world without moving?', answer: 'Stamp', acceptedAnswers: ['stamp', 'a stamp', 'postage stamp'], difficulty: 'medium', category: 'Objects', tags: ['travel', 'post'] },
  { id: 'rd10', question: 'I have one eye but cannot see. What am I?', answer: 'Needle', acceptedAnswers: ['needle', 'a needle', 'sewing needle'], difficulty: 'medium', category: 'Objects', tags: ['everyday', 'sewing'] },
  { id: 'rd11', question: 'What has teeth but cannot bite?', answer: 'Comb', acceptedAnswers: ['comb', 'a comb', 'saw', 'a saw', 'gear'], difficulty: 'easy', category: 'Objects', tags: ['everyday', 'grooming'] },
  { id: 'rd12', question: 'What goes up but never comes down?', answer: 'Your age', acceptedAnswers: ['your age', 'age', 'how old you are', 'years old'], difficulty: 'easy', category: 'Life', tags: ['life', 'thinking'] },
  { id: 'rd13', question: 'What has a bottom at the top?', answer: 'Legs', acceptedAnswers: ['legs', 'your legs', 'a leg', 'trousers', 'pants'], difficulty: 'easy', category: 'Body', tags: ['body', 'funny'] },
  { id: 'rd14', question: 'What is full of holes but still holds water?', answer: 'Sponge', acceptedAnswers: ['sponge', 'a sponge'], difficulty: 'easy', category: 'Home', tags: ['home', 'everyday'] },
  { id: 'rd15', question: 'I come once in a minute, twice in a moment, but never in a thousand years. What am I?', answer: 'The letter M', acceptedAnswers: ['the letter m', 'm', 'letter m'], difficulty: 'hard', category: 'Language', tags: ['language', 'letters'] },
  { id: 'rd16', question: 'What has a face and two hands but no arms or legs?', answer: 'Clock', acceptedAnswers: ['clock', 'a clock', 'watch', 'a watch'], difficulty: 'easy', category: 'Objects', tags: ['time', 'everyday'] },
  { id: 'rd17', question: 'What runs but never walks, has a mouth but never talks, has a head but never weeps, has a bed but never sleeps?', answer: 'River', acceptedAnswers: ['river', 'a river', 'stream', 'creek'], difficulty: 'medium', category: 'Nature', tags: ['nature', 'water'] },
  { id: 'rd18', question: 'What can you catch but not throw?', answer: 'Cold', acceptedAnswers: ['a cold', 'cold', 'sickness', 'the flu'], difficulty: 'easy', category: 'Health', tags: ['health', 'body'] },
  { id: 'rd19', question: 'What goes up when rain comes down?', answer: 'Umbrella', acceptedAnswers: ['umbrella', 'an umbrella', 'brolly'], difficulty: 'easy', category: 'Weather', tags: ['weather', 'everyday'] },
  { id: 'rd20', question: 'What has a ring but no finger?', answer: 'Phone', acceptedAnswers: ['phone', 'a phone', 'telephone', 'mobile'], difficulty: 'easy', category: 'Tech', tags: ['tech', 'everyday'] },
  { id: 'rd21', question: 'I am not alive, but I grow. I do not have lungs, but I need air. What am I?', answer: 'Fire', acceptedAnswers: ['fire', 'flame', 'a fire'], difficulty: 'medium', category: 'Nature', tags: ['nature', 'science'] },
  { id: 'rd22', question: 'What building has the most stories?', answer: 'A library', acceptedAnswers: ['library', 'a library'], difficulty: 'easy', category: 'Wordplay', tags: ['wordplay', 'funny'] },
  { id: 'rd23', question: 'What has four legs in the morning, two legs at noon, and three legs in the evening?', answer: 'Human', acceptedAnswers: ['human', 'a human', 'person', 'man', 'people'], difficulty: 'hard', category: 'Life', tags: ['classic', 'philosophy'] },
  { id: 'rd24', question: 'What is always in front of you but cannot be seen?', answer: 'The future', acceptedAnswers: ['the future', 'future', 'tomorrow'], difficulty: 'medium', category: 'Life', tags: ['life', 'thinking'] },
  { id: 'rd25', question: 'I have no legs but I always run. I have no mouth but the news I always tell. What am I?', answer: 'Watch / Clock', acceptedAnswers: ['watch', 'clock', 'a watch', 'a clock', 'timer'], difficulty: 'medium', category: 'Objects', tags: ['time', 'everyday'] },
];

export function getRandomRiddle(
  usedIds: string[],
  difficulty?: 'easy' | 'medium' | 'hard',
  seenMap?: SeenMap,
): Riddle {
  let pool = RIDDLES.filter(r => !usedIds.includes(r.id));
  if (difficulty) {
    const filtered = pool.filter(r => r.difficulty === difficulty || r.difficulty === 'easy');
    if (filtered.length > 0) pool = filtered;
  }
  if (pool.length === 0) pool = RIDDLES;
  if (seenMap) return selectFreshPrompt(pool, usedIds, seenMap);
  return pool[Math.floor(Math.random() * pool.length)];
}

export function checkRiddleAnswer(userAnswer: string, riddle: Riddle): boolean {
  const normalised = userAnswer.toLowerCase().trim().replace(/[^a-z0-9\s]/g, '');
  return riddle.acceptedAnswers.some(a => {
    const normA = a.toLowerCase().replace(/[^a-z0-9\s]/g, '');
    return normA === normalised || normalised.includes(normA) || normA.includes(normalised);
  });
}
