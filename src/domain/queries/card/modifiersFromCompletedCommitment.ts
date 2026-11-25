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
  // A commitment still to be decided, or declined, put no card down, so it
  // lends nothing (§8.3).
  if (commitment.commitmentType !== 'completed') {
    return undefined;
  }

  // The committed card gives +1 to every stat it names, and never anything
  // but +1 (§8.2); the moment reads only the stats it uses.
  const modifiers: Modifier[] = commitment.card.modifiers.map((modifier) => ({
    type: modifier,
    value: 1,
  }));
  return modifiers;
}
