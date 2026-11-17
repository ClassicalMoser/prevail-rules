import type { Army } from '@entities';
import { createTestCard, getUnitByTrait } from '@testing';

import { getArmyMorale } from './getArmyMorale';

describe('getArmyMorale function', () => {
  it('sums each unit type’s Morale once for every copy fielded', () => {
    // Four copies worth 2 each, and two javelin troops worth nothing (§9.3.2).
    const legion = { ...getUnitByTrait('formation'), morale: 2 };
    const javelins = { ...getUnitByTrait('javelin'), morale: 0 };
    // A card is part of the list but carries no Morale.
    const army: Army = {
      commandCards: [createTestCard()],
      id: '44444444-4444-4444-8444-444444444444',
      name: 'Morale test',
      units: [
        { count: 4, unitType: legion },
        { count: 2, unitType: javelins },
      ],
    };

    // 4 × 2 + 2 × 0.
    expect(getArmyMorale(army)).toBe(8);
  });
});
