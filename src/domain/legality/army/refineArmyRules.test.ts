import type { Army, UnitType } from '@entities';
import { createTestCard } from '@testing';
import { z } from 'zod';

import { legalArmySchema, refineArmyRules } from './refineArmyRules';

/**
 * A unit type whose only gameplay fact for these cases is its fielding limit.
 */
function unitTypeWithLimit(limit: number, id: string): UnitType {
  const unitType: UnitType = {
    cost: 10,
    id,
    imageUrl: null,
    limit,
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
  return unitType;
}

/** Limit 2 — cases at or past that bound write the count against this. */
const limitTwo = unitTypeWithLimit(2, '00000000-0000-4000-8000-ffff00000010');

/** A second type, so an army can hold two entries without duplicating. */
const anotherType = unitTypeWithLimit(
  8,
  '00000000-0000-4000-8000-ffff00000011',
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
    // Two of a limit-2 type is exactly the bound; each card appears once.
    const army = {
      commandCards: [createTestCard(), createTestCard()],
      units: [
        { count: 2, unitType: limitTwo },
        { count: 3, unitType: anotherType },
      ],
    };

    const result = armyRules.safeParse(army);

    expect(result.success).toBe(true);
  });

  it('rejects more of a unit type than its limit allows', () => {
    // A third copy is one past the limit of two.
    const army = {
      commandCards: [],
      units: [{ count: 3, unitType: limitTwo }],
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
    // Splitting one type over two entries would dodge the per-type limit.
    const army = {
      commandCards: [],
      units: [
        { count: 1, unitType: anotherType },
        { count: 2, unitType: anotherType },
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
    const card = createTestCard();
    const army = {
      commandCards: [card, card],
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
    units: [{ count: 2, unitType: limitTwo }],
  };

  it('accepts a well-formed army that keeps the army rules', () => {
    const result = legalArmySchema.safeParse(army);

    expect(result.data).toStrictEqual(army);
  });

  it('rejects a well-formed army that breaks an army rule', () => {
    // A third copy passes the shape checks but breaks the unit limit.
    const overLimit: Army = {
      ...army,
      units: [{ count: 3, unitType: limitTwo }],
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
