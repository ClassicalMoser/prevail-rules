import type { AttackApplyState, GameState } from '@game';
import { getCurrentPhaseState, getRangedAttackResolutionState } from '@queries';
import { isPending } from '@utils';
import { updateCommandResolutionState } from './updateCommandResolutionState';
import { updateMeleeAttackApplyState } from './updateMeleeAttackApplyState';

/**
 * Creates a new game state with the attack apply state updated.
 * Attack apply only occurs in ranged attack resolution (issueCommands) or melee resolution (resolveMelee).
 *
 * @param state - The current game state
 * @param attackApplyState - The new attack apply state to set
 * @returns A new game state with the updated attack apply state
 */
export function updateAttackApplyState<S extends GameState>(
  state: S,
  attackApplyState: AttackApplyState,
): S {
  // Results are carried out after a shot in Phase 3 or a melee in Phase 4,
  // and nowhere else (§7.5).
  const phaseState = getCurrentPhaseState(state);

  // A shot is one way (§7.4.4), so it has one apply: its target's.
  if (phaseState.phase === 'issueCommands') {
    const ranged = getRangedAttackResolutionState(state);
    // This writer replaces an apply the shot has already opened; the shot
    // opens its own when it is measured.
    // TODO(composition): this walk repeats `getRangedAttackApplyState`, which
    // throws on the same `'pending'` with a message one word shorter ("…in
    // ranged attack resolution"). The melee branch below makes no such
    // check, so a melee writer may fill a slot not yet opened while a ranged
    // one may not. Settled by deciding whether this writer only ever replaces
    // an opened apply, then reading it through the getter on both branches.
    if (isPending(ranged.attackApplyState)) {
      throw new Error(
        'No attack apply state found in ranged attack resolution state',
      );
    }
    const written = updateCommandResolutionState(state, {
      ...ranged,
      attackApplyState,
    });
    // The shot, with its target's results as they now stand.
    return written;
  }

  if (phaseState.phase === 'resolveMelee') {
    // The slots are named for whose unit holds the result, so the owner
    // picks the slot.
    const written = updateMeleeAttackApplyState(
      state,
      attackApplyState.defendingUnit.playerSide,
      attackApplyState,
    );
    // The melee, with that side's results as they now stand.
    return written;
  }

  // Any other phase has no attack being carried out: a fault in the caller.
  throw new Error(
    `Attack apply state update not expected in phase: ${phaseState.phase}`,
  );
}
