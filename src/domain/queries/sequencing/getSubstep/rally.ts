import type { Board } from "@entities";
import type { GameState, GameStateForBoard, RallyResolutionState, RoutState } from "@game";
import { getCleanupPhaseState } from "../getPhaseState";

/**
 * Gets the rally resolution state from cleanup phase for a specific player.
 * Assumes we're in cleanup phase with a rally resolution state (validation should happen elsewhere).
 *
 * @param state - The game state
 * @param player - The player ('white' or 'black')
 * @returns The rally resolution state for the player
 * @throws Error if not in cleanup phase or rally resolution state is missing
 */
export function getRallyResolutionState<TBoard extends Board>(
  state: GameStateForBoard<TBoard>,
  player: "white" | "black",
): RallyResolutionState {
  const phaseState = getCleanupPhaseState(state as GameState);
  const firstPlayer = state.currentInitiative;
  const isFirstPlayer = player === firstPlayer;

  const rallyState = isFirstPlayer
    ? phaseState.firstPlayerRallyResolutionState
    : phaseState.secondPlayerRallyResolutionState;

  if (!rallyState) {
    throw new Error(`No ${player} rally resolution state found`);
  }
  return rallyState;
}

/**
 * Gets the current rally resolution state based on the cleanup phase step.
 * Assumes we're in a resolveRally step (validation should happen elsewhere).
 *
 * @param state - The game state
 * @returns The rally resolution state for the current step
 * @throws Error if not in a resolveRally step or rally resolution state is missing
 */
export function getCurrentRallyResolutionState<TBoard extends Board>(
  state: GameStateForBoard<TBoard>,
): RallyResolutionState {
  const phaseState = getCleanupPhaseState(state as GameState);
  const step = phaseState.step;

  if (step === "firstPlayerResolveRally") {
    if (!phaseState.firstPlayerRallyResolutionState) {
      throw new Error("No first player rally resolution state found");
    }
    return phaseState.firstPlayerRallyResolutionState;
  }

  if (step === "secondPlayerResolveRally") {
    if (!phaseState.secondPlayerRallyResolutionState) {
      throw new Error("No second player rally resolution state found");
    }
    return phaseState.secondPlayerRallyResolutionState;
  }

  throw new Error(`Not in a resolveRally step: ${step}`);
}

/**
 * Gets the rout state from a rally resolution state.
 * Assumes the rally resolution state has a rout state (validation should happen elsewhere).
 *
 * @param rallyState - The rally resolution state
 * @returns The rout state
 * @throws Error if rout state is missing
 */
export function getRoutStateFromRally(rallyState: RallyResolutionState): RoutState {
  if (!rallyState.routState) {
    throw new Error("No rout state found in rally resolution state");
  }
  return rallyState.routState;
}

/**
 * Rout state during cleanup when resolving rally (includes chooseRally steps).
 * Matches which rally resolution bucket is active for the current cleanup step.
 */
export function getRoutStateFromCleanupPhaseForResolveRout<TBoard extends Board>(
  state: GameStateForBoard<TBoard>,
): RoutState {
  const phaseState = getCleanupPhaseState(state as GameState);
  const isFirstPlayerStep =
    phaseState.step === "firstPlayerResolveRally" || phaseState.step === "firstPlayerChooseRally";

  const rallyState = isFirstPlayerStep
    ? phaseState.firstPlayerRallyResolutionState
    : phaseState.secondPlayerRallyResolutionState;

  if (!rallyState?.routState) {
    throw new Error("No rout state found in rally resolution");
  }

  return rallyState.routState;
}
