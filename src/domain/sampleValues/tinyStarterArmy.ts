import type { Army } from '@entities';
import { tempCommandCards } from './tempCommandCards';

export const tinyStarterArmy: Army = {
  id: '00000000-0000-0000-0000-000000000000',
  units: new Set(),
  tempCommandCards: new Set(tempCommandCards),
};
