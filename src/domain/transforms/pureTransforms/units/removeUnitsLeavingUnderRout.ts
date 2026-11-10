import type { UnitInstance } from '@entities';
import type { GameState } from '@game';
import { getPositionOfUnit, hasUnitInArray } from '@queries';
import { updateBoardState } from '../board/updateBoardState';
import { defeatCommanderWithRoutedUnit } from '../commanders/defeatCommanderWithRoutedUnit';
import { addUnitToRouted } from './addUnitToRouted';
import { removeUnitFromBoard } from './removeUnitFromBoard';

/**
 * A unit routed in combat leaves the board when the rout opens, not when the
 * discard is paid. Removes each unit from the board and records it in
 * `routedUnits`; its own commander, if it stands there, falls with it
 * (§4.2.8). Every combat rout comes here — a shot's or a melee's result, a
 * retreat with nowhere to go, a rear engagement — and the support check's
 * rout does not.
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
    // Its own commander, standing with it, falls with it.
    next = defeatCommanderWithRoutedUnit(next, { placement, unit });
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
