import type { Modifier } from '@entities';
import { tempCommandCards } from '@sampleValues';

import { modifiersFromCompletedCommitment } from './modifiersFromCompletedCommitment';

/**
 * ModifiersFromCompletedCommitment: only a completed commitment yields the committed card's modifiers;
 * pending or declined yield nothing.
 */
describe(modifiersFromCompletedCommitment, () => {
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
});
