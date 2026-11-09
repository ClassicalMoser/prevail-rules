import { createEmptyStandardBoard } from '@factories';

import { getStepFacing } from './getStepFacing';

/**
 * A step always goes straight ahead (§5.1.3), so the two spaces it joins
 * fix the facing it was taken on.
 */
describe('getStepFacing function', () => {
  const board = createEmptyStandardBoard();

  it('stepping to the space above faces north', () => {
    expect(getStepFacing(board, 'E-5', 'D-5')).toBe('north');
  });

  it('stepping onto a diagonal neighbour faces that diagonal', () => {
    expect(getStepFacing(board, 'E-4', 'D-5')).toBe('northEast');
  });

  it('two spaces that are not neighbours have no step between them', () => {
    expect(getStepFacing(board, 'E-5', 'C-5')).toBeUndefined();
  });
});
