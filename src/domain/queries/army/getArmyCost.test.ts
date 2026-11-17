import type { Army } from '@entities';
import { createTestCard, getUnitByTrait } from '@testing';

import { getArmyCost } from './getArmyCost';

describe('getArmyCost function', () => {
  it('counts every copy of a unit at its price, and every card at its own', () => {
    // A roster formation unit priced at 20 for this case; three copies cost 60.
    const legion = { ...getUnitByTrait('formation'), cost: 20 };
    // Two cards at 5 each add 10 more from the same budget (§3.1.3).
    const army: Army = {
      commandCards: [createTestCard({ cost: 5 }), createTestCard({ cost: 5 })],
      id: '33333333-3333-4333-8333-333333333333',
      name: 'Cost test',
      units: [{ count: 3, unitType: legion }],
    };

    // 3 × 20 for the units, plus 5 + 5 for the cards.
    expect(getArmyCost(army)).toBe(70);
  });

  it('costs nothing for a list with no units and no cards', () => {
    // An empty list buys nothing.
    const army: Army = {
      commandCards: [],
      id: '33333333-3333-4333-8333-333333333334',
      name: 'Empty',
      units: [],
    };

    expect(getArmyCost(army)).toBe(0);
  });
});
