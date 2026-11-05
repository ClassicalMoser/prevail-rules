import type { Army } from '@entities';
import { tempCommandCards, tempUnits } from '@sampleValues';
import { throwIfUndefined } from '@utils';
import { z } from 'zod';

import { legalArmySchema, refineArmyRules } from './refineArmyRules';

/** African Elephants may be fielded at most twice in any army. */
const elephants = throwIfUndefined(
  tempUnits.find((unitType) => unitType.name === 'African Elephants'),
  'African Elephants are missing from the sample units.',
);

/** Any second unit type will do: the rules only compare it with the first. */
const velites = throwIfUndefined(
  tempUnits.find((unitType) => unitType.name === 'Velites'),
  'Velites are missing from the sample units.',
);

/**
 * Accepts any shape, so each case reaches the army rules without the shape
 * checks in `armySchema` getting there first.
 */
const armyRules = z
  .custom<Pick<Army, 'units' | 'commandCards'>>()
  .superRefine(refineArmyRules);

describe('refineArmyRules function', () => {
  it('accepts an army within every unit limit, with nothing listed twice', () => {
    // Two elephants is exactly the limit; each card appears once.
    const army = {
      commandCards: [tempCommandCards[0], tempCommandCards[1]],
      units: [
        { count: 2, unitType: elephants },
        { count: 3, unitType: velites },
      ],
    };

    const result = armyRules.safeParse(army);

    expect(result.success).toBe(true);
  });

  it('rejects more of a unit type than its limit allows', () => {
    // A third elephant is one past the limit of two.
    const army = {
      commandCards: [],
      units: [{ count: 3, unitType: elephants }],
    };

    const result = armyRules.safeParse(army);

    expect(result.error?.issues).toMatchObject([
      {
        message: 'Count must be less than or equal to unit type limit.',
        path: ['units', 0, 'count'],
      },
    ]);
  });

  it('rejects the same unit type listed twice', () => {
    // Splitting velites over two entries would dodge the per-type limit.
    const army = {
      commandCards: [],
      units: [
        { count: 1, unitType: velites },
        { count: 2, unitType: velites },
      ],
    };

    const result = armyRules.safeParse(army);

    expect(result.error?.issues).toMatchObject([
      {
        message: 'An army cannot duplicate unit types.',
        path: ['units', 1, 'unitType'],
      },
    ]);
  });

  it('rejects the same command card listed twice', () => {
    // An army holds one copy of each command card.
    const army = {
      commandCards: [tempCommandCards[0], tempCommandCards[0]],
      units: [],
    };

    const result = armyRules.safeParse(army);

    expect(result.error?.issues).toMatchObject([
      {
        message: 'An army cannot duplicate command cards.',
        path: ['commandCards', 1],
      },
    ]);
  });
});

describe('legalArmySchema schema', () => {
  /** A whole army, so the shape checks run as well as the rules. Units alone
   * reach the unit limit, so it carries no command cards. */
  const army: Army = {
    commandCards: [],
    id: '33333333-3333-4333-8333-333333333333',
    name: 'Test Army',
    units: [{ count: 2, unitType: elephants }],
  };

  it('accepts a well-formed army that keeps the army rules', () => {
    const result = legalArmySchema.safeParse(army);

    expect(result.data).toStrictEqual(army);
  });

  it('rejects a well-formed army that breaks an army rule', () => {
    // A third elephant passes the shape checks but breaks the unit limit.
    const overLimit: Army = {
      ...army,
      units: [{ count: 3, unitType: elephants }],
    };

    const result = legalArmySchema.safeParse(overLimit);

    expect(result.error?.issues).toMatchObject([
      {
        message: 'Count must be less than or equal to unit type limit.',
        path: ['units', 0, 'count'],
      },
    ]);
  });
});
