import { STANDARD_MAX_ARMY_COST } from '@ruleValues';

import { isWithinMaxArmyCost } from './isWithinMaxArmyCost';

/** A Standard list costs at most 300; Tutorial sets no cap (§3.1.3). */
describe('isWithinMaxArmyCost function', () => {
  it('allows a list that spends the whole cap', () => {
    expect(isWithinMaxArmyCost(300, STANDARD_MAX_ARMY_COST)).toBe(true);
  });

  it('refuses a list one point over', () => {
    expect(isWithinMaxArmyCost(301, STANDARD_MAX_ARMY_COST)).toBe(false);
  });

  it('allows any cost where the mode sets no cap', () => {
    expect(isWithinMaxArmyCost(10_000, null)).toBe(true);
  });
});
