import type { Board } from '@entities';
import type { MoveResult } from './explore';
import { unitFacings } from '@entities';
import { getGridPosition } from '@queries';
import { boardColumnNumbers } from '@ruleValues';

/**
 * As many columns as the widest board has, so a row's rank always clears
 * the last column of the row before it, on a board of any size.
 */
const ENOUGH_COLUMNS = boardColumnNumbers.length;

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
  // Each ending's place in board order, worked out once: its row, its
  // column, then its facing among the eight. Positions are counted from 0,
  // so a row outweighs any column and a column any facing.
  const ranked = [...moves].map((move) => {
    const { row, column } = getGridPosition(board, move.placement.coordinate);
    const facing = unitFacings.indexOf(move.placement.facing);
    const rank = (row * ENOUGH_COLUMNS + column) * unitFacings.length + facing;

    // The ending, carried with its place so the sort reads one number.
    const withRank = { move, rank };
    return withRank;
  });

  // Lowest rank first: row, then column, then facing.
  const listed = ranked
    .toSorted((a, b) => a.rank - b.rank)
    .map(({ move }) => move);

  // The same endings, nothing added or dropped, now in board order.
  return listed;
}
