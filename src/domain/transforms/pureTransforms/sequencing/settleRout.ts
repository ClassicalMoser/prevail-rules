import type { GameState, RoutState } from '@game';
import { closeRearEngagementWhenRouted } from './closeRearEngagementWhenRouted';
import { updateRoutState } from './updateRoutState';

/**
 * Records a rout and closes whatever it was the last thing holding open.
 * A rout is settled two ways, by the Morale being paid or by there being none
 * to pay, and both leave the rout in the same place with the same parents
 * waiting on it: a retreat that fell into it ends, a rally moves on, and a
 * rear engagement, which is nothing but the rout (§6.3.3), is over and the
 * move can finish. Each of those is closed once, here, so neither way of
 * settling can leave a parent hanging.
 *
 * A rout still owed closes nothing; it is written and the parents wait.
 *
 * @param state - The current game state
 * @param routState - The rout as it now stands
 * @returns The state with the rout written and any parent it settled closed
 */
export function settleRout<S extends GameState>(
  state: S,
  routState: RoutState,
): S {
  const written = updateRoutState(state, routState);
  const settled = closeRearEngagementWhenRouted(written);
  return settled;
}
