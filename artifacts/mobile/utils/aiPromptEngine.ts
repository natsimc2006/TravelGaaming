import { validatePromptSafety } from './promptSafety';
import { isDuplicatePrompt } from './promptDeduper';

export type PromptSource = 'local' | 'ai' | 'user_created';

export interface GeneratedPrompt {
  id: string;
  gameId: string;
  promptText: string;
  answer?: string;
  acceptedAnswers?: string[];
  clues?: string[];
  category?: string;
  difficulty: 'easy' | 'mixed' | 'hard';
  ageRange: '4-7' | '8-10' | '10+';
  tags: string[];
  source: PromptSource;
  createdAt: string;
  safetyStatus: 'approved' | 'needs_review' | 'rejected';
}

export interface GenerateOptions {
  gameId: string;
  ageRange?: '4-7' | '8-10' | '10+';
  difficulty?: 'easy' | 'mixed' | 'hard';
  situation?: string;
  energy?: string;
  avoidPromptIds?: string[];
  previousPromptThemes?: string[];
  familySafeOnly?: boolean;
}

function uid(): string {
  return `gen_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

type TemplateBase = Omit<GeneratedPrompt, 'id' | 'source' | 'createdAt' | 'safetyStatus' | 'gameId'>;

const WHATAMI_TEMPLATES: TemplateBase[] = [
  {
    promptText: 'What am I?',
    answer: 'Umbrella',
    acceptedAnswers: ['umbrella', 'brolly', 'parasol'],
    clues: [
      'I am useful when the weather changes.',
      'People usually carry me outside.',
      'I open up above your head.',
      'I help keep rain off you.',
      'I have a handle and a canopy.',
    ],
    difficulty: 'easy', ageRange: '4-7', tags: ['weather', 'everyday'], category: 'Objects',
  },
  {
    promptText: 'What am I?',
    answer: 'Shadow',
    acceptedAnswers: ['shadow', 'silhouette'],
    clues: [
      'I follow you everywhere in the sunlight.',
      'I have no colour of my own.',
      'I get longer in the morning and evening.',
      'I disappear when there is no light.',
      'I am a dark shape on the ground made by you.',
    ],
    difficulty: 'easy', ageRange: '4-7', tags: ['nature', 'science'], category: 'Things',
  },
  {
    promptText: 'What am I?',
    answer: 'Echo',
    acceptedAnswers: ['echo'],
    clues: [
      'I am invisible.',
      'I repeat what you say.',
      'I am found in mountains and caves.',
      'Sound bounces off walls to create me.',
      'Shout into a canyon and you will hear me come back.',
    ],
    difficulty: 'mixed', ageRange: '8-10', tags: ['science', 'sound'], category: 'Phenomena',
  },
  {
    promptText: 'What am I?',
    answer: 'Stairs',
    acceptedAnswers: ['stairs', 'steps', 'staircase'],
    clues: [
      'I help you go up or down.',
      'I am found inside buildings.',
      'I am not a lift.',
      'Each part of me is called a step.',
      'You climb me with your feet.',
    ],
    difficulty: 'easy', ageRange: '4-7', tags: ['home', 'everyday'], category: 'Structures',
  },
  {
    promptText: 'What am I?',
    answer: 'Rainbow',
    acceptedAnswers: ['rainbow'],
    clues: [
      'I appear after rain.',
      'I have seven colours.',
      'I form an arc in the sky.',
      'You can never reach my end.',
      'Red, orange, yellow, green, blue, indigo, violet.',
    ],
    difficulty: 'easy', ageRange: '4-7', tags: ['weather', 'colour'], category: 'Nature',
  },
  {
    promptText: 'What am I?',
    answer: 'Clock',
    acceptedAnswers: ['clock', 'watch', 'timepiece'],
    clues: [
      'I have hands but cannot clap.',
      'I have a face but no eyes.',
      'I tell you something without speaking.',
      'I run but never walk.',
      'I count twelve hours twice every day.',
    ],
    difficulty: 'mixed', ageRange: '8-10', tags: ['riddle', 'time'], category: 'Objects',
  },
  {
    promptText: 'What am I?',
    answer: 'Mirror',
    acceptedAnswers: ['mirror', 'looking glass'],
    clues: [
      'I show you something no camera can.',
      'I reflect what stands in front of me.',
      'I am flat and shiny.',
      'You use me to check your appearance.',
      'Every morning you probably look into me.',
    ],
    difficulty: 'easy', ageRange: '4-7', tags: ['home', 'everyday'], category: 'Objects',
  },
  {
    promptText: 'What am I?',
    answer: 'Snowflake',
    acceptedAnswers: ['snowflake', 'snow crystal'],
    clues: [
      'No two of me are ever the same.',
      'I am made of frozen water.',
      'I fall from the sky in winter.',
      'I melt quickly in your hand.',
      'Millions of me make a snowstorm.',
    ],
    difficulty: 'mixed', ageRange: '4-7', tags: ['weather', 'winter', 'science'], category: 'Nature',
  },
];

const ALPHABET_TEMPLATES: TemplateBase[] = [
  {
    promptText: 'Name something from this category',
    category: 'Things you might find in a messy car',
    difficulty: 'easy', ageRange: '4-7', tags: ['car', 'everyday', 'funny'],
  },
  {
    promptText: 'Name something from this category',
    category: 'Animals that would make terrible passengers',
    difficulty: 'mixed', ageRange: '8-10', tags: ['animals', 'funny', 'car'],
  },
  {
    promptText: 'Name something from this category',
    category: 'Foods that are hard to eat in the back seat',
    difficulty: 'easy', ageRange: '4-7', tags: ['food', 'car', 'funny'],
  },
  {
    promptText: 'Name something from this category',
    category: 'Things that are always lost in the house',
    difficulty: 'easy', ageRange: '4-7', tags: ['home', 'funny', 'everyday'],
  },
  {
    promptText: 'Name something from this category',
    category: 'Things that make weird noises',
    difficulty: 'mixed', ageRange: '4-7', tags: ['funny', 'sound', 'everyday'],
  },
  {
    promptText: 'Name something from this category',
    category: 'Jobs that would be hilarious for a robot',
    difficulty: 'hard', ageRange: '10+', tags: ['funny', 'jobs', 'creative'],
  },
  {
    promptText: 'Name something from this category',
    category: 'Things you find at the beach',
    difficulty: 'easy', ageRange: '4-7', tags: ['beach', 'summer', 'everyday'],
  },
  {
    promptText: 'Name something from this category',
    category: 'Things your pet would say if it could talk',
    difficulty: 'mixed', ageRange: '8-10', tags: ['animals', 'funny', 'creative'],
  },
];

const CATEGORY_DASH_TEMPLATES: TemplateBase[] = [
  {
    promptText: 'Name one for each category',
    clues: ['Animals', 'Foods', 'Countries', 'Sports', 'Things in a kitchen'],
    difficulty: 'easy', ageRange: '4-7', tags: ['general', 'variety'],
  },
  {
    promptText: 'Name one for each category',
    clues: ['Famous people', 'Things outside', 'Colours', 'Jobs', 'Things in a school bag'],
    difficulty: 'mixed', ageRange: '8-10', tags: ['general', 'variety'],
  },
  {
    promptText: 'Name one for each category',
    clues: ['Things that fly', 'Vegetables', 'Sports teams', 'Musical instruments', 'Types of transport'],
    difficulty: 'easy', ageRange: '4-7', tags: ['general', 'variety'],
  },
  {
    promptText: 'Name one for each category',
    clues: ['Books or movies', 'Things that are cold', 'Capital cities', 'Games or toys', 'Things with wheels'],
    difficulty: 'mixed', ageRange: '8-10', tags: ['general', 'variety'],
  },
  {
    promptText: 'Name one for each category',
    clues: ['Things you wear', 'Fruits', 'Famous landmarks', 'Card games', 'Things in a bedroom'],
    difficulty: 'easy', ageRange: '4-7', tags: ['general', 'variety'],
  },
];

const FORBIDDEN_WORD_TEMPLATES: TemplateBase[] = [
  {
    promptText: 'Get your team to guess the word',
    answer: 'Door',
    acceptedAnswers: ['door'],
    clues: ['knob', 'open', 'close', 'hinge', 'lock'],
    difficulty: 'easy', ageRange: '4-7', tags: ['home', 'everyday'],
  },
  {
    promptText: 'Get your team to guess the word',
    answer: 'Star',
    acceptedAnswers: ['star'],
    clues: ['sky', 'shine', 'night', 'space', 'twinkle'],
    difficulty: 'easy', ageRange: '4-7', tags: ['space', 'nature'],
  },
  {
    promptText: 'Get your team to guess the word',
    answer: 'Rain',
    acceptedAnswers: ['rain', 'rainfall'],
    clues: ['wet', 'cloud', 'fall', 'water', 'drop'],
    difficulty: 'easy', ageRange: '4-7', tags: ['weather', 'nature'],
  },
  {
    promptText: 'Get your team to guess the word',
    answer: 'Book',
    acceptedAnswers: ['book'],
    clues: ['read', 'page', 'story', 'cover', 'library'],
    difficulty: 'easy', ageRange: '4-7', tags: ['learning', 'everyday'],
  },
  {
    promptText: 'Get your team to guess the word',
    answer: 'Island',
    acceptedAnswers: ['island'],
    clues: ['water', 'land', 'surrounded', 'tropical', 'ocean'],
    difficulty: 'mixed', ageRange: '8-10', tags: ['geography', 'nature'],
  },
  {
    promptText: 'Get your team to guess the word',
    answer: 'Compass',
    acceptedAnswers: ['compass'],
    clues: ['north', 'direction', 'needle', 'navigate', 'south'],
    difficulty: 'hard', ageRange: '10+', tags: ['geography', 'navigation'],
  },
];

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function templatePoolForGame(gameId: string): TemplateBase[] {
  switch (gameId) {
    case 'what-am-i': return WHATAMI_TEMPLATES;
    case 'alphabet-showdown': return ALPHABET_TEMPLATES;
    case 'category-dash': return CATEGORY_DASH_TEMPLATES;
    case 'forbidden-word': return FORBIDDEN_WORD_TEMPLATES;
    default: return WHATAMI_TEMPLATES;
  }
}

function filterTemplates(pool: TemplateBase[], opts: GenerateOptions): TemplateBase[] {
  let filtered = [...pool];
  if (opts.ageRange) {
    filtered = filtered.filter(t => !t.ageRange || t.ageRange === opts.ageRange);
    if (filtered.length === 0) filtered = [...pool];
  }
  if (opts.difficulty && opts.difficulty !== 'mixed') {
    const diffFiltered = filtered.filter(t => t.difficulty === opts.difficulty || t.difficulty === 'mixed');
    if (diffFiltered.length > 0) filtered = diffFiltered;
  }
  return filtered;
}

export async function generateFreshPrompt(opts: GenerateOptions): Promise<GeneratedPrompt> {
  const pool = templatePoolForGame(opts.gameId);
  const candidates = filterTemplates(pool, opts);

  // Filter out already-used prompt IDs
  const avoid = new Set(opts.avoidPromptIds ?? []);
  const available = candidates.filter(t => !t.answer || !avoid.has(t.answer.toLowerCase()));
  const template = available.length > 0 ? pickRandom(available) : pickRandom(candidates);

  const prompt: GeneratedPrompt = {
    ...template,
    id: uid(),
    gameId: opts.gameId,
    source: 'local',
    createdAt: new Date().toISOString(),
    safetyStatus: 'approved',
  };

  // Run safety validation
  const safety = validatePromptSafety(prompt);
  prompt.safetyStatus = safety.status;

  if (safety.status === 'rejected') {
    // Fall back to a safe default
    const safeDefault = pickRandom(pool);
    return {
      ...safeDefault,
      id: uid(),
      gameId: opts.gameId,
      source: 'local',
      createdAt: new Date().toISOString(),
      safetyStatus: 'approved',
    };
  }

  // Duplicate check
  const promptsToCheck = (opts.avoidPromptIds ?? []).map(id => ({ answer: id, promptText: '' }));
  if (isDuplicatePrompt(prompt, promptsToCheck as any)) {
    const fallback = available.length > 1 ? pickRandom(available.filter(t => t !== template)) : pickRandom(pool);
    return {
      ...fallback,
      id: uid(),
      gameId: opts.gameId,
      source: 'local',
      createdAt: new Date().toISOString(),
      safetyStatus: 'approved',
    };
  }

  // =============================================================
  // Future live AI call goes here.
  // ─────────────────────────────────────────────────────────────
  // 1. Build a structured prompt request from opts.
  // 2. Send to OpenAI / Anthropic / custom model endpoint.
  // 3. Receive raw AI response.
  // 4. Parse and validate against GeneratedPrompt schema.
  // 5. Run validatePromptSafety() — reject if not approved.
  // 6. Run isDuplicatePrompt() — regenerate once if too similar.
  // 7. If still failing, return local fallback prompt (above).
  // 8. Cache approved prompt locally for offline reuse.
  // =============================================================
  // Example future call:
  //   const aiResult = await openai.chat.completions.create({ ... });
  //   const parsed = parseAIResponse(aiResult, opts.gameId);
  //   const safe = validatePromptSafety(parsed);
  //   if (safe.status !== 'approved') return localFallback;
  // =============================================================

  return prompt;
}

export function getLocalPromptStats(): { total: number; byGame: Record<string, number> } {
  // Static counts from local data libraries
  // Updated when new prompts are added to data/*.ts files
  return {
    total: 171,
    byGame: {
      'what-am-i': 40,
      'alphabet-showdown': 51,
      'category-dash': 40,
      'forbidden-word': 40,
    },
  };
}
