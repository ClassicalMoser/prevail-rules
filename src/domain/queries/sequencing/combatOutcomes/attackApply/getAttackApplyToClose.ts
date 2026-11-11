import type { AttackApplyState, GameState } from '@game';
import { getCurrentPhaseState } from '@queries/sequencing/phases/getCurrentPhaseState';
import { getMeleeResolutionState } from '@queries/sequencing/meleeResolution/getMeleeResolutionState';
import { findNextMeleeAttackApplyToClose } from './findNextMeleeAttackApplyToClose';
import { getRangedAttackApplyState } from './getRangedAttackApplyState';

/**
 * The attack apply that `completeAttackApply` closes next: the ranged attack's
 * one apply, or, in a melee, the first not yet closed in the order the blows
 * take effect (§7.5.6). The sequencer asks for the close when the apply's
 * results are carried out, and both the procedure that builds the effect and
 * the transform that applies it ask this, so which apply it is has one answer.
 *
 * @param state - The game state, in a shot or a melee
 * @returns The apply to close
 * @throws Error outside a shot or a melee, or when every apply in the melee is closed
 */
export function getAttackApplyToClose(state: GameState): AttackApplyState {
  const phaseState = getCurrentPhaseState(state);

  // A ranged attack has one apply.
  if (phaseState.phase === 'issueCommands') {
    const rangedApply = getRangedAttackApplyState(state);
    return rangedApply;
  }

  // A melee has one on each side, closed in resolution order.
  if (phaseState.phase === 'resolveMelee') {
    const next = findNextMeleeAttackApplyToClose(
      getMeleeResolutionState(state),
    );
    if (next === undefined) {
      throw new Error(
        'No incomplete attack apply state found in melee resolution',
      );
    }
    return next;
  }

  throw new Error(
    `completeAttackApply not expected in phase: ${phaseState.phase}`,
  );
}
