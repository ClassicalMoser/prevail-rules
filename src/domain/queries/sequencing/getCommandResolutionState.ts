import type {
  CommandResolutionState,
  GameState,
  MeleeResolutionState,
  MovementResolutionState,
  PhaseState,
  RangedAttackResolutionState,
} from '@game';
import { getCurrentPhaseState } from './getPhaseState';

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
export function getMovementResolutionState(
  state: GameState,
): MovementResolutionState {
  const commandResolutionState = getCurrentCommandResolutionState(state);
  if (commandResolutionState.commandResolutionType !== 'movement') {
    throw new Error('Current command resolution is not a movement');
  }
  return commandResolutionState;
}

/**
 * Gets the melee resolution state from the resolve melee phase.
 * Assumes we're in resolveMelee phase with a melee resolution state (validation should happen elsewhere).
 *
 * @param state - The game state
 * @returns The melee resolution state
 * @throws Error if not in resolveMelee phase or melee resolution state is missing
 */
export function getMeleeResolutionState(
  state: GameState,
): MeleeResolutionState {
  const phaseState = state.currentRoundState.currentPhaseState;
  if (phaseState === 'none' || phaseState.phase !== 'resolveMelee') {
    throw new Error('Not in resolveMelee phase');
  }
  if (phaseState.currentMeleeResolutionState === 'pending') {
    throw new Error('No current melee resolution state');
  }
  return phaseState.currentMeleeResolutionState;
}

/**
 * Narrowing helper for melee attack-value generation: in resolve melee phase,
 * both commitments are resolved and attack-apply substeps have not been created yet.
 *
 * @throws Error if commitments are pending or attack apply already exists
 */
export function getMeleeResolutionReadyForAttackCalculation(
  state: GameState,
): MeleeResolutionState {
  const meleeState = getMeleeResolutionState(state);
  if (meleeState.whiteCommitment.commitmentType === 'pending') {
    throw new Error('White commitment is still pending');
  }
  if (meleeState.blackCommitment.commitmentType === 'pending') {
    throw new Error('Black commitment is still pending');
  }
  if (
    meleeState.whiteAttackApplyState !== 'pending' ||
    meleeState.blackAttackApplyState !== 'pending'
  ) {
    throw new Error('Attack apply states already exist');
  }
  return meleeState;
}
