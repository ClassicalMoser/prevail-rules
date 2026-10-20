import type { AttackApplyState, GameState, RoutState } from '@game';
import { isOpenSubstep, throwIfPending } from '@utils';
import { getOtherPlayer } from '@queries/player';
import { getMeleeResolutionState } from '../meleeResolution/getMeleeResolutionState';

/**
 * Gets the rout state from an attack apply state.
 * Assumes the attack apply state has a rout state (validation should happen elsewhere).
 *
 * @param attackApplyState - The attack apply state
 * @returns The rout state
 * @throws Error if rout state is missing
 */
export function getRoutStateFromAttackApply(
  attackApplyState: AttackApplyState,
): RoutState {
  return throwIfPending(
    attackApplyState.routState,
    'No rout state found in attack apply state',
  );
}

/**
 * Rout state from melee resolution, in initiative order (first player's apply first).
 * Assumes resolveMelee phase and that one attack-apply carries an active rout.
 */
export function getRoutStateFromMeleeResolutionByInitiative(
  state: GameState,
): RoutState {
  const meleeState = getMeleeResolutionState(state);
  const firstPlayer = state.currentInitiative;
  const secondPlayer = getOtherPlayer(firstPlayer);

  const firstApply = meleeState[`${firstPlayer}AttackApplyState`];
  const secondApply = meleeState[`${secondPlayer}AttackApplyState`];

  // A miss apply has routState 'miss'. That side has nothing to rout.
  if (firstApply !== 'pending' && isOpenSubstep(firstApply.routState)) {
    return firstApply.routState;
  }
  if (secondApply !== 'pending' && isOpenSubstep(secondApply.routState)) {
    return secondApply.routState;
  }
  throw new Error('No rout state found in melee resolution');
}
