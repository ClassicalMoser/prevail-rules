import type { Modifier } from '@entities';

import { areModifiersArraysEqual } from './areModifiersArraysEqual';

/**
 * AreModifiersArraysEqual: same modifiers by type and value, ignoring order and object identity.
 */
describe('areModifiersArraysEqual function', () => {
  it('both arrays are empty', () => {
    expect(areModifiersArraysEqual([], [])).toBe(true);
  });

  it('a single modifier matches the same type and value', () => {
    const modifiers1: Modifier[] = [{ type: 'defense', value: 2 }];
    const modifiers2: Modifier[] = [{ type: 'defense', value: 2 }];
    expect(areModifiersArraysEqual(modifiers1, modifiers2)).toBe(true);
  });

  it('same modifiers in the same order', () => {
    const modifiers1: Modifier[] = [
      { type: 'attack', value: 1 },
      { type: 'speed', value: 2 },
    ];
    const modifiers2: Modifier[] = [
      { type: 'attack', value: 1 },
      { type: 'speed', value: 2 },
    ];
    expect(areModifiersArraysEqual(modifiers1, modifiers2)).toBe(true);
  });

  it('different objects with the same type and value match', () => {
    const modifiers1: Modifier[] = [{ type: 'attack', value: 1 }];
    const modifiers2: Modifier[] = [{ type: 'attack', value: 1 }];
    expect(areModifiersArraysEqual(modifiers1, modifiers2)).toBe(true);
  });

  it('an array matches itself', () => {
    const modifiers: Modifier[] = [
      { type: 'attack', value: 1 },
      { type: 'defense', value: 2 },
    ];
    expect(areModifiersArraysEqual(modifiers, modifiers)).toBe(true);
  });

  it('the same modifiers in a different order do match', () => {
    const modifiers1: Modifier[] = [
      { type: 'attack', value: 1 },
      { type: 'speed', value: 2 },
    ];
    const modifiers2: Modifier[] = [
      { type: 'speed', value: 2 },
      { type: 'attack', value: 1 },
    ];
    expect(areModifiersArraysEqual(modifiers1, modifiers2)).toBe(true);
  });

  it('repeated copies of one modifier match the same repeated copies', () => {
    const modifiers1: Modifier[] = [
      { type: 'attack', value: 1 },
      { type: 'attack', value: 1 },
      { type: 'attack', value: 1 },
    ];
    const modifiers2: Modifier[] = [
      { type: 'attack', value: 1 },
      { type: 'attack', value: 1 },
      { type: 'attack', value: 1 },
    ];
    expect(areModifiersArraysEqual(modifiers1, modifiers2)).toBe(true);
  });

  it('an empty array does not match a non-empty array', () => {
    const modifiers: Modifier[] = [{ type: 'attack', value: 1 }];
    expect(areModifiersArraysEqual([], modifiers)).toBe(false);
    expect(areModifiersArraysEqual(modifiers, [])).toBe(false);
  });

  it('different lengths do not match', () => {
    const modifiers1: Modifier[] = [{ type: 'attack', value: 1 }];
    const modifiers2: Modifier[] = [
      { type: 'attack', value: 1 },
      { type: 'speed', value: 2 },
    ];
    expect(areModifiersArraysEqual(modifiers1, modifiers2)).toBe(false);
  });

  it('same length with matching modifier but different value does not match', () => {
    const modifiers1: Modifier[] = [
      { type: 'attack', value: 1 },
      { type: 'speed', value: 2 },
    ];
    const modifiers2: Modifier[] = [
      { type: 'attack', value: 1 },
      { type: 'speed', value: 3 },
    ];
    expect(areModifiersArraysEqual(modifiers1, modifiers2)).toBe(false);
  });
});
