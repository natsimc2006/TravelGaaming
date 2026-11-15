import { filterByTier } from '@/utils/director';
import { isAnswerMatch } from '@/utils/answerMatch';
import type { SeenMap } from '@/utils/contentMemory';
import { selectFreshPrompt } from '@/utils/freshPrompt';

export interface SoundItem {
  id: string;
  soundText: string;
  answer: string;
  acceptedAnswers: string[];
  difficulty: 'easy' | 'medium' | 'hard';
  category?: string;
  tags?: string[];
}

export const SOUND_ITEMS: SoundItem[] = [
  { id: 'gs1', soundText: 'Moo', answer: 'Cow', acceptedAnswers: ['cow'], difficulty: 'easy', category: 'Animals', tags: ['animals', 'farm'] },
  { id: 'gs2', soundText: 'Woof woof', answer: 'Dog', acceptedAnswers: ['dog', 'puppy', 'doggy'], difficulty: 'easy', category: 'Animals', tags: ['animals', 'pets'] },
  { id: 'gs3', soundText: 'Meow', answer: 'Cat', acceptedAnswers: ['cat', 'kitten', 'kitty'], difficulty: 'easy', category: 'Animals', tags: ['animals', 'pets'] },
  { id: 'gs4', soundText: 'Vroom vroom', answer: 'Car', acceptedAnswers: ['car', 'vehicle', 'engine'], difficulty: 'easy', category: 'Vehicles', tags: ['vehicles', 'transport'] },
  { id: 'gs5', soundText: 'Tick… tock… tick… tock…', answer: 'Clock', acceptedAnswers: ['clock', 'watch', 'timer'], difficulty: 'easy', category: 'Objects', tags: ['time', 'everyday'] },
  { id: 'gs6', soundText: 'Drip… drip… drip…', answer: 'Tap / Dripping water', acceptedAnswers: ['tap', 'dripping', 'water', 'faucet', 'leaking tap'], difficulty: 'easy', category: 'Home', tags: ['home', 'water'] },
  { id: 'gs7', soundText: 'Beep beep beep!', answer: 'Alarm / Microwave', acceptedAnswers: ['alarm', 'microwave', 'timer', 'alarm clock', 'beeper'], difficulty: 'easy', category: 'Home', tags: ['home', 'kitchen'] },
  { id: 'gs8', soundText: 'Buzz buzz buzz', answer: 'Bee', acceptedAnswers: ['bee', 'bees', 'wasp', 'insect'], difficulty: 'easy', category: 'Animals', tags: ['animals', 'insects'] },
  { id: 'gs9', soundText: 'Choo choo!', answer: 'Train', acceptedAnswers: ['train', 'steam train', 'locomotive'], difficulty: 'easy', category: 'Vehicles', tags: ['vehicles', 'transport'] },
  { id: 'gs10', soundText: 'Achoo!', answer: 'Sneeze', acceptedAnswers: ['sneeze', 'sneezing', 'sneezing sound'], difficulty: 'easy', category: 'Body', tags: ['body', 'health'] },
  { id: 'gs11', soundText: 'Splash!', answer: 'Water / Diving', acceptedAnswers: ['water', 'splash', 'diving', 'jumping in pool', 'pool'], difficulty: 'easy', category: 'Water', tags: ['water', 'swimming'] },
  { id: 'gs12', soundText: 'Ribbit ribbit', answer: 'Frog', acceptedAnswers: ['frog', 'froggy'], difficulty: 'easy', category: 'Animals', tags: ['animals', 'nature'] },
  { id: 'gs13', soundText: 'Snap! Crackle! Pop!', answer: 'Cereal / Fire', acceptedAnswers: ['cereal', 'rice bubbles', 'fire', 'campfire', 'breakfast cereal'], difficulty: 'medium', category: 'Food', tags: ['food', 'breakfast'] },
  { id: 'gs14', soundText: 'Clip clop clip clop', answer: 'Horse', acceptedAnswers: ['horse', 'pony', 'horses hooves'], difficulty: 'easy', category: 'Animals', tags: ['animals', 'farm'] },
  { id: 'gs15', soundText: 'Ding dong!', answer: 'Doorbell', acceptedAnswers: ['doorbell', 'bell', 'door bell'], difficulty: 'easy', category: 'Home', tags: ['home', 'everyday'] },
  { id: 'gs16', soundText: 'Ssssss…', answer: 'Snake', acceptedAnswers: ['snake', 'serpent', 'hissing'], difficulty: 'easy', category: 'Animals', tags: ['animals', 'reptiles'] },
  { id: 'gs17', soundText: 'Whoosh!', answer: 'Wind / Aeroplane', acceptedAnswers: ['wind', 'aeroplane', 'airplane', 'jet', 'fast car', 'breeze'], difficulty: 'medium', category: 'Weather', tags: ['weather', 'transport'] },
  { id: 'gs18', soundText: 'Hoot hoot', answer: 'Owl', acceptedAnswers: ['owl', 'owlet'], difficulty: 'easy', category: 'Animals', tags: ['animals', 'birds'] },
  { id: 'gs19', soundText: 'Roar!', answer: 'Lion / Tiger', acceptedAnswers: ['lion', 'tiger', 'dinosaur', 't-rex', 'bear', 'beast'], difficulty: 'easy', category: 'Animals', tags: ['animals', 'wild'] },
  { id: 'gs20', soundText: 'Ka-ching!', answer: 'Cash register / Money', acceptedAnswers: ['cash register', 'till', 'money', 'register', 'checkout'], difficulty: 'medium', category: 'Shopping', tags: ['shopping', 'money'] },
  { id: 'gs90', soundText: 'Tick-tock, tick-tock', answer: 'Clock', acceptedAnswers: ['clock', 'watch', 'a clock'], difficulty: 'medium', category: 'Household' },
  { id: 'gs91', soundText: 'Drip… drip… drip…', answer: 'Tap', acceptedAnswers: ['tap', 'leaky tap', 'faucet', 'dripping tap', 'rain'], difficulty: 'medium', category: 'Household' },
  { id: 'gs92', soundText: 'Whoosh… then a loud POP!', answer: 'Balloon', acceptedAnswers: ['balloon', 'popping balloon', 'a balloon'], difficulty: 'medium', category: 'Fun' },
  { id: 'gs93', soundText: 'Rumble, rumble, CRACK!', answer: 'Thunder', acceptedAnswers: ['thunder', 'thunderstorm', 'storm'], difficulty: 'medium', category: 'Nature' },
  { id: 'gs94', soundText: 'Click-clack, click-clack, ding!', answer: 'Typewriter', acceptedAnswers: ['typewriter', 'a typewriter'], difficulty: 'hard', category: 'Objects' },
  { id: 'gs95', soundText: 'Whirrrr… then a gentle chug-chug-chug', answer: 'Washing machine', acceptedAnswers: ['washing machine', 'washer', 'a washing machine'], difficulty: 'medium', category: 'Household' },
  { id: 'gs96', soundText: 'Hoo-hoo… hoo-hoo… (at night)', answer: 'Owl', acceptedAnswers: ['owl', 'an owl'], difficulty: 'medium', category: 'Animals' },
  { id: 'gs97', soundText: 'A long, low, rumbling CHOO-CHOO with a whistle', answer: 'Steam train', acceptedAnswers: ['steam train', 'train', 'a train'], difficulty: 'hard', category: 'Vehicles' },
  { id: 'gs98', soundText: 'Crunch… crunch… crunch… (in the snow)', answer: 'Footsteps in snow', acceptedAnswers: ['footsteps', 'walking in snow', 'walking', 'snow', 'footsteps in snow'], difficulty: 'hard', category: 'Nature' },
];

export function getRandomSoundItem(
  usedIds: string[],
  difficulty?: 'easy' | 'medium' | 'hard',
  seenMap?: SeenMap,
): SoundItem {
  let pool = filterByTier(SOUND_ITEMS.filter(i => !usedIds.includes(i.id)), difficulty);
  if (pool.length === 0) pool = SOUND_ITEMS;
  if (seenMap) return selectFreshPrompt(pool, usedIds, seenMap);
  return pool[Math.floor(Math.random() * pool.length)];
}

export function checkSoundAnswer(userAnswer: string, item: SoundItem): boolean {
  return isAnswerMatch(userAnswer, [item.answer, ...item.acceptedAnswers]);
}
