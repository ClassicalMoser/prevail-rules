import type { UnitStatName } from '@entities';

import { isDefenseStat } from './isDefenseStat';

/**
 * IsDefenseStat: The defense stat names (reverse, retreat, rout).
 */
describe(isDefenseStat, () => {
  it('given defense stats, returns true', () => {
    const { result: reverseResult } = isDefenseStat('reverse');
    expect(reverseResult).toBeTruthy();
    const { result: retreatResult } = isDefenseStat('retreat');
    expect(retreatResult).toBeTruthy();
    const { result: routResult } = isDefenseStat('rout');
    expect(routResult).toBeTruthy();
  });

  it('given non-defense stats, returns false', () => {
    const { result: attackResult } = isDefenseStat('attack');
    expect(attackResult).toBeFalsy();
    const { result: rangeResult } = isDefenseStat('range');
    expect(rangeResult).toBeFalsy();
    const { result: speedResult } = isDefenseStat('speed');
    expect(speedResult).toBeFalsy();
    const { result: defenseResult } = isDefenseStat('defense' as UnitStatName);
    expect(defenseResult).toBeFalsy();
  });
});
