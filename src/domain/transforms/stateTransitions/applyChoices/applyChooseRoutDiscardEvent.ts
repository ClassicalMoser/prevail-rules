import type { Board, CleanupPhaseState, GameState } from '@entities';
import type { ChooseRoutDiscardEvent } from '@events';
import {
  getCleanupPhaseState,
  getCurrentRallyResolutionState,
  getRoutStateFromRally,
} from '@queries';

/**
 * Applies a ChooseRoutDiscardEvent to the game state.
 * Marks that the player has chosen which cards to discard for rout penalty.
 *
 * @param event - The choose rout discard event to apply
 * @param state - The current game state
 * @returns A new game state with the rout discard choice recorded
 */
export function applyChooseRoutDiscardEvent<TBoard extends Board>(
  event: ChooseRoutDiscardEvent<TBoard>,
  state: GameState<TBoard>,
): GameState<TBoard> {
  const { player } = event;
  const currentPhaseState = getCleanupPhaseState(state);
  const rallyState = getCurrentRallyResolutionState(state);
  const routState = getRoutStateFromRally(rallyState);

  // Determine which rally resolution we're in
  const firstPlayer = state.currentInitiative;
  const isFirstPlayer = player === firstPlayer;

  // Update the rout state with cardsChosen set to true
  const updatedRoutState = {
    ...routState,
    cardsChosen: true,
  };

  const updatedRallyState = {
    ...rallyState,
    routState: updatedRoutState,
  };

  // Keep the same step - awaiting ResolveRoutDiscardEvent
  const newPhaseState: CleanupPhaseState = isFirstPlayer
    ? {
        ...currentPhaseState,
        firstPlayerRallyResolutionState: updatedRallyState,
      }
    : {
        ...currentPhaseState,
        secondPlayerRallyResolutionState: updatedRallyState,
      };

  return {
    ...state,
    currentRoundState: {
      ...state.currentRoundState,
      currentPhaseState: newPhaseState,
    },
  };
}
