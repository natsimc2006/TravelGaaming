export interface WhatAmIItem {
  id: string;
  answer: string;
  clues: [string, string, string, string, string];
  difficulty: 'easy' | 'medium' | 'hard';
}

export const WHAT_AM_I_ITEMS: WhatAmIItem[] = [
  {
    id: 'penguin',
    answer: 'Penguin',
    clues: [
      'I am an animal.',
      'I cannot fly.',
      'I wear a natural tuxedo.',
      'I live somewhere very cold.',
      'I waddle when I walk.',
    ],
    difficulty: 'easy',
  },
  {
    id: 'rainbow',
    answer: 'Rainbow',
    clues: [
      'I appear in the sky.',
      'You can never touch me.',
      'I have seven colours.',
      'I only appear after rain.',
      'Legends say gold is at my end.',
    ],
    difficulty: 'easy',
  },
  {
    id: 'piano',
    answer: 'Piano',
    clues: [
      'I am a musical instrument.',
      'I have both black and white keys.',
      'I can be very large or quite small.',
      'You press me to make sound.',
      'I have 88 keys in total.',
    ],
    difficulty: 'easy',
  },
  {
    id: 'volcano',
    answer: 'Volcano',
    clues: [
      'I am a natural landform.',
      'I can be found on land or underwater.',
      'I have a crater at my top.',
      'When I erupt, lava flows out.',
      'I have destroyed whole cities in history.',
    ],
    difficulty: 'medium',
  },
  {
    id: 'toothbrush',
    answer: 'Toothbrush',
    clues: [
      'You use me every day.',
      'I live in the bathroom.',
      'I come in many colours.',
      'I have bristles.',
      'Dentists love me.',
    ],
    difficulty: 'easy',
  },
  {
    id: 'submarine',
    answer: 'Submarine',
    clues: [
      'I am a type of vehicle.',
      'I can travel underwater.',
      'I am used by navies.',
      'People live inside me for months.',
      'I use sonar to navigate.',
    ],
    difficulty: 'medium',
  },
  {
    id: 'kangaroo',
    answer: 'Kangaroo',
    clues: [
      'I am an animal.',
      'I carry my baby in a pouch.',
      'I am found in Australia.',
      'I move by hopping.',
      'I have a very powerful tail.',
    ],
    difficulty: 'easy',
  },
  {
    id: 'library',
    answer: 'Library',
    clues: [
      'I am a place you visit.',
      'You must be quiet inside me.',
      'I am full of books.',
      'You can borrow things from me for free.',
      'You need a special card to use me.',
    ],
    difficulty: 'easy',
  },
  {
    id: 'thunderstorm',
    answer: 'Thunderstorm',
    clues: [
      'I am a weather event.',
      'I can be scary at night.',
      'I involve lots of rain.',
      'I come with flashing lights.',
      'I make a very loud booming sound.',
    ],
    difficulty: 'easy',
  },
  {
    id: 'compass',
    answer: 'Compass',
    clues: [
      'I am a tool.',
      'I am circular.',
      'I have a needle inside.',
      'I am used for navigation.',
      'I always point north.',
    ],
    difficulty: 'medium',
  },
  {
    id: 'chocolate',
    answer: 'Chocolate',
    clues: [
      'I am a food.',
      'I am made from a tropical bean.',
      'I melt in warm hands.',
      'I come in milk, dark, and white varieties.',
      'Many people say I am their favourite treat.',
    ],
    difficulty: 'easy',
  },
  {
    id: 'snail',
    answer: 'Snail',
    clues: [
      'I am a small creature.',
      'I carry my home on my back.',
      'I leave a trail behind me.',
      'I move very, very slowly.',
      'I come out when it rains.',
    ],
    difficulty: 'easy',
  },
  {
    id: 'escalator',
    answer: 'Escalator',
    clues: [
      'I am found in big buildings.',
      'I am a type of transport.',
      'I move people between floors.',
      'I have moving steps.',
      'You can walk on me or just stand still.',
    ],
    difficulty: 'medium',
  },
  {
    id: 'koala',
    answer: 'Koala',
    clues: [
      'I am an animal.',
      'I look like a small bear but I am not one.',
      'I live in Australia.',
      'I sleep up to 22 hours a day.',
      'I eat only one type of leaf.',
    ],
    difficulty: 'easy',
  },
  {
    id: 'mirror',
    answer: 'Mirror',
    clues: [
      'I can be found in most rooms.',
      'I am usually flat and rectangular.',
      'I am made of glass.',
      'I show you yourself.',
      'Breaking me is said to bring bad luck.',
    ],
    difficulty: 'easy',
  },
  {
    id: 'cactus',
    answer: 'Cactus',
    clues: [
      'I am a plant.',
      'I live in very dry places.',
      'I store water inside me.',
      'I have sharp spikes instead of leaves.',
      'You would not want to hug me.',
    ],
    difficulty: 'easy',
  },
  {
    id: 'lighthouse',
    answer: 'Lighthouse',
    clues: [
      'I am a tall structure.',
      'I am found near the sea.',
      'I have a light at the top.',
      'I help ships find their way safely.',
      'Someone used to live inside me and keep the light burning.',
    ],
    difficulty: 'medium',
  },
  {
    id: 'magnet',
    answer: 'Magnet',
    clues: [
      'I am an object.',
      'I come in many shapes.',
      'I attract certain metals.',
      'Two of me will either attract or repel each other.',
      'The Earth itself is a giant version of me.',
    ],
    difficulty: 'medium',
  },
  {
    id: 'spider',
    answer: 'Spider',
    clues: [
      'I am a small creature.',
      'Many people are afraid of me.',
      'I have eight legs.',
      'I spin webs.',
      'I catch insects for my dinner.',
    ],
    difficulty: 'easy',
  },
  {
    id: 'igloo',
    answer: 'Igloo',
    clues: [
      'I am a type of building.',
      'I am dome-shaped.',
      'I am built in freezing places.',
      'I am made from a surprising material.',
      'I am made entirely of packed snow and ice.',
    ],
    difficulty: 'medium',
  },
  {
    id: 'camera',
    answer: 'Camera',
    clues: [
      'I am a device.',
      'Most people carry one in their pocket.',
      'I capture moments.',
      'I have a lens.',
      'I take photographs.',
    ],
    difficulty: 'easy',
  },
  {
    id: 'eclipse',
    answer: 'Solar Eclipse',
    clues: [
      'I am a natural event.',
      'I happen in the sky.',
      'You must not look directly at me.',
      'I happen when the moon blocks the sun.',
      'I can turn day into night for a few minutes.',
    ],
    difficulty: 'hard',
  },
  {
    id: 'trampoling',
    answer: 'Trampoline',
    clues: [
      'I am a piece of equipment.',
      'I am usually found outdoors.',
      'I am round or rectangular.',
      'I have a bouncy surface.',
      'Children love jumping on me.',
    ],
    difficulty: 'easy',
  },
  {
    id: 'worm',
    answer: 'Worm',
    clues: [
      'I am a tiny creature.',
      'I have no legs.',
      'I live in the ground.',
      'I am great for gardens.',
      'Birds love to eat me.',
    ],
    difficulty: 'easy',
  },
  {
    id: 'dictionary',
    answer: 'Dictionary',
    clues: [
      'I am a book.',
      'I am usually very thick.',
      'Words are listed alphabetically inside me.',
      'I tell you what words mean.',
      'You use me when you are unsure how to spell something.',
    ],
    difficulty: 'medium',
  },
  {
    id: 'umbrella',
    answer: 'Umbrella',
    clues: [
      'I am an object.',
      'I fold up small.',
      'I have a handle.',
      'You open me above your head.',
      'I keep you dry in the rain.',
    ],
    difficulty: 'easy',
  },
  {
    id: 'giraffe',
    answer: 'Giraffe',
    clues: [
      'I am an animal.',
      'I live in Africa.',
      'I have a spotted coat.',
      'I eat leaves from the tops of trees.',
      'I have the longest neck of any animal.',
    ],
    difficulty: 'easy',
  },
  {
    id: 'telescope',
    answer: 'Telescope',
    clues: [
      'I am a device.',
      'I can be very large or fit in your hand.',
      'I am used at night.',
      'Scientists use me for their work.',
      'I make faraway things look closer.',
    ],
    difficulty: 'medium',
  },
  {
    id: 'iceberg',
    answer: 'Iceberg',
    clues: [
      'I am a natural object.',
      'I float in the ocean.',
      'I am made entirely of frozen water.',
      'Only a small part of me is visible above water.',
      'A famous ship sank after hitting me in 1912.',
    ],
    difficulty: 'medium',
  },
  {
    id: 'fire-station',
    answer: 'Fire Station',
    clues: [
      'I am a building.',
      'I can be found in most towns.',
      'I have large garage doors.',
      'People in special uniforms work inside me.',
      'Big red vehicles are kept here.',
    ],
    difficulty: 'easy',
  },
  {
    id: 'cloud',
    answer: 'Cloud',
    clues: [
      'I am found in the sky.',
      'I can be many shapes.',
      'I look fluffy from the ground.',
      'I am actually made of tiny water droplets.',
      'Rain falls from me.',
    ],
    difficulty: 'easy',
  },
  {
    id: 'anchor',
    answer: 'Anchor',
    clues: [
      'I am a heavy object.',
      'I am made of metal.',
      'I am found on boats and ships.',
      'I am dropped into the water.',
      'I stop a boat from drifting away.',
    ],
    difficulty: 'medium',
  },
  {
    id: 'earwig',
    answer: 'Alarm Clock',
    clues: [
      'I am a device.',
      'I sit beside your bed.',
      'I display numbers.',
      'I make a loud noise at a set time.',
      'Most people find me annoying in the morning.',
    ],
    difficulty: 'easy',
  },
  {
    id: 'escalator2',
    answer: 'Shoelace',
    clues: [
      'I am a thin object.',
      'I come in pairs.',
      'I can be many colours.',
      'I go through small holes.',
      'Without me, your shoe would fall off.',
    ],
    difficulty: 'easy',
  },
  {
    id: 'spaghetti',
    answer: 'Spaghetti',
    clues: [
      'I am a food.',
      'I come from Italy originally.',
      'I am long and thin.',
      'I need to be cooked in boiling water.',
      'People often eat me with sauce and a fork.',
    ],
    difficulty: 'easy',
  },
  {
    id: 'earthquake',
    answer: 'Earthquake',
    clues: [
      'I am a natural event.',
      'I can be very dangerous.',
      'Buildings can fall when I happen.',
      'I am caused by movement deep underground.',
      'The ground shakes when I occur.',
    ],
    difficulty: 'medium',
  },
  {
    id: 'beehive',
    answer: 'Beehive',
    clues: [
      'I am a structure.',
      'I can be found in gardens and forests.',
      'I am made from a waxy material.',
      'Thousands of insects live inside me.',
      'Something delicious is stored inside me.',
    ],
    difficulty: 'medium',
  },
  {
    id: 'thermometer',
    answer: 'Thermometer',
    clues: [
      'I am a device.',
      'I come in different sizes.',
      'You use me when you feel unwell.',
      'Numbers are printed on me.',
      'I tell you how hot or cold something is.',
    ],
    difficulty: 'medium',
  },
  {
    id: 'coconut',
    answer: 'Coconut',
    clues: [
      'I am a fruit.',
      'I grow in tropical places.',
      'I am large and round.',
      'I have a very hard, rough shell.',
      'There is a refreshing drink inside me.',
    ],
    difficulty: 'easy',
  },
  {
    id: 'shadow',
    answer: 'Shadow',
    clues: [
      'I follow you everywhere.',
      'You cannot pick me up.',
      'I am always the same shape as you.',
      'I appear when there is light.',
      'I disappear in the dark.',
    ],
    difficulty: 'medium',
  },
];

export function getRandomWhatAmIItem(
  usedIds: string[],
  difficulty?: 'easy' | 'medium' | 'hard'
): WhatAmIItem {
  let pool = WHAT_AM_I_ITEMS.filter(item => !usedIds.includes(item.id));
  if (difficulty === 'easy') {
    const easy = pool.filter(i => i.difficulty === 'easy');
    if (easy.length > 0) pool = easy;
  } else if (difficulty === 'hard') {
    const hard = pool.filter(i => i.difficulty === 'hard' || i.difficulty === 'medium');
    if (hard.length > 0) pool = hard;
  }
  if (pool.length === 0) pool = WHAT_AM_I_ITEMS;
  return pool[Math.floor(Math.random() * pool.length)];
}
