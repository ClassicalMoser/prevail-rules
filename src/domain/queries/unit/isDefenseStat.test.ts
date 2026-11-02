import type { UnitStatName } from '@entities';

import { isDefenseStat } from './isDefenseStat';

/**
 * IsDefenseStat: The defense stat names (reverse, retreat, rout).
 */
describe('isDefenseStat function', () => {
  it('returns true for reverse, retreat, and rout', () => {
    const { result: reverseResult } = isDefenseStat('reverse');
    expect(reverseResult).toBe(true);
    const { result: retreatResult } = isDefenseStat('retreat');
    expect(retreatResult).toBe(true);
    const { result: routResult } = isDefenseStat('rout');
    expect(routResult).toBe(true);
  });

  it('returns false for attack, range, speed, and the defense modifier name', () => {
    const { result: attackResult } = isDefenseStat('attack');
    expect(attackResult).toBe(false);
    const { result: rangeResult } = isDefenseStat('range');
    expect(rangeResult).toBe(false);
    const { result: speedResult } = isDefenseStat('speed');
    expect(speedResult).toBe(false);
    const { result: defenseResult } = isDefenseStat('defense' as UnitStatName);
    expect(defenseResult).toBe(false);
  });
});
