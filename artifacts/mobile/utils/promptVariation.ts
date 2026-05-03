// Part 3 — Variation Engine
// Generates fresh-feeling variants of base category names so repeated play
// never shows the same wording twice. Used by Alphabet Showdown and Category Dash.

export type VariationMode = 'qualifier' | 'situation' | 'perspective' | 'inversion';

const ADJECTIVES = [
  'messy', 'tiny', 'giant', 'imaginary', 'invisible', 'surprising',
  'embarrassing', 'suspicious', 'overpriced', 'very old', 'brand new',
  'slightly broken', 'absolutely enormous', 'totally unnecessary',
];

const SITUATIONS = [
  'right now',
  'on a Monday morning',
  'in a massive hurry',
  'at 3am',
  'on a school day',
  'before anyone has had coffee',
  'in a traffic jam',
  'on the last day of holidays',
];

const PERSPECTIVES = [
  'a toddler would love',
  'your grandparents would recognise',
  'you completely forgot existed',
  'your pet would enjoy',
  'would make no sense to a robot',
  'would confuse a time traveller',
  'a 5-year-old would immediately break',
  'are impossible to explain without hand gestures',
];

const PLACES = ['kitchen', 'car', 'bedroom', 'garden', 'backpack', 'fridge', 'garage', 'classroom'];
const MOODS = ['messy', 'tidy', 'tiny', 'haunted', 'very cold', 'very hot', 'suspiciously quiet'];

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

interface VariationDef {
  mode: VariationMode;
  apply: (base: string) => string;
  weight: number;
}

const VARIATION_DEFS: VariationDef[] = [
  {
    mode: 'qualifier',
    apply: base => `${pick(ADJECTIVES)} ${base.toLowerCase()}`,
    weight: 3,
  },
  {
    mode: 'situation',
    apply: base => `${base} ${pick(SITUATIONS)}`,
    weight: 2,
  },
  {
    mode: 'perspective',
    apply: base => `${base} that ${pick(PERSPECTIVES)}`,
    weight: 2,
  },
  {
    mode: 'inversion',
    apply: base => `${base} that definitely should not exist`,
    weight: 1,
  },
];

function pickWeightedVariation(): VariationDef {
  const total = VARIATION_DEFS.reduce((s, v) => s + v.weight, 0);
  let rand = Math.random() * total;
  for (const v of VARIATION_DEFS) {
    rand -= v.weight;
    if (rand <= 0) return v;
  }
  return VARIATION_DEFS[0];
}

/**
 * Returns a fresh-sounding variation of a category name.
 * Passes through the original ~30% of the time to avoid over-decoration.
 */
export function applyVariation(baseName: string): string {
  if (Math.random() < 0.3) return baseName;
  return pickWeightedVariation().apply(baseName);
}

/**
 * Alias for use in category-based games. Same behaviour as applyVariation.
 */
export function getVariedCategoryName(name: string): string {
  return applyVariation(name);
}

// ─────────────────────────────────────────────────────────────────────────────
// Structured template pool — used for AI prompt generation and future packs.
// ─────────────────────────────────────────────────────────────────────────────

export interface CategoryTemplate {
  template: string;
  slots: { place?: string[]; mood?: string[]; other?: string[] };
}

export const CATEGORY_TEMPLATES: CategoryTemplate[] = [
  {
    template: 'Things in a {place}',
    slots: { place: PLACES },
  },
  {
    template: 'Things in a {mood} {place}',
    slots: { mood: MOODS, place: PLACES },
  },
  {
    template: 'Things that should not be in a {place}',
    slots: { place: [...PLACES, 'swimming pool', 'library', 'aeroplane'] },
  },
  {
    template: 'Things you forgot to pack for {other}',
    slots: { other: ['a holiday', 'school', 'the beach', 'camping', 'a birthday party', 'the shops'] },
  },
  {
    template: 'Things a {other} would find confusing',
    slots: { other: ['time traveller', 'robot', 'alien', 'Victorian child', 'medieval knight'] },
  },
  {
    template: 'Things you would find in a {mood} {other}',
    slots: {
      mood: MOODS,
      other: ['house', 'school bag', 'lunchbox', 'supermarket trolley', 'garden shed'],
    },
  },
];

/**
 * Generates a brand-new category prompt from the template pool.
 * Useful as a fallback when all base categories are exhausted.
 */
export function generateTemplateCategory(): string {
  const tpl = pick(CATEGORY_TEMPLATES);
  let result = tpl.template;
  for (const [key, options] of Object.entries(tpl.slots)) {
    if (options && result.includes(`{${key}}`)) {
      result = result.replace(`{${key}}`, pick(options));
    }
  }
  return result;
}
