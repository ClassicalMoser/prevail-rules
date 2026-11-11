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
  const player = getCommandingPlayer(state);
  const nextStep = getStepAfterResolvingCommands(state);
  const done = updateRemainingUnitsForPlayer(state, player, []);
  const advanced = updateIssueCommandsStep(done, nextStep);
  return advanced;
}
