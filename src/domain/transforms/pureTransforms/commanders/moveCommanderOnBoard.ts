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

  // Off its space; another side's commander there stays.
  const lifted = removeCommanderFromBoard(state.boardState, from, side);

  // Onto the new one, and filed there. Where it may go is the caller's to
  // have settled: a Phase 2 move by legality (§4.2), a ride or a retreat by
  // the unit it goes with (§4.3.10, §9.1.8).
  const written: S = {
    ...state,
    boardState: addCommanderToBoard(lifted, side, to),
    index: fileCommanderInIndex(state.index, side, to),
  };

  // The state with the commander at its new space.
  return written;
}
