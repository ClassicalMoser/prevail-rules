import type {
  AttackApplyState,
  Board,
  EngagementState,
  GameState,
  RallyResolutionState,
  RetreatState,
  ReverseState,
  RoutState,
} from '@entities';
import {
  getMeleeResolutionState,
  getMovementResolutionState,
  getRangedAttackResolutionState,
} from './getCommandResolutionState';
import { getCleanupPhaseState } from './getPhaseState';

/**
 * Gets the current step from the phase state.
 * Assumes we're in a phase with steps (validation should happen elsewhere).
 *
 * @param state - The game state
 * @returns The current step
 * @throws Error if phase state is missing
 */
export function getCurrentStep<TBoard extends Board>(
  state: GameState<TBoard>,
): string {
  const phaseState = state.currentRoundState.currentPhaseState;
  if (!phaseState) {
    throw new Error('No current phase state found');
  }
  // All phase states have a step property
  return (phaseState as { step: string }).step;
}

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
  state: GameState<TBoard>,
  player: 'white' | 'black',
): RallyResolutionState {
  const phaseState = getCleanupPhaseState(state);
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
  state: GameState<TBoard>,
): RallyResolutionState {
  const phaseState = getCleanupPhaseState(state);
  const step = phaseState.step;

  if (step === 'firstPlayerResolveRally') {
    if (!phaseState.firstPlayerRallyResolutionState) {
      throw new Error('No first player rally resolution state found');
    }
    return phaseState.firstPlayerRallyResolutionState;
  }

  if (step === 'secondPlayerResolveRally') {
    if (!phaseState.secondPlayerRallyResolutionState) {
      throw new Error('No second player rally resolution state found');
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
export function getRoutStateFromRally(
  rallyState: RallyResolutionState,
): RoutState {
  if (!rallyState.routState) {
    throw new Error('No rout state found in rally resolution state');
  }
  return rallyState.routState;
}

/**
 * Gets the attack apply state from a ranged attack resolution.
 * Assumes we're resolving a ranged attack with an attack apply state (validation should happen elsewhere).
 *
 * @param state - The game state
 * @returns The attack apply state
 * @throws Error if not resolving a ranged attack or attack apply state is missing
 */
export function getAttackApplyStateFromRangedAttack<TBoard extends Board>(
  state: GameState<TBoard>,
): AttackApplyState<TBoard> {
  const rangedAttackState = getRangedAttackResolutionState(state);
  if (!rangedAttackState.attackApplyState) {
    throw new Error('No attack apply state found in ranged attack resolution');
  }
  return rangedAttackState.attackApplyState;
}

/**
 * Gets the attack apply state from melee resolution for a specific player.
 * Assumes we're in resolveMelee phase with a melee resolution state (validation should happen elsewhere).
 *
 * @param state - The game state
 * @param player - The player ('white' or 'black')
 * @returns The attack apply state for the player
 * @throws Error if not in resolveMelee phase or attack apply state is missing
 */
export function getAttackApplyStateFromMelee<TBoard extends Board>(
  state: GameState<TBoard>,
  player: 'white' | 'black',
): AttackApplyState<TBoard> {
  const meleeState = getMeleeResolutionState(state);
  const attackApplyState =
    player === 'white'
      ? meleeState.whiteAttackApplyState
      : meleeState.blackAttackApplyState;
  if (!attackApplyState) {
    throw new Error(
      `No ${player} attack apply state found in melee resolution`,
    );
  }
  return attackApplyState;
}

/**
 * Gets the retreat state from an attack apply state.
 * Assumes the attack apply state has a retreat state (validation should happen elsewhere).
 *
 * @param attackApplyState - The attack apply state
 * @returns The retreat state
 * @throws Error if retreat state is missing
 */
export function getRetreatStateFromAttackApply<TBoard extends Board>(
  attackApplyState: AttackApplyState<TBoard>,
): RetreatState<TBoard> {
  if (!attackApplyState.retreatState) {
    throw new Error('No retreat state found in attack apply state');
  }
  return attackApplyState.retreatState;
}

/**
 * Gets the retreat state from a ranged attack resolution.
 * Navigates: RangedAttackResolutionState -> AttackApplyState -> RetreatState
 *
 * @param state - The game state
 * @returns The retreat state
 * @throws Error if any step in the navigation is missing
 */
export function getRetreatStateFromRangedAttack<TBoard extends Board>(
  state: GameState<TBoard>,
): RetreatState<TBoard> {
  const attackApplyState = getAttackApplyStateFromRangedAttack(state);
  return getRetreatStateFromAttackApply(attackApplyState);
}

/**
 * Gets the retreat state from melee resolution for a specific player.
 * Navigates: MeleeResolutionState -> AttackApplyState -> RetreatState
 *
 * @param state - The game state
 * @param player - The player ('white' or 'black')
 * @returns The retreat state
 * @throws Error if any step in the navigation is missing
 */
export function getRetreatStateFromMelee<TBoard extends Board>(
  state: GameState<TBoard>,
  player: 'white' | 'black',
): RetreatState<TBoard> {
  const attackApplyState = getAttackApplyStateFromMelee(state, player);
  return getRetreatStateFromAttackApply(attackApplyState);
}

/**
 * Gets the engagement state from a movement resolution.
 * Assumes we're resolving a movement with an engagement state (validation should happen elsewhere).
 *
 * @param state - The game state
 * @returns The engagement state
 * @throws Error if not resolving a movement or engagement state is missing
 */
export function getEngagementStateFromMovement<TBoard extends Board>(
  state: GameState<TBoard>,
): EngagementState<TBoard> {
  const movementState = getMovementResolutionState(state);
  if (!movementState.engagementState) {
    throw new Error('No engagement state found in movement resolution');
  }
  return movementState.engagementState;
}

/**
 * Gets the rout state from an attack apply state.
 * Assumes the attack apply state has a rout state (validation should happen elsewhere).
 *
 * @param attackApplyState - The attack apply state
 * @returns The rout state
 * @throws Error if rout state is missing
 */
export function getRoutStateFromAttackApply<TBoard extends Board>(
  attackApplyState: AttackApplyState<TBoard>,
): RoutState {
  if (!attackApplyState.routState) {
    throw new Error('No rout state found in attack apply state');
  }
  return attackApplyState.routState;
}

/**
 * Gets the reverse state from an attack apply state.
 * Assumes the attack apply state has a reverse state (validation should happen elsewhere).
 *
 * @param attackApplyState - The attack apply state
 * @returns The reverse state
 * @throws Error if reverse state is missing
 */
export function getReverseStateFromAttackApply<TBoard extends Board>(
  attackApplyState: AttackApplyState<TBoard>,
): ReverseState<TBoard> {
  if (!attackApplyState.reverseState) {
    throw new Error('No reverse state found in attack apply state');
  }
  return attackApplyState.reverseState;
}

/**
 * Finds the retreat state from the current game state context.
 * Searches in: ranged attack resolution or melee resolution.
 * Assumes a retreat state exists (validation should happen elsewhere).
 *
 * @param state - The game state
 * @param player - The player whose retreat state to find
 * @returns The retreat state
 * @throws Error if retreat state not found in any context
 */
export function findRetreatState<TBoard extends Board>(
  state: GameState<TBoard>,
  player: 'white' | 'black',
): RetreatState<TBoard> {
  const phaseState = state.currentRoundState.currentPhaseState;
  if (!phaseState) {
    throw new Error('No current phase state found');
  }

  // Try ranged attack resolution first
  if (phaseState.phase === 'issueCommands') {
    try {
      const retreatState = getRetreatStateFromRangedAttack(state);
      if (retreatState.retreatingUnit.unit.playerSide === player) {
        return retreatState;
      }
    } catch {
      // Not in ranged attack or no retreat state, continue
    }
  }

  // Try melee resolution
  if (phaseState.phase === 'resolveMelee') {
    try {
      return getRetreatStateFromMelee(state, player);
    } catch {
      // Not found, continue
    }
  }

  throw new Error(`No retreat state found for player ${player}`);
}
