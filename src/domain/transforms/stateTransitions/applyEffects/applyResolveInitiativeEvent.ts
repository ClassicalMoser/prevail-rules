import type { Board, GameState, PlayCardsPhaseState } from '@entities';
import type { ResolveInitiativeEvent } from '@events';
import { getPlayCardsPhaseState } from '@queries';
import { withPhaseState } from '@transforms/pureTransforms';

/**
 * Applies a ResolveInitiativeEvent to the game state.
 * Sets the player who has initiative for this round and advances
 * the play cards phase step from 'assignInitiative' to 'complete'.
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

  if (phaseState.step !== 'assignInitiative') {
    throw new Error('Play cards phase is not on assignInitiative step');
  }

  // Advance to complete step
  const newPhaseState: PlayCardsPhaseState = {
    ...phaseState,
    step: 'complete',
  };

  // Set the initiative player
  const stateWithInitiative = {
    ...state,
    currentInitiative: event.player,
  };

  const stateWithPhase = withPhaseState(stateWithInitiative, newPhaseState);

  return stateWithPhase;
}
