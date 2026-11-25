import type { Army, GameModeName } from '@entities';
import { armySchema } from '@entities';
import { createTestCard, getUnitByTrait } from '@testing';
import { z } from 'zod';

import {
  armySchemaForMode,
  refineArmyComposition,
} from './refineArmyComposition';

/**
 * Two cards at each initiative, ten points apiece: the spread Mini asks for
 * (§3.1.7), for 80 of its 200 points.
 */
const miniHand = [1, 1, 2, 2, 3, 3, 4, 4].map((initiative) =>
  createTestCard({ cost: 10, initiative }),
);

/**
 * A list that keeps every Mini limit (§3.1.3): one unit type, five copies at
 * 20 points and 2 Morale each. 100 points of units and 80 of cards make 180
 * of the 200; 10 Morale is the floor exactly.
 */
const legalMiniList: Army = {
  commandCards: miniHand,
  id: '33333333-3333-4333-8333-333333333333',
  name: 'Legal Mini list',
  units: [
    {
      count: 5,
      unitType: { ...getUnitByTrait('formation'), cost: 20, morale: 2 },
    },
  ],
};

/**
 * Accepts any shape, so each case reaches the mode's limits without the army
 * shape checks or the army rules getting there first.
 */
function compositionIn(mode: GameModeName): z.ZodType<Army> {
  const schema = z
    .custom<Army>()
    .superRefine((army, ctx) => refineArmyComposition(army, mode, ctx));
  return schema;
}

/**
 * Mode composition refinements for army list-building (cost, morale, initiative).
 */
describe('refineArmyComposition function', () => {
  it('raises nothing for a list that keeps every limit of its mode', () => {
    const result = compositionIn('mini').safeParse(legalMiniList);

    expect(result.success).toBe(true);
  });

  it('refuses a fifth unit type in a Mini list', () => {
    // Five types, one copy each at 20 points and 2 Morale: the cost and the
    // Morale still keep to Mini, so variety is the only limit broken.
    const fiveTypes: Army = {
      ...legalMiniList,
      units: (
        ['formation', 'cavalry', 'javelin', 'beast', 'phalanx'] as const
      ).map((trait) => ({
        count: 1,
        unitType: { ...getUnitByTrait(trait), cost: 20, morale: 2 },
      })),
    };

    const result = compositionIn('mini').safeParse(fiveTypes);

    // Mini allows four types, and the issue points at the units.
    expect(result.error?.issues).toMatchObject([
      {
        message: 'Mini armies may include at most 4 different unit types.',
        path: ['units'],
      },
    ]);
  });

  it('refuses a Mini list whose cards take it past the cap its units keep to', () => {
    // Five units at 25 points are 125, inside the 200 on their own; the 80
    // points of cards are bought from the same points and make it 205.
    const overCap: Army = {
      ...legalMiniList,
      units: [
        {
          count: 5,
          unitType: { ...getUnitByTrait('formation'), cost: 25, morale: 2 },
        },
      ],
    };

    const result = compositionIn('mini').safeParse(overCap);

    // The cost is the whole list's, so the issue points at the army itself.
    expect(result.error?.issues).toMatchObject([
      { message: 'Mini armies cannot cost more than 200.', path: [] },
    ]);
  });

  it('refuses a Mini list short of 10 Morale', () => {
    // Five units worth 1 Morale each carry 5 (§3.1.6).
    const worthless: Army = {
      ...legalMiniList,
      units: [
        {
          count: 5,
          unitType: { ...getUnitByTrait('formation'), cost: 20, morale: 1 },
        },
      ],
    };

    const result = compositionIn('mini').safeParse(worthless);

    // The Morale is the units', so the issue points at them.
    expect(result.error?.issues).toMatchObject([
      {
        message: 'Mini armies must have a total morale value of 10 or greater.',
        path: ['units'],
      },
    ]);
  });

  it('refuses a Mini hand without two cards at every initiative', () => {
    // Still eight cards, but three at 1 and one at 2 (§3.1.7).
    const lopsided: Army = {
      ...legalMiniList,
      commandCards: [1, 1, 1, 2, 3, 3, 4, 4].map((initiative) =>
        createTestCard({ cost: 10, initiative }),
      ),
    };

    const result = compositionIn('mini').safeParse(lopsided);

    // The spread is the cards', so the issue points at them.
    expect(result.error?.issues).toMatchObject([
      {
        message:
          'Mini armies must have exactly 2 command cards for each initiative.',
        path: ['commandCards'],
      },
    ]);
  });

  it('points each issue at the army inside a larger value', () => {
    // Inside a game, White's army sits at `whiteArmy`; 5 Morale is short.
    const worthless: Army = {
      ...legalMiniList,
      units: [
        {
          count: 5,
          unitType: { ...getUnitByTrait('formation'), cost: 20, morale: 1 },
        },
      ],
    };
    const inGame = z
      .custom<Army>()
      .superRefine((army, ctx) =>
        refineArmyComposition(army, 'mini', ctx, ['whiteArmy']),
      );

    const result = inGame.safeParse(worthless);

    // The Morale issue names White's units.
    expect(result.error?.issues).toMatchObject([
      { path: ['whiteArmy', 'units'] },
    ]);
  });

  it('raises nothing in Tutorial, which sets no cost cap, Morale floor or spread', () => {
    // One very costly unit worth no Morale, and a single card (§3.1.3).
    const anything: Army = {
      ...legalMiniList,
      commandCards: [createTestCard({ initiative: 1 })],
      units: [
        {
          count: 1,
          unitType: { ...getUnitByTrait('formation'), cost: 999, morale: 0 },
        },
      ],
    };

    const result = compositionIn('tutorial').safeParse(anything);

    expect(result.success).toBe(true);
  });
});

describe('armySchemaForMode function', () => {
  it('accepts a well-formed list that keeps the army rules and its mode', () => {
    const result = armySchemaForMode('mini').safeParse(legalMiniList);

    expect(result.data).toStrictEqual(legalMiniList);
  });

  it('refuses a well-formed list that breaks a limit of its mode', () => {
    // Legal in Tutorial, but Mini asks two cards at each initiative.
    const oneCard: Army = {
      ...legalMiniList,
      commandCards: [createTestCard({ initiative: 1 })],
    };

    const result = armySchemaForMode('mini').safeParse(oneCard);

    expect(result.error?.issues).toMatchObject([{ path: ['commandCards'] }]);
  });

  it('applies the army rules even where tutorial skips composition', () => {
    // Tutorial has no composition limits, but a unit limit still holds.
    const army: Army = {
      ...legalMiniList,
      commandCards: [],
      units: [
        { count: 5, unitType: { ...getUnitByTrait('formation'), limit: 4 } },
      ],
    };

    expect(armySchemaForMode('tutorial').safeParse(army).success).toBe(false);
  });
});

/**
 * Entity shape schema still used as the base for mode refinement.
 */
describe('entity armySchema shape', () => {
  it('leaves the army rules to legality', () => {
    // Over the unit limit, which only legalArmySchema and armySchemaForMode reject.
    const army: Army = {
      ...legalMiniList,
      commandCards: [],
      units: [
        { count: 5, unitType: { ...getUnitByTrait('formation'), limit: 4 } },
      ],
    };

    expect(armySchema.parse(army)).toStrictEqual(army);
  });
});
