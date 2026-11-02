import { createTestUnit } from '@testing';

import { hasUnitInSet } from './hasUnitInSet';
import { setWithoutUnit } from './setWithoutUnit';

/**
 * SetWithoutUnit: copy of the set without one unit (matched by value).
 */
describe('setWithoutUnit function', () => {
  it('returns a new set without a unit that is present', () => {
    const unit = createTestUnit('black', { instanceNumber: 1 });
    const other = createTestUnit('white');
    const set = new Set([unit, other]);
    const result = setWithoutUnit(set, unit);
    expect(result.size).toBe(1);
    expect(hasUnitInSet(result, other)).toBe(true);
    expect(hasUnitInSet(result, unit)).toBe(false);
  });

  it('removes a member that matches by value under a different reference', () => {
    const unit = createTestUnit('black', { instanceNumber: 1 });
    const set = new Set([unit]);
    const sameValue = createTestUnit('black', { instanceNumber: 1 });
    const result = setWithoutUnit(set, sameValue);
    expect(result.size).toBe(0);
  });

  it('leaves the size unchanged when the unit is not in the set', () => {
    const set = new Set([createTestUnit('black')]);
    const result = setWithoutUnit(set, createTestUnit('white'));
    expect(result.size).toBe(1);
  });
});
