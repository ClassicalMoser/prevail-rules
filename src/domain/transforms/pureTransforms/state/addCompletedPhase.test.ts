import { createEmptyGameState } from '@factories';
import {
  createMoveCommandersPhaseState,
  createPlayCardsPhaseState,
} from '@testing';

import { addCompletedPhase } from './addCompletedPhase';

/**
 * A phase that has ended is recorded after those that ended before it this
 * round, the phases running in a fixed order (§4).
 */
describe('addCompletedPhase function', () => {
  it('records the ended phase, leaving the state it was given as it was', () => {
    // A new game, nothing ended yet; Play Cards has just ended.
    const state = createEmptyGameState('standard');
    const playCards = createPlayCardsPhaseState({ step: 'complete' });

    const recorded = addCompletedPhase(state, playCards);

    // Play Cards is the one phase recorded; the state given has none.
    expect(recorded.currentRoundState.completedPhases).toStrictEqual([
      { phase: 'playCards', step: 'complete' },
    ]);
    expect(state.currentRoundState.completedPhases).toStrictEqual([]);
  });

  it('records a later phase after those already ended', () => {
    // Play Cards has ended and been recorded; then Move Commanders ends.
    const afterPlayCards = addCompletedPhase(
      createEmptyGameState('standard'),
      createPlayCardsPhaseState({ step: 'complete' }),
    );
    const moveCommanders = createMoveCommandersPhaseState({ step: 'complete' });

    const recorded = addCompletedPhase(afterPlayCards, moveCommanders);

    // Both are recorded, in the order they ended.
    expect(recorded.currentRoundState.completedPhases).toStrictEqual([
      { phase: 'playCards', step: 'complete' },
      { phase: 'moveCommanders', step: 'complete' },
    ]);
  });
});
