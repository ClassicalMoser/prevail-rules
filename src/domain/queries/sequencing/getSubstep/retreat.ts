import type { Board } from '@entities';
import type { AttackApplyState, GameStateWithBoard, RetreatState } from '@game';
import { getMeleeResolutionState } from '../getCommandResolutionState';
import {
  getAttackApplyStateFromMelee,
  getAttackApplyStateFromRangedAttack,
} from './attackApply';

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
  state: GameStateWithBoard<TBoard>,
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
export function getRetreatStateFromMelee<TBoard extends Board>(
  state: GameStateWithBoard<TBoard>,
  player: 'white' | 'black',
): RetreatState {
  const attackApplyState = getAttackApplyStateFromMelee(state, player);
  return getRetreatStateFromAttackApply(attackApplyState);
}

/**
 * Retreat substep ready for resolveRetreat in melee: finalPosition set, not yet completed.
 * Initiative order matches attack-apply sequencing.
 */
export function getRetreatStateReadyForResolveFromMelee<TBoard extends Board>(
  state: GameStateWithBoard<TBoard>,
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
    firstPlayerAttackApply?.retreatState &&
    firstPlayerAttackApply.retreatState.finalPosition !== undefined &&
    !firstPlayerAttackApply.retreatState.completed
  ) {
    return firstPlayerAttackApply.retreatState;
  }
  if (
    secondPlayerAttackApply?.retreatState &&
    secondPlayerAttackApply.retreatState.finalPosition !== undefined &&
    !secondPlayerAttackApply.retreatState.completed
  ) {
    return secondPlayerAttackApply.retreatState;
  }
  throw new Error(
    'No retreat state with finalPosition found in melee resolution',
  );
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
  state: GameStateWithBoard<TBoard>,
  player: 'white' | 'black',
): RetreatState {
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
