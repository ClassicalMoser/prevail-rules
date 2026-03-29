import type { Modifier } from '@entities';
import type { Commitment } from '@game';

/**
 * Returns the committed card’s modifiers when `commitmentType === 'completed'`;
 * otherwise `undefined` (pending or declined — no card to read).
 *
 * Used when computing stats with optional card modifiers (melee, ranged, movement).
 */
export function modifiersFromCompletedCommitment(
  commitment: Commitment,
): Modifier[] | undefined {
  if (commitment.commitmentType !== 'completed') {
    return undefined;
  }
  return commitment.card.modifiers;
}
