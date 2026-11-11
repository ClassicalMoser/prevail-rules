import type { UnitSupport } from '@entities';
import type { LegalAssignUnitSupport } from './getLegalAssignUnitSupport';
import { createTestUnit } from '@testing';

import {
  getSupportPlacementOffer,
  isSameSupportPlacement,
} from './getSupportPlacementOffer';

/**
 * After a rally, every unit on the board needs a place in a pool its cards
 * make (§10.4.4). The player fills the places one unit at a time: a unit
 * takes only one place, a pool takes no more units than its count, and any
 * open place an uncovered unit could take must be taken (§10.4.5). Units
 * left without a place rout (§10.4.6).
 *
 * White's hand here makes two pools: a generic pool of two places, and a
 * pool of one place for the spearmen's unit type. White has three units:
 * two spearmen and one other.
 */
const spearmen = createTestUnit('white', { attack: 3, instanceNumber: 1 });
const secondSpearmen = createTestUnit('white', {
  attack: 3,
  instanceNumber: 2,
  unitType: spearmen.unitType,
});
const skirmishers = createTestUnit('white', { attack: 2, instanceNumber: 1 });

const genericPool: UnitSupport = { count: 2, supportType: 'generic' };
const spearmenPool: UnitSupport = {
  count: 1,
  supportType: 'unitType',
  unitTypeId: spearmen.unitType.id,
};

const pools: LegalAssignUnitSupport = {
  categories: [
    {
      eligibleUnits: [spearmen, secondSpearmen, skirmishers],
      unitSupport: genericPool,
    },
    { eligibleUnits: [spearmen, secondSpearmen], unitSupport: spearmenPool },
  ],
  player: 'white',
};

describe('getSupportPlacementOffer function', () => {
  it('offers every unit a place in every pool it matches, before any place is filled', () => {
    const offer = getSupportPlacementOffer(pools, []);

    // Three units fit the generic pool, and the two spearmen fit their own.
    expect(offer.next).toStrictEqual([
      { unit: spearmen, unitSupport: genericPool },
      { unit: secondSpearmen, unitSupport: genericPool },
      { unit: skirmishers, unitSupport: genericPool },
      { unit: spearmen, unitSupport: spearmenPool },
      { unit: secondSpearmen, unitSupport: spearmenPool },
    ]);
    // Places are open and units are uncovered, so white may not stop.
    expect(offer.mayStop).toBe(false);
  });

  it('offers a unit that has its place no other place', () => {
    // The first spearmen takes the spearmen pool's place.
    const offer = getSupportPlacementOffer(pools, [
      { unit: spearmen, unitSupport: spearmenPool },
    ]);

    // A unit takes only one place (§10.4.4), so it is offered nowhere else.
    expect(
      offer.next.some((placement) =>
        isSameSupportPlacement(placement, {
          unit: spearmen,
          unitSupport: genericPool,
        }),
      ),
    ).toBe(false);
  });

  it('offers no more places in a pool that is full', () => {
    // The spearmen pool has one place, and the first spearmen fills it.
    const offer = getSupportPlacementOffer(pools, [
      { unit: spearmen, unitSupport: spearmenPool },
    ]);

    // The second spearmen can still go in the generic pool, but not in its
    // own, which is full.
    expect(offer.next).toStrictEqual([
      { unit: secondSpearmen, unitSupport: genericPool },
      { unit: skirmishers, unitSupport: genericPool },
    ]);
  });

  it('lets the player stop once no open place can take an uncovered unit, leaving the rest to rout', () => {
    // The generic pool's two places go to the second spearmen and the
    // skirmishers, and the spearmen pool's one place to the first spearmen.
    // Every unit has a place.
    const everyUnitPlaced = getSupportPlacementOffer(pools, [
      { unit: secondSpearmen, unitSupport: genericPool },
      { unit: skirmishers, unitSupport: genericPool },
      { unit: spearmen, unitSupport: spearmenPool },
    ]);
    expect(everyUnitPlaced).toStrictEqual({ mayStop: true, next: [] });

    // A poorer arrangement: both spearmen fill the generic pool. The
    // skirmishers match nothing with room left, so white may stop and they
    // rout. §10.4.5 does not oblige the better arrangement.
    const poorer = getSupportPlacementOffer(pools, [
      { unit: spearmen, unitSupport: genericPool },
      { unit: secondSpearmen, unitSupport: genericPool },
    ]);
    expect(poorer).toStrictEqual({ mayStop: true, next: [] });
  });

  it('does not let the player stop while an open place could take an uncovered unit', () => {
    // The spearmen pool is filled, but the generic pool still has room, and
    // two units are still uncovered.
    const offer = getSupportPlacementOffer(pools, [
      { unit: spearmen, unitSupport: spearmenPool },
    ]);

    // Use what you have (§10.4.5).
    expect(offer.mayStop).toBe(false);
  });

  it('offers the same places whatever order the earlier ones were filled in', () => {
    // Filling the same two places in either order leaves the same choice.
    const oneWay = getSupportPlacementOffer(pools, [
      { unit: spearmen, unitSupport: spearmenPool },
      { unit: skirmishers, unitSupport: genericPool },
    ]);
    const otherWay = getSupportPlacementOffer(pools, [
      { unit: skirmishers, unitSupport: genericPool },
      { unit: spearmen, unitSupport: spearmenPool },
    ]);

    expect(otherWay).toStrictEqual(oneWay);
  });
});
