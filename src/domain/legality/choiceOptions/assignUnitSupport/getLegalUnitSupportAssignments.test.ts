import type { UnitSupport } from '@entities';
import type { LegalAssignUnitSupport } from './getLegalAssignUnitSupport';
import { createTestUnit } from '@testing';

import {
  getAssignmentRefusalReason,
  getLegalUnitSupportAssignments,
  getUnitSupportLabel,
  isSameUnitSupportAssignment,
} from './getLegalUnitSupportAssignments';

/**
 * After a rally, every unit on the board needs a place under the unit
 * support its cards hold (§10.4.4). The player assigns the places one unit at
 * a time: a unit takes only one place, a unit support holds no more units
 * than its count, and any open place an uncovered unit could take must be
 * taken (§10.4.5). Units left without a place rout (§10.4.6).
 *
 * White's hand here holds two unit supports: a generic one of two places,
 * and one of one place for the spearmen's unit type. White has three units:
 * two spearmen and one other.
 */
const spearmen = createTestUnit('white', { attack: 3, instanceNumber: 1 });
const secondSpearmen = createTestUnit('white', {
  attack: 3,
  instanceNumber: 2,
  unitType: spearmen.unitType,
});
const skirmishers = createTestUnit('white', { attack: 2, instanceNumber: 1 });

const genericSupport: UnitSupport = { count: 2, supportType: 'generic' };
const spearmenSupport: UnitSupport = {
  count: 1,
  supportType: 'unitType',
  unitTypeId: spearmen.unitType.id,
};

const handSupport: LegalAssignUnitSupport = {
  categories: [
    {
      eligibleUnits: [spearmen, secondSpearmen, skirmishers],
      unitSupport: genericSupport,
    },
    { eligibleUnits: [spearmen, secondSpearmen], unitSupport: spearmenSupport },
  ],
  player: 'white',
};

describe('getLegalUnitSupportAssignments function', () => {
  it('offers every unit a place under every unit support it matches, before any place is filled', () => {
    const offer = getLegalUnitSupportAssignments(handSupport, []);

    // Three units fit the generic support, and the two spearmen fit their own.
    expect(offer.next).toStrictEqual([
      { unit: spearmen, unitSupport: genericSupport },
      { unit: secondSpearmen, unitSupport: genericSupport },
      { unit: skirmishers, unitSupport: genericSupport },
      { unit: spearmen, unitSupport: spearmenSupport },
      { unit: secondSpearmen, unitSupport: spearmenSupport },
    ]);
    // Places are open and units are uncovered, so white may not stop.
    expect(offer.mayStop).toBe(false);
  });

  it('offers no more places under a unit support whose places are all filled', () => {
    // The spearmen support has one place, and the first spearmen fills it.
    const offer = getLegalUnitSupportAssignments(handSupport, [
      { unit: spearmen, unitSupport: spearmenSupport },
    ]);

    // The second spearmen can still go under the generic support, but not
    // under its own, which is full.
    // A unit takes only one place (§10.4.4), so the first spearmen is
    // offered nowhere else.
    expect(offer.next).toStrictEqual([
      { unit: secondSpearmen, unitSupport: genericSupport },
      { unit: skirmishers, unitSupport: genericSupport },
    ]);
  });

  it('lets the player stop once no open place can take an uncovered unit, leaving the rest to rout', () => {
    // The generic support's two places go to the second spearmen and the
    // skirmishers, and the spearmen support's one place to the first
    // spearmen.
    // Every unit has a place.
    const everyUnitPlaced = getLegalUnitSupportAssignments(handSupport, [
      { unit: secondSpearmen, unitSupport: genericSupport },
      { unit: skirmishers, unitSupport: genericSupport },
      { unit: spearmen, unitSupport: spearmenSupport },
    ]);
    expect(everyUnitPlaced).toStrictEqual({ mayStop: true, next: [] });

    // A poorer arrangement: both spearmen fill the generic support. The
    // skirmishers match nothing with room left, so white may stop and they
    // rout. §10.4.5 does not oblige the better arrangement.
    const poorer = getLegalUnitSupportAssignments(handSupport, [
      { unit: spearmen, unitSupport: genericSupport },
      { unit: secondSpearmen, unitSupport: genericSupport },
    ]);
    expect(poorer).toStrictEqual({ mayStop: true, next: [] });
  });

  it('does not let the player stop while an open place could take an uncovered unit', () => {
    // The spearmen support is filled, but the generic one still has room, and
    // two units are still uncovered.
    const offer = getLegalUnitSupportAssignments(handSupport, [
      { unit: spearmen, unitSupport: spearmenSupport },
    ]);

    // Use what you have (§10.4.5).
    expect(offer.mayStop).toBe(false);
  });

  it('a place filled under one unit support leaves the others with all their places', () => {
    // The skirmishers take one of the generic support's two places.
    const offer = getLegalUnitSupportAssignments(handSupport, [
      { unit: skirmishers, unitSupport: genericSupport },
    ]);

    // The generic support has a place left, and the spearmen support's one
    // place is untouched: each stack counts only its own places.
    expect(offer.next).toStrictEqual([
      { unit: spearmen, unitSupport: genericSupport },
      { unit: secondSpearmen, unitSupport: genericSupport },
      { unit: spearmen, unitSupport: spearmenSupport },
      { unit: secondSpearmen, unitSupport: spearmenSupport },
    ]);
  });

  it('offers the same places whatever order the earlier ones were filled in', () => {
    // Filling the same two places in either order leaves the same choice.
    const oneWay = getLegalUnitSupportAssignments(handSupport, [
      { unit: spearmen, unitSupport: spearmenSupport },
      { unit: skirmishers, unitSupport: genericSupport },
    ]);
    const otherWay = getLegalUnitSupportAssignments(handSupport, [
      { unit: skirmishers, unitSupport: genericSupport },
      { unit: spearmen, unitSupport: spearmenSupport },
    ]);

    expect(otherWay).toStrictEqual(oneWay);
  });
});

