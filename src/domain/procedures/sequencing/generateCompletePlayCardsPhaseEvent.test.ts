import { generateCompletePlayCardsPhaseEvent } from './generateCompletePlayCardsPhaseEvent';

/**
 * Play Cards complete: both cards are face up and initiative is settled,
 * and the commanders move next. Who holds the initiative, and each card in
 * play, are the state's, so the effect carries nothing.
 */
describe('generateCompletePlayCardsPhaseEvent function', () => {
  it('ends Play Cards with an effect that carries nothing', () => {
    expect(generateCompletePlayCardsPhaseEvent()).toStrictEqual({
      effectType: 'completePlayCardsPhase',
      eventType: 'gameEffect',
    });
  });
});
