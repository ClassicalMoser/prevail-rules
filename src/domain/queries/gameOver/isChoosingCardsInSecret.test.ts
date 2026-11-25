import type { PlayCardsPhaseStep } from '@game';
import { createEmptyGameState } from '@factories';
import { tempCommandCards } from '@sampleValues';
import { createPlayCardsPhaseState } from '@testing';
import { updatePhaseState, updatePlayerCardState } from '@transforms';

import { isChoosingCardsInSecret } from './isChoosingCardsInSecret';

/** A new game at this step of Phase 1, with neither card chosen yet. */
function playingCards(step: PlayCardsPhaseStep) {
  const state = updatePhaseState(
    createEmptyGameState('standard'),
    createPlayCardsPhaseState({ step }),
  );
  return state;
}

/**
 * Both cards are laid face down and revealed together (§4.1.1, §4.1.2), so
 * the hands are not judged between the two choices: whichever arrives first
 * is an accident of the network.
 */
describe('isChoosingCardsInSecret function', () => {
  it('is true while the cards are being chosen face down', () => {
    // Neither card is laid yet, so no hand can be judged empty.
    const state = playingCards('chooseCards');

    expect(isChoosingCardsInSecret(state)).toBe(true);
  });

  it('is still true while only one card is chosen', () => {
    // Black has laid a card face down; White has not.
    const choosing = playingCards('chooseCards');
    const state = updatePlayerCardState(choosing, 'black', {
      ...choosing.cardState.black,
      awaitingPlay: tempCommandCards[0],
    });

    // The game is not judged between the two choices.
    expect(isChoosingCardsInSecret(state)).toBe(true);
  });

  it('is false once both cards are chosen and wait to be revealed', () => {
    // Both cards are face down, still on the chooseCards step.
    const choosing = playingCards('chooseCards');
    const blackChosen = updatePlayerCardState(choosing, 'black', {
      ...choosing.cardState.black,
      awaitingPlay: tempCommandCards[0],
    });
    const state = updatePlayerCardState(blackChosen, 'white', {
      ...blackChosen.cardState.white,
      awaitingPlay: tempCommandCards[1],
    });

    // From here on, the hands are judged.
    expect(isChoosingCardsInSecret(state)).toBe(false);
  });

  it('is false once the cards are revealed and initiative is being assigned', () => {
    // Later in Phase 1, after the reveal: no card waits face down.
    const state = playingCards('assignInitiative');

    // The secret choice is over, so the hands are judged again.
    expect(isChoosingCardsInSecret(state)).toBe(false);
  });

  it('is false before the round has a phase', () => {
    // Setup has no phase yet.
    expect(isChoosingCardsInSecret(createEmptyGameState('standard'))).toBe(
      false,
    );
  });
});
