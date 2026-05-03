import type { SeenMap } from '@/utils/contentMemory';
import { selectFreshPrompt } from '@/utils/freshPrompt';

export interface ThisOrThatCard {
  id: string;
  optionA: string;
  optionB: string;
  category?: string;
  tags?: string[];
}

export const THIS_OR_THAT_CARDS: ThisOrThatCard[] = [
  { id: 'tot1', optionA: 'Cats', optionB: 'Dogs', category: 'Animals', tags: ['animals', 'pets'] },
  { id: 'tot2', optionA: 'Pizza', optionB: 'Burgers', category: 'Food', tags: ['food', 'fast food'] },
  { id: 'tot3', optionA: 'Beach', optionB: 'Pool', category: 'Places', tags: ['summer', 'water'] },
  { id: 'tot4', optionA: 'Mountains', optionB: 'Desert', category: 'Nature', tags: ['nature', 'adventure'] },
  { id: 'tot5', optionA: 'Morning person', optionB: 'Night owl', category: 'Lifestyle', tags: ['lifestyle', 'habits'] },
  { id: 'tot6', optionA: 'Hot chocolate', optionB: 'Milkshake', category: 'Food', tags: ['drinks', 'food'] },
  { id: 'tot7', optionA: 'Summer', optionB: 'Winter', category: 'Seasons', tags: ['seasons', 'weather'] },
  { id: 'tot8', optionA: 'Netflix', optionB: 'YouTube', category: 'Entertainment', tags: ['tech', 'entertainment'] },
  { id: 'tot9', optionA: 'Shower', optionB: 'Bath', category: 'Lifestyle', tags: ['lifestyle', 'home'] },
  { id: 'tot10', optionA: 'City', optionB: 'Country', category: 'Places', tags: ['places', 'lifestyle'] },
  { id: 'tot11', optionA: 'Book', optionB: 'Movie', category: 'Entertainment', tags: ['entertainment', 'learning'] },
  { id: 'tot12', optionA: 'Sweet', optionB: 'Salty', category: 'Food', tags: ['food', 'snacks'] },
  { id: 'tot13', optionA: 'Coffee', optionB: 'Tea', category: 'Drinks', tags: ['drinks', 'food'] },
  { id: 'tot14', optionA: 'Pancakes', optionB: 'Waffles', category: 'Food', tags: ['food', 'breakfast'] },
  { id: 'tot15', optionA: 'Flying', optionB: 'Invisible', category: 'Powers', tags: ['superpowers', 'fantasy'] },
  { id: 'tot16', optionA: 'Camping', optionB: 'Hotel', category: 'Travel', tags: ['travel', 'holiday'] },
  { id: 'tot17', optionA: 'Loud music', optionB: 'Total silence', category: 'Lifestyle', tags: ['music', 'lifestyle'] },
  { id: 'tot18', optionA: 'Space', optionB: 'Deep ocean', category: 'Science', tags: ['science', 'adventure'] },
  { id: 'tot19', optionA: 'Run fast', optionB: 'Jump high', category: 'Abilities', tags: ['sports', 'powers'] },
  { id: 'tot20', optionA: 'Chocolate', optionB: 'Vanilla', category: 'Food', tags: ['food', 'dessert'] },
  { id: 'tot21', optionA: 'Sunrise', optionB: 'Sunset', category: 'Nature', tags: ['nature', 'beauty'] },
  { id: 'tot22', optionA: 'Indoor', optionB: 'Outdoor', category: 'Lifestyle', tags: ['lifestyle', 'activities'] },
  { id: 'tot23', optionA: 'Socks with sandals', optionB: 'No socks at all', category: 'Fashion', tags: ['fashion', 'funny'] },
  { id: 'tot24', optionA: 'Time travel to the past', optionB: 'Time travel to the future', category: 'Fantasy', tags: ['fantasy', 'time'] },
  { id: 'tot25', optionA: 'Maths', optionB: 'English', category: 'School', tags: ['school', 'learning'] },
  { id: 'tot26', optionA: 'Train', optionB: 'Plane', category: 'Transport', tags: ['transport', 'travel'] },
  { id: 'tot27', optionA: 'Pineapple on pizza', optionB: 'No cheese on pizza', category: 'Food', tags: ['food', 'debate'] },
  { id: 'tot28', optionA: 'Too hot', optionB: 'Too cold', category: 'Weather', tags: ['weather', 'comfort'] },
  { id: 'tot29', optionA: 'Be the oldest sibling', optionB: 'Be the youngest sibling', category: 'Family', tags: ['family', 'life'] },
  { id: 'tot30', optionA: 'Always be right', optionB: 'Always be happy', category: 'Life', tags: ['life', 'values'] },
];

export function getRandomThisOrThat(
  usedIds: string[],
  seenMap?: SeenMap,
): ThisOrThatCard {
  let pool = THIS_OR_THAT_CARDS.filter(c => !usedIds.includes(c.id));
  if (pool.length === 0) pool = THIS_OR_THAT_CARDS;
  if (seenMap) return selectFreshPrompt(pool, usedIds, seenMap);
  return pool[Math.floor(Math.random() * pool.length)];
}
