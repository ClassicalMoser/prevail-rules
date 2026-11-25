import type { ResolveInitiativeEvent } from '@events';
import type { GameState } from '@game';
import { getPlayCardsPhaseState } from '@queries';
import {
  markPhaseAsComplete,
  updateCurrentInitiative,
  updatePhaseState,
} from '@transforms/pureTransforms';

/**
 * Applies a ResolveInitiativeEvent to the game state.
 * Sets the player who has initiative for this round and advances the play cards phase
 * step to `complete`.
 *
 * Step is not re-validated; the event is trusted from the procedure / machine-generated
 * log. Phase is narrowed via {@link getPlayCardsPhaseState} (throws if not `playCards`).
 *
 * @param event - The resolve initiative event to apply
 * @param state - The current game state
 * @returns A new game state with initiative assigned
 */
export function applyResolveInitiativeEvent<S extends GameState>(
  event: ResolveInitiativeEvent,
  state: S,
): S {
  // Safe broad type cast because we know the event is for the board type
  // TODO(misleading): there is no cast here, and no board type; the line
  // insists the game is playing cards, and throws otherwise. Settle by
  // rewording to say initiative is decided only while cards are played (§4.1).
  const phaseState = getPlayCardsPhaseState(state);

  // Advance to complete step
  // Deciding initiative is the last thing card play does (§4.1.3); the
  // commanders move next.
  // TODO(composition): `updatePlayCardsStep(state, 'complete')` does what
  // this line and the `updatePhaseState` below do together, reading the phase
  // through the same `getPlayCardsPhaseState` and throwing the same message;
  // `applyRevealCardsEvent` already uses it. Settle by calling it, once the
  // comments above are reworded so none is left without its line.
  const newPhaseState = markPhaseAsComplete(phaseState);

  // Safe broad type cast because we know the event is for the board type
  // TODO(misleading): no cast here either. The procedure compared the two
  // cards in play: the lower initiative wins, and a tie leaves it with the
  // side that held it (§4.1.3, §4.1.4). That side is the first player for the
  // rest of the round (§4.1.5).
  const stateWithInitiative = updateCurrentInitiative(state, event.player);
  const stateWithPhase = updatePhaseState(stateWithInitiative, newPhaseState);

  // The round's first player decided, and card play complete.
  return stateWithPhase;
}
