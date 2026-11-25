import { createEmptyStandardBoard } from '@factories';

import { findPlacementAfterPath } from './findPlacementAfterPath';

/**
 * A path's geometry: steps move one space, turns change the facing. Every
 * case starts on E-5 facing north on an empty board.
 */
describe('findPlacementAfterPath function', () => {
  const board = createEmptyStandardBoard();
  const start = { coordinate: 'E-5', facing: 'north' } as const;

  it('an empty path leaves the unit where it stood', () => {
    // No step and no turn: the same space, the same facing.
    expect(findPlacementAfterPath(board, start, [], 'advance')).toStrictEqual(
      start,
    );
  });

  it('a turn and a step go one space on the new facing', () => {
    // Turned right to face north-east, the step goes to D-6.
    expect(
      findPlacementAfterPath(board, start, ['turnRight', 'step'], 'advance'),
    ).toStrictEqual({ coordinate: 'D-6', facing: 'northEast' });
  });

  it('a retreat steps behind the facing, not ahead of it', () => {
    // Two steps back from E-5 facing north reach G-5, still facing north.
    expect(
      findPlacementAfterPath(board, start, ['step', 'step'], 'retreat'),
    ).toStrictEqual({ coordinate: 'G-5', facing: 'north' });
  });

  it('a step off the board has no placement', () => {
    // From the northern edge, facing off it.
    expect(
      findPlacementAfterPath(
        board,
        { coordinate: 'A-5', facing: 'north' },
        ['step'],
        'advance',
      ),
    ).toBeUndefined();
  });
});
