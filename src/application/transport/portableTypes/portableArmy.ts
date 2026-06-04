import type { Card, UnitCount } from '@entities';

export interface PortableArmy {
  id: string;
  units: UnitCount[];
  commandCards: Card[];
}