describe('isSameUnitSupportAssignment function', () => {
  it('the same unit under another unit support is a different place', () => {
    // The first spearmen could go in either stack; the two places differ.
    const inGeneric = { unit: spearmen, unitSupport: genericSupport };
    const inOwn = { unit: spearmen, unitSupport: spearmenSupport };

    expect(isSameUnitSupportAssignment(inGeneric, inOwn)).toBe(false);
  });

  it('two copies naming the same unit in the same unit support are the same place', () => {
    // An event's copy of an offered place is a separate object.
    const offered = { unit: spearmen, unitSupport: genericSupport };
    const submitted = {
      unit: { ...spearmen },
      unitSupport: { ...genericSupport },
    };

    expect(isSameUnitSupportAssignment(offered, submitted)).toBe(true);
  });
});

/**
 * A refusal names the stack as a player would read it: what it holds, then
 * how many places.
 */
describe('getUnitSupportLabel function', () => {
  it('names a generic stack by its places alone', () => {
    expect(getUnitSupportLabel(genericSupport)).toBe('generic:2');
  });

  it('names a trait stack by its trait and places', () => {
    const formation: UnitSupport = {
      count: 4,
      supportType: 'trait',
      trait: 'formation',
    };

    expect(getUnitSupportLabel(formation)).toBe('trait:formation:4');
  });

  it('names a unit-type stack by the type’s id and its places', () => {
    const typed: UnitSupport = {
      count: 1,
      supportType: 'unitType',
      unitTypeId: '00000000-0000-4000-8000-000000000003',
    };

    expect(getUnitSupportLabel(typed)).toBe(
      'unitType:00000000-0000-4000-8000-000000000003:1',
    );
  });

  it('refuses a unit support of no kind the rules name', () => {
    // No card carries such a support; the cast forces one past the type to
    // reach the exhaustive default.
    const unknownKind = { count: 1, supportType: 'banner' } as never;

    // Refused by name, as every other reader of a support's kind refuses it.
    expect(() => getUnitSupportLabel(unknownKind)).toThrow(
      'Unknown unit support type: banner',
    );
  });
});

/**
 * When an assignment was not among those offered, the refusal says which
 * rule of the support check it breaks, checked in a fixed order: the stack
 * is not held, the unit already has a place, the stack is full, the unit does
 * not match the stack, and last, the unit is not one of the rallying
 * player's units on the board.
 */
describe('getAssignmentRefusalReason function', () => {
  it('refuses a stack the hand does not add up to', () => {
    // White's hand holds two generic places, not three.
    const notHeld: UnitSupport = { count: 3, supportType: 'generic' };

    expect(
      getAssignmentRefusalReason(handSupport, [], {
        unit: skirmishers,
        unitSupport: notHeld,
      }),
    ).toBe('Unit support generic:3 is not available from hand');
  });

  it('refuses a second place for a unit that already has one', () => {
    // The skirmishers are already in the generic stack (§10.4.4).
    expect(
      getAssignmentRefusalReason(
        handSupport,
        [{ unit: skirmishers, unitSupport: genericSupport }],
        { unit: skirmishers, unitSupport: genericSupport },
      ),
    ).toBe('Unit is assigned support more than once');
  });

  it('refuses a place in a stack whose places are all filled', () => {
    // The spearmen stack's one place went to the first spearmen.
    expect(
      getAssignmentRefusalReason(
        handSupport,
        [{ unit: spearmen, unitSupport: spearmenSupport }],
        { unit: secondSpearmen, unitSupport: spearmenSupport },
      ),
    ).toBe(
      `Assignment for unitType:${spearmen.unitType.id}:1 exceeds support count 1`,
    );
  });

  it('refuses a unit that does not match the stack', () => {
    // The skirmishers are not of the spearmen's unit type.
    expect(
      getAssignmentRefusalReason(handSupport, [], {
        unit: skirmishers,
        unitSupport: spearmenSupport,
      }),
    ).toBe(`Unit does not match support unitType:${spearmen.unitType.id}:1`);
  });

  it('refuses a unit that matches an open stack but is not on White’s board', () => {
    // A third spearmen, of the right type, that White does not have on the
    // board.
    const absent = createTestUnit('white', {
      attack: 3,
      instanceNumber: 3,
      unitType: spearmen.unitType,
    });

    expect(
      getAssignmentRefusalReason(handSupport, [], {
        unit: absent,
        unitSupport: genericSupport,
      }),
    ).toBe('Unit is not on the board for white');
  });
});
