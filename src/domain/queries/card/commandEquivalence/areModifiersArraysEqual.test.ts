import type { Modifier } from '@entities';

import { areModifiersArraysEqual } from './areModifiersArraysEqual';

/**
 * A command or round effect prints a list of modifiers, each a stat and a
 * value (§4.3.8). Two lists are the same when they give the same bonuses, in
 * any order, each as many times.
 */
describe('areModifiersArraysEqual function', () => {
  it('holds for two empty lists', () => {
    // A command that gives no bonus is the same as another that gives none.
    expect(areModifiersArraysEqual([], [])).toBe(true);
  });

  it('holds for the same bonuses written separately, in any order', () => {
    // +1 Attack and +2 Speed, printed in either order.
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

  it('holds for a repeated bonus repeated as often on both', () => {
    // +1 Attack three times on each.
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

  it('fails when a repeated bonus has no copy of its own on the other', () => {
    // Two lists of two: +1 Attack twice is not +1 Attack and +2 Speed, though
    // every bonus on the first appears on the second.
    const modifiers1: Modifier[] = [
      { type: 'attack', value: 1 },
      { type: 'attack', value: 1 },
    ];
    const modifiers2: Modifier[] = [
      { type: 'attack', value: 1 },
      { type: 'speed', value: 2 },
    ];

    expect(areModifiersArraysEqual(modifiers1, modifiers2)).toBe(false);
  });

  it('fails when only one gives a bonus', () => {
    const modifiers: Modifier[] = [{ type: 'attack', value: 1 }];

    // Whichever side is empty.
    expect(areModifiersArraysEqual([], modifiers)).toBe(false);
    expect(areModifiersArraysEqual(modifiers, [])).toBe(false);
  });

  it('fails when one gives a bonus more', () => {
    // +1 Attack against +1 Attack and +2 Speed.
    const modifiers1: Modifier[] = [{ type: 'attack', value: 1 }];
    const modifiers2: Modifier[] = [
      { type: 'attack', value: 1 },
      { type: 'speed', value: 2 },
    ];

    expect(areModifiersArraysEqual(modifiers1, modifiers2)).toBe(false);
  });

  it('fails when a bonus differs in size', () => {
    // +2 Speed against +3 Speed, beside the same +1 Attack.
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
