import { createTestUnit } from '@testing';

import { isSameInstanceNumber } from './isSameInstanceNumber';

/**
 * IsSameInstanceNumber: Determines whether two unit instances have the same instance number.
 */
describe('isSameInstanceNumber function', () => {
  it('returns true when both units have the same instance number', () => {
    const unit1 = createTestUnit('black', { attack: 3, instanceNumber: 1 });
    const unit2 = createTestUnit('black', { attack: 4, instanceNumber: 1 });
    expect(isSameInstanceNumber(unit1, unit2)).toBe(true);
  });

  it('returns false when units have different instance numbers', () => {
    const unit1 = createTestUnit('black', { attack: 3, instanceNumber: 1 });
    const unit2 = createTestUnit('black', { attack: 3, instanceNumber: 2 });
    expect(isSameInstanceNumber(unit1, unit2)).toBe(false);
  });

  it('returns true when comparing a unit to itself', () => {
    const unit = createTestUnit('black', { attack: 3, instanceNumber: 1 });
    expect(isSameInstanceNumber(unit, unit)).toBe(true);
  });

  it('returns true when the sides differ and the instance number matches', () => {
    const unit1 = createTestUnit('black', { attack: 3, instanceNumber: 1 });
    const unit2 = createTestUnit('white', { attack: 3, instanceNumber: 1 });
    expect(isSameInstanceNumber(unit1, unit2)).toBe(true);
  });

  it('returns false when the instance numbers differ and the type matches', () => {
    const unit1 = createTestUnit('black', { attack: 3, instanceNumber: 1 });
    const unit2 = createTestUnit('black', { attack: 3, instanceNumber: 3 });
    expect(isSameInstanceNumber(unit1, unit2)).toBe(false);
  });
});
