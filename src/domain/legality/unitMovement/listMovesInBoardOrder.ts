import type { Board } from '@entities';
import type { MoveResult } from './explore';
import { unitFacings } from '@entities';
import { getGridPosition } from '@queries';

/**
 * A set of move endings written down as a list, in board order: by the space
 * each ends on, row by row from the north edge and each row from the west,
 * then on one space by facing, the four straight facings before the four
 * diagonals.
 *
 * The order means nothing in the game, and no reader may take it to. An
 * offer travels as JSON, which has no sets, so a list must have some order;
 * fixing it to the board's keeps it from depending on how the walk found the
 * endings. The moveUnit offer in `getLegalPlayerChoiceOptions` lists a
 * mover's endings this way, as `listInBoardOrder` does for spaces.
 *
 * @param board - The board the move is on
 * @param moves - The endings, in any order
 * @returns The same endings, in board order
 */
export function listMovesInBoardOrder(
  board: Board,
  moves: Iterable<MoveResult>,
): MoveResult[] {
  const listed = [...moves].toSorted((a, b) => {
    // Earlier rows first, then earlier columns: the space's place on the
    // board.
    const aSpace = getGridPosition(board, a.placement.coordinate);
    const bSpace = getGridPosition(board, b.placement.coordinate);
    const byRow = aSpace.row - bSpace.row;
    const byColumn = aSpace.column - bSpace.column;

    // On one space, the facings in their fixed order.
    const byFacing =
      unitFacings.indexOf(a.placement.facing) -
      unitFacings.indexOf(b.placement.facing);

    // Row, then column, then facing.
    const order = byRow || byColumn || byFacing;
    return order;
  });
  return listed;
}
