export interface ForbiddenWordCard {
  id: string;
  targetWord: string;
  forbiddenWords: [string, string, string, string, string];
  difficulty: 'easy' | 'medium' | 'hard';
}

export const FORBIDDEN_WORD_CARDS: ForbiddenWordCard[] = [
  { id: 'fw1', targetWord: 'Pizza', forbiddenWords: ['cheese', 'slice', 'pepperoni', 'oven', 'crust'], difficulty: 'easy' },
  { id: 'fw2', targetWord: 'Elephant', forbiddenWords: ['trunk', 'grey', 'big', 'Africa', 'zoo'], difficulty: 'easy' },
  { id: 'fw3', targetWord: 'Swimming', forbiddenWords: ['pool', 'water', 'float', 'dive', 'stroke'], difficulty: 'easy' },
  { id: 'fw4', targetWord: 'Birthday', forbiddenWords: ['cake', 'candles', 'party', 'presents', 'wish'], difficulty: 'easy' },
  { id: 'fw5', targetWord: 'Snowman', forbiddenWords: ['snow', 'carrot', 'buttons', 'cold', 'scarf'], difficulty: 'easy' },
  { id: 'fw6', targetWord: 'Spaghetti', forbiddenWords: ['pasta', 'noodles', 'sauce', 'Italian', 'fork'], difficulty: 'easy' },
  { id: 'fw7', targetWord: 'Astronaut', forbiddenWords: ['space', 'rocket', 'moon', 'helmet', 'gravity'], difficulty: 'medium' },
  { id: 'fw8', targetWord: 'Rainbow', forbiddenWords: ['colours', 'rain', 'sun', 'sky', 'arc'], difficulty: 'easy' },
  { id: 'fw9', targetWord: 'Submarine', forbiddenWords: ['underwater', 'navy', 'sea', 'torpedo', 'dive'], difficulty: 'medium' },
  { id: 'fw10', targetWord: 'Library', forbiddenWords: ['books', 'quiet', 'borrow', 'reading', 'shelves'], difficulty: 'easy' },
  { id: 'fw11', targetWord: 'Volcano', forbiddenWords: ['lava', 'erupt', 'magma', 'mountain', 'fire'], difficulty: 'medium' },
  { id: 'fw12', targetWord: 'Honeybee', forbiddenWords: ['honey', 'sting', 'hive', 'flower', 'buzz'], difficulty: 'easy' },
  { id: 'fw13', targetWord: 'Pirate', forbiddenWords: ['treasure', 'ship', 'hook', 'sea', 'parrot'], difficulty: 'easy' },
  { id: 'fw14', targetWord: 'Guitar', forbiddenWords: ['strings', 'music', 'strum', 'band', 'acoustic'], difficulty: 'easy' },
  { id: 'fw15', targetWord: 'Chocolate', forbiddenWords: ['sweet', 'cocoa', 'dark', 'milk', 'bar'], difficulty: 'easy' },
  { id: 'fw16', targetWord: 'Sandwich', forbiddenWords: ['bread', 'lunch', 'filling', 'toast', 'eat'], difficulty: 'easy' },
  { id: 'fw17', targetWord: 'Camping', forbiddenWords: ['tent', 'fire', 'nature', 'outdoors', 'sleep'], difficulty: 'easy' },
  { id: 'fw18', targetWord: 'Doctor', forbiddenWords: ['hospital', 'medicine', 'sick', 'nurse', 'health'], difficulty: 'easy' },
  { id: 'fw19', targetWord: 'Kangaroo', forbiddenWords: ['Australia', 'pouch', 'hop', 'joey', 'jump'], difficulty: 'easy' },
  { id: 'fw20', targetWord: 'Computer', forbiddenWords: ['screen', 'keyboard', 'internet', 'mouse', 'digital'], difficulty: 'easy' },
  { id: 'fw21', targetWord: 'Dinosaur', forbiddenWords: ['extinct', 'fossil', 'prehistoric', 'T-Rex', 'roar'], difficulty: 'easy' },
  { id: 'fw22', targetWord: 'Sunscreen', forbiddenWords: ['sun', 'burn', 'SPF', 'skin', 'beach'], difficulty: 'medium' },
  { id: 'fw23', targetWord: 'Escalator', forbiddenWords: ['stairs', 'moving', 'lift', 'floor', 'step'], difficulty: 'medium' },
  { id: 'fw24', targetWord: 'Homework', forbiddenWords: ['school', 'teacher', 'study', 'work', 'assignment'], difficulty: 'easy' },
  { id: 'fw25', targetWord: 'Lighthouse', forbiddenWords: ['light', 'sea', 'ship', 'coast', 'tower'], difficulty: 'medium' },
  { id: 'fw26', targetWord: 'Umbrella', forbiddenWords: ['rain', 'wet', 'open', 'handle', 'shelter'], difficulty: 'easy' },
  { id: 'fw27', targetWord: 'Trampoline', forbiddenWords: ['bounce', 'jump', 'spring', 'outdoor', 'kids'], difficulty: 'easy' },
  { id: 'fw28', targetWord: 'Mirror', forbiddenWords: ['reflection', 'glass', 'see', 'look', 'face'], difficulty: 'easy' },
  { id: 'fw29', targetWord: 'Penguin', forbiddenWords: ['Antarctica', 'waddle', 'black', 'white', 'bird'], difficulty: 'easy' },
  { id: 'fw30', targetWord: 'Thermometer', forbiddenWords: ['temperature', 'hot', 'cold', 'fever', 'measure'], difficulty: 'medium' },
  { id: 'fw31', targetWord: 'Basketball', forbiddenWords: ['ball', 'hoop', 'court', 'dribble', 'team'], difficulty: 'easy' },
  { id: 'fw32', targetWord: 'Sunflower', forbiddenWords: ['yellow', 'petals', 'seeds', 'tall', 'garden'], difficulty: 'easy' },
  { id: 'fw33', targetWord: 'Rollercoaster', forbiddenWords: ['fast', 'ride', 'scream', 'loop', 'theme park'], difficulty: 'medium' },
  { id: 'fw34', targetWord: 'Magician', forbiddenWords: ['trick', 'hat', 'rabbit', 'magic', 'disappear'], difficulty: 'easy' },
  { id: 'fw35', targetWord: 'Alarm Clock', forbiddenWords: ['morning', 'wake', 'ring', 'snooze', 'time'], difficulty: 'easy' },
  { id: 'fw36', targetWord: 'Coconut', forbiddenWords: ['tropical', 'milk', 'palm tree', 'fruit', 'shell'], difficulty: 'medium' },
  { id: 'fw37', targetWord: 'Earthquake', forbiddenWords: ['shake', 'ground', 'tremor', 'disaster', 'rumble'], difficulty: 'medium' },
  { id: 'fw38', targetWord: 'Chopsticks', forbiddenWords: ['eat', 'Chinese', 'food', 'utensil', 'sticks'], difficulty: 'medium' },
  { id: 'fw39', targetWord: 'Compass', forbiddenWords: ['north', 'direction', 'needle', 'navigate', 'south'], difficulty: 'medium' },
  { id: 'fw40', targetWord: 'Marshmallow', forbiddenWords: ['soft', 'white', 'sweet', 'roast', 'squishy'], difficulty: 'easy' },
];

export function getRandomForbiddenCard(usedIds: string[], difficulty?: 'easy' | 'medium' | 'hard'): ForbiddenWordCard {
  let pool = FORBIDDEN_WORD_CARDS.filter(c => !usedIds.includes(c.id));
  if (difficulty === 'easy') {
    const easy = pool.filter(c => c.difficulty === 'easy');
    if (easy.length > 0) pool = easy;
  } else if (difficulty === 'hard') {
    const hard = pool.filter(c => c.difficulty === 'medium' || c.difficulty === 'hard');
    if (hard.length > 0) pool = hard;
  }
  if (pool.length === 0) pool = FORBIDDEN_WORD_CARDS;
  return pool[Math.floor(Math.random() * pool.length)];
}
