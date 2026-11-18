import { STANDARD_MAX_ARMY_UNIT_TYPE_COUNT } from '@ruleValues';

import { isWithinMaxUnitTypeCount } from './isWithinMaxUnitTypeCount';

/** A Standard list fields at most eight different unit types (§3.1.3). */
describe('isWithinMaxUnitTypeCount function', () => {
  it('allows a list at the limit', () => {
    expect(isWithinMaxUnitTypeCount(8, STANDARD_MAX_ARMY_UNIT_TYPE_COUNT)).toBe(
      true,
    );
  });

  it('refuses a list with one type too many', () => {
    expect(isWithinMaxUnitTypeCount(9, STANDARD_MAX_ARMY_UNIT_TYPE_COUNT)).toBe(
      false,
    );
  });
});
