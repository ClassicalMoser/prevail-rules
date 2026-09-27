import type { Modifier } from '@entities';
import { tempCommandCards } from '@sampleValues';

import { modifiersFromCompletedCommitment } from './modifiersFromCompletedCommitment';

/**
 * ModifiersFromCompletedCommitment: only a completed commitment yields the committed card's modifiers;
 * pending or declined yield nothing.
 */
describe(modifiersFromCompletedCommitment, () => {
  it('given pending commitment, returns undefined', () => {
    expect(
      modifiersFromCompletedCommitment({ commitmentType: 'pending' }),
    ).toBeUndefined();
  });

  it('given declined commitment, returns undefined', () => {
    expect(
      modifiersFromCompletedCommitment({ commitmentType: 'declined' }),
    ).toBeUndefined();
  });

  it('given completed commitment with card, returns that card modifiers', () => {
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
