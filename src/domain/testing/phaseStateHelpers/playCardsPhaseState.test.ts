import { PLAY_CARDS_PHASE } from '@game';

import { createPlayCardsPhaseState } from './playCardsPhaseState';

/** Phase 1 as it opens, both players about to choose a card face down (§4.1.1). */
describe('createPlayCardsPhaseState function', () => {
  it('opens Phase 1 on both players choosing their cards', () => {
    const phase = createPlayCardsPhaseState();

    expect(phase).toStrictEqual({
      phase: PLAY_CARDS_PHASE,
      step: 'chooseCards',
    });
  });

  it('stands at the step a spec names', () => {
    const phase = createPlayCardsPhaseState({ step: 'assignInitiative' });

    expect(phase.step).toBe('assignInitiative');
  });
});
