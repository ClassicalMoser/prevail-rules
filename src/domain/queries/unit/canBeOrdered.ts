import type {
  Board,
  Restrictions,
  UnitInstance,
  UnitWithPlacement,
} from '@entities';
import { getBoardSpace } from '@queries/board';
import { hasEngagedUnits } from '@queries/unitPresence';
import { hasUnitInArray } from './hasUnitInArray';
import { unitTypeMatchesRestrictions } from './unitTypeMatchesRestrictions';

/**
 * Whether an order may name this unit at all (§4.3.4, §4.3.6): it is not
 * locked in an engagement, it has not been commanded this round, and its type
 * is one the order's trait and type restrictions allow. A unit that fails any
 * of these can be neither ordered by itself nor stand in a line.
 *
 * Inspiration range is not asked here: only a line's anchor needs it
 * (§4.3.5), where a units order asks it of every unit, so each caller asks it
 * on top of this.
 *
 * @param unitWithPlacement - The unit and where it stands
 * @param board - The board state
 * @param restrictions - The order's restrictions; only traits and types are read
 * @param commandedUnits - Units already commanded this round
 * @returns True when the order may name the unit
 */
export function canBeOrdered(
  unitWithPlacement: UnitWithPlacement,
  board: Board,
  restrictions: Restrictions,
  commandedUnits: readonly UnitInstance[],
): boolean {
  // A unit locked with an enemy cannot be ordered (§4.3.4).
  const space = getBoardSpace(board, unitWithPlacement.placement.coordinate);
  if (hasEngagedUnits(space.unitPresence)) {
    return false;
  }
  // One order per unit per round (§4.3.6).
  if (hasUnitInArray(commandedUnits, unitWithPlacement.unit)) {
    return false;
  }
  // The order's trait and type filters.
  const allowed = unitTypeMatchesRestrictions(
    unitWithPlacement.unit.unitType,
    restrictions,
  );
  return allowed;
}
