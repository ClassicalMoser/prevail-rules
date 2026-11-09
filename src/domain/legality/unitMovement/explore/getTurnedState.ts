import type { MoveTurn } from '@entities';
import { getTurnedFacing } from '@queries';
import type { MoveState } from './moveState';

/**
 * The point a move reaches after one turn in place: the same space, the
 * new facing, one point of Flexibility spent (§5.2.1), and the turn added
 * to the path. Whether the turn is allowed is `getTurnOptions`' question;
 * this only takes it.
 *
 * @param state - The point the turn is made from
 * @param turn - The turn made
 * @returns The point after the turn
 */
export function getTurnedState(state: MoveState, turn: MoveTurn): MoveState {
  const turned: MoveState = {
    ...state,
    facing: getTurnedFacing(state.facing, turn),
    path: [...state.path, turn],
    remainingFlexibility: state.remainingFlexibility - 1,
  };
  return turned;
}
