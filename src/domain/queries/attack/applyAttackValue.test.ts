import { createEmptyGameState } from '@factories';
/**
 * An attack meets a defense when it is greater than or equal to that stat.
 * Rout, reverse, and retreat are compared independently. A defending modifier
 * of type `defense` shifts all three before the comparison; other modifier
 * types do not.
 */

import type { UnitType } from '@entities';
import { createTestUnit } from '@testing';

import { applyAttackValue } from './applyAttackValue';

function unitTypeWithDefenses(defenses: {
  retreat: number;
  reverse: number;
  rout: number;
}): UnitType {
  return {
    imageUrl: 'https://assets.prevailgame.com/art/homemade/unit/Hastati.png',
    cost: 1,
    id: '00000000-0000-4000-8000-000000000001',
    limit: 1,
    name: 'Defenses',
    version: '1.0.0',
    morale: 0,
    stats: {
      attack: 1,
      flexibility: 1,
      range: 0,
      speed: 1,
      ...defenses,
    },
    traits: [],
  };
}

describe(applyAttackValue, () => {
  const gameState = createEmptyGameState('standard');

  describe('an attack above a threshold', () => {
    it('routs the unit when the attack is above its rout', () => {
      const unit = createTestUnit('black', { rout: 3 });
      expect(applyAttackValue(gameState, 4, unit).unitRouted).toBe(true);
    });

    it('reverses the unit when the attack is above its reverse', () => {
      const unit = createTestUnit('black', { reverse: 3 });
      expect(applyAttackValue(gameState, 4, unit).unitReversed).toBe(true);
    });

    it('retreats the unit when the attack is above its retreat', () => {
      const unit = createTestUnit('black', { retreat: 3 });
      expect(applyAttackValue(gameState, 4, unit).unitRetreated).toBe(true);
    });
  });

  describe('an attack that lands exactly on a threshold', () => {
    it('routs the unit when the attack equals its rout', () => {
      const unit = createTestUnit('black', { rout: 3 });
      expect(applyAttackValue(gameState, 3, unit).unitRouted).toBe(true);
    });

    it('reverses the unit when the attack equals its reverse', () => {
      const unit = createTestUnit('black', { reverse: 3 });
      expect(applyAttackValue(gameState, 3, unit).unitReversed).toBe(true);
    });

    it('retreats the unit when the attack equals its retreat', () => {
      const unit = createTestUnit('black', { retreat: 3 });
      expect(applyAttackValue(gameState, 3, unit).unitRetreated).toBe(true);
    });
  });

  describe('an attack short of a threshold', () => {
    it('leaves the unit unrouted when the attack is below its rout', () => {
      const unit = createTestUnit('black', { rout: 3 });
      expect(applyAttackValue(gameState, 2, unit).unitRouted).toBe(false);
    });

    it('leaves the unit unreversed when the attack is below its reverse', () => {
      const unit = createTestUnit('black', { reverse: 3 });
      expect(applyAttackValue(gameState, 2, unit).unitReversed).toBe(false);
    });

    it('leaves the unit unretreated when the attack is below its retreat', () => {
      const unit = createTestUnit('black', { retreat: 3 });
      expect(applyAttackValue(gameState, 2, unit).unitRetreated).toBe(false);
    });
  });

  it('routs without retreating or reversing when rout is the only defense the attack meets', () => {
    const unit = createTestUnit('black', {
      unitType: unitTypeWithDefenses({ retreat: 5, reverse: 6, rout: 2 }),
    });

    expect(applyAttackValue(gameState, 3, unit)).toStrictEqual({
      unitRetreated: false,
      unitReversed: false,
      unitRouted: true,
    });
  });

  it('raises every defense by a defense modifier before comparing', () => {
    const unit = createTestUnit('black', {
      unitType: unitTypeWithDefenses({ retreat: 3, reverse: 3, rout: 3 }),
    });

    expect(applyAttackValue(gameState, 4, unit).unitRouted).toBe(true);
    expect(
      applyAttackValue(gameState, 4, unit, [{ type: 'defense', value: 2 }]),
    ).toStrictEqual({
      unitRetreated: false,
      unitReversed: false,
      unitRouted: false,
    });
  });

  it('ignores a defending modifier that is not defense', () => {
    const unit = createTestUnit('black', {
      unitType: unitTypeWithDefenses({ retreat: 3, reverse: 3, rout: 3 }),
    });

    expect(
      applyAttackValue(gameState, 3, unit, [{ type: 'attack', value: 2 }]),
    ).toStrictEqual({
      unitRetreated: true,
      unitReversed: true,
      unitRouted: true,
    });
  });
});
