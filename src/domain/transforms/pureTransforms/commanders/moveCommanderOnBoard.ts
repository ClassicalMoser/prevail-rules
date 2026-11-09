import type { Board, Coordinate, PlayerSide } from '@entities';
import { addCommanderToBoard } from './addCommanderToBoard';
import { removeCommanderFromBoard } from './removeCommanderFromBoard';

/**
 * A commander changes spaces: lifted from the one it stands on and set down
 * on another. Whatever the reason it moves (the Move Commanders phase, §4.2,
 * or riding with its unit, §4.3.10), the board changes the same way.
 */
export function moveCommanderOnBoard(
  board: Board,
  playerSide: PlayerSide,
  from: Coordinate,
  to: Coordinate,
): Board {
  const lifted = removeCommanderFromBoard(board, from, playerSide);
  const moved = addCommanderToBoard(lifted, playerSide, to);
  return moved;
}
