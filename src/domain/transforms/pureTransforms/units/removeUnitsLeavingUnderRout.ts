import type { UnitInstance } from '@entities';
import type { GameState } from '@game';
import { getPositionOfUnit } from '@queries';
import { defeatCommanderWithRoutedUnit } from '../commanders/defeatCommanderWithRoutedUnit';
import { routUnit } from './routUnit';

/**
 * A unit routed in combat leaves the board when the rout opens, not when the
 * discard is paid. Each unit routs, off the board and into `routedUnits`; its
 * own commander, if it stands there, falls with it (§4.2.8). Every combat
 * rout comes here — a shot's or a melee's result, a retreat with nowhere to
 * go, a rear engagement — and the support check's rout does not.
 *
 * @param state - The current game state
 * @param units - The units leaving under this rout
 * @returns A new game state with those units off the board and in `routedUnits`
 * @throws {Error} If a unit is not on the board, as when it has already routed
 */
export function removeUnitsLeavingUnderRout<S extends GameState>(
  state: S,
  units: readonly UnitInstance[],
): S {
  // One unit after another, each written onto the state the one before it
  // left, so every write keeps the board and the index in step.
  let next = state;
  for (const unit of units) {
    // The unit's space is read now: once it routs, it stands nowhere.
    const placement = getPositionOfUnit(next, unit);
    // Its own commander, standing with it, falls with it.
    next = defeatCommanderWithRoutedUnit(next, { placement, unit });
    // The unit itself routs.
    next = routUnit(next, unit);
  }

  // The game with every unit of this rout gone, its Morale still to be paid.
  return next;
}
