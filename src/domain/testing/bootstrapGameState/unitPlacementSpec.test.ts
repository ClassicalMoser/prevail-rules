import type { UnitPlacementSpec } from './unitPlacementSpec';
import { getUnitByTrait } from '@testing/getUnitByTrait';
import {
  assignInstanceNumbers,
  getExplicitInstanceNumber,
  normalizeUnitPlacement,
} from './unitPlacementSpec';

/**
 * A spec's shorthand for where a unit stands is read here: whether it gave a
 * number by hand, the whole unit it stands for, and the number each unit
 * carries.
 */
describe('getExplicitInstanceNumber function', () => {
  it('finds no hand-given number in a tuple', () => {
    expect(getExplicitInstanceNumber(['E-5', 'black'])).toBeUndefined();
  });

  it('finds the number an object gives', () => {
    expect(
      getExplicitInstanceNumber({
        coord: 'E-5',
        instanceNumber: 5,
        player: 'black',
      }),
    ).toBe(5);
  });

  it('finds no number in an object that gives none', () => {
    expect(
      getExplicitInstanceNumber({ coord: 'E-5', player: 'black' }),
    ).toBeUndefined();
  });
});

describe('normalizeUnitPlacement function', () => {
  it('stands a tuple’s unit on its space for its side, facing north, with the number counted', () => {
    const result = normalizeUnitPlacement(['E-5', 'black'], 1);
    expect(result.placement.coordinate).toBe('E-5');
    expect(result.placement.facing).toBe('north');
    expect(result.unit.playerSide).toBe('black');
    expect(result.unit.instanceNumber).toBe(1);
  });

  it('turns a tuple’s unit the way its third entry says', () => {
    const result = normalizeUnitPlacement(['E-5', 'white', 'south'], 1);
    expect(result.placement.facing).toBe('south');
  });

  it('chooses an object’s unit by the stats it asks for', () => {
    const result = normalizeUnitPlacement(
      { attack: 3, coord: 'E-6', player: 'white' },
      1,
    );
    expect(result.placement.coordinate).toBe('E-6');
    expect(result.unit.unitType.stats.attack).toBe(3);
  });

  it('lets an object’s own number win over the one counted', () => {
    const result = normalizeUnitPlacement(
      { coord: 'E-5', instanceNumber: 12, player: 'black' },
      1,
    );
    expect(result.unit.instanceNumber).toBe(12);
  });
});

describe('assignInstanceNumbers function', () => {
  it('counts a side’s units 1, 2 in the order listed', () => {
    const result = assignInstanceNumbers([
      ['E-5', 'black'],
      ['E-6', 'black'],
    ]);
    expect(result[0].instanceNumber).toBe(1);
    expect(result[1].instanceNumber).toBe(2);
  });

  it('keeps the numbers given by hand', () => {
    const result = assignInstanceNumbers([
      { coord: 'E-5', instanceNumber: 5, player: 'black' },
      { coord: 'E-6', instanceNumber: 10, player: 'white' },
    ]);
    expect(result[0].instanceNumber).toBe(5);
    expect(result[1].instanceNumber).toBe(10);
  });

  it('lets each side have its own unit numbered 1', () => {
    const result = assignInstanceNumbers([
      { coord: 'E-5', instanceNumber: 1, player: 'black' },
      { coord: 'E-6', instanceNumber: 1, player: 'white' },
    ]);
    expect(result[0].instanceNumber).toBe(1);
    expect(result[1].instanceNumber).toBe(1);
  });

  it('counts on past a number given by hand', () => {
    const result = assignInstanceNumbers([
      ['E-5', 'black'],
      { coord: 'E-6', instanceNumber: 12, player: 'white' },
      ['E-7', 'black'],
    ]);
    expect(result[0].instanceNumber).toBe(1);
    expect(result[1].instanceNumber).toBe(12);
    expect(result[2].instanceNumber).toBe(2);
  });

  it('numbers each player’s units from 1, as the game does', () => {
    const result = assignInstanceNumbers([
      ['E-5', 'black'],
      ['E-6', 'white'],
      ['E-7', 'black'],
      ['E-8', 'white'],
    ]);

    // Each side numbers its own copies of a unit type (§3.1), so the second
    // white unit is white's second, not the fourth overall.
    expect(result.map((entry) => entry.instanceNumber)).toStrictEqual([
      1, 1, 2, 2,
    ]);
  });

  it('numbers a player’s units of each type separately', () => {
    const cavalry = getUnitByTrait('cavalry');
    const phalanx = getUnitByTrait('phalanx');
    const result = assignInstanceNumbers([
      { coord: 'E-5', player: 'black', unitType: cavalry },
      { coord: 'E-6', player: 'black', unitType: phalanx },
      { coord: 'E-7', player: 'black', unitType: cavalry },
    ]);

    // Black's second cavalry is its second, and its first phalanx is its first.
    expect(result.map((entry) => entry.instanceNumber)).toStrictEqual([
      1, 1, 2,
    ]);
  });

  it('stays within the limit a type has for any layout of one side', () => {
    const specs: UnitPlacementSpec[] = Array.from({ length: 12 }, () => [
      'E-5',
      'black',
    ]);

    const result = assignInstanceNumbers(specs);

    // Twelve copies of one type is the most an army may hold.
    expect(Math.max(...result.map((entry) => entry.instanceNumber))).toBe(12);
  });
});
