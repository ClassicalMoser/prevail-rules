import type { AttackApplyState, GameState } from '@game';
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
  switch (stage) {
    case 'retreat': {
      return apply.retreatState === 'pending';
    }
    case 'reverse': {
      return apply.reverseState === 'pending';
    }
    case 'rout': {
      return apply.routState === 'pending';
    }
    default: {
      // Exhaustiveness check for TypeScript
      const _exhaustive: never = stage;
      throw new Error(`Unknown attack apply stage: ${String(_exhaustive)}`);
    }
  }
}

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
    if (!isAwaitingOpen(apply, stage)) {
      throw new Error(`The ${stage} is not pending on the ranged attack apply`);
    }
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
    if (apply === undefined) {
      throw new Error(`No pending ${stage} on either melee attack apply`);
    }
    return apply;
  }

  throw new Error(
    `Attack-apply ${stage} open not expected in phase: ${phaseState.phase}`,
  );
}
