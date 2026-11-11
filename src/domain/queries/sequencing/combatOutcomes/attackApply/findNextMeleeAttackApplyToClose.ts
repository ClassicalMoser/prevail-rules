import type { AttackApplyState, MeleeResolutionState } from '@game';
import { getMeleeAppliesInResolutionOrder } from '@queries/sequencing/meleeResolution/getMeleeAppliesInResolutionOrder';

/**
 * The melee attack apply still to close, in the order the blows take effect.
 *
 * Once every stage of a melee's results has been carried out, each unit's
 * apply is closed in turn. The first player's blow lands first, so the second
 * player's unit is closed first (§7.5.6). Both the sequencer, asking what is
 * due, and the procedure that closes it ask this, so the order is written once.
 *
 * @param meleeState - The melee being sequenced.
 * @returns The first apply in resolution order not yet completed; `undefined`
 * if either apply is not yet written (the order is not known until both are),
 * or both are already complete.
 */
export function findNextMeleeAttackApplyToClose(
  meleeState: MeleeResolutionState,
): AttackApplyState | undefined {
  // Resolution order only applies once both applies have been opened.
  const appliesInOrder = getMeleeAppliesInResolutionOrder(meleeState);
  if (appliesInOrder.length < 2) {
    return undefined;
  }
  return appliesInOrder.find((apply) => !apply.completed);
}
