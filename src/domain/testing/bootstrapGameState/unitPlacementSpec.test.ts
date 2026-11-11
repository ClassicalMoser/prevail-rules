import type { UnitPlacementSpec } from './unitPlacementSpec';
import { getUnitByTrait } from '@testing/getUnitByTrait';
import {
  assignInstanceNumbers,
  getExplicitInstanceNumber,
  normalizeUnitPlacement,
} from './unitPlacementSpec';

/**
 * GetExplicitInstanceNumber: Short-hand unit placement specification for bootstrapping test scenarios.
 */
describe('getExplicitInstanceNumber function', () => {
  it('given tuple spec, returns undefined', () => {
    expect(getExplicitInstanceNumber(['E-5', 'black'])).toBeUndefined();
  });

  it('given provided, returns instanceNumber for object spec', () => {
    expect(
      getExplicitInstanceNumber({
        coord: 'E-5',
        instanceNumber: 5,
        player: 'black',
      }),
    ).toBe(5);
  });

  it('given object spec without instanceNumber, returns undefined', () => {
    expect(
      getExplicitInstanceNumber({ coord: 'E-5', player: 'black' }),
    ).toBeUndefined();
  });
});

describe('normalizeUnitPlacement function', () => {
  it('given normalize tuple syntax with default facing', () => {
    const result = normalizeUnitPlacement(['E-5', 'black'], 1);
    expect(result.placement.coordinate).toBe('E-5');
    expect(result.placement.facing).toBe('north');
    expect(result.unit.playerSide).toBe('black');
    expect(result.unit.instanceNumber).toBe(1);
  });

  it('given normalize tuple syntax with explicit facing', () => {
    const result = normalizeUnitPlacement(['E-5', 'white', 'south'], 1);
    expect(result.placement.facing).toBe('south');
  });

  it('given normalize object syntax with unit options', () => {
    const result = normalizeUnitPlacement(
      { attack: 3, coord: 'E-6', player: 'white' },
      1,
    );
    expect(result.placement.coordinate).toBe('E-6');
    expect(result.unit.unitType.stats.attack).toBe(3);
  });

  it('given use explicit instance number from object spec', () => {
    const result = normalizeUnitPlacement(
      { coord: 'E-5', instanceNumber: 12, player: 'black' },
      1,
    );
    expect(result.unit.instanceNumber).toBe(12);
  });
});

describe('assignInstanceNumbers function', () => {
  it('given auto-assign sequential numbers when not specified', () => {
    const result = assignInstanceNumbers([
      ['E-5', 'black'],
      ['E-6', 'black'],
    ]);
    expect(result[0].instanceNumber).toBe(1);
    expect(result[1].instanceNumber).toBe(2);
  });

  it('given preserve explicit instance numbers', () => {
    const result = assignInstanceNumbers([
      { coord: 'E-5', instanceNumber: 5, player: 'black' },
      { coord: 'E-6', instanceNumber: 10, player: 'white' },
    ]);
    expect(result[0].instanceNumber).toBe(5);
    expect(result[1].instanceNumber).toBe(10);
  });

  it('given allow duplicate explicit numbers', () => {
    const result = assignInstanceNumbers([
      { coord: 'E-5', instanceNumber: 1, player: 'black' },
      { coord: 'E-6', instanceNumber: 1, player: 'white' },
    ]);
    expect(result[0].instanceNumber).toBe(1);
    expect(result[1].instanceNumber).toBe(1);
  });

  it('given continue auto-assign after explicit', () => {
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
