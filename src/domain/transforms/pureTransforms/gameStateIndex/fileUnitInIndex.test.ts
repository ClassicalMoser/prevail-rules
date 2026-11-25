import { createEmptyGameState, createUnitIndexKey } from '@factories';
import { createTestUnit, withReservedUnits } from '@testing';

import { fileUnitInIndex } from './fileUnitInIndex';

/** One unit's entry overwritten; every other entry as it was. */
describe('fileUnitInIndex function', () => {
  it('overwrites the one unit and leaves the rest', () => {
    // Two white units in reserve, filed there, before deployment.
    const first = createTestUnit('white', { attack: 3, instanceNumber: 1 });
    const second = createTestUnit('white', { attack: 3, instanceNumber: 2 });
    const { index } = withReservedUnits(createEmptyGameState('standard'), [
      first,
      second,
    ]);

    const filed = fileUnitInIndex(index, first, 'L-5');

    // The first now stands on L-5; the second still waits; the original is
    // untouched.
    expect(filed.units).toStrictEqual({
      [createUnitIndexKey(first)]: 'L-5',
      [createUnitIndexKey(second)]: 'reserved',
    });
    expect(index.units[createUnitIndexKey(first)]).toBe('reserved');
  });
});
