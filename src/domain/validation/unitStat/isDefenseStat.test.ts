import type { UnitStatName } from '@entities';

import { describe, expect, it } from 'vitest';
import { isDefenseStat } from './isDefenseStat';

/**
 * isDefenseStat: The defense stat names (reverse, retreat, rout).
 */
describe('isDefenseStat', () => {
  it('given defense stats, returns true', () => {
    const { result: reverseResult } = isDefenseStat('reverse');
    expect(reverseResult).toBe(true);
    const { result: retreatResult } = isDefenseStat('retreat');
    expect(retreatResult).toBe(true);
    const { result: routResult } = isDefenseStat('rout');
    expect(routResult).toBe(true);
  });
  it('given non-defense stats, returns false', () => {
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
