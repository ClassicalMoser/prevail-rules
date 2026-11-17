import type { Army } from '@entities';
import { createTestCard, getUnitByTrait } from '@testing';

import { getArmyCompositionStatus } from './getArmyCompositionStatus';

describe('getArmyCompositionStatus function', () => {
  it('measures a Mini list against each of the four Mini limits', () => {
    // Five formation units at cost 30 and Morale 1: 150 points and 5 Morale,
    // under the Mini floor of 10 (§3.1.3).
    const formation = { ...getUnitByTrait('formation'), cost: 30, morale: 1 };
    // Three cards at initiative 1 and none elsewhere: Mini asks for two at
    // every value (§3.1.7). At 10 points each they bring the cost to 180.
    const army: Army = {
      commandCards: [1, 1, 1].map((initiative) =>
        createTestCard({ cost: 10, initiative }),
      ),
      id: '66666666-6666-4666-8666-666666666666',
      name: 'Status test',
      units: [{ count: 5, unitType: formation }],
    };

    const status = getArmyCompositionStatus(army, 'mini');

    // One unit type of the four Mini allows.
    expect(status.unitTypeCount).toStrictEqual({
      limit: 4,
      met: true,
      value: 1,
    });
    // 180 of the 200 cap.
    expect(status.cost).toStrictEqual({ limit: 200, met: true, value: 180 });
    // 5 Morale, short of the floor of 10.
    expect(status.morale).toStrictEqual({ limit: 10, met: false, value: 5 });
    // Every initiative is counted, and the spread is not two at each.
    expect(status.cardsPerInitiative).toStrictEqual({
      limit: 2,
      met: false,
      value: { 1: 3, 2: 0, 3: 0, 4: 0 },
    });
  });

  it('meets every limit Tutorial leaves unset, whatever the list holds', () => {
    // A very expensive list worth no Morale, with every card at one value.
    const costly = { ...getUnitByTrait('formation'), cost: 999, morale: 0 };
    const army: Army = {
      commandCards: [createTestCard({ initiative: 4 })],
      id: '66666666-6666-4666-8666-666666666667',
      name: 'Tutorial test',
      units: [{ count: 1, unitType: costly }],
    };

    const status = getArmyCompositionStatus(army, 'tutorial');

    // Tutorial sets no cost cap, Morale floor or spread (§3.1.3), so each is
    // met with no limit to show.
    expect(status.cost.limit).toBeNull();
    expect(status.cost.met).toBe(true);
    expect(status.morale.limit).toBeNull();
    expect(status.morale.met).toBe(true);
    expect(status.cardsPerInitiative.limit).toBeNull();
    expect(status.cardsPerInitiative.met).toBe(true);
  });
});
