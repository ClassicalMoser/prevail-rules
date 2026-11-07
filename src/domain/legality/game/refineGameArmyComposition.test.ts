import type { Army, UnitType } from '@entities';
import { z } from 'zod';

import { refineGameArmyComposition } from './refineGameArmyComposition';

/** Limit 2 — over-limit cases write count 3 against this. */
const limitTwo: UnitType = {
  cost: 10,
  id: '00000000-0000-4000-8000-ffff00000010',
  imageUrl: null,
  limit: 2,
  morale: 1,
  name: 'Test Unit',
  stats: {
    attack: 1,
    flexibility: 1,
    range: 0,
    retreat: 1,
    reverse: 1,
    rout: 1,
    speed: 1,
  },
  traits: ['formation'],
  version: '1.0.0',
};

/** Two copies: exactly the limit. */
const legalArmy: Army = {
  commandCards: [],
  id: '33333333-3333-4333-8333-333333333333',
  name: 'Legal Army',
  units: [{ count: 2, unitType: limitTwo }],
};

/** Three copies: one past the limit. */
const overLimitArmy: Army = {
  ...legalArmy,
  name: 'Over-limit Army',
  units: [{ count: 3, unitType: limitTwo }],
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
