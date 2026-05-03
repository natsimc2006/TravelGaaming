import type { SeenMap } from '@/utils/contentMemory';
import { selectFreshPrompt } from '@/utils/freshPrompt';

export type WYRMode = 'silly' | 'thoughtful' | 'chaos';

export interface WYRCard {
  id: string;
  optionA: string;
  optionB: string;
  mode: WYRMode;
  tags?: string[];
}

export const WYR_CARDS: WYRCard[] = [
  { id: 'wyr1', optionA: 'Have spaghetti for hair', optionB: 'Have pancakes for hands', mode: 'silly', tags: ['food', 'body', 'funny'] },
  { id: 'wyr2', optionA: 'Live in a zoo', optionB: 'Live in a theme park', mode: 'silly', tags: ['places', 'funny'] },
  { id: 'wyr3', optionA: 'Only speak in rhymes', optionB: 'Only speak in questions', mode: 'silly', tags: ['language', 'funny'] },
  { id: 'wyr4', optionA: 'Have a pet dragon', optionB: 'Have a pet unicorn', mode: 'silly', tags: ['fantasy', 'animals'] },
  { id: 'wyr5', optionA: 'Sneeze confetti forever', optionB: 'Hiccup every 10 seconds forever', mode: 'silly', tags: ['body', 'funny'] },
  { id: 'wyr6', optionA: 'Be the size of an ant', optionB: 'Be the size of a bus', mode: 'silly', tags: ['size', 'funny'] },
  { id: 'wyr7', optionA: 'Have fingers as long as rulers', optionB: 'Have ears the size of dinner plates', mode: 'silly', tags: ['body', 'funny'] },
  { id: 'wyr8', optionA: 'Slide down rainbows for transport', optionB: 'Fly on giant toast', mode: 'silly', tags: ['transport', 'funny'] },
  { id: 'wyr9', optionA: 'Only eat things that are orange', optionB: 'Only eat things that are blue', mode: 'silly', tags: ['food', 'colour'] },
  { id: 'wyr10', optionA: 'Have a laugh that sounds like a seal', optionB: 'Have a sneeze that sounds like a foghorn', mode: 'silly', tags: ['funny', 'sounds'] },
  { id: 'wyr11', optionA: 'Never need sleep', optionB: 'Never need food', mode: 'thoughtful', tags: ['life', 'wellness'] },
  { id: 'wyr12', optionA: 'Always know what people are thinking', optionB: 'Know what will happen tomorrow', mode: 'thoughtful', tags: ['powers', 'life'] },
  { id: 'wyr13', optionA: 'Be able to fly', optionB: 'Be able to breathe underwater', mode: 'thoughtful', tags: ['powers', 'superpowers'] },
  { id: 'wyr14', optionA: 'Go back in time once', optionB: 'See into the future once', mode: 'thoughtful', tags: ['time', 'powers'] },
  { id: 'wyr15', optionA: 'Always be a little cold', optionB: 'Always be a little hot', mode: 'thoughtful', tags: ['comfort', 'life'] },
  { id: 'wyr16', optionA: 'Be famous but unhappy', optionB: 'Be unknown but extremely happy', mode: 'thoughtful', tags: ['life', 'values'] },
  { id: 'wyr17', optionA: 'Explore the deepest ocean', optionB: 'Explore the surface of Mars', mode: 'thoughtful', tags: ['adventure', 'science'] },
  { id: 'wyr18', optionA: 'Have one true best friend forever', optionB: 'Have hundreds of good friends', mode: 'thoughtful', tags: ['friendship', 'life'] },
  { id: 'wyr19', optionA: 'Speak every language fluently', optionB: 'Play every instrument perfectly', mode: 'thoughtful', tags: ['skills', 'learning'] },
  { id: 'wyr20', optionA: 'Live without music', optionB: 'Live without movies or TV', mode: 'thoughtful', tags: ['entertainment', 'life'] },
  { id: 'wyr21', optionA: 'Fight 100 duck-sized horses', optionB: 'Fight 1 horse-sized duck', mode: 'chaos', tags: ['animals', 'chaos', 'funny'] },
  { id: 'wyr22', optionA: 'Everything you sit on makes a fart noise', optionB: 'You can only walk sideways like a crab', mode: 'chaos', tags: ['body', 'chaos'] },
  { id: 'wyr23', optionA: 'All your teeth fall out but grow back every day', optionB: 'Your hair grows 3cm every hour', mode: 'chaos', tags: ['body', 'chaos'] },
  { id: 'wyr24', optionA: 'Monkeys constantly steal your things', optionB: 'Pigeons follow you everywhere', mode: 'chaos', tags: ['animals', 'chaos'] },
  { id: 'wyr25', optionA: 'Every door you open plays a loud fanfare', optionB: 'Every time you sit down, confetti falls', mode: 'chaos', tags: ['chaos', 'funny'] },
  { id: 'wyr26', optionA: 'Your shadow does the opposite of what you do', optionB: 'Your reflection always waves first', mode: 'chaos', tags: ['chaos', 'weird'] },
  { id: 'wyr27', optionA: 'Have a personal theme song that plays everywhere you go', optionB: 'Have a narrator describe your life out loud at all times', mode: 'chaos', tags: ['chaos', 'funny'] },
  { id: 'wyr28', optionA: 'Swim in a pool of jelly', optionB: 'Swim in a pool of baked beans', mode: 'chaos', tags: ['food', 'chaos'] },
  { id: 'wyr29', optionA: 'All your food tastes like broccoli', optionB: 'All your drinks taste like pickle juice', mode: 'chaos', tags: ['food', 'chaos'] },
  { id: 'wyr30', optionA: 'Wake up as a completely different person every Monday', optionB: 'Switch bodies with your pet for one week per year', mode: 'chaos', tags: ['chaos', 'animals'] },
];

export function getRandomWYRCard(
  usedIds: string[],
  mode?: WYRMode,
  seenMap?: SeenMap,
): WYRCard {
  let pool = WYR_CARDS.filter(c => !usedIds.includes(c.id));
  if (mode) {
    const modeFiltered = pool.filter(c => c.mode === mode);
    if (modeFiltered.length > 0) pool = modeFiltered;
  }
  if (pool.length === 0) pool = WYR_CARDS;
  if (seenMap) return selectFreshPrompt(pool, usedIds, seenMap);
  return pool[Math.floor(Math.random() * pool.length)];
}
