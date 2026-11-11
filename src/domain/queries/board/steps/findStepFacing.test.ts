import { createEmptyStandardBoard } from '@factories';

import { findStepFacing } from './findStepFacing';

/**
 * A step always goes straight ahead (§5.1.3), so the two spaces it joins
 * fix the facing it was taken on.
 */
describe('findStepFacing function', () => {
  const board = createEmptyStandardBoard();

  it('stepping to the space above faces north', () => {
    expect(findStepFacing(board, 'E-5', 'D-5')).toBe('north');
  });

  it('stepping onto a diagonal neighbour faces that diagonal', () => {
    expect(findStepFacing(board, 'E-4', 'D-5')).toBe('northEast');
  });

  it('two spaces that are not neighbours have no step between them', () => {
    expect(findStepFacing(board, 'E-5', 'C-5')).toBeUndefined();
  });
});
