import type {
  Board,
  CleanupPhaseState,
  GameState,
  IssueCommandsPhaseState,
  MoveCommandersPhaseState,
  PhaseState,
  PlayCardsPhaseState,
  ResolveMeleePhaseState,
} from '@entities';

/**
 * Gets the current phase state from the game state.
 * Assumes the phase state exists (validation should happen elsewhere).
 *
 * @param state - The game state
 * @returns The current phase state
 * @throws Error if phase state is missing
 */
export function getCurrentPhaseState<TBoard extends Board>(
  state: GameState<TBoard>,
): PhaseState<TBoard> {
  const phaseState = state.currentRoundState.currentPhaseState;
  if (!phaseState) {
    throw new Error('No current phase state found');
  }
  return phaseState;
}

/**
 * Gets the play cards phase state from the game state.
 * Assumes we're in the playCards phase (validation should happen elsewhere).
 *
 * @param state - The game state
 * @returns The play cards phase state
 * @throws Error if not in playCards phase or phase state is missing
 */
export function getPlayCardsPhaseState<TBoard extends Board>(
  state: GameState<TBoard>,
): PlayCardsPhaseState {
  const phaseState = getCurrentPhaseState(state);
  if (phaseState.phase !== 'playCards') {
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
export function getMoveCommandersPhaseState<TBoard extends Board>(
  state: GameState<TBoard>,
): MoveCommandersPhaseState {
  const phaseState = getCurrentPhaseState(state);
  if (phaseState.phase !== 'moveCommanders') {
    throw new Error(`Expected moveCommanders phase, got ${phaseState.phase}`);
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
export function getIssueCommandsPhaseState<TBoard extends Board>(
  state: GameState<TBoard>,
): IssueCommandsPhaseState<TBoard> {
  const phaseState = getCurrentPhaseState(state);
  if (phaseState.phase !== 'issueCommands') {
    throw new Error(`Expected issueCommands phase, got ${phaseState.phase}`);
  }
  return phaseState;
}

/**
 * Gets the resolve melee phase state from the game state.
 * Assumes we're in the resolveMelee phase (validation should happen elsewhere).
 *
 * @param state - The game state
 * @returns The resolve melee phase state
 * @throws Error if not in resolveMelee phase or phase state is missing
 */
export function getResolveMeleePhaseState<TBoard extends Board>(
  state: GameState<TBoard>,
): ResolveMeleePhaseState<TBoard> {
  const phaseState = getCurrentPhaseState(state);
  if (phaseState.phase !== 'resolveMelee') {
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
export function getCleanupPhaseState<TBoard extends Board>(
  state: GameState<TBoard>,
): CleanupPhaseState {
  const phaseState = getCurrentPhaseState(state);
  if (phaseState.phase !== 'cleanup') {
    throw new Error(`Expected cleanup phase, got ${phaseState.phase}`);
  }
  return phaseState;
}
