import type { Board, GameState, PlayCardsPhaseState } from '@entities';
import type { ResolveInitiativeEvent } from '@events';

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
  event: ResolveInitiativeEvent,
  state: GameState<TBoard>,
): GameState<TBoard> {
  const currentPhaseState = state.currentRoundState.currentPhaseState;

  if (!currentPhaseState) {
    throw new Error('No current phase state found');
  }

  if (currentPhaseState.phase !== 'playCards') {
    throw new Error('Current phase is not playCards');
  }

  if (currentPhaseState.step !== 'assignInitiative') {
    throw new Error('Play cards phase is not on assignInitiative step');
  }

  // Advance to complete step
  const newPhaseState: PlayCardsPhaseState = {
    ...currentPhaseState,
    step: 'complete',
  };

  return {
    ...state,
    currentInitiative: event.player,
    currentRoundState: {
      ...state.currentRoundState,
      currentPhaseState: newPhaseState,
    },
  };
}
