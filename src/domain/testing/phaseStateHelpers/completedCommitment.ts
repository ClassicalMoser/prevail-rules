import type { CommandCard } from '@entities';
import { createTestCard } from '@testing/testHelpers';

/**
 * Completed commitment from the card the caller put in play.
 * When that pile is empty, the helper supplies its own +1 attack card.
 */
export function completedCommitment(inPlay: CommandCard | null): {
  card: CommandCard;
  commitmentType: 'completed';
} {
  return {
    card: inPlay ?? createTestCard({ modifiers: ['attack'] }),
    commitmentType: 'completed' as const,
  };
}
