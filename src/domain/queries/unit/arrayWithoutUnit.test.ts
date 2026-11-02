import { createTestUnit } from '@testing';

import { arrayWithoutUnit } from './arrayWithoutUnit';
import { hasUnitInArray } from './hasUnitInArray';

/**
 * ArrayWithoutUnit: copy of the array without one unit (matched by value).
 */
describe('arrayWithoutUnit function', () => {
  it('returns a new array without a unit that is present', () => {
    const unit = createTestUnit('black', { instanceNumber: 1 });
    const other = createTestUnit('white');
    const array = [unit, other];
    const result = arrayWithoutUnit(array, unit);
    expect(result).toHaveLength(1);
    expect(hasUnitInArray(result, other)).toBe(true);
    expect(hasUnitInArray(result, unit)).toBe(false);
  });

  it('removes a member that matches by value under a different reference', () => {
    const unit = createTestUnit('black', { instanceNumber: 1 });
    const array = [unit];
    const sameValue = createTestUnit('black', { instanceNumber: 1 });
    const result = arrayWithoutUnit(array, sameValue);
    expect(result).toHaveLength(0);
  });

  it('leaves the length unchanged when the unit is not in the array', () => {
    const array = [createTestUnit('black')];
    const result = arrayWithoutUnit(array, createTestUnit('white'));
    expect(result).toHaveLength(1);
  });
});
