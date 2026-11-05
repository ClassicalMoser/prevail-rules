import type { Army } from '@entities';
import { tempUnits } from '@sampleValues';
import { throwIfUndefined } from '@utils';
import { z } from 'zod';

import { refineGameArmyComposition } from './refineGameArmyComposition';

/** African Elephants may be fielded at most twice in any army. */
const elephants = throwIfUndefined(
  tempUnits.find((unitType) => unitType.name === 'African Elephants'),
  'African Elephants are missing from the sample units.',
);

/** Two elephants: exactly the limit. */
const legalArmy: Army = {
  commandCards: [],
  id: '33333333-3333-4333-8333-333333333333',
  name: 'Legal Army',
  units: [{ count: 2, unitType: elephants }],
};

/** Three elephants: one past the limit. */
const overLimitArmy: Army = {
  ...legalArmy,
  name: 'Over-limit Army',
  units: [{ count: 3, unitType: elephants }],
};

/**
 * Accepts any shape, so each case reaches the refinement without the game
 * shape checks getting there first.
 */
const gameArmies = z
  .custom<Parameters<typeof refineGameArmyComposition>[0]>()
  .superRefine(refineGameArmyComposition);

describe('refineGameArmyComposition function', () => {
  // Tutorial has no composition limits, so only the army rules can fail.
  it("reports an army rule white breaks under white's army", () => {
    const result = gameArmies.safeParse({
      blackArmy: legalArmy,
      gameMode: 'tutorial',
      whiteArmy: overLimitArmy,
    });

    expect(result.error?.issues).toMatchObject([
      {
        message: 'Count must be less than or equal to unit type limit.',
        path: ['whiteArmy', 'units', 0, 'count'],
      },
    ]);
  });

  it("reports an army rule black breaks under black's army", () => {
    const result = gameArmies.safeParse({
      blackArmy: overLimitArmy,
      gameMode: 'tutorial',
      whiteArmy: legalArmy,
    });

    expect(result.error?.issues).toMatchObject([
      {
        message: 'Count must be less than or equal to unit type limit.',
        path: ['blackArmy', 'units', 0, 'count'],
      },
    ]);
  });
});
