import type { Modifier } from '@entities';

import { areModifiersEqual } from './areModifiersEqual';

/**
 * AreModifiersEqual: Compares two Modifier objects for equality by comparing all properties.
 */
describe('areModifiersEqual function', () => {
  it('a modifier matches itself', () => {
    const modifier: Modifier = { type: 'attack', value: 1 };
    expect(areModifiersEqual(modifier, modifier)).toBe(true);
  });
  it('different objects with the same type and value match', () => {
    const modifier1: Modifier = { type: 'defense', value: 2 };
    const modifier2: Modifier = { type: 'defense', value: 2 };
    expect(areModifiersEqual(modifier1, modifier2)).toBe(true);
  });

  it('negative values match', () => {
    const modifier1: Modifier = { type: 'attack', value: -1 };
    const modifier2: Modifier = { type: 'attack', value: -1 };
    expect(areModifiersEqual(modifier1, modifier2)).toBe(true);
  });

  it('zero values match', () => {
    const modifier1: Modifier = { type: 'speed', value: 0 };
    const modifier2: Modifier = { type: 'speed', value: 0 };
    expect(areModifiersEqual(modifier1, modifier2)).toBe(true);
  });

  it('different types do not match', () => {
    const modifier1: Modifier = { type: 'attack', value: 1 };
    const modifier2: Modifier = { type: 'speed', value: 1 };
    expect(areModifiersEqual(modifier1, modifier2)).toBe(false);
  });

  it('different values do not match', () => {
    const modifier1: Modifier = { type: 'attack', value: 1 };
    const modifier2: Modifier = { type: 'attack', value: 2 };
    expect(areModifiersEqual(modifier1, modifier2)).toBe(false);
  });

  it('invalid modifiers do not match', () => {
    const modifier1: Modifier = { type: 'attack', value: 1 };
    // Intentional type error to test invalid modifiers
    const modifier2: Modifier = 'invalid' as unknown as Modifier;
    expect(areModifiersEqual(modifier1, modifier2)).toBe(false);
  });
});
