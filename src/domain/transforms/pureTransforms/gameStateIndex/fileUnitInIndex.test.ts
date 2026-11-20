import { createEmptyGameState, createUnitIndexKey } from '@factories';
import { createTestUnit } from '@testing';

import { fileUnitInIndex } from './fileUnitInIndex';

/** One unit's entry overwritten; every other entry as it was. */
describe('fileUnitInIndex function', () => {
  it('overwrites the one unit and leaves the rest', () => {
    // Two white units in reserve.
    const first = createTestUnit('white', { attack: 3, instanceNumber: 1 });
    const second = createTestUnit('white', { attack: 3, instanceNumber: 2 });
    const index = {
      ...createEmptyGameState('standard').index,
      units: {
        [createUnitIndexKey(first)]: 'reserved' as const,
        [createUnitIndexKey(second)]: 'reserved' as const,
      },
    };

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
