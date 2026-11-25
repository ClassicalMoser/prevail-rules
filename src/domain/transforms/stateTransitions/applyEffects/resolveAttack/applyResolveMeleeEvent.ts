import type { ResolveMeleeEvent } from '@events';
import type { GameState } from '@game';
import { getMeleeCombatants } from '@queries';
import { createAttackApplyState } from '@factories';
import { updateMeleeAttackApplyState } from '@transforms/pureTransforms';

/**
 * Applies a ResolveMeleeEvent to the game state.
 * Creates AttackApplyStates for both players. A threshold the attack reached marks
 * its rout, retreat or reverse `'pending'`; one it did not reach is
 * `'bypassed'`, so an attack that reaches none writes a completed apply. No
 * substep is written here: each opener writes its own when its turn comes.
 * TODO(misleading): an attack that reaches none writes an apply with nothing
 * due, but not a completed one: `createAttackApplyState` opens every apply
 * with `completed: false`, and `completeAttackApply` closes it. Settle by
 * saying "an apply with nothing due".
 *
 * @param event - The resolve melee event to apply
 * @param state - The current game state
 * @returns A new game state with the attack apply states created for both players
 */
export function applyResolveMeleeEvent<S extends GameState>(
  event: ResolveMeleeEvent,
  state: S,
): S {
  // The two units engaged in the melee's space; each side's result is an
  // independent measurement of the same exchange.
  const { black, white } = getMeleeCombatants(state);

  // Only the factory decides which slots are due; no substep is written here.
  const whiteAttackApplyState = createAttackApplyState(
    white.unit,
    event.attackResultOnWhiteUnit,
  );
  const blackAttackApplyState = createAttackApplyState(
    black.unit,
    event.attackResultOnBlackUnit,
  );

  // The event records what happened to each side's unit; each apply is
  // written to the slot its owner's initiative gives it.
  const withWhite = updateMeleeAttackApplyState(
    state,
    'white',
    whiteAttackApplyState,
  );
  const resolved = updateMeleeAttackApplyState(
    withWhite,
    'black',
    blackAttackApplyState,
  );

  // Both units' results written at once, as the blows are simultaneous
  // (§7.2.1), to be carried out a stage at a time (§7.5.6).
  return resolved;
}
