import type { PlayerSide } from '@entities';
import type { Coordinate } from '@ruleValues';
import type { GameState } from '@game';
import { getCommanderSpace } from '@queries';
import { fileCommanderInIndex } from '../gameStateIndex/fileCommanderInIndex';
import { addCommanderToBoard } from './addCommanderToBoard';
import { removeCommanderFromBoard } from './removeCommanderFromBoard';

/**
 * A side's commander changes space: lifted from where it stands and set down
 * on another. However it goes (its own move in Phase 2, riding with a unit,
 * or going with a retreating one), the board changes the same way, in one
 * write with its entry in the index.
 *
 * @param state - The game, with the commander on the board
 * @param side - The side whose commander moves
 * @param to - The space it is set down on
 * @returns The state with the commander at its new space, and filed there
 * @throws When the commander is not on the board
 */
export function moveCommanderOnBoard<S extends GameState>(
  state: S,
  side: PlayerSide,
  to: Coordinate,
): S {
  // Where it stands now; it must be on the board to move.
  const from = getCommanderSpace(side, state);

  // Off its space, onto the new one, and filed there.
  const lifted = removeCommanderFromBoard(state.boardState, from, side);
  const written: S = {
    ...state,
    boardState: addCommanderToBoard(lifted, side, to),
    index: fileCommanderInIndex(state.index, side, to),
  };
  return written;
}
