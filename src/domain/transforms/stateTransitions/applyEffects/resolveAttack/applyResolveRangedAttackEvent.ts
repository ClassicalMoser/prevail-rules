import type { ResolveRangedAttackEvent } from '@events';
import type { GameState } from '@game';
import { createAttackApplyState } from '@factories';
import { getRangedAttackResolutionState } from '@queries';
import { updateCommandResolutionState } from '@transforms/pureTransforms';
import { throwIfPending } from '@utils';

/**
 * Applies a ResolveRangedAttackEvent to the game state.
 * Creates the AttackApplyState from the attack results. A threshold the shot
 * reached marks its rout, retreat or reverse `'pending'`; one it did not reach
 * is `'bypassed'`. No substep is written here: each opener writes its own when
 * its turn comes.
 *
 * @param event - The resolve ranged attack event to apply
 * @param state - The current game state
 * @returns A new game state with the attack apply state created
 */
export function applyResolveRangedAttackEvent<S extends GameState>(
  event: ResolveRangedAttackEvent,
  state: S,
): S {
  const rangedAttackState = getRangedAttackResolutionState(state);

  // The shot's target is the one it was aimed at.
  const defendingUnit = throwIfPending(
    rangedAttackState.defendingUnit,
    'The shot has not been aimed yet',
  );

  // Only the factory decides which slots are due; no substep is written here.
  const attackApplyState = createAttackApplyState(
    defendingUnit,
    event.attackResult,
  );

  const resolved = updateCommandResolutionState(state, {
    ...rangedAttackState,
    attackApplyState,
  });
  return resolved;
}
