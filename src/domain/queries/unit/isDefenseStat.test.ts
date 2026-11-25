import type { UnitStatName } from '@entities';

import { isDefenseStat } from './isDefenseStat';

/**
 * A card names the three thresholds together as Defence, which raises all
 * three at once (§7.1.5, §8.5).
 */
describe('isDefenseStat function', () => {
  it('holds for each of the three thresholds', () => {
    expect(isDefenseStat('retreat')).toBe(true);
    expect(isDefenseStat('reverse')).toBe(true);
    expect(isDefenseStat('rout')).toBe(true);
  });

  it('fails for every other stat, and for the name Defence itself', () => {
    // A Defence bonus does nothing to a unit's blow or its movement.
    expect(isDefenseStat('attack')).toBe(false);
    expect(isDefenseStat('range')).toBe(false);
    expect(isDefenseStat('speed')).toBe(false);
    expect(isDefenseStat('flexibility')).toBe(false);
    // 'defense' names the modifier, not a stat a unit prints.
    expect(isDefenseStat('defense' as UnitStatName)).toBe(false);
  });
});
