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
  // The shot under way, with its shooter, target and commitments recorded.
  const rangedAttackState = getRangedAttackResolutionState(state);

  // The shot's target is the one it was aimed at.
  // The expected engine asks for this effect only once the shooter has
  // named its target (§4.3.11 step 3), so an unaimed shot is a fault in the
  // sequence.
  const defendingUnit = throwIfPending(
    rangedAttackState.defendingUnit,
    'The shot has not been aimed yet',
  );

  // Only the factory decides which slots are due; no substep is written here.
  const attackApplyState = createAttackApplyState(
    defendingUnit,
    event.attackResult,
  );

  // A shot is one way (§7.4.4): only the target takes results, so the shot
  // has one apply.
  const withApply = { ...rangedAttackState, attackApplyState };
  const resolved = updateCommandResolutionState(state, withApply);

  // The shot, with the target's results waiting to be carried out in order
  // (§7.5.2).
  return resolved;
}
