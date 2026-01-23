import type {
  Board,
  CommandResolutionState,
  GameState,
  MeleeResolutionState,
  MovementResolutionState,
  RangedAttackResolutionState,
} from '@entities';

/**
 * Gets the current command resolution state from the issue commands phase.
 * Assumes we're in issueCommands phase with a command resolution state (validation should happen elsewhere).
 *
 * @param state - The game state
 * @returns The current command resolution state
 * @throws Error if not in issueCommands phase or command resolution state is missing
 */
export function getCurrentCommandResolutionState<TBoard extends Board>(
  state: GameState<TBoard>,
): CommandResolutionState<TBoard> {
  const phaseState = state.currentRoundState.currentPhaseState;
  if (!phaseState || phaseState.phase !== 'issueCommands') {
    throw new Error('Not in issueCommands phase');
  }
  const commandResolutionState = phaseState.currentCommandResolutionState;
  if (!commandResolutionState) {
    throw new Error('No current command resolution state');
  }
  return commandResolutionState;
}

/**
 * Gets the ranged attack resolution state from the issue commands phase.
 * Assumes we're resolving a ranged attack (validation should happen elsewhere).
 *
 * @param state - The game state
 * @returns The ranged attack resolution state
 * @throws Error if not resolving a ranged attack
 */
export function getRangedAttackResolutionState<TBoard extends Board>(
  state: GameState<TBoard>,
): RangedAttackResolutionState<TBoard> {
  const commandResolutionState = getCurrentCommandResolutionState(state);
  if (commandResolutionState.commandResolutionType !== 'rangedAttack') {
    throw new Error('Current command resolution is not a ranged attack');
  }
  return commandResolutionState as RangedAttackResolutionState<TBoard>;
}

/**
 * Gets the movement resolution state from the issue commands phase.
 * Assumes we're resolving a movement (validation should happen elsewhere).
 *
 * @param state - The game state
 * @returns The movement resolution state
 * @throws Error if not resolving a movement
 */
export function getMovementResolutionState<TBoard extends Board>(
  state: GameState<TBoard>,
): MovementResolutionState<TBoard> {
  const commandResolutionState = getCurrentCommandResolutionState(state);
  if (commandResolutionState.commandResolutionType !== 'movement') {
    throw new Error('Current command resolution is not a movement');
  }
  return commandResolutionState as MovementResolutionState<TBoard>;
}

/**
 * Gets the melee resolution state from the resolve melee phase.
 * Assumes we're in resolveMelee phase with a melee resolution state (validation should happen elsewhere).
 *
 * @param state - The game state
 * @returns The melee resolution state
 * @throws Error if not in resolveMelee phase or melee resolution state is missing
 */
export function getMeleeResolutionState<TBoard extends Board>(
  state: GameState<TBoard>,
): MeleeResolutionState<TBoard> {
  const phaseState = state.currentRoundState.currentPhaseState;
  if (!phaseState || phaseState.phase !== 'resolveMelee') {
    throw new Error('Not in resolveMelee phase');
  }
  if (!phaseState.currentMeleeResolutionState) {
    throw new Error('No current melee resolution state');
  }
  return phaseState.currentMeleeResolutionState;
}
