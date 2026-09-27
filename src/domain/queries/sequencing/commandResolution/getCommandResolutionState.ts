import type {
  CommandResolutionState,
  GameState,
  MovementResolutionState,
  PhaseState,
  RangedAttackResolutionState,
} from '@game';
import { getCurrentPhaseState } from '../getPhaseState';

/**
 * Gets the current command resolution state from the issue commands phase.
 * Assumes we're in issueCommands phase with a command resolution state (validation should happen elsewhere).
 *
 * @param state - The game state
 * @returns The current command resolution state
 * @throws Error if not in issueCommands phase or command resolution state is missing
 */
export function getCurrentCommandResolutionState(
  state: GameState,
): CommandResolutionState {
  const phaseState: PhaseState = getCurrentPhaseState(state);
  if (phaseState.phase !== 'issueCommands') {
    throw new Error('Not in issueCommands phase');
  }
  const commandResolutionState = phaseState.currentCommandResolutionState;
  if (commandResolutionState === 'pending') {
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
export function getRangedAttackResolutionState(
  state: GameState,
): RangedAttackResolutionState {
  const commandResolutionState = getCurrentCommandResolutionState(state);
  if (commandResolutionState.commandResolutionType !== 'rangedAttack') {
    throw new Error('Current command resolution is not a ranged attack');
  }
  return commandResolutionState;
}

/**
 * Gets the movement resolution state from the issue commands phase.
 * Assumes we're resolving a movement (validation should happen elsewhere).
 *
 * @param state - The game state
 * @returns The movement resolution state
 * @throws Error if not resolving a movement
 */
export function getMovementResolutionState<S extends GameState>(
  state: S,
): MovementResolutionState {
  const commandResolutionState = getCurrentCommandResolutionState(state);
  if (commandResolutionState.commandResolutionType !== 'movement') {
    throw new Error('Current command resolution is not a movement');
  }
  return commandResolutionState;
}
