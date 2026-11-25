import type { AttackApplyState, GameState } from '@game';
import { isPending } from '@utils';
import type { AttackApplyStage } from './attackApplyStages';
import { getCurrentPhaseState } from '@queries/sequencing/phases/getCurrentPhaseState';
import { getMeleeAppliesInResolutionOrder } from '@queries/sequencing/meleeResolution/getMeleeAppliesInResolutionOrder';
import { getMeleeResolutionState } from '@queries/sequencing/meleeResolution/getMeleeResolutionState';
import { getRangedAttackApplyState } from './getRangedAttackApplyState';

/** Whether this stage of the unit's results is waiting to be opened. */
function isAwaitingOpen(
  apply: AttackApplyState,
  stage: AttackApplyStage,
): boolean {
  // Each stage has its own slot on the apply. `'pending'` there means the
  // attack reached that threshold and nothing has opened the step yet;
  // `'bypassed'` or an open substep means there is nothing left to open.
  switch (stage) {
    case 'retreat': {
      // The unit was driven back and its ways back are not yet worked out.
      return isPending(apply.retreatState);
    }
    case 'reverse': {
      // The unit was shaken and its reverse is not yet written.
      return isPending(apply.reverseState);
    }
    case 'rout': {
      // The unit broke and its rout is not yet written.
      return isPending(apply.routState);
    }
    default: {
      // Exhaustiveness check for TypeScript
      const _exhaustive: never = stage;
      throw new Error(`Unknown attack apply stage: ${String(_exhaustive)}`);
    }
  }
}

// TODO(composition): picks the melee slot by resolution order, which follows
// the initiative, rather than reading which slot is due. Settled by deciding
// whether order is a fair way to name the slot.
/**
 * The attack apply whose retreat, reverse or rout opens next: the one
 * `open*FromAttackApply` is owed for.
 *
 * A shot has one apply. A melee carries each stage out for both units before
 * the next (§7.5.6), the second player's unit first, since the first player's
 * attack takes effect first; the sequencer asks for an open only once every unit before
 * it in that order has nothing left due in the stage. So the apply to open is
 * the first, in resolution order, whose slot for the stage is still waiting.
 *
 * @param state - The game state, in a shot or a melee
 * @param stage - The stage being opened
 * @returns The apply whose slot for that stage opens next
 * @throws Error outside a shot or a melee, or when no apply's slot for the stage is waiting
 */
export function getAttackApplyAwaitingOpen(
  state: GameState,
  stage: AttackApplyStage,
): AttackApplyState {
  const phaseState = getCurrentPhaseState(state);

  // A shot has one apply.
  if (phaseState.phase === 'issueCommands') {
    const apply = getRangedAttackApplyState(state);
    // The sequencer asks only when the stage is due, so a slot already open
    // or bypassed means it asked out of turn.
    if (!isAwaitingOpen(apply, stage)) {
      throw new Error(`The ${stage} is not pending on the ranged attack apply`);
    }
    // The target's apply is the only one this shot has.
    return apply;
  }

  // A melee opens the first one waiting, in resolution order.
  if (phaseState.phase === 'resolveMelee') {
    const appliesInOrder = getMeleeAppliesInResolutionOrder(
      getMeleeResolutionState(state),
    );
    const apply = appliesInOrder.find((candidate) =>
      isAwaitingOpen(candidate, stage),
    );
    // Neither unit is owed this stage, so the sequencer asked out of turn.
    if (apply === undefined) {
      throw new Error(`No pending ${stage} on either melee attack apply`);
    }
    // The unit that suffers first among those still owed this stage.
    return apply;
  }

  // Only a shot and a melee carry out an attack's results.
  throw new Error(
    `Attack-apply ${stage} open not expected in phase: ${phaseState.phase}`,
  );
}
