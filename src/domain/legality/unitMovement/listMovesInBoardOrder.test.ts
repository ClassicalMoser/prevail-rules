import type { MoveResult } from './explore';
import { createEmptySmallBoard } from '@factories';
import { listMovesInBoardOrder } from './listMovesInBoardOrder';

/**
 * A set of move endings written down in board order, so a list sent as JSON
 * does not depend on how the walk found them. The order means nothing.
 */
describe('listMovesInBoardOrder function', () => {
  // The small board; only where spaces sit matters here.
  const board = createEmptySmallBoard();

  // An ending on a space and facing; its path and cost do not bear on order.
  const ending = (
    coordinate: MoveResult['placement']['coordinate'],
    facing: MoveResult['placement']['facing'],
  ): MoveResult => ({
    flexibilityUsed: 0,
    path: [],
    placement: { coordinate, facing },
    speedUsed: 0,
  });

  it('lists endings by space, row by row from the north-west', () => {
    // Given south-east first, they come out north-west first.
    const moves = [
      ending('E-5', 'north'),
      ending('B-2', 'north'),
      ending('B-1', 'north'),
    ];
    expect(
      listMovesInBoardOrder(board, moves).map((move) => move.placement),
    ).toStrictEqual([
      { coordinate: 'B-1', facing: 'north' },
      { coordinate: 'B-2', facing: 'north' },
      { coordinate: 'E-5', facing: 'north' },
    ]);
  });

  it('lists endings on one space by facing, the straight ones before the diagonals', () => {
    // Three facings on E-5, given out of order.
    const moves = [
      ending('E-5', 'northWest'),
      ending('E-5', 'south'),
      ending('E-5', 'north'),
    ];
    expect(
      listMovesInBoardOrder(board, moves).map((move) => move.placement.facing),
    ).toStrictEqual(['north', 'south', 'northWest']);
  });
});
