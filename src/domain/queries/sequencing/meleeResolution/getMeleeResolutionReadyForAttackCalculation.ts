import type { GameState, MeleeResolutionState } from '@game';
import { getMeleeResolutionState } from './getMeleeResolutionState';

/**
 * Narrowing helper for melee attack-value generation: in resolve melee phase,
 * both commitments are resolved and attack-apply substeps have not been created yet.
 *
 * @throws Error if commitments are pending or attack apply already exists
 */
export function getMeleeResolutionReadyForAttackCalculation<
  S extends GameState,
>(state: S): MeleeResolutionState {
  const meleeState = getMeleeResolutionState(state);
  // Attack values are calculated only after both players have committed.
  if (meleeState.whiteCommitment.commitmentType === 'pending') {
    throw new Error('White commitment is still pending');
  }
  if (meleeState.blackCommitment.commitmentType === 'pending') {
    throw new Error('Black commitment is still pending');
  }
  // And only before either attack-apply has been opened.
  if (
    meleeState.whiteAttackApplyState !== 'pending' ||
    meleeState.blackAttackApplyState !== 'pending'
  ) {
    throw new Error('Attack apply states already exist');
  }
  return meleeState;
}
