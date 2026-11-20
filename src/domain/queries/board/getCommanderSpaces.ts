import type { Board, Coordinate, PlayerSide } from '@entities';
import { getBoardCoordinates } from './getBoardCoordinates';
import { getBoardSpace } from './getBoardSpace';

/**
 * Each board already read, with the space each side's commander stands in.
 *
 * A board is never written in place: every transform returns a new one. So
 * what one read of a board found holds for every later question about the
 * same board. Keyed weakly, so a board no longer held by the game is let go
 * with its answers.
 */
const commanderSpacesByBoard = new WeakMap<
  Board,
  ReadonlyMap<PlayerSide, Coordinate>
>();

/**
 * The space each side's commander stands in, for each commander on the board.
 *
 * Inspiration range is measured from the commander (§4.2.7), and a round
 * effect's range is checked whenever its bonus matters (§4.3.7), so this is
 * asked on nearly every read of a unit's stats. The board is read once here,
 * the first time it is asked about, and `findCommanderSpace` looks a side up
 * in that reading. A side whose commander has fallen (§4.2.8) is absent.
 *
 * @param board - The board to read
 * @returns Each side's commander space, for the commanders still on the board
 */
export function getCommanderSpaces(
  board: Board,
): ReadonlyMap<PlayerSide, Coordinate> {
  // A board read before gives the same answer again.
  const known = commanderSpacesByBoard.get(board);
  if (known !== undefined) {
    return known;
  }

  // Read every space, row by row, as the walk it replaces did. Should a side's
  // commander ever stand in two spaces, the first in that order answers.
  const spaces = new Map<PlayerSide, Coordinate>();
  for (const coordinate of getBoardCoordinates(board)) {
    for (const side of getBoardSpace(board, coordinate).commanders) {
      if (!spaces.has(side)) {
        spaces.set(side, coordinate);
      }
    }
  }

  // Kept for the next question about this same board.
  commanderSpacesByBoard.set(board, spaces);
  return spaces;
}
