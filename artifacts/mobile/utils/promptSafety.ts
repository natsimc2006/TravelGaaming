import type { GeneratedPrompt } from './aiPromptEngine';

export type SafetyStatus = 'approved' | 'needs_review' | 'rejected';

export interface SafetyResult {
  status: SafetyStatus;
  reasons: string[];
}

const REJECT_TERMS: string[] = [
  'kill', 'murder', 'stab', 'shoot', 'gun', 'bomb', 'explode', 'die', 'dead', 'death',
  'blood', 'gore', 'corpse', 'weapon', 'knife', 'bullet',
  'sex', 'sexy', 'naked', 'nude', 'porn', 'adult', 'explicit', 'intimate',
  'drug', 'cocaine', 'heroin', 'meth', 'weed', 'cannabis', 'marijuana', 'overdose',
  'alcohol', 'beer', 'wine', 'vodka', 'drunk', 'booze', 'liquor', 'whisky', 'whiskey',
  'gamble', 'gambling', 'casino', 'betting', 'poker', 'slot',
  'hate', 'racist', 'racism', 'slur', 'abuse',
  'hell', 'damn', 'crap', 'ass', 'bastard', 'bitch', 'shit', 'fuck', 'crap',
  'devil', 'demon', 'evil', 'horror', 'terrifying', 'nightmare', 'monster', 'scary',
  'suicide', 'self-harm', 'cutting',
];

const REVIEW_TERMS: string[] = [
  'fight', 'war', 'battle', 'danger', 'dark', 'scary', 'violent', 'blood',
  'strange', 'weird', 'creepy', 'alone', 'lonely',
];

function tokenise(text: string): string[] {
  return text.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).filter(Boolean);
}

function checkText(text: string, list: string[]): string[] {
  const tokens = tokenise(text);
  return list.filter(term => tokens.includes(term) || text.toLowerCase().includes(term));
}

function collectAllText(prompt: GeneratedPrompt): string {
  const parts: string[] = [
    prompt.promptText,
    prompt.answer ?? '',
    ...(prompt.acceptedAnswers ?? []),
    ...(prompt.clues ?? []),
    prompt.category ?? '',
    ...(prompt.tags ?? []),
  ];
  return parts.join(' ');
}

export function validatePromptSafety(prompt: GeneratedPrompt): SafetyResult {
  const allText = collectAllText(prompt);
  const reasons: string[] = [];

  const rejectedTerms = checkText(allText, REJECT_TERMS);
  if (rejectedTerms.length > 0) {
    reasons.push(`Contains rejected terms: ${rejectedTerms.join(', ')}`);
    return { status: 'rejected', reasons };
  }

  const reviewTerms = checkText(allText, REVIEW_TERMS);
  if (reviewTerms.length > 0) {
    reasons.push(`Contains terms for review: ${reviewTerms.join(', ')}`);
    return { status: 'needs_review', reasons };
  }

  return { status: 'approved', reasons: [] };
}
