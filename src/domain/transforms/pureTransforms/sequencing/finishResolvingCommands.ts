import type { GameState } from '@game';
import { getCommandingPlayer, getStepAfterResolvingCommands } from '@queries';
import { updateIssueCommandsStep } from './updateIssueCommandsStep';
import { updateRemainingUnitsForPlayer } from './updateRemainingUnitsForPlayer';

/**
 * A player's orders are all carried out, or none of the units left can act
 * on them: nothing remains for them to do, and the phase moves on to the
 * second player's orders, or ends (§4.3).
 *
 * @param state - The game state, on that player's resolve step
 * @returns The game state on the step that follows
 */
export function finishResolvingCommands<S extends GameState>(state: S): S {
  // The player whose orders these were, and the step that follows theirs:
  // the second player's issuing once the first is done, or the end of the
  // phase once the second is (§4.3).
  const player = getCommandingPlayer(state);
  const nextStep = getStepAfterResolvingCommands(state);

  // Whatever orders are left unspent are forfeited (§4.3.3), so no unit of
  // theirs is still to act.
  const done = updateRemainingUnitsForPlayer(state, player, []);

  // The phase moves on.
  const advanced = updateIssueCommandsStep(done, nextStep);
  return advanced;
}
