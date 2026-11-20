import { createEmptySmallBoard } from '@factories';
import { listInBoardOrder } from './listInBoardOrder';

/**
 * A set of spaces written down in board order, so a list sent as JSON does
 * not depend on how the spaces were found. The order means nothing.
 */
describe('listInBoardOrder function', () => {
  // The small board; any size reads its own spaces the same way.
  const board = createEmptySmallBoard();

  it('lists spaces row by row from the north-west, whatever order they came in', () => {
    // Given south-east first, they come out north-west first.
    const spaces = new Set(['H-12', 'B-1', 'A-2', 'A-1'] as const);
    expect(listInBoardOrder(board, spaces)).toStrictEqual([
      'A-1',
      'A-2',
      'B-1',
      'H-12',
    ]);
  });

  it('lists nothing for no spaces', () => {
    // An empty set is an empty list.
    expect(listInBoardOrder(board, new Set())).toStrictEqual([]);
  });
});
