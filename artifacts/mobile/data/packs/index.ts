export { CORE_PACK } from './corePack';
export { ROAD_TRIP_PACK } from './roadTripPack';

export interface PackMeta {
  id: string;
  name: string;
  description: string;
  tags: string[];
  included: boolean;
  comingSoon?: boolean;
}

export const ALL_PACKS: PackMeta[] = [
  { id: 'core', name: 'Core Pack', description: 'The essential Gimme a Game collection. Works everywhere.', tags: ['car', 'dinner', 'waiting', 'all-ages'], included: true },
  { id: 'road-trip', name: 'Road Trip Pack', description: 'Made for long drives. Bigger categories, more letters, extra clues.', tags: ['car', 'long'], included: false, comingSoon: true },
  { id: 'dinner', name: 'Dinner Table Pack', description: 'Calmer games for around the table. No shouting required.', tags: ['dinner', 'calm'], included: false, comingSoon: true },
  { id: 'bedtime', name: 'Calm & Wind-Down Pack', description: 'Quieter prompts. Perfect for settling down.', tags: ['calm', 'bedtime'], included: false, comingSoon: true },
];
