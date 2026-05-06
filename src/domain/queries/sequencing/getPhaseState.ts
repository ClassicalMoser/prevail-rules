import { Board } from "@entities";
import type {
  CleanupPhaseState,
  GameState,
  GameStateForBoard,
  IssueCommandsPhaseState,
  IssueCommandsPhaseStateForBoard,
  MoveCommandersPhaseState,
  PhaseState,
  PhaseStateForBoard,
  PlayCardsPhaseState,
  ResolveMeleePhaseState,
  ResolveMeleePhaseStateForBoard,
} from "@game";
import { throwIfUndefined } from "@utils";

/**
 * Gets the current phase state from the game state.
 * Assumes the phase state exists (validation should happen elsewhere).
 *
 * @param state - The game state
 * @returns The current phase state
 * @throws Error if phase state is missing
 */
export function getCurrentPhaseStateForBoard<TBoard extends Board>(
  state: GameStateForBoard<TBoard>,
): PhaseStateForBoard<TBoard> {
  const phaseState = throwIfUndefined(
    state.currentRoundState.currentPhaseState,
    "No current phase state found",
  );
  return phaseState;
}

/**
 * Broader generic version of {@link getCurrentPhaseStateForBoard}.
 *
 * @param state - The game state
 * @returns The current phase state
 * @throws Error if phase state is missing
 */
export function getCurrentPhaseState(state: GameState): PhaseState {
  return throwIfUndefined(
    state.currentRoundState.currentPhaseState,
    "No current phase state found",
  );
}

/**
 * Gets the play cards phase state from the game state.
 * Assumes we're in the playCards phase (validation should happen elsewhere).
 *
 * @param state - The game state
 * @returns The play cards phase state
 * @throws Error if not in playCards phase or phase state is missing
 */
export function getPlayCardsPhaseState(state: GameState): PlayCardsPhaseState {
  const phaseState = getCurrentPhaseState(state);
  if (phaseState.phase !== "playCards") {
    throw new Error(`Expected playCards phase, got ${phaseState.phase}`);
  }
  return phaseState;
}

/**
 * Gets the move commanders phase state from the game state.
 * Assumes we're in the moveCommanders phase (validation should happen elsewhere).
 *
 * @param state - The game state
 * @returns The move commanders phase state
 * @throws Error if not in moveCommanders phase or phase state is missing
 */
export function getMoveCommandersPhaseState(state: GameState): MoveCommandersPhaseState {
  const phaseState = getCurrentPhaseState(state);
  if (phaseState.phase !== "moveCommanders") {
    throw new Error(`Expected moveCommanders phase, got ${phaseState.phase}`);
  }
  return phaseState;
}

/**
 * Narrowed version of {@link getIssueCommandsPhaseStateForBoard}.
 *
 * @param state - The game state for the board
 * @returns The issue commands phase state
 * @throws Error if not in issueCommands phase or phase state is missing
 */
export function getIssueCommandsPhaseStateForBoard<TBoard extends Board>(
  state: GameStateForBoard<TBoard>,
): IssueCommandsPhaseStateForBoard<TBoard> {
  const phaseState = getCurrentPhaseStateForBoard<TBoard>(state);
  if (phaseState.phase !== "issueCommands") {
    throw new Error(`Expected issueCommands phase, got ${phaseState.phase}`);
  }
  return phaseState;
}

/**
 * Gets the issue commands phase state from the game state.
 * Assumes we're in the issueCommands phase (validation should happen elsewhere).
 *
 * @param state - The game state
 * @returns The issue commands phase state
 * @throws Error if not in issueCommands phase or phase state is missing
 */
export function getIssueCommandsPhaseState(state: GameState): IssueCommandsPhaseState {
  const phaseState = getCurrentPhaseState(state);
  if (phaseState.phase !== "issueCommands") {
    throw new Error(`Expected issueCommands phase, got ${phaseState.phase}`);
  }
  return phaseState;
}

/**
 * Gets the resolve melee phase state from the game state.
 * Assumes we're in the resolveMelee phase (validation should happen elsewhere).
 *
 * @param state - The game state for the board
 * @returns The resolve melee phase state
 * @throws Error if not in resolveMelee phase or phase state is missing
 */
export function getResolveMeleePhaseStateForBoard<TBoard extends Board>(
  state: GameStateForBoard<TBoard>,
): ResolveMeleePhaseStateForBoard<TBoard> {
  const phaseState = getCurrentPhaseStateForBoard<TBoard>(state);
  if (phaseState.phase !== "resolveMelee") {
    throw new Error(`Expected resolveMelee phase, got ${phaseState.phase}`);
  }
  return phaseState;
}

/**
 * Broader generic version of {@link getResolveMeleePhaseStateForBoard}.
 *
 * @param state - The game state
 * @returns The resolve melee phase state
 * @throws Error if not in resolveMelee phase or phase state is missing
 */
export function getResolveMeleePhaseState(state: GameState): ResolveMeleePhaseState {
  const phaseState = getCurrentPhaseState(state);
  if (phaseState.phase !== "resolveMelee") {
    throw new Error(`Expected resolveMelee phase, got ${phaseState.phase}`);
  }
  return phaseState;
}

/**
 * Gets the cleanup phase state from the game state.
 * Assumes we're in the cleanup phase (validation should happen elsewhere).
 *
 * @param state - The game state
 * @returns The cleanup phase state
 * @throws Error if not in cleanup phase or phase state is missing
 */
export function getCleanupPhaseState(state: GameState): CleanupPhaseState {
  const phaseState = getCurrentPhaseState(state);
  if (phaseState.phase !== "cleanup") {
    throw new Error(`Expected cleanup phase, got ${phaseState.phase}`);
  }
  return phaseState;
}
