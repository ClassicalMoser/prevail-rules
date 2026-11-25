import type { Coordinate, UnitFacing } from '@entities';
import type { MoveState } from './moveState';
import { createUnitPlacement } from '@factories';
import { isSamePlacement } from '@queries';

/**
 * Whether the move has already held this position: stood on this space,
 * facing this way. A move may not come back to a position it has held
 * (§5.2.4); doing so wins nothing a shorter move could not.
 *
 * @param state - The point in the move, with the positions held so far
 * @param coordinate - The space a step or turn would leave the unit on
 * @param facing - The way it would face there
 * @returns Whether that position is one the move has already held
 */
export function isPositionHeld(
  state: MoveState,
  coordinate: Coordinate,
  facing: UnitFacing,
): boolean {
  // A position is a space and a facing together: the same space faced
  // another way is a new position, and so is another space faced this way.
  const position = createUnitPlacement(coordinate, facing);
  const held = state.heldPositions.some((heldPosition) =>
    isSamePlacement(heldPosition, position),
  );

  // A step or turn that would come back here is not offered.
  return held;
}
