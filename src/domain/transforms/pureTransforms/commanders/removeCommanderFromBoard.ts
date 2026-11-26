import type { Board, BoardSpace, PlayerSide } from '@entities';
import type { Coordinate } from '@ruleValues';
import { getBoardSpace } from '@queries';
import { replaceBoardSpace } from '../board/replaceBoardSpace';
/* Pure transform to remove a commander from the board immutably with no side effects. */

/**
 * A board with one side's commander lifted off a space: the first half of a
 * commander changing space, and the whole of one falling (§4.2.8). The other
 * side's commander, if one rode into the same space (§4.3.10), stays.
 *
 * A step on a bare board only. It does not change the commander's entry in
 * the index, so play reaches it through `moveCommanderOnBoard` and
 * `defeatCommander`, which change the entry in the same write.
 *
 * @param board - The board as it was
 * @param coordinate - The space the commander stands on
 * @param playerSide - The side whose commander is lifted
 * @returns A new board without that commander on that space, every other space as it was
 * @throws When that side's commander is not on that space
 */
export function removeCommanderFromBoard(
  board: Board,
  coordinate: Coordinate,
  playerSide: PlayerSide,
): Board {
  // The space it is lifted from, and whose commanders stand there.
  const space = getBoardSpace(board, coordinate);
  const existingCommanders = space.commanders;

  // Its writers find the space through the index, so a commander missing
  // from it means the board and the index disagree.
  if (!existingCommanders.includes(playerSide)) {
    throw new Error('Commander not present to remove');
  }

  // Only this side's commander leaves; an enemy commander sharing the space
  // is with its own unit.
  const newCommanders = [...existingCommanders].filter(
    (commander) => commander !== playerSide,
  );
  const newSpace: BoardSpace = {
    ...space,
    commanders: newCommanders,
  };

  // Only that one space changes; the rest of the board is as it was.
  const newBoard = replaceBoardSpace(board, coordinate, newSpace);

  // The board without the commander on that space.
  return newBoard;
}
