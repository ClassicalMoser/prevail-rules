import { createEmptyGameState } from '@factories';
import { tempCommandCards } from '@sampleValues';
import { createPlayCardsPhaseState, updateCardState } from '@testing';
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

  it('is still true while only one card is chosen', () => {
    // Black has laid a card face down; White has not.
    const choosing = updatePhaseState(
      createEmptyGameState('standard'),
      createPlayCardsPhaseState({ step: 'chooseCards' }),
    );
    const state = updateCardState(choosing, {
      ...choosing.cardState,
      black: { ...choosing.cardState.black, awaitingPlay: tempCommandCards[0] },
    });

    // The game is not judged between the two choices.
    expect(isChoosingCardsInSecret(state)).toBe(true);
  });

  it('is false once both cards are chosen and wait to be revealed', () => {
    // Both cards are face down, still on the chooseCards step.
    const choosing = updatePhaseState(
      createEmptyGameState('standard'),
      createPlayCardsPhaseState({ step: 'chooseCards' }),
    );
    const state = updateCardState(choosing, {
      ...choosing.cardState,
      black: { ...choosing.cardState.black, awaitingPlay: tempCommandCards[0] },
      white: { ...choosing.cardState.white, awaitingPlay: tempCommandCards[1] },
    });

    // From here on, the hands are judged.

    expect(isChoosingCardsInSecret(state)).toBe(false);
  });

  it('is false before the round has a phase', () => {
    // Setup has no phase yet.
    expect(isChoosingCardsInSecret(createEmptyGameState('standard'))).toBe(
      false,
    );
  });
});
