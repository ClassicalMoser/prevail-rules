import { createEmptyGameState } from '@factories';
import { createCleanupPhaseState, createTestCard } from '@testing';
import { updatePhaseState, updatePlayerCardState } from '@transforms';

import { generateCardsLeavePlayEvent } from './generateCardsLeavePlayEvent';

/**
 * Cleanup phase entry: signal to discard all played command cards from both sides.
 * Payload is a fixed game effect only; handler clears played piles. Implementation ignores
 * `state` beyond the parameter shape — tests document that contract.
 */
describe('generateCardsLeavePlayEvent function', () => {
  it('sends both cards in play to the played piles with an event that names no card', () => {
    // Cleanup has begun, and each player still has this round's card in play.
    const cleanup = updatePhaseState(
      createEmptyGameState('standard'),
      createCleanupPhaseState({ step: 'cardsLeavePlay' }),
    );
    const whiteInPlay = updatePlayerCardState(cleanup, 'white', {
      ...cleanup.cardState.white,
      inPlay: createTestCard(),
    });
    const state = updatePlayerCardState(whiteInPlay, 'black', {
      ...whiteInPlay.cardState.black,
      inPlay: createTestCard(),
    });

    // Cards leaving play is fixed (§4.5.1): the event carries only its type,
    // and the apply reads the cards from the state.
    expect(generateCardsLeavePlayEvent(state)).toStrictEqual({
      effectType: 'cardsLeavePlay',
      eventType: 'gameEffect',
    });
  });
});
