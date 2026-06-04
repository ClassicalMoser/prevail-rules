import { createTestUnit } from '@testing';

import { arrayWithoutUnit, hasUnitInArray } from './unitArray';

/**
 * HasUnitInArray: membership test for UnitInstance in an array using value equality (not reference identity).
 */
describe(hasUnitInArray, () => {
  it('given array contains same instance, returns true', () => {
    const unit = createTestUnit('black', { instanceNumber: 1 });
    const array = [
      createTestUnit('white'),
      unit,
      createTestUnit('black', { instanceNumber: 2 }),
    ];
    expect(hasUnitInArray(array, unit)).toBeTruthy();
  });

  it('given array member equals argument by value, returns true', () => {
    const array = [createTestUnit('black', { instanceNumber: 1 })];
    const sameValue = createTestUnit('black', { instanceNumber: 1 });
    expect(hasUnitInArray(array, sameValue)).toBeTruthy();
  });

  it('given no matching unit, returns false', () => {
    const array = [createTestUnit('black', { instanceNumber: 1 })];
    expect(
      hasUnitInArray(array, createTestUnit('black', { instanceNumber: 2 })),
    ).toBeFalsy();
  });

  it('given empty array, returns false', () => {
    expect(hasUnitInArray([], createTestUnit('black'))).toBeFalsy();
  });
});

/**
 * ArrayWithoutUnit: copy of the array without one unit (matched by value).
 */
describe(arrayWithoutUnit, () => {
  it('given unit present, returns new array without it', () => {
    const unit = createTestUnit('black', { instanceNumber: 1 });
    const other = createTestUnit('white');
    const array = [unit, other];
    const result = arrayWithoutUnit(array, unit);
    expect(result.length).toBe(1);
    expect(hasUnitInArray(result, other)).toBeTruthy();
    expect(hasUnitInArray(result, unit)).toBeFalsy();
  });

  it('given equal value different reference, removes matching unit', () => {
    const unit = createTestUnit('black', { instanceNumber: 1 });
    const array = [unit];
    const sameValue = createTestUnit('black', { instanceNumber: 1 });
    const result = arrayWithoutUnit(array, sameValue);
    expect(result.length).toBe(0);
  });

  it('given unit not in array, leaves length unchanged', () => {
    const array = [createTestUnit('black')];
    const result = arrayWithoutUnit(array, createTestUnit('white'));
    expect(result.length).toBe(1);
  });
});
