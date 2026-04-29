import type { Board } from "@entities";
import type { ChooseRallyEvent } from "@events";
import type { CleanupPhaseState, GameStateWithBoard, RallyResolutionState } from "@game";
import { getCleanupPhaseState } from "@queries";
import { updatePhaseState } from "@transforms/pureTransforms";

function initialRallyResolutionState(playerRallied: boolean): RallyResolutionState {
  return {
    playerRallied,
    rallyResolved: false,
    unitsLostSupport: undefined,
    routState: undefined,
    completed: false,
  };
}

/**
 * Applies a ChooseRallyEvent to the game state.
 * If player chooses to rally, advances to resolveRally step.
 * If player chooses not to rally, skips to the next choose-rally or complete step.
 * Event is assumed pre-validated (correct step and player).
 *
 * @param event - The choose rally event to apply
 * @param state - The current game state
 * @returns A new game state with the step advanced
 */
export function applyChooseRallyEvent<TBoard extends Board>(
  event: ChooseRallyEvent<TBoard>,
  state: GameStateWithBoard<TBoard>,
): GameStateWithBoard<TBoard> {
  const currentPhaseState = getCleanupPhaseState(state);
  const { performRally } = event;
  let newPhaseState: CleanupPhaseState;

  if (currentPhaseState.step === "firstPlayerChooseRally") {
    // Create rally resolution state and advance
    newPhaseState = {
      ...currentPhaseState,
      firstPlayerRallyResolutionState: initialRallyResolutionState(performRally),
      step: performRally
        ? "firstPlayerResolveRally" // Ready to resolve rally
        : "secondPlayerChooseRally", // Resolution skipped, next player to choose rally
    };
  } else if (currentPhaseState.step === "secondPlayerChooseRally") {
    // Create rally resolution state and advance
    newPhaseState = {
      ...currentPhaseState,
      secondPlayerRallyResolutionState: initialRallyResolutionState(performRally),
      step: performRally
        ? "secondPlayerResolveRally" // Ready to resolve rally
        : "complete", // Resolution skipped, next step is complete
    };
  } else {
    throw new Error(`Cleanup phase is not on a chooseRally step: ${currentPhaseState.step}`);
  }

  const newGameState = updatePhaseState(state, newPhaseState);
  return newGameState;
}
