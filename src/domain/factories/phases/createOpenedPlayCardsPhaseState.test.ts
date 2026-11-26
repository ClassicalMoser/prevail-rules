import { createOpenedPlayCardsPhaseState } from './createOpenedPlayCardsPhaseState';

/** Phase 1 as a round opens. */
describe('createOpenedPlayCardsPhaseState function', () => {
  it('opens on both players choosing a card', () => {
    expect(createOpenedPlayCardsPhaseState()).toStrictEqual({
      phase: 'playCards',
      step: 'chooseCards',
    });
  });
});
