import { createEmptyStandardBoard } from '@factories';

import { getPlacementAfterPath } from './getPlacementAfterPath';

/**
 * A validated path's end. The walk is findPlacementAfterPath's; this only
 * insists the path stays on the board, as a checked move or retreat does.
 */
describe('getPlacementAfterPath function', () => {
  const board = createEmptyStandardBoard();

  it('gives where the path ends and which way the unit faces', () => {
    // From E-5 facing north, a right turn and a step.
    const start = { coordinate: 'E-5', facing: 'north' } as const;

    // One space north-east, now facing that way.
    expect(
      getPlacementAfterPath(board, start, ['turnRight', 'step'], 'advance'),
    ).toStrictEqual({ coordinate: 'D-6', facing: 'northEast' });
  });

  it('throws when a step would leave the board, which validation rules out first', () => {
    // From the northern edge, facing off it.
    const start = { coordinate: 'A-5', facing: 'north' } as const;

    // A checked path never runs off the board, so reaching here is a fault.
    expect(() =>
      getPlacementAfterPath(board, start, ['step'], 'advance'),
    ).toThrow(new Error('The advance path leaves the board'));
  });
});
