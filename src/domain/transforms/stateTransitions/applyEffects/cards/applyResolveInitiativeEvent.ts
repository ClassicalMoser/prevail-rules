import type { Board } from '@entities';
import type { ResolveInitiativeEvent } from '@events';
import type { GameStateWithBoard } from '@game';
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
 * log. Phase is narrowed via `getPlayCardsPhaseState` (throws if not `playCards`).
 *
 * @param event - The resolve initiative event to apply
 * @param state - The current game state
 * @returns A new game state with initiative assigned
 */
export function applyResolveInitiativeEvent<TBoard extends Board>(
  event: ResolveInitiativeEvent<TBoard>,
  state: GameStateWithBoard<TBoard>,
): GameStateWithBoard<TBoard> {
  const phaseState = getPlayCardsPhaseState(state);

  // Advance to complete step
  const newPhaseState = markPhaseAsComplete(phaseState);

  const stateWithInitiative = updateCurrentInitiative(state, event.player);
  const stateWithPhase = updatePhaseState(stateWithInitiative, newPhaseState);

  return stateWithPhase;
}
