import { createGameStateResolvingMelee } from '@testing';

import { generateCompleteResolveMeleePhaseEvent } from './generateCompleteResolveMeleePhaseEvent';

/**
 * Closes the resolve-melee phase after all engagements are processed. Generator returns
 * only the `completeResolveMeleePhase` effect marker; no per-state branching in procedure.
 */
describe('generateCompleteResolveMeleePhaseEvent function', () => {
  it('ends Resolve Melee with an effect that carries nothing', () => {
    // Phase 4 with no melee under way and no engagement left to fight.
    const state = createGameStateResolvingMelee('pending');

    // A fight left standing stays on the board; the effect names only itself.
    expect(generateCompleteResolveMeleePhaseEvent(state)).toStrictEqual({
      effectType: 'completeResolveMeleePhase',
      eventType: 'gameEffect',
    });
  });
});
