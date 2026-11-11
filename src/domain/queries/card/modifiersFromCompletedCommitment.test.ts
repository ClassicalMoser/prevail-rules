import { tempCommandCards } from '@sampleValues';
import type { Modifier } from '@entities';
import { createTestCard } from '@testing';

import { modifiersFromCompletedCommitment } from './modifiersFromCompletedCommitment';

/**
 * ModifiersFromCompletedCommitment: only a completed commitment yields the committed card's modifiers;
 * pending or declined yield nothing.
 */
describe('modifiersFromCompletedCommitment function', () => {
  it('a pending commitment has no modifiers', () => {
    expect(
      modifiersFromCompletedCommitment({ commitmentType: 'pending' }),
    ).toBeUndefined();
  });

  it('a declined commitment has no modifiers', () => {
    expect(
      modifiersFromCompletedCommitment({ commitmentType: 'declined' }),
    ).toBeUndefined();
  });

  it('a completed commitment yields its card modifiers', () => {
    const card = tempCommandCards[0];
    const expected: Modifier[] = card.modifiers.map((type) => ({
      type,
      value: 1,
    }));
    expect(
      modifiersFromCompletedCommitment({
        card,
        commitmentType: 'completed',
      }),
    ).toStrictEqual(expected);
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
