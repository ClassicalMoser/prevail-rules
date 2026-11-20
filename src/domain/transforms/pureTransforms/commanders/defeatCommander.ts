import type { PlayerSide } from '@entities';
import type { GameState } from '@game';
import { getCommanderSpace } from '@queries';
import { fileCommanderInIndex } from '../gameStateIndex/fileCommanderInIndex';
import { removeCommanderFromBoard } from './removeCommanderFromBoard';

/**
 * A side's commander is defeated (§4.2.8): it leaves the board and is out of
 * the game for good, in one write. The board, the lost commanders and the
 * index change together, so no state has it both standing and lost.
 *
 * When a commander falls is its caller's to say: only with one of its own
 * units routing in combat.
 *
 * @param state - The game, with the commander on the board
 * @param side - The side whose commander falls
 * @returns The state with the commander off the board, among the lost, and filed as lost
 * @throws When the commander is not on the board
 */
export function defeatCommander<S extends GameState>(
  state: S,
  side: PlayerSide,
): S {
  // Where it stands; it must be on the board to fall.
  const at = getCommanderSpace(side, state);

  // Off the board, among the lost, and filed as lost.
  const written: S = {
    ...state,
    boardState: removeCommanderFromBoard(state.boardState, at, side),
    index: fileCommanderInIndex(state.index, side, 'lost'),
    lostCommanders: [...state.lostCommanders, side],
  };
  return written;
}
