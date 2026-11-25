import type { MoveTurn } from '@entities';
import { createUnitPlacement } from '@factories';
import { getTurnedFacing } from '@queries';
import type { MoveState } from './moveState';

/**
 * The point a move reaches after one turn in place: the same space, the
 * new facing, one point of Flexibility spent (§5.2.1), the turn added to
 * the path, and the new facing on this space added to the positions held. Whether the turn is allowed is `getTurnOptions`' question;
 * this only takes it.
 *
 * @param state - The point the turn is made from
 * @param turn - The turn made
 * @returns The point after the turn
 */
export function getTurnedState(state: MoveState, turn: MoveTurn): MoveState {
  // The way it faces after the turn.
  const facing = getTurnedFacing(state.facing, turn);

  // The same space, the new facing, a point of Flexibility spent, and this
  // position held from now on.
  const turned: MoveState = {
    ...state,
    facing,
    heldPositions: [
      ...state.heldPositions,
      createUnitPlacement(state.coordinate, facing),
    ],
    path: [...state.path, turn],
    remainingFlexibility: state.remainingFlexibility - 1,
  };

  // The point the move goes on from, or may end at.
  return turned;
}
