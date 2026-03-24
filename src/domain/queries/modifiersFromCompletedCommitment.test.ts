import type { Modifier } from '@entities';
import { commandCards } from '@sampleValues';
import { describe, expect, it } from 'vitest';

import { modifiersFromCompletedCommitment } from './modifiersFromCompletedCommitment';

/**
 * modifiersFromCompletedCommitment: only a completed commitment yields the committed card's modifiers;
 * pending or declined yield nothing.
 */
describe('modifiersFromCompletedCommitment', () => {
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
    const card = commandCards[0];
    const expected: Modifier[] = card.modifiers;
    expect(
      modifiersFromCompletedCommitment({
        commitmentType: 'completed',
        card,
      }),
    ).toEqual(expected);
  });
});
