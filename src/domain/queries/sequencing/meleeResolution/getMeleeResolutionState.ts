import type { GameState, MeleeResolutionState } from '@game';

/**
 * Gets the melee resolution state from the resolve melee phase.
 * Assumes we're in resolveMelee phase with a melee resolution state (validation should happen elsewhere).
 *
 * @param state - The game state
 * @returns The melee resolution state
 * @throws Error if not in resolveMelee phase or melee resolution state is missing
 */
export function getMeleeResolutionState<S extends GameState>(
  state: S,
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
export function getMeleeResolutionReadyForAttackCalculation<
  S extends GameState,
>(state: S): MeleeResolutionState {
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
