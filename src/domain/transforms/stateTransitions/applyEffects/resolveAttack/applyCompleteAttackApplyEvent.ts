import type { CompleteAttackApplyEvent } from '@events';
import type { GameState } from '@game';
import { getAttackApplyToClose } from '@queries';
import { updateAttackApplyState } from '@transforms/pureTransforms';

/**
 * Applies a CompleteAttackApplyEvent to the game state.
 * Marks the attack apply state as completed.
 * Can be in ranged attack resolution (issueCommands phase) or melee resolution (resolveMelee phase).
 *
 * The event carries nothing: {@link getAttackApplyToClose} names the apply, a
 * shot's only one or the next of a melee's two in resolution order.
 *
 * @param _event - Present for `applyGameEffectEvent` dispatch; this effect has no payload fields
 * @param state - The current game state
 * @returns A new game state with the attack apply state marked as completed
 */
export function applyCompleteAttackApplyEvent<S extends GameState>(
  _event: CompleteAttackApplyEvent,
  state: S,
): S {
  const apply = getAttackApplyToClose(state);
  const closed = updateAttackApplyState(state, { ...apply, completed: true });
  return closed;
}
