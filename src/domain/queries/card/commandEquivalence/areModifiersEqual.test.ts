import type { Modifier } from '@entities';

import { areModifiersEqual } from './areModifiersEqual';

/**
 * A modifier is a stat and a value: +1 Attack, −2 Speed (§4.3.8). Two are the
 * same modifier when both agree.
 */
describe('areModifiersEqual function', () => {
  it('holds for the same stat and value written separately, a penalty included', () => {
    // +2 Defence on both.
    const bonus1: Modifier = { type: 'defense', value: 2 };
    const bonus2: Modifier = { type: 'defense', value: 2 };
    expect(areModifiersEqual(bonus1, bonus2)).toBe(true);

    // −1 Attack on both: a penalty is a modifier like any other.
    const penalty1: Modifier = { type: 'attack', value: -1 };
    const penalty2: Modifier = { type: 'attack', value: -1 };
    expect(areModifiersEqual(penalty1, penalty2)).toBe(true);
  });

  it('fails when the stats differ', () => {
    // +1 Attack is not +1 Speed.
    const modifier1: Modifier = { type: 'attack', value: 1 };
    const modifier2: Modifier = { type: 'speed', value: 1 };

    expect(areModifiersEqual(modifier1, modifier2)).toBe(false);
  });

  it('fails when the values differ', () => {
    // +1 Attack is not +2 Attack.
    const modifier1: Modifier = { type: 'attack', value: 1 };
    const modifier2: Modifier = { type: 'attack', value: 2 };

    expect(areModifiersEqual(modifier1, modifier2)).toBe(false);
  });
});
