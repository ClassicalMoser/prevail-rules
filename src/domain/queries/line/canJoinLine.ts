import type {
  Board,
  Coordinate,
  PlayerSide,
  Restrictions,
  UnitFacing,
  UnitInstance,
  UnitWithPlacement,
} from '@entities';
import { getBoardSpace } from '@queries/board';
import { hasUnitInArray, unitTypeMatchesRestrictions } from '@queries/unit';
import {
  getPlayerUnitWithPosition,
  hasEngagedUnits,
} from '@queries/unitPresence';

/**
 * Whether the unit at `coordinate` may stand in a line (§4.3.5): this is the
 * one statement of who qualifies. A line stops at the first space that fails.
 *
 * - A friendly unit: empty ground or an enemy breaks the line.
 * - Facing the line's way or exactly the opposite: a rank that has
 *   about-faced is still a rank.
 * - Matching the order's trait and type restrictions. Inspiration range is
 *   asked only of the end named first, not here.
 * - Not already commanded this round: a line cannot be drawn through one
 *   (§4.3.6).
 * - Not engaged: an engaged unit cannot be commanded, and a line does not
 *   run past it (§4.3.4, §4.3.5).
 *
 * @param board - The board state
 * @param coordinate - The space to check
 * @param friendlySide - The side that owns the line
 * @param lineFacing - Facing of the unit the line is built from
 * @param oppositeLineFacing - Opposite of `lineFacing`
 * @param restrictions - The order's restrictions; only traits and types are read
 * @param commandedUnits - Units already commanded this round
 * @returns The unit when it can join, otherwise `undefined`
 */
export function canJoinLine(
  board: Board,
  coordinate: Coordinate,
  friendlySide: PlayerSide,
  lineFacing: UnitFacing,
  oppositeLineFacing: UnitFacing,
  restrictions: Restrictions,
  commandedUnits: readonly UnitInstance[],
): UnitWithPlacement | undefined {
  const playerUnit = getPlayerUnitWithPosition(board, coordinate, friendlySide);
  // No friendly unit: empty space or enemy.
  if (playerUnit === undefined) {
    return undefined;
  }
  // A unit locked with an enemy cannot be ordered, so the line stops there.
  if (hasEngagedUnits(getBoardSpace(board, coordinate).unitPresence)) {
    return undefined;
  }
  // Facing must match the line facing or its opposite.
  const playerFacing = playerUnit.placement.facing;
  if (playerFacing !== lineFacing && playerFacing !== oppositeLineFacing) {
    return undefined;
  }
  // The order's trait and type filters apply to every member.
  if (!unitTypeMatchesRestrictions(playerUnit.unit.unitType, restrictions)) {
    return undefined;
  }
  // One order per unit per round: a commanded unit ends the line.
  if (hasUnitInArray([...commandedUnits], playerUnit.unit)) {
    return undefined;
  }
  return playerUnit;
}
