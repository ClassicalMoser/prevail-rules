import { createEmptyGameState } from '@factories';

import { fileCommanderInIndex } from './fileCommanderInIndex';

/** One commander's entry overwritten; every other entry as it was. */
describe('fileCommanderInIndex function', () => {
  it('overwrites the one side and leaves the other', () => {
    // Both commanders waiting to be placed.
    const { index } = createEmptyGameState('standard');

    const filed = fileCommanderInIndex(index, 'black', 'E-5');

    // Black's stands on E-5; white's still waits; the original is untouched.
    expect(filed.commanders).toStrictEqual({ black: 'E-5', white: 'reserved' });
    expect(index.commanders.black).toBe('reserved');
  });
});
