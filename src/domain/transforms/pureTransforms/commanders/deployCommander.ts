import type { PlayerSide } from '@entities';
import type { Coordinate } from '@ruleValues';
import type { GameState } from '@game';
import { fileCommanderInIndex } from '../gameStateIndex/fileCommanderInIndex';
import { addCommanderToBoard } from './addCommanderToBoard';

/**
 * A side places its commander at deployment (§3.5.3): from waiting to be
 * placed to standing on the board, in one write with its entry in the index.
 *
 * @param state - The game, the commander not yet placed
 * @param side - The side whose commander deploys
 * @param coordinate - The space it is placed on
 * @returns The state with the commander on the board, and filed there
 * @throws When the commander has already been placed or lost
 */
export function deployCommander<S extends GameState>(
  state: S,
  side: PlayerSide,
  coordinate: Coordinate,
): S {
  // A commander deploys once, before it has stood anywhere.
  if (state.index.commanders[side] !== 'reserved') {
    throw new Error(`The ${side} commander has already been placed`);
  }

  // Placed on its space, and filed there. It may share the space with one of
  // its own units (§3.5.3).
  const written: S = {
    ...state,
    boardState: addCommanderToBoard(state.boardState, side, coordinate),
    index: fileCommanderInIndex(state.index, side, coordinate),
  };

  // The state with the commander standing on the board.
  return written;
}
