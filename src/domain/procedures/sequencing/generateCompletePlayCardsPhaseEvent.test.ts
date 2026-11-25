import { createEmptyGameState } from '@factories';
import { createPlayCardsPhaseState } from '@testing';
import { updatePhaseState } from '@transforms';

import { generateCompletePlayCardsPhaseEvent } from './generateCompletePlayCardsPhaseEvent';

/**
 * After both sides have played cards, this effect closes the play-cards phase. The generator
 * returns a constant payload only — it does not read initiative, round, or card fields.
 */
describe('generateCompletePlayCardsPhaseEvent function', () => {
  it('ends Play Cards with an effect that carries nothing', () => {
    // Both cards are revealed and initiative is settled; the phase is
    // complete.
    const state = updatePhaseState(
      createEmptyGameState('standard'),
      createPlayCardsPhaseState({ step: 'complete' }),
    );

    // Who holds the initiative, and each card in play, are the state's; the
    // effect names only itself.
    expect(generateCompletePlayCardsPhaseEvent(state)).toStrictEqual({
      effectType: 'completePlayCardsPhase',
      eventType: 'gameEffect',
    });
  });
});
