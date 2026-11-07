import type { UnitInstance } from '@entities';
import type { GameState } from '@game';
import { getPositionOfUnit, hasUnitInArray } from '@queries';
import { updateBoardState } from '../board/updateBoardState';
import { addUnitToRouted } from './addUnitToRouted';
import { removeUnitFromBoard } from './removeUnitFromBoard';

/**
 * A routed unit leaves the board when the rout opens, not when the discard is
 * paid. Removes each unit from the board and records it in `routedUnits`.
 *
 * @param state - The current game state
 * @param units - The units leaving under this rout
 * @returns A new game state with those units off the board and in `routedUnits`
 */
export function removeUnitsLeavingUnderRout<S extends GameState>(
  state: S,
  units: readonly UnitInstance[],
): S {
  let next = state;
  for (const unit of units) {
    // The unit's square is read now — after this write it is gone.
    const placement = getPositionOfUnit(next.boardState, unit);
    next = updateBoardState(
      next,
      removeUnitFromBoard(next.boardState, { placement, unit }),
    );
    if (!hasUnitInArray(next.routedUnits, unit)) {
      next = addUnitToRouted(next, unit);
    }
  }
  return next;
}
