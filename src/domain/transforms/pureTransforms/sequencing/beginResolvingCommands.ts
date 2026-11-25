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
  // The player whose issuing step this is, and the resolve step that is
  // theirs next: a player carries out their own orders before the other
  // issues any (§4.3).
  const player = getCommandingPlayer(state);
  const resolveStep = getResolveStepAfterIssuing(state);

  // Every unit this player ordered this round is one still to act. A unit is
  // ordered only once a round (§4.3.6), so the round's list is exactly the
  // orders this player has just issued.
  const ordered = getCommandedUnitsForPlayer(state, player);
  const toAct = updateRemainingUnitsForPlayer(state, player, ordered);

  // The player moves on to carrying those orders out, one unit at a time
  // (§4.3.9).
  const resolving = updateIssueCommandsStep(toAct, resolveStep);
  return resolving;
}
