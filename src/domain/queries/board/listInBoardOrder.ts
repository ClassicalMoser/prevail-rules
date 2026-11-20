import type { Board, Coordinate } from '@entities';
import { getBoardCoordinates } from './getBoardCoordinates';

/**
 * A set of spaces written down as a list, in board order: row by row from
 * the north edge, each row from the west edge.
 *
 * The order means nothing in the game, and no reader may take it to. It
 * exists because an offer travels as JSON, which has no sets: a list must
 * have some order, and fixing it to the board's keeps it from depending on
 * how the spaces were found. `getLegalPlayerChoiceOptions` lists a
 * commander's destinations this way.
 *
 * @param board - The board the spaces are on
 * @param spaces - The spaces, in any order
 * @returns The same spaces, in board order
 */
export function listInBoardOrder(
  board: Board,
  spaces: ReadonlySet<Coordinate>,
): Coordinate[] {
  // Walk the board in its own order and keep the spaces in the set, so each
  // comes out once and in the same place every time.
  const listed = getBoardCoordinates(board).filter((coordinate) =>
    spaces.has(coordinate),
  );
  return listed;
}
