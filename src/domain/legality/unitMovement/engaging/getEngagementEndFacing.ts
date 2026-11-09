import type { Board, Coordinate, MoveTurn, UnitFacing } from '@entities';
import {
  getBoardSpace,
  getNeighbourSide,
  getOppositeFacing,
  getStepFacing,
  getTurnedFacing,
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
 * @returns The final facing and the squaring turn the move must include (`null` when none is needed, which costs nothing), or `undefined` when there is no lone unit to engage or the two spaces are not neighbours
 */
export function getEngagementEndFacing(
  board: Board,
  defenderCoordinate: Coordinate,
  approachCoordinate: Coordinate,
): { facing: UnitFacing; squaringTurn: MoveTurn | null } | undefined {
  // Only a lone unit can be engaged; open ground and engaged spaces have
  // no defender to square up against.
  const destinationSpace = getBoardSpace(board, defenderCoordinate);
  if (!hasSingleUnit(destinationSpace.unitPresence)) {
    return undefined;
  }
  const defenderFacing = destinationSpace.unitPresence.facing;

  // A step only ever goes straight ahead (§5.1.3), so the facing it arrived
  // on is fixed by the two spaces. Spaces that are not neighbours were not
  // joined by a step at all.
  const steppedFacing = getStepFacing(
    board,
    approachCoordinate,
    defenderCoordinate,
  );
  if (steppedFacing === undefined) {
    return undefined;
  }

  // Which of the defender's spaces the step left decides the manner of the
  // engagement (§6.2). Only a front approach forces the facing.
  const approach = getNeighbourSide(
    board,
    defenderCoordinate,
    defenderFacing,
    approachCoordinate,
  );
  if (approach !== 'front') {
    // Flank and rear approaches fight as they arrived: the flanked
    // defender is the one dragged around, not the attacker (§6.3.4).
    const kept = { facing: steppedFacing, squaringTurn: null };
    return kept;
  }

  // §6.2.3: squared up, head on. From the centre front space the step
  // already faces that way and no turn is needed.
  const squaredFacing = getOppositeFacing(defenderFacing);
  if (squaredFacing === steppedFacing) {
    const alreadySquare = { facing: squaredFacing, squaringTurn: null };
    return alreadySquare;
  }
  // From either corner front space the step arrives exactly 45° off
  // head-on, so one turn to the side squares it — the turn the move's path
  // must record, for 1 Flexibility.
  const squaringTurn: MoveTurn =
    getTurnedFacing(steppedFacing, 'turnLeft') === squaredFacing
      ? 'turnLeft'
      : 'turnRight';
  const squared = { facing: squaredFacing, squaringTurn };
  return squared;
}
