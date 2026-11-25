import { createTestCard } from '@testing';

import { modifiersFromCompletedCommitment } from './modifiersFromCompletedCommitment';

/**
 * A committed card gives +1 to every stat it names (§8.2). A commitment not
 * yet decided, or declined, puts no card down and gives nothing.
 */
describe('modifiersFromCompletedCommitment function', () => {
  it('a pending commitment has no modifiers', () => {
    // The player has not yet chosen whether to commit.
    expect(
      modifiersFromCompletedCommitment({ commitmentType: 'pending' }),
    ).toBeUndefined();
  });

  it('a declined commitment has no modifiers', () => {
    // Commitment is always optional (§8.3); declining lends nothing.
    expect(
      modifiersFromCompletedCommitment({ commitmentType: 'declined' }),
    ).toBeUndefined();
  });

  it('a card naming two stats gives +1 to both (§8.2)', () => {
    // A Range and Attack card committed to a shot: both land at once.
    const card = createTestCard({ modifiers: ['range', 'attack'] });

    expect(
      modifiersFromCompletedCommitment({
        card,
        commitmentType: 'completed',
      }),
    ).toStrictEqual([
      { type: 'range', value: 1 },
      { type: 'attack', value: 1 },
    ]);
  });
});
