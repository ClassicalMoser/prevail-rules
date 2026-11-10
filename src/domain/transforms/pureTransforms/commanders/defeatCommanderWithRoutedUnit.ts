import type { UnitWithPlacement } from '@entities';
import type { GameState } from '@game';
import { getBoardSpace } from '@queries';
import { updateBoardState } from '../board/updateBoardState';
import { addCommanderToLostCommanders } from './addCommanderToLostCommanders';
import { removeCommanderFromBoard } from './removeCommanderFromBoard';

/**
 * A commander standing where one of its own units routs in combat is
 * defeated with it (§4.2.8). It leaves the board for good, and from then on
 * every inspiration range on its side's cards reaches nothing. Defeat costs
 * nothing else: no cards, no Morale.
 *
 * Only the routing unit's own commander falls; an enemy commander in the
 * same space is with its own unit, and stays. The support check's rout
 * never comes here (§10.4).
 *
 * @param state - The game state as the unit routs, the unit still on the board
 * @param routing - The unit routing in combat, and where it stands
 * @returns The state with its own commander gone, if it stood there; otherwise unchanged
 */
export function defeatCommanderWithRoutedUnit<S extends GameState>(
  state: S,
  routing: UnitWithPlacement,
): S {
  // Is the routing unit's own commander in its space?
  const side = routing.unit.playerSide;
  const { coordinate } = routing.placement;
  const space = getBoardSpace(state.boardState, coordinate);
  if (!space.commanders.includes(side)) {
    return state;
  }

  // It falls with the unit: off the board, and recorded as lost.
  const withoutCommander = updateBoardState(
    state,
    removeCommanderFromBoard(state.boardState, coordinate, side),
  );
  const defeated = addCommanderToLostCommanders(withoutCommander, side);
  return defeated;
}
