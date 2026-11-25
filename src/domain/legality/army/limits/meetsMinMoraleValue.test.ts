import { STANDARD_MIN_ARMY_MORALE_VALUE } from '@ruleValues';

import { meetsMinMoraleValue } from './meetsMinMoraleValue';

/** A Standard list carries at least 20 Morale; Tutorial sets no floor (§3.1.6). */
describe('meetsMinMoraleValue function', () => {
  it('allows a list exactly at the floor', () => {
    expect(meetsMinMoraleValue(20, STANDARD_MIN_ARMY_MORALE_VALUE)).toBe(true);
  });

  it('refuses a list one short of it', () => {
    expect(meetsMinMoraleValue(19, STANDARD_MIN_ARMY_MORALE_VALUE)).toBe(false);
  });

  it('allows any Morale where the mode sets no floor', () => {
    // No list carries less than 0 Morale, and JavaScript reads `0 >= null` as
    // true, so no case can tell the `null` test from the comparison: dropping
    // it is an equivalent mutant. The test is kept so the reading does not
    // lean on that coercion.
    expect(meetsMinMoraleValue(0, null)).toBe(true);
  });
});
