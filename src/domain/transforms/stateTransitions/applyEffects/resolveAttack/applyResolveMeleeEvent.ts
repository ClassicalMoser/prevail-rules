import type { ResolveMeleeEvent } from '@events';
import type { AttackResult, GameState } from '@game';
import { createAttackApplyState } from '@factories';
import { updateMeleeAttackApplyState } from '@transforms/pureTransforms';

/**
 * Applies a ResolveMeleeEvent to the game state.
 * Creates AttackApplyStates for both players. A threshold the blow reached marks
 * its rout, retreat or reverse `'pending'`; one it did not reach is
 * `'bypassed'`, so an attack that reaches none writes a completed apply. No
 * substep is written here: each opener writes its own when its turn comes.
 *
 * @param event - The resolve melee event to apply
 * @param state - The current game state
 * @returns A new game state with the attack apply states created for both players
 */
export function applyResolveMeleeEvent<S extends GameState>(
  event: ResolveMeleeEvent,
  state: S,
): S {
  // Each side's thresholds are independent measurements of the same exchange.
  const whiteAttackResult: AttackResult = {
    unitRetreated: event.whiteUnitRetreated,
    unitReversed: event.whiteUnitReversed,
    unitRouted: event.whiteUnitRouted,
  };

  const blackAttackResult: AttackResult = {
    unitRetreated: event.blackUnitRetreated,
    unitReversed: event.blackUnitReversed,
    unitRouted: event.blackUnitRouted,
  };

  // Only the factory decides which slots are due; no substep is written here.
  const whiteAttackApplyState = createAttackApplyState(
    event.whiteUnitWithPlacement.unit,
    whiteAttackResult,
  );
  const blackAttackApplyState = createAttackApplyState(
    event.blackUnitWithPlacement.unit,
    blackAttackResult,
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
  return resolved;
}
