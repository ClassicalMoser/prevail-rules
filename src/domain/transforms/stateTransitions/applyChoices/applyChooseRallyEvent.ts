import type { Board, CleanupPhaseState, GameState } from '@entities';
import type { ChooseRallyEvent } from '@events';
import { getCleanupPhaseState, getOtherPlayer } from '@queries';

/**
 * Applies a ChooseRallyEvent to the game state.
 * If player chooses to rally, advances to resolveRally step.
 * If player chooses not to rally, skips to resolveUnitSupport step.
 *
 * @param event - The choose rally event to apply
 * @param state - The current game state
 * @returns A new game state with the step advanced
 */
export function applyChooseRallyEvent<TBoard extends Board>(
  event: ChooseRallyEvent<TBoard>,
  state: GameState<TBoard>,
): GameState<TBoard> {
  const { player, performRally } = event;
  const currentPhaseState = getCleanupPhaseState(state);

  // Determine which step we're on and validate player
  const firstPlayer = state.currentInitiative;
  const secondPlayer = getOtherPlayer(firstPlayer);
  let newPhaseState: CleanupPhaseState;

  if (currentPhaseState.step === 'firstPlayerChooseRally') {
    if (player !== firstPlayer) {
      throw new Error(`Expected ${firstPlayer} (first player) to choose rally`);
    }
    // Create rally resolution state and advance
    if (performRally) {
      newPhaseState = {
        ...currentPhaseState,
        firstPlayerRallyResolutionState: {
          playerRallied: true,
          rallyResolved: false,
          unitsLostSupport: undefined,
          routState: undefined,
          completed: false,
        },
        // Ready to resolve rally
        step: 'firstPlayerResolveRally',
      };
    } else {
      newPhaseState = {
        ...currentPhaseState,
        firstPlayerRallyResolutionState: {
          playerRallied: false,
          rallyResolved: false,
          unitsLostSupport: undefined,
          routState: undefined,
          completed: false,
        },
        // Resolution skipped, next player to choose rally
        step: 'secondPlayerChooseRally',
      };
    }
  } else if (currentPhaseState.step === 'secondPlayerChooseRally') {
    if (player !== secondPlayer) {
      throw new Error(
        `Expected ${secondPlayer} (second player) to choose rally`,
      );
    }
    // Create rally resolution state and advance
    if (performRally) {
      newPhaseState = {
        ...currentPhaseState,
        secondPlayerRallyResolutionState: {
          playerRallied: true,
          rallyResolved: false,
          unitsLostSupport: undefined,
          routState: undefined,
          completed: false,
        },
        // Ready to resolve rally
        step: 'secondPlayerResolveRally',
      };
    } else {
      newPhaseState = {
        ...currentPhaseState,
        secondPlayerRallyResolutionState: {
          playerRallied: false,
          rallyResolved: false,
          unitsLostSupport: undefined,
          routState: undefined,
          completed: false,
        },
        // Resolution skipped, next player to choose rally
        step: 'complete',
      };
    }
  } else {
    throw new Error(
      `Cleanup phase is not on a chooseRally step: ${currentPhaseState.step}`,
    );
  }

  return {
    ...state,
    currentRoundState: {
      ...state.currentRoundState,
      currentPhaseState: newPhaseState,
    },
  };
}
