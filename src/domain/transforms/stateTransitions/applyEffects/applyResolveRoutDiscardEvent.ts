import type { Board, CleanupPhaseState, GameState } from '@entities';
import type { ResolveRoutDiscardEvent } from '@events';

import { getOtherPlayer } from '@queries';
import { discardCardsFromHand } from '@transforms/pureTransforms';

/**
 * Applies a ResolveRoutDiscardEvent to the game state.
 * Discards the chosen cards from the player's hand and advances to the next step.
 *
 * @param event - The resolve rout discard event to apply
 * @param state - The current game state
 * @returns A new game state with cards discarded
 */
export function applyResolveRoutDiscardEvent<TBoard extends Board>(
  event: ResolveRoutDiscardEvent<TBoard>,
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

  if (!rallyState.routDiscardState.cardsChosen) {
    throw new Error('Rout discard cards not yet chosen');
  }

  // Validate that correct number of cards being discarded
  if (cardIds.length !== rallyState.routDiscardState.numberToDiscard) {
    throw new Error(
      `Expected ${rallyState.routDiscardState.numberToDiscard} cards, got ${cardIds.length}`,
    );
  }

  // Discard the cards
  const newCardState = discardCardsFromHand(state.cardState, player, cardIds);

  // Rally resolution is now complete, advance to next step
  const nextStep: CleanupPhaseState['step'] = isFirstPlayer
    ? 'secondPlayerChooseRally'
    : 'complete';

  const newPhaseState: CleanupPhaseState = isFirstPlayer
    ? {
        ...currentPhaseState,
        step: nextStep,
      }
    : {
        ...currentPhaseState,
        step: nextStep,
      };

  return {
    ...state,
    cardState: newCardState,
    currentRoundState: {
      ...state.currentRoundState,
      currentPhaseState: newPhaseState,
    },
  };
}
