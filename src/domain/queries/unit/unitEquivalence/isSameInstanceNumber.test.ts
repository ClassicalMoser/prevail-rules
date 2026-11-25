import { createTestUnit } from '@testing';

import { isSameInstanceNumber } from './isSameInstanceNumber';

/**
 * The number that tells copies of one unit type apart. It says nothing about
 * side or type: `isSameUnitInstance` asks those too.
 */
describe('isSameInstanceNumber function', () => {
  it('holds for the same number, whatever else differs', () => {
    // Two different types, each its army's first copy.
    const unit1 = createTestUnit('black', { attack: 3, instanceNumber: 1 });
    const unit2 = createTestUnit('black', { attack: 4, instanceNumber: 1 });
    expect(isSameInstanceNumber(unit1, unit2)).toBe(true);

    // The same number in the other army.
    const enemy = createTestUnit('white', { attack: 3, instanceNumber: 1 });
    expect(isSameInstanceNumber(unit1, enemy)).toBe(true);
  });

  it('fails for different numbers', () => {
    // The first and second copies of one type.
    const unit1 = createTestUnit('black', { attack: 3, instanceNumber: 1 });
    const unit2 = createTestUnit('black', { attack: 3, instanceNumber: 2 });

    expect(isSameInstanceNumber(unit1, unit2)).toBe(false);
  });
});
