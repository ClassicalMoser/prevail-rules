import type { Board, Coordinate, PlayerSide } from '@entities';
import { getCommanderSpaces } from './getCommanderSpaces';

/**
 * Gets the board coordinate containing the commander for a given player side.
 * Each board's commander spaces are read once, by `getCommanderSpaces`.
 *
 * @param side - The player side to get the commander space for
 * @param board - The board to search
 * @returns The board coordinate containing the commander, or undefined if not found
 */
export function findCommanderSpace(
  side: PlayerSide,
  board: Board,
): Coordinate | undefined {
  // A fallen commander (§4.2.8) is on no space, and the answer is undefined.
  const space = getCommanderSpaces(board).get(side);
  return space;
}
