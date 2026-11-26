import { PLAY_CARDS_PHASE } from '@game';
import { createPlayCardsPhaseState } from './playCardsPhaseState';

/**
 * CreatePlayCardsPhaseState: Creates a PlayCardsPhaseState with sensible defaults.
 */
describe('createPlayCardsPhaseState function', () => {
  it('given context, returns play cards phase with default step', () => {
    expect.hasAssertions();
    const state = createPlayCardsPhaseState();
    expect(state.phase).toBe(PLAY_CARDS_PHASE);
    expect(state.step).toBe('chooseCards');
  });
});
