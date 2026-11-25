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
  // The apply whose results have all been carried out: a shot's one, or in
  // a melee the second player's unit's before the first player's, since the
  // first player's blow lands first (§7.5.6).
  const apply = getAttackApplyToClose(state);

  // Closing it says this unit's results are finished; nothing else on it
  // changes.
  const closedApply = { ...apply, completed: true };
  const closed = updateAttackApplyState(state, closedApply);

  // The shot or melee, with one more apply closed: the sequencer then asks
  // for the other melee apply's close, or for the shot or melee to finish.
  return closed;
}
