import type { GameTypeStructure } from '@entities';

export const gameTypes: readonly GameTypeStructure[] = [
  { type: 'tutorial', boardSize: 'small' },
  { type: 'mini', boardSize: 'small' },
  { type: 'standard', boardSize: 'standard' },
];
