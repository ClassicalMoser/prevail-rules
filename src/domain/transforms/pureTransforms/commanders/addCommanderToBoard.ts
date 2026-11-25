import type { Board, PlayerSide } from '@entities';
import type { Coordinate } from '@ruleValues';
import { getBoardSpace } from '@queries';

/**
 * A board with one side's commander set down on a space. Commanders do not
 * occupy space (§2.2.2), so it joins whatever already stands there: its own
 * unit, or, once it has ridden into an engagement, the enemy too (§4.3.10).
 *
 * A step on a bare board only. It does not file the commander in the index,
 * so play reaches it through `deployCommander` and `moveCommanderOnBoard`,
 * which file it in the same write; a spec reaches it through a fixture that
 * builds a whole board and derives the index from it.
 *
 * @param board - The board as it was
 * @param playerSide - The side whose commander is set down
 * @param coordinate - The space it is set down on
 * @returns A new board with the commander on that space, every other space as it was
 */
export function addCommanderToBoard(
  board: Board,
  playerSide: PlayerSide,
  coordinate: Coordinate,
): Board {
  // The space it is set down on, and whoever's commander already stands
  // there.
  const space = getBoardSpace(board, coordinate);
  const existingCommanders = space.commanders;

  // It stands alongside them: a commander takes up no room (§2.2.2).
  const newCommanders = [...existingCommanders, playerSide];
  const newSpace = {
    ...space,
    commanders: newCommanders,
  };

  // Only that one space changes; the rest of the board is as it was.
  const newBoard = {
    ...board,
    board: {
      ...board.board,
      [coordinate]: newSpace,
    },
  };

  // The board with the commander standing there.
  return newBoard;
}
