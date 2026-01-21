import type { Board, CleanupPhaseState, GameState } from '@entities';
import type { ChooseRoutDiscardEvent } from '@events';

import { getOtherPlayer } from '@queries';

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
  const { player, cardIds } = event;
  const currentPhaseState = state.currentRoundState.currentPhaseState;

  if (!currentPhaseState) {
    throw new Error('No current phase state found');
  }

  if (currentPhaseState.phase !== 'cleanup') {
    throw new Error('Current phase is not cleanup');
  }

  // Determine which rally resolution we're in
  const firstPlayer = state.currentInitiative;
  const secondPlayer = getOtherPlayer(firstPlayer);
  let rallyState;
  let isFirstPlayer: boolean;

  if (currentPhaseState.step === 'firstPlayerResolveRally') {
    if (player !== firstPlayer) {
      throw new Error(`Expected ${firstPlayer} (first player) for discard`);
    }
    rallyState = currentPhaseState.firstPlayerRallyResolutionState;
    isFirstPlayer = true;
  } else if (currentPhaseState.step === 'secondPlayerResolveRally') {
    if (player !== secondPlayer) {
      throw new Error(`Expected ${secondPlayer} (second player) for discard`);
    }
    rallyState = currentPhaseState.secondPlayerRallyResolutionState;
    isFirstPlayer = false;
  } else {
    throw new Error(
      `Cleanup phase is not on a resolveRally step: ${currentPhaseState.step}`,
    );
  }

  if (!rallyState) {
    throw new Error('Rally resolution state not found');
  }

  if (!rallyState.routDiscardState) {
    throw new Error('No rout discard penalty state found');
  }

  if (rallyState.routDiscardState.cardsChosen) {
    throw new Error('Rout discard cards already chosen');
  }

  // Validate that correct number of cards were chosen
  if (cardIds.length !== rallyState.routDiscardState.numberToDiscard) {
    throw new Error(
      `Expected ${rallyState.routDiscardState.numberToDiscard} cards, got ${cardIds.length}`,
    );
  }

  // Update the rout discard state
  const updatedRoutDiscardState = {
    ...rallyState.routDiscardState,
    cardsChosen: true,
  };

  const updatedRallyState = {
    ...rallyState,
    routDiscardState: updatedRoutDiscardState,
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
