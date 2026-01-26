import type {
  AttackApplyState,
  Board,
  GameState,
  PlayerSide,
} from '@entities';
import {
  getAttackApplyStateFromMelee,
  getAttackApplyStateFromRangedAttack,
  getCurrentPhaseState,
} from '@queries';
import { updateAttackApplyState } from './updateAttackApplyState';

/**
 * Gets the attack apply state from the current game state context.
 * Handles phase checking automatically.
 *
 * For ranged attack resolution (issueCommands phase), returns the single attack apply state.
 * For melee resolution (resolveMelee phase), requires a player parameter.
 *
 * @param state - The game state
 * @param player - Optional player for melee context (required if in resolveMelee phase)
 * @returns The attack apply state
 * @throws Error if not in a phase that supports attack apply substeps
 */
export function getAttackApplyStateFromContext<TBoard extends Board>(
  state: GameState<TBoard>,
  player?: PlayerSide,
): AttackApplyState<TBoard> {
  const phaseState = getCurrentPhaseState<TBoard>(state);

  // Handle ranged attack resolution (in issueCommands phase)
  if (phaseState.phase === 'issueCommands') {
    return getAttackApplyStateFromRangedAttack(state);
  }

  // Handle melee resolution (in resolveMelee phase)
  if (phaseState.phase === 'resolveMelee') {
    if (!player) {
      throw new Error(
        'Player parameter required for melee attack apply state context',
      );
    }
    return getAttackApplyStateFromMelee(state, player);
  }

  throw new Error(
    `Attack apply state not available in phase: ${phaseState.phase}`,
  );
}

/**
 * Updates a nested substep within an attack apply state.
 * Handles phase checking and player determination automatically.
 *
 * For ranged attack resolution, automatically gets the attack apply state.
 * For melee resolution, extracts the player from the substep state using the provided function.
 *
 * @param state - The game state
 * @param updateFn - Function that takes the current attack apply state and returns an updated one
 * @param getPlayer - Function to extract player from substep state (required for melee)
 * @param substepState - Substep state to extract player from (required for melee)
 * @returns A new game state with the updated attack apply state
 */
export function updateAttackApplySubstep<TBoard extends Board, TSubstep>(
  state: GameState<TBoard>,
  updateFn: (attackApplyState: AttackApplyState<TBoard>) => AttackApplyState<TBoard>,
  getPlayer: (substep: TSubstep) => PlayerSide,
  substepState: TSubstep,
): GameState<TBoard> {
  const phaseState = getCurrentPhaseState<TBoard>(state);

  // Handle ranged attack resolution (in issueCommands phase)
  if (phaseState.phase === 'issueCommands') {
    const attackApplyState = getAttackApplyStateFromRangedAttack(state);
    const updatedAttackApplyState = updateFn(attackApplyState);
    return updateAttackApplyState(state, updatedAttackApplyState);
  }

  // Handle melee resolution (in resolveMelee phase)
  if (phaseState.phase === 'resolveMelee') {
    const player = getPlayer(substepState);
    const attackApplyState = getAttackApplyStateFromMelee(state, player);
    const updatedAttackApplyState = updateFn(attackApplyState);
    return updateAttackApplyState(state, updatedAttackApplyState);
  }

  throw new Error(
    `Attack apply substep update not expected in phase: ${phaseState.phase}`,
  );
}
