import type { GameState } from '@game';
import {
  getCommandedUnitsForPlayer,
  getCommandingPlayer,
  getResolveStepAfterIssuing,
} from '@queries';
import { updateIssueCommandsStep } from './updateIssueCommandsStep';
import { updateRemainingCommandsForPlayer } from './updateRemainingCommandsForPlayer';
import { updateRemainingUnitsForPlayer } from './updateRemainingUnitsForPlayer';

/**
 * A player has finished issuing orders, by giving them all or by stopping
 * (§4.3.3): any orders left are forfeited, the units they ordered are the
 * ones still to act, and they move on to carrying those orders out.
 *
 * @param state - The game state, on that player's issuing step
 * @returns The game state on their resolve step
 */
export function beginResolvingCommands<S extends GameState>(state: S): S {
  const player = getCommandingPlayer(state);
  const resolveStep = getResolveStepAfterIssuing(state);
  const forfeited = updateRemainingCommandsForPlayer(state, player, []);
  const toAct = updateRemainingUnitsForPlayer(
    forfeited,
    player,
    getCommandedUnitsForPlayer(state, player),
  );
  const resolving = updateIssueCommandsStep(toAct, resolveStep);
  return resolving;
}
