import type {
  AttackApplyState,
  Board,
  GameState,
  RetreatState,
} from '@entities';
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
