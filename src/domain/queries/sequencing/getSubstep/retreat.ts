import type { AttackApplyState, GameState, RetreatState } from '@game';
import { throwIfPending } from '@utils';
import { getMeleeResolutionState } from '../getCommandResolutionState';
import {
  getAttackApplyStateFromMelee,
  getAttackApplyStateFromRangedAttack,
} from './attackApply';
import { getFrontEngagementStateFromMovement } from './engagement';

/**
 * Gets the retreat state from an attack apply state.
 * Assumes the attack apply state has a retreat state (validation should happen elsewhere).
 *
 * @param attackApplyState - The attack apply state
 * @returns The retreat state
 * @throws Error if retreat state is missing
 */
export function getRetreatStateFromAttackApply(
  attackApplyState: AttackApplyState,
): RetreatState {
  return throwIfPending(
    attackApplyState.retreatState,
    'No retreat state found in attack apply state',
  );
}

/**
 * Gets the retreat state from a ranged attack resolution.
 * Navigates: RangedAttackResolutionState -> AttackApplyState -> RetreatState
 *
 * @param state - The game state
 * @returns The retreat state
 * @throws Error if any step in the navigation is missing
 */
export function getRetreatStateFromRangedAttack(
  state: GameState,
): RetreatState {
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
export function getRetreatStateFromMelee(
  state: GameState,
  player: 'white' | 'black',
): RetreatState {
  const attackApplyState = getAttackApplyStateFromMelee(state, player);
  return getRetreatStateFromAttackApply(attackApplyState);
}

/**
 * Retreat substep ready for resolveRetreat in melee: finalPosition set, not yet completed.
 * Initiative order matches attack-apply sequencing.
 */
export function getRetreatStateReadyForResolveFromMelee(
  state: GameState,
): RetreatState {
  const meleeState = getMeleeResolutionState(state);
  const firstPlayer = state.currentInitiative;
  const firstPlayerAttackApply =
    firstPlayer === 'white'
      ? meleeState.whiteAttackApplyState
      : meleeState.blackAttackApplyState;
  const secondPlayerAttackApply =
    firstPlayer === 'white'
      ? meleeState.blackAttackApplyState
      : meleeState.whiteAttackApplyState;

  if (
    firstPlayerAttackApply !== 'pending' &&
    firstPlayerAttackApply.retreatState !== 'pending' &&
    firstPlayerAttackApply.retreatState.finalPosition !== 'pending' &&
    !firstPlayerAttackApply.retreatState.completed
  ) {
    return firstPlayerAttackApply.retreatState;
  }
  if (
    secondPlayerAttackApply !== 'pending' &&
    secondPlayerAttackApply.retreatState !== 'pending' &&
    secondPlayerAttackApply.retreatState.finalPosition !== 'pending' &&
    !secondPlayerAttackApply.retreatState.completed
  ) {
    return secondPlayerAttackApply.retreatState;
  }
  throw new Error(
    'No retreat state with finalPosition found in melee resolution',
  );
}

/**
 * Gets the retreat state nested under a front engagement in movement CRS.
 *
 * @param state - The game state
 * @returns The retreat state
 * @throws Error if not in front engagement or retreatState is still pending
 */
export function getRetreatStateFromFrontEngagement(
  state: GameState,
): RetreatState {
  const engagementState = getFrontEngagementStateFromMovement(state);
  return throwIfPending(
    engagementState.engagementResolutionState.retreatState,
    'No retreat state found in front engagement',
  );
}

/**
 * Finds the retreat state from the current game state context.
 * Searches in: ranged attack resolution, front engagement (movement), or melee.
 * Assumes a retreat state exists (validation should happen elsewhere).
 *
 * @param state - The game state
 * @param player - The player whose retreat state to find
 * @returns The retreat state
 * @throws Error if retreat state not found in any context
 */
export function findRetreatState(
  state: GameState,
  player: 'white' | 'black',
): RetreatState {
  const phaseState = state.currentRoundState.currentPhaseState;
  if (phaseState === 'none') {
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

    try {
      const retreatState = getRetreatStateFromFrontEngagement(state);
      if (retreatState.retreatingUnit.unit.playerSide === player) {
        return retreatState;
      }
    } catch {
      // Not in front engagement retreat, continue
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
