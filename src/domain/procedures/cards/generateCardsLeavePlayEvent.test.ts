import { generateCardsLeavePlayEvent } from './generateCardsLeavePlayEvent';

/**
 * Cleanup opens with both cards in play going to their played piles
 * (§4.5.1). Which cards are in play is the state's, so the effect carries
 * nothing.
 */
describe('generateCardsLeavePlayEvent function', () => {
  it('sends both cards in play to the played piles with an effect that names no card', () => {
    expect(generateCardsLeavePlayEvent()).toStrictEqual({
      effectType: 'cardsLeavePlay',
      eventType: 'gameEffect',
    });
  });
});
