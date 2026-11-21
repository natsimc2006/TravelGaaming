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
  /** Button label on the home "Where's the family today?" card. */
  homeLabel: string;
  /** Heading above the games that suit this situation. */
  goodFor: string;
}[] = [
  { value: 'Car', label: 'Car', icon: 'navigation', micro: 'Minimal props. Maximum distraction.', homeLabel: 'In the car', goodFor: 'Good in the car' },
  { value: 'Dinner', label: 'Dinner', icon: 'coffee', micro: 'For when everyone is technically still at the table.', homeLabel: 'At dinner', goodFor: 'Good at dinner' },
  { value: 'Waiting', label: 'Waiting', icon: 'clock', micro: 'Because queues build character. Apparently.', homeLabel: 'Waiting around', goodFor: 'Good while waiting' },
  { value: 'Bedtime', label: 'Bedtime', icon: 'moon', micro: 'Still fun. Just less feral.', homeLabel: 'Bedtime', goodFor: 'Good at bedtime' },
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
