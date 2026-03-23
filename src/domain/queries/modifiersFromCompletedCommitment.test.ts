import type { Modifier } from '@entities';
import { commandCards } from '@sampleValues';
import { describe, expect, it } from 'vitest';

import { modifiersFromCompletedCommitment } from './modifiersFromCompletedCommitment';

describe('modifiersFromCompletedCommitment', () => {
  it('returns undefined when commitment is pending', () => {
    expect(
      modifiersFromCompletedCommitment({ commitmentType: 'pending' }),
    ).toBeUndefined();
  });

  it('returns undefined when commitment is declined', () => {
    expect(
      modifiersFromCompletedCommitment({ commitmentType: 'declined' }),
    ).toBeUndefined();
  });

  it('returns card modifiers when commitment is completed', () => {
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
