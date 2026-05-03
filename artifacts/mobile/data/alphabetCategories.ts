export interface AlphabetCategory {
  id: string;
  name: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

export const ALPHABET_CATEGORIES: AlphabetCategory[] = [
  { id: 'animals', name: 'Animals', difficulty: 'easy' },
  { id: 'food', name: 'Food', difficulty: 'easy' },
  { id: 'things-at-school', name: 'Things at school', difficulty: 'easy' },
  { id: 'holiday-pack', name: 'Things you pack for a holiday', difficulty: 'easy' },
  { id: 'smelly-things', name: 'Things that smell funny', difficulty: 'easy' },
  { id: 'grandmas-house', name: "Things in grandma's house", difficulty: 'easy' },
  { id: 'not-in-shoe', name: 'Things you never want in your shoe', difficulty: 'easy' },
  { id: 'useless-moon', name: 'Things useless on the moon', difficulty: 'medium' },
  { id: 'sports', name: 'Sports', difficulty: 'easy' },
  { id: 'countries', name: 'Countries', difficulty: 'medium' },
  { id: 'in-the-car', name: 'Things in the car', difficulty: 'easy' },
  { id: 'superhero-powers', name: 'Superhero powers', difficulty: 'easy' },
  { id: 'bedroom-items', name: 'Things in a bedroom', difficulty: 'easy' },
  { id: 'kitchen-items', name: 'Things in a kitchen', difficulty: 'easy' },
  { id: 'jobs', name: 'Jobs', difficulty: 'easy' },
  { id: 'fruit', name: 'Types of fruit', difficulty: 'easy' },
  { id: 'vegetables', name: 'Vegetables', difficulty: 'easy' },
  { id: 'things-at-beach', name: 'Things at the beach', difficulty: 'easy' },
  { id: 'insects', name: 'Insects and bugs', difficulty: 'easy' },
  { id: 'space', name: 'Things in space', difficulty: 'medium' },
  { id: 'things-round', name: 'Things that are round', difficulty: 'easy' },
  { id: 'things-cold', name: 'Things that are cold', difficulty: 'easy' },
  { id: 'things-loud', name: 'Things that are loud', difficulty: 'easy' },
  { id: 'transport', name: 'Types of transport', difficulty: 'easy' },
  { id: 'things-underground', name: 'Things underground', difficulty: 'medium' },
  { id: 'things-that-fly', name: 'Things that fly', difficulty: 'easy' },
  { id: 'things-sticky', name: 'Things that are sticky', difficulty: 'easy' },
  { id: 'holiday-destinations', name: 'Holiday destinations', difficulty: 'medium' },
  { id: 'sea-creatures', name: 'Sea creatures', difficulty: 'easy' },
  { id: 'music-instruments', name: 'Musical instruments', difficulty: 'easy' },
  { id: 'things-that-bounce', name: 'Things that bounce', difficulty: 'easy' },
  { id: 'things-colourful', name: 'Things that are colourful', difficulty: 'easy' },
  { id: 'animals-australia', name: 'Australian animals', difficulty: 'easy' },
  { id: 'things-tiny', name: 'Things that are tiny', difficulty: 'easy' },
  { id: 'things-heavy', name: 'Things that are very heavy', difficulty: 'easy' },
  { id: 'birthday-party', name: 'Things at a birthday party', difficulty: 'easy' },
  { id: 'camping-stuff', name: 'Things you take camping', difficulty: 'easy' },
  { id: 'winter-things', name: 'Winter things', difficulty: 'easy' },
  { id: 'summer-things', name: 'Summer things', difficulty: 'easy' },
  { id: 'things-you-wear', name: 'Things you wear', difficulty: 'easy' },
  { id: 'things-in-park', name: 'Things in a park', difficulty: 'easy' },
  { id: 'things-yummy', name: 'Yummy foods', difficulty: 'easy' },
  { id: 'things-gross', name: 'Gross things', difficulty: 'easy' },
  { id: 'dinosaurs', name: 'Dinosaurs', difficulty: 'medium' },
  { id: 'pizza-toppings', name: 'Pizza toppings', difficulty: 'easy' },
  { id: 'things-in-garden', name: 'Things in the garden', difficulty: 'easy' },
  { id: 'dog-breeds', name: 'Dog breeds', difficulty: 'medium' },
  { id: 'book-characters', name: 'Famous fictional characters', difficulty: 'medium' },
  { id: 'things-that-glow', name: 'Things that glow in the dark', difficulty: 'medium' },
  { id: 'things-in-doctor', name: 'Things at the doctor', difficulty: 'easy' },
  { id: 'fairy-tale-things', name: 'Things in a fairy tale', difficulty: 'easy' },
];

export const LETTERS = 'ABCDEFGHIJKLMNOPRSTW'.split('');

export function getRandomLetter(usedLetters: string[]): string {
  const available = LETTERS.filter(l => !usedLetters.includes(l));
  if (available.length === 0) return LETTERS[Math.floor(Math.random() * LETTERS.length)];
  return available[Math.floor(Math.random() * available.length)];
}

export function getRandomCategory(
  usedIds: string[],
  difficulty?: 'easy' | 'medium' | 'hard',
  seenMap?: import('@/utils/contentMemory').SeenMap,
): AlphabetCategory {
  let pool = ALPHABET_CATEGORIES.filter(c => !usedIds.includes(c.id));
  if (difficulty && difficulty !== 'hard') {
    const filtered = pool.filter(c => c.difficulty === difficulty || c.difficulty === 'easy');
    if (filtered.length > 0) pool = filtered;
  }
  if (pool.length === 0) pool = ALPHABET_CATEGORIES;
  if (seenMap) {
    const { selectFreshPrompt } = require('@/utils/freshPrompt');
    return selectFreshPrompt(pool, usedIds, seenMap);
  }
  return pool[Math.floor(Math.random() * pool.length)];
}
