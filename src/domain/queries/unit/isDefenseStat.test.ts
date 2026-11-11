import type { UnitStatName } from '@entities';

import { isDefenseStat } from './isDefenseStat';

/**
 * IsDefenseStat: The defense stat names (reverse, retreat, rout).
 */
describe('isDefenseStat function', () => {
  it('returns true for reverse, retreat, and rout', () => {
    const reverseResult = isDefenseStat('reverse');
    expect(reverseResult).toBe(true);
    const retreatResult = isDefenseStat('retreat');
    expect(retreatResult).toBe(true);
    const routResult = isDefenseStat('rout');
    expect(routResult).toBe(true);
  });

  it('returns false for attack, range, speed, and the defense modifier name', () => {
    const attackResult = isDefenseStat('attack');
    expect(attackResult).toBe(false);
    const rangeResult = isDefenseStat('range');
    expect(rangeResult).toBe(false);
    const speedResult = isDefenseStat('speed');
    expect(speedResult).toBe(false);
    const defenseResult = isDefenseStat('defense' as UnitStatName);
    expect(defenseResult).toBe(false);
  });
});
