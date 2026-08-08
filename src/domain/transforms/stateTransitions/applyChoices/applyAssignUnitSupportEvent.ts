import type { UnitInstance } from '@entities';
import type { AssignUnitSupportEvent } from '@events';
import type { GameState } from '@game';
import {
  getPlayerUnitsOnBoard,
  hasUnitInArray,
  isSameUnitInstance,
} from '@queries';
import { applyUnitsLostSupportAfterRally } from '../applyEffects/cards/applyUnitsLostSupportAfterRally';

/**
 * Applies an AssignUnitSupportEvent:
 * covered units stay; board units not in any assignment lose support and rout.
 *
 * Event is assumed pre-validated via {@link isValidAssignUnitSupportEvent}.
 */
export function applyAssignUnitSupportEvent<S extends GameState>(
  event: AssignUnitSupportEvent,
  state: S,
): S {
  const covered: UnitInstance[] = [];
  for (const assignment of event.assignments) {
    for (const unit of assignment.units) {
      if (!hasUnitInArray(covered, unit)) {
        covered.push(unit);
      }
    }
  }

  const boardUnits = [...getPlayerUnitsOnBoard(state, event.player)];
  const uncovered = boardUnits.filter(
    (unit) => !covered.some((c) => isSameUnitInstance(c, unit).result),
  );

  return applyUnitsLostSupportAfterRally(state, event.player, uncovered);
}
