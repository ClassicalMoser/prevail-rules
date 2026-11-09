import { createEmptyStandardBoard } from '@factories';

import { getPlacementAfterPath } from './getPlacementAfterPath';

/**
 * A path's geometry: steps move one space, turns change the facing. Every
 * case starts on E-5 facing north on an empty board.
 */
describe('getPlacementAfterPath function', () => {
  const board = createEmptyStandardBoard();
  const start = { coordinate: 'E-5', facing: 'north' } as const;

  it('an empty path leaves the unit where it stood', () => {
    expect(getPlacementAfterPath(board, start, [], 'advance')).toStrictEqual(
      start,
    );
  });

  it('a turn and a step go one space on the new facing', () => {
    expect(
      getPlacementAfterPath(board, start, ['turnRight', 'step'], 'advance'),
    ).toStrictEqual({ coordinate: 'D-6', facing: 'northEast' });
  });

  it('a retreat steps behind the facing, not ahead of it', () => {
    expect(
      getPlacementAfterPath(board, start, ['step', 'step'], 'retreat'),
    ).toStrictEqual({ coordinate: 'G-5', facing: 'north' });
  });

  it('a step off the board has no placement', () => {
    // From the northern edge, facing off it.
    expect(
      getPlacementAfterPath(
        board,
        { coordinate: 'A-5', facing: 'north' },
        ['step'],
        'advance',
      ),
    ).toBeUndefined();
  });
});
