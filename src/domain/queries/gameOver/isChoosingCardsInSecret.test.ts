import { createEmptyGameState } from '@factories';
import { createPlayCardsPhaseState } from '@testing';
import { updatePhaseState } from '@transforms';

import { isChoosingCardsInSecret } from './isChoosingCardsInSecret';

describe('isChoosingCardsInSecret function', () => {
  it('is true while the cards are being chosen face down', () => {
    // Neither card is in play yet, so no hand can be judged empty.
    const state = updatePhaseState(
      createEmptyGameState('standard'),
      createPlayCardsPhaseState({ step: 'chooseCards' }),
    );

    expect(isChoosingCardsInSecret(state)).toBe(true);
  });

  it('is false once the cards are to be revealed', () => {
    // Both cards are chosen; from the reveal on, the hands are judged.
    const state = updatePhaseState(
      createEmptyGameState('standard'),
      createPlayCardsPhaseState({ step: 'revealCards' }),
    );

    expect(isChoosingCardsInSecret(state)).toBe(false);
  });

  it('is false before the round has a phase', () => {
    // Setup has no phase yet.
    expect(isChoosingCardsInSecret(createEmptyGameState('standard'))).toBe(
      false,
    );
  });
});
