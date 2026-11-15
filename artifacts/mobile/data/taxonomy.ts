import type { EnergyLevel, GameSetting } from './games';

/**
 * Single source of truth for how games are grouped and labelled.
 * Home, All Games and game cards all read from here so the words a
 * parent sees never change between screens.
 */

export const SITUATIONS: {
  value: GameSetting;
  label: string;
  icon: string;
  micro: string;
}[] = [
  { value: 'Car', label: 'Car', icon: 'navigation', micro: 'Minimal props. Maximum distraction.' },
  { value: 'Dinner', label: 'Dinner', icon: 'coffee', micro: 'For when everyone is technically still at the table.' },
  { value: 'Waiting', label: 'Waiting', icon: 'clock', micro: 'Because queues build character. Apparently.' },
  { value: 'Bedtime', label: 'Bedtime', icon: 'moon', micro: 'Still fun. Just less feral.' },
];

export const VIBES: { value: EnergyLevel; label: string }[] = [
  { value: 'Calm', label: 'Calm' },
  { value: 'Medium', label: 'Thinky' },
  { value: 'Chaotic', label: 'Lively' },
];

export const VIBE_LABEL: Record<EnergyLevel, string> = {
  Calm: 'Calm',
  Medium: 'Thinky',
  Chaotic: 'Lively',
};
