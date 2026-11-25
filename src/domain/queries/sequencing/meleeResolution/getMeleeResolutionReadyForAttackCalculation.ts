import type { GameState, MeleeResolutionState } from '@game';
import { isResolved } from '@utils';
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
  // The melee being fought; asking outside one throws there.
  const meleeState = getMeleeResolutionState(state);

  // Attack values are calculated only after both players have committed.
  if (meleeState.firstPlayerCommitment.commitmentType === 'pending') {
    throw new Error('First player commitment is still pending');
  }
  if (meleeState.secondPlayerCommitment.commitmentType === 'pending') {
    throw new Error('Second player commitment is still pending');
  }
  // And only before either attack-apply has been opened.
  if (
    isResolved(meleeState.attackOnFirstPlayerApplyState) ||
    isResolved(meleeState.attackOnSecondPlayerApplyState)
  ) {
    throw new Error('Attack apply states already exist');
  }

  // The melee, with both cards known and the blows still to be counted.
  return meleeState;
}
