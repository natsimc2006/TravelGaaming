export interface CategoryDashRound {
  id: string;
  categories: [string, string, string, string, string];
  difficulty: 'easy' | 'medium' | 'hard';
}

export const CATEGORY_DASH_ROUNDS: CategoryDashRound[] = [
  { id: 'r1', categories: ['Something you eat', 'A place', 'An animal', 'Something annoying', 'Something in a car'], difficulty: 'easy' },
  { id: 'r2', categories: ['A sport', 'A type of weather', 'Something soft', 'A job', 'Something you find on a beach'], difficulty: 'easy' },
  { id: 'r3', categories: ['A film', 'Something red', 'A musical instrument', 'A country', 'Something noisy'], difficulty: 'medium' },
  { id: 'r4', categories: ['A toy', 'Something in the kitchen', 'An insect', 'A type of transport', 'Something cold'], difficulty: 'easy' },
  { id: 'r5', categories: ['Something you drink', 'A famous person', 'Something in space', 'A type of clothing', 'Something in a park'], difficulty: 'medium' },
  { id: 'r6', categories: ['A fruit', 'Something scary', 'A hobby', 'Something in a school', 'An animal you would hug'], difficulty: 'easy' },
  { id: 'r7', categories: ['A vegetable', 'Something tall', 'A TV show', 'Something you wear in winter', 'An Australian animal'], difficulty: 'easy' },
  { id: 'r8', categories: ['A type of cheese', 'Something underground', 'A sea creature', 'Something fast', 'A board game'], difficulty: 'medium' },
  { id: 'r9', categories: ['A birthday thing', 'Something you find in a bag', 'An animal with four legs', 'Something sticky', 'A snack'], difficulty: 'easy' },
  { id: 'r10', categories: ['Something round', 'A type of tree', 'Something you do before bed', 'A superpower', 'Something in a fairy tale'], difficulty: 'easy' },
  { id: 'r11', categories: ['A sandwich filling', 'Something in space', 'A type of shoe', 'Something you do on holidays', 'An animal that lives in water'], difficulty: 'medium' },
  { id: 'r12', categories: ['A breakfast food', 'Something shiny', 'A type of music', 'Something in a hospital', 'A camping item'], difficulty: 'medium' },
  { id: 'r13', categories: ['A pizza topping', 'Something you find in a forest', 'A colour', 'A party game', 'An animal with wings'], difficulty: 'easy' },
  { id: 'r14', categories: ['A type of cake', 'Something in the bathroom', 'An animal in Australia', 'Something you plug in', 'A school subject'], difficulty: 'easy' },
  { id: 'r15', categories: ['A type of pasta', 'Something in a garden', 'A famous city', 'A thing you do in summer', 'Something that floats'], difficulty: 'medium' },
  { id: 'r16', categories: ['A dinosaur', 'Something that has wheels', 'A type of dance', 'Something you keep in a fridge', 'A sport played with a ball'], difficulty: 'medium' },
  { id: 'r17', categories: ['A type of dog', 'Something that melts', 'A nursery rhyme character', 'Something in a superhero film', 'A thing you carry'], difficulty: 'easy' },
  { id: 'r18', categories: ['A sweet food', 'Something in the ocean', 'A famous building', 'Something tiny', 'A type of hat'], difficulty: 'medium' },
  { id: 'r19', categories: ['Something that bounces', 'A type of flower', 'Something in a suitcase', 'An animal found in a zoo', 'Something green'], difficulty: 'easy' },
  { id: 'r20', categories: ['A condiment or sauce', 'Something you find in the sky', 'A cartoon character', 'Something that makes you laugh', 'A game you play outside'], difficulty: 'easy' },
  { id: 'r21', categories: ['Something sharp', 'A type of bird', 'Something you read', 'A thing you do when bored', 'Something in a toolbox'], difficulty: 'medium' },
  { id: 'r22', categories: ['A flavour of ice cream', 'Something yellow', 'A type of fish', 'Something in a playground', 'A board or card game'], difficulty: 'easy' },
  { id: 'r23', categories: ['Something you do quietly', 'A type of hat', 'A wild animal', 'Something you find at a petrol station', 'A winter activity'], difficulty: 'medium' },
  { id: 'r24', categories: ['A thing with a lid', 'Something that smells good', 'A fictional world', 'Something made of wood', 'An animal sound'], difficulty: 'medium' },
  { id: 'r25', categories: ['A comfort food', 'Something found in a cave', 'A type of cloud', 'Something you find at a fair', 'A thing that lights up'], difficulty: 'hard' },
  { id: 'r26', categories: ['A sandwich type', 'Something that spins', 'An animal that changes colour', 'A type of bag', 'Something you see at the airport'], difficulty: 'medium' },
  { id: 'r27', categories: ['Something in a lunchbox', 'A thing that can be giant or tiny', 'A mythical creature', 'A word meaning fast', 'Something you do on a rainy day'], difficulty: 'medium' },
  { id: 'r28', categories: ['A type of soup', 'Something colourful', 'A nocturnal animal', 'A famous scientist', 'Something you wear on your head'], difficulty: 'hard' },
  { id: 'r29', categories: ['A biscuit or cookie', 'Something you find on a farm', 'A type of storm', 'Something made of glass', 'A thing that can be folded'], difficulty: 'medium' },
  { id: 'r30', categories: ['Something you put on toast', 'An ocean animal', 'A word meaning huge', 'Something in a classroom', 'A hobby you can do indoors'], difficulty: 'easy' },
  { id: 'r31', categories: ['A hot drink', 'Something in a haunted house', 'A type of monkey', 'Something powered by wind', 'An Olympic sport'], difficulty: 'medium' },
  { id: 'r32', categories: ['A party food', 'Something white', 'An animal with a long tail', 'A famous explorer', 'Something you collect'], difficulty: 'medium' },
  { id: 'r33', categories: ['A flavour of chips', 'Something you find underwater', 'A word meaning tired', 'A toy you push or pull', 'Something you do every morning'], difficulty: 'easy' },
  { id: 'r34', categories: ['A type of nut', 'Something you ride', 'A planet', 'Something that chirps or buzzes', 'A type of race'], difficulty: 'medium' },
  { id: 'r35', categories: ['A food from another country', 'Something you find in a museum', 'A type of forest animal', 'A word meaning happy', 'Something on a dinner table'], difficulty: 'medium' },
  { id: 'r36', categories: ['A school lunch item', 'Something that goes up and down', 'A type of frog or lizard', 'Something you pack for camping', 'A famous landmark'], difficulty: 'medium' },
  { id: 'r37', categories: ['Something you dip in sauce', 'A thing with buttons', 'An animal that builds things', 'Something that can be invisible', 'A word meaning cold'], difficulty: 'hard' },
  { id: 'r38', categories: ['A type of bread', 'Something that sinks', 'An insect', 'Something found in Antarctica', 'A thing that requires batteries'], difficulty: 'medium' },
  { id: 'r39', categories: ['A type of pie', 'Something you collect', 'A word meaning loud', 'An animal with a pouch', 'Something you put in a backpack'], difficulty: 'easy' },
  { id: 'r40', categories: ['A midnight snack', 'Something with a pattern', 'A creature from the deep sea', 'Something that echoes', 'A thing you lose easily'], difficulty: 'medium' },
];

export const LETTERS_FOR_DASH = 'BCDFGHJKLMNPRST'.split('');

export function getRandomDashLetter(): string {
  return LETTERS_FOR_DASH[Math.floor(Math.random() * LETTERS_FOR_DASH.length)];
}

export function getRandomDashRound(
  usedIds: string[],
  difficulty?: 'easy' | 'medium' | 'hard',
  seenMap?: import('@/utils/contentMemory').SeenMap,
): CategoryDashRound {
  let pool = CATEGORY_DASH_ROUNDS.filter(r => !usedIds.includes(r.id));
  if (difficulty === 'easy') {
    const easy = pool.filter(r => r.difficulty === 'easy');
    if (easy.length > 0) pool = easy;
  }
  if (pool.length === 0) pool = CATEGORY_DASH_ROUNDS;
  if (seenMap) {
    const { selectFreshPrompt } = require('@/utils/freshPrompt');
    return selectFreshPrompt(pool, usedIds, seenMap);
  }
  return pool[Math.floor(Math.random() * pool.length)];
}
