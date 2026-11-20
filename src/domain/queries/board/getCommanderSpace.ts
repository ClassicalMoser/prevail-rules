import type { Coordinate, PlayerSide } from '@entities';
import type { GameState } from '@game';
import { findCommanderSpace } from './findCommanderSpace';

/**
 * The space where a side's commander stands, for a question that is only
 * asked while it stands on the board: moving it in Phase 2 (§4.2), say. A
 * fallen commander (§4.2.8) is not asked to move, so a missing one is a
 * fault in whoever asked.
 *
 * @param side - The side whose commander is wanted
 * @param gameState - The game, for its index
 * @returns The coordinate the commander stands on
 * @throws When the side's commander is not on the board
 */
export function getCommanderSpace(
  side: PlayerSide,
  gameState: GameState,
): Coordinate {
  // Where the commander stands, if anywhere.
  const space = findCommanderSpace(side, gameState);

  // A commander asked about must be on the board.
  if (space === undefined) {
    throw new Error(`The ${side} commander is not on the board`);
  }

  // The one space it stands on.
  return space;
}
