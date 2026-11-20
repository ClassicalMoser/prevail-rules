import type { GameState } from '@game';
import {
  getCommandedUnitsForPlayer,
  getCommandingPlayer,
  getResolveStepAfterIssuing,
} from '@queries';
import { updateIssueCommandsStep } from './updateIssueCommandsStep';
import { updateRemainingUnitsForPlayer } from './updateRemainingUnitsForPlayer';

/**
 * A player has issued their orders (§4.3): the units they ordered are the
 * ones still to act, and they move on to carrying those orders out.
 *
 * @param state - The game state, on that player's issuing step
 * @returns The game state on their resolve step
 */
export function beginResolvingCommands<S extends GameState>(state: S): S {
  const player = getCommandingPlayer(state);
  const resolveStep = getResolveStepAfterIssuing(state);
  const toAct = updateRemainingUnitsForPlayer(
    state,
    player,
    getCommandedUnitsForPlayer(state, player),
  );
  const resolving = updateIssueCommandsStep(toAct, resolveStep);
  return resolving;
}
