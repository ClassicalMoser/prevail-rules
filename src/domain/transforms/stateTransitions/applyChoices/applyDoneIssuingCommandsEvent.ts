import type { DoneIssuingCommandsEvent } from '@events';
import type { GameState } from '@game';
import { getCommandingPlayer } from '@queries';
import { beginResolvingCommands } from '@transforms/pureTransforms';

/**
 * Applies a DoneIssuingCommandsEvent: the player stops issuing orders and
 * forfeits those left (§4.3.3), and moves on to carrying out the ones given.
 */
export function applyDoneIssuingCommandsEvent<S extends GameState>(
  event: DoneIssuingCommandsEvent,
  state: S,
): S {
  // Only the player whose issuing step it is can stop issuing.
  const commanding = getCommandingPlayer(state);
  if (event.player !== commanding) {
    throw new Error(
      `doneIssuingCommands is for ${commanding}, not ${event.player}`,
    );
  }
  const resolving = beginResolvingCommands(state);
  return resolving;
}
