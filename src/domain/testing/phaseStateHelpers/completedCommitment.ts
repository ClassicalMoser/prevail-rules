import type { CommandCard } from '@entities';
import { createTestCard } from '@testing/testHelpers';

/**
 * Completed commitment from the card the caller put in play.
 * When that pile is empty, the helper supplies its own +1 attack card.
 *
 * TODO(wrong): a card in play cannot be committed (§4.1.6, §8.6); only a card
 * in hand can, and it goes to the discard pile. So every move, shot and melee
 * built on this records a commitment play could not make, and when a card is
 * in play the same card sits in two places at once. The fallback card is in
 * no pile at all, and as an Attack card it is no use to a ranged defender,
 * who may commit only for Defence or Flexibility (§8.4). To settle: decide
 * whether these fixtures default to a declined commitment, or to a card taken
 * from the hand into the discard pile, and which specs need which.
 */
export function completedCommitment(inPlay: CommandCard | null): {
  card: CommandCard;
  commitmentType: 'completed';
} {
  // The commitment already made, so a spec can begin after it.
  const commitment = {
    card: inPlay ?? createTestCard({ modifiers: ['attack'] }),
    commitmentType: 'completed' as const,
  };

  // The commitment, for a resolution substep's commitment slot.
  return commitment;
}
