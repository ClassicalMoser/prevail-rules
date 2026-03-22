import type { Board, GameState } from '@entities';
import type { ResolveInitiativeEvent } from '@events';
import { getPlayCardsPhaseState } from '@queries';
import {
  markPhaseAsComplete,
  updatePhaseState,
} from '@transforms/pureTransforms';

/**
 * Applies a ResolveInitiativeEvent to the game state.
 * Sets the player who has initiative for this round and advances the play cards phase
 * step to `complete`.
 *
 * Step is not re-validated; the event is trusted from the procedure / machine-generated
 * log. Phase is narrowed via `getPlayCardsPhaseState` (throws if not `playCards`).
 *
 * @param event - The resolve initiative event to apply
 * @param state - The current game state
 * @returns A new game state with initiative assigned
 */
export function applyResolveInitiativeEvent<TBoard extends Board>(
  event: ResolveInitiativeEvent<TBoard>,
  state: GameState<TBoard>,
): GameState<TBoard> {
  const phaseState = getPlayCardsPhaseState(state);

  // Advance to complete step
  const newPhaseState = markPhaseAsComplete(phaseState);

  // Set the initiative player
  const stateWithInitiative = {
    ...state,
    currentInitiative: event.player,
  };

  const stateWithPhase = updatePhaseState(stateWithInitiative, newPhaseState);

  return stateWithPhase;
}
