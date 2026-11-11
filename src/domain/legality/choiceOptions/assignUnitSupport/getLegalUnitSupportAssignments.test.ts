import type { UnitSupport } from '@entities';
import type { LegalAssignUnitSupport } from './getLegalAssignUnitSupport';
import { createTestUnit } from '@testing';

import {
  getLegalUnitSupportAssignments,
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

  it('offers a unit that has its place no other place', () => {
    // The first spearmen takes the spearmen support's one place.
    const offer = getLegalUnitSupportAssignments(handSupport, [
      { unit: spearmen, unitSupport: spearmenSupport },
    ]);

    // A unit takes only one place (§10.4.4), so it is offered nowhere else.
    expect(
      offer.next.some((assignment) =>
        isSameUnitSupportAssignment(assignment, {
          unit: spearmen,
          unitSupport: genericSupport,
        }),
      ),
    ).toBe(false);
  });

  it('offers no more places under a unit support whose places are all filled', () => {
    // The spearmen support has one place, and the first spearmen fills it.
    const offer = getLegalUnitSupportAssignments(handSupport, [
      { unit: spearmen, unitSupport: spearmenSupport },
    ]);

    // The second spearmen can still go under the generic support, but not
    // under its own, which is full.
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
