interface ContentRelease {
  releaseWeek: string;
  newPromptIds: string[];
}

function getCurrentISOWeek(): string {
  const now = new Date();
  const jan1 = new Date(now.getFullYear(), 0, 1);
  const week = Math.ceil(((now.getTime() - jan1.getTime()) / 86400000 + jan1.getDay() + 1) / 7);
  return `${now.getFullYear()}-W${String(week).padStart(2, '0')}`;
}

const RELEASES: ContentRelease[] = [
  {
    releaseWeek: '2025-W01',
    newPromptIds: [
      'penguin', 'rainbow', 'piano', 'volcano', 'toothbrush',
      'fw1', 'fw2', 'fw3', 'fw4', 'fw5',
      'animals', 'food', 'things-at-school', 'holiday-pack', 'smelly-things',
      'r1', 'r2', 'r3', 'r4', 'r5',
    ],
  },
  {
    releaseWeek: '2025-W18',
    newPromptIds: [
      'grandmas-house', 'not-in-shoe', 'useless-moon',
      'r6', 'r7', 'r8',
      'fw6', 'fw7', 'fw8',
    ],
  },
  {
    releaseWeek: '2025-W19',
    newPromptIds: [
      'superhero-powers', 'bedroom-items', 'kitchen-items', 'jobs',
      'r9', 'r10', 'r11',
      'fw9', 'fw10', 'fw11',
    ],
  },
  {
    releaseWeek: '2026-W18',
    newPromptIds: [
      'fairy-tale-things', 'things-in-doctor', 'things-that-glow',
      'book-characters', 'things-underground',
      'r36', 'r37', 'r38', 'r39', 'r40',
      'fw36', 'fw37', 'fw38', 'fw39', 'fw40',
    ],
  },
];

export function getNewThisWeekCount(): number {
  const week = getCurrentISOWeek();
  const release = RELEASES.find(r => r.releaseWeek === week);
  return release?.newPromptIds.length ?? 0;
}

export function isNewThisWeek(promptId: string): boolean {
  const week = getCurrentISOWeek();
  const release = RELEASES.find(r => r.releaseWeek === week);
  return release?.newPromptIds.includes(promptId) ?? false;
}

export function getAllNewPromptIds(): string[] {
  const week = getCurrentISOWeek();
  const release = RELEASES.find(r => r.releaseWeek === week);
  return release?.newPromptIds ?? [];
}
