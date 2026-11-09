import type { Board, Coordinate, UnitFacing } from '@entities';
import {
  getBoardSpace,
  getFrontSpaces,
  getOppositeFacing,
  hasSingleUnit,
} from '@queries';

/**
 * The facing an engaging move ends on, and what the ending costs beyond the
 * step. A front approach ends **squared up, head on** — facing directly
 * opposite the defender — and the turn that squares it is part of the
 * engaging move, spending 1 Flexibility if the last step was not already
 * facing that way (§6.2.3). Flank and rear approaches keep the facing the
 * step arrived on. Because every approach ends square, on the flank, or
 * from behind, no engagement is ever created 45° off head-on (§6.3.1, A13).
 *
 * @param board - The board state
 * @param defenderCoordinate - The space being stepped into
 * @param approachCoordinate - The space the last step left
 * @param steppedFacing - The facing the step arrived on
 * @returns The final facing and the Flexibility the squaring turn spends, or `undefined` when the space holds no lone unit to engage
 */
export function getEngagementEndFacing(
  board: Board,
  defenderCoordinate: Coordinate,
  approachCoordinate: Coordinate,
  steppedFacing: UnitFacing,
): { facing: UnitFacing; flexibilitySpent: number } | undefined {
  // Only a lone unit can be engaged; open ground and engaged spaces have
  // no defender to square up against.
  const destinationSpace = getBoardSpace(board, defenderCoordinate);
  if (!hasSingleUnit(destinationSpace.unitPresence)) {
    return undefined;
  }
  const defenderFacing = destinationSpace.unitPresence.facing;

  // Which of the defender's spaces the step left decides the manner of the
  // engagement (§6.2). Only a front approach forces the facing.
  const defenderFrontSpaces = getFrontSpaces(
    board,
    defenderCoordinate,
    defenderFacing,
  );
  if (!defenderFrontSpaces.has(approachCoordinate)) {
    // Flank and rear approaches fight as they arrived: the flanked
    // defender is the one dragged around, not the attacker (§6.3.4).
    const kept = { facing: steppedFacing, flexibilitySpent: 0 };
    return kept;
  }

  // §6.2.3: squared up, head on. From the centre front space the step
  // already faces that way and the turn costs nothing.
  const squaredFacing = getOppositeFacing(defenderFacing);
  const flexibilitySpent = squaredFacing === steppedFacing ? 0 : 1;
  const squared = { facing: squaredFacing, flexibilitySpent };
  return squared;
}
