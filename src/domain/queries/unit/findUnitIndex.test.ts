import { createTestUnit } from '@testing';

import { findUnitIndex } from './findUnitIndex';

describe('findUnitIndex function', () => {
  const first = createTestUnit('black', { attack: 3, instanceNumber: 1 });
  const second = createTestUnit('black', { attack: 3, instanceNumber: 2 });
  const members = [{ unit: first }, { unit: second }];

  it('finds a unit by who it is, wherever it stands in the list', () => {
    expect(findUnitIndex(members, first)).toBe(0);
    expect(findUnitIndex(members, second)).toBe(1);
  });

  it('finds the same unit from a separate copy of it', () => {
    expect(findUnitIndex(members, { ...second })).toBe(1);
  });

  it('answers undefined for a unit not in the list', () => {
    const other = createTestUnit('white', { attack: 3, instanceNumber: 1 });

    expect(findUnitIndex(members, other)).toBeUndefined();
  });
});
