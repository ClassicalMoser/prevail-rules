import type {
  Board,
  CardState,
  CleanupPhaseState,
  GameState,
  RallyResolutionState,
} from '@entities';
import type { ResolveRallyEvent } from '@events';
import {
  burnCardFromPlayed,
  returnCardsToHand,
} from '@transforms/pureTransforms';

/**
 * Applies a ResolveRallyEvent to the game state.
 * Burns the specified card from played pile, then returns all remaining played
 * and discarded cards to the player's hand.
 * Advances to the appropriate resolveUnitSupport step.
 *
 * @param event - The resolve rally event to apply
 * @param state - The current game state
 * @returns A new game state with rally resolved
 */
export function applyResolveRallyEvent<TBoard extends Board>(
  event: ResolveRallyEvent<TBoard>,
  state: GameState<TBoard>,
): GameState<TBoard> {
  const { player, card } = event;
  const currentPhaseState = state.currentRoundState.currentPhaseState;

  if (!currentPhaseState) {
    throw new Error('No current phase state found');
  }

  if (currentPhaseState.phase !== 'cleanup') {
    throw new Error('Current phase is not cleanup');
  }

  // Determine which step we're on and validate
  const firstPlayer = state.currentInitiative;
  let newStep: CleanupPhaseState['step'];
  let rallyResolutionState;

  if (currentPhaseState.step === 'firstPlayerResolveRally') {
    if (player !== firstPlayer) {
      throw new Error(
        `Expected ${firstPlayer} (first player) to resolve rally`,
      );
    }
    rallyResolutionState = currentPhaseState.firstPlayerRallyResolutionState;
    newStep = 'secondPlayerChooseRally';
  } else if (currentPhaseState.step === 'secondPlayerResolveRally') {
    if (player === firstPlayer) {
      throw new Error(`Expected non-first player to resolve rally`);
    }
    rallyResolutionState = currentPhaseState.secondPlayerRallyResolutionState;
    newStep = 'complete';
  } else {
    throw new Error(
      `Cleanup phase is not on a resolveRally step: ${currentPhaseState.step}`,
    );
  }

  if (!rallyResolutionState) {
    throw new Error('Rally resolution state not found');
  }

  if (!rallyResolutionState.playerRallied) {
    throw new Error('Player did not choose to rally');
  }

  if (rallyResolutionState.rallyResolved) {
    throw new Error('Rally has already been resolved');
  }

  // Compose pure transforms
  let newCardState: CardState = state.cardState;
  newCardState = burnCardFromPlayed(newCardState, player, card);
  newCardState = returnCardsToHand(newCardState, player);

  // Mark rally as resolved and initialize unit support checking
  const updatedRallyResolutionState: RallyResolutionState = {
    ...rallyResolutionState,
    rallyResolved: true,
    unitsLostSupport: new Set([]), // TODO: Calculate which units lost support
    routState: undefined,
  };

  const newPhaseState: CleanupPhaseState =
    currentPhaseState.step === 'firstPlayerResolveRally'
      ? {
          ...currentPhaseState,
          firstPlayerRallyResolutionState: updatedRallyResolutionState,
          step: newStep,
        }
      : {
          ...currentPhaseState,
          secondPlayerRallyResolutionState: updatedRallyResolutionState,
          step: newStep,
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
