import { createEmptyGameState } from '@factories';
import {
  createMoveCommandersPhaseState,
  createPlayCardsPhaseState,
} from '@testing';
import { updatePhaseState } from '@transforms';

import { getMoveCommandersPhaseState } from './getMoveCommandersPhaseState';

/** Phase 2, where each player may move their commander (§4.2). */
describe('getMoveCommandersPhaseState function', () => {
  it('returns the move commanders phase', () => {
    // The step is the second commander, so this is not the factory's first step.
    const phase = createMoveCommandersPhaseState({
      step: 'moveSecondCommander',
    });
    const state = updatePhaseState(createEmptyGameState('standard'), phase);

    // The phase this test installed.
    expect(getMoveCommandersPhaseState(state)).toBe(phase);
  });

  it('throws when the phase is play cards', () => {
    // The round is still in Phase 1.
    const phase = createPlayCardsPhaseState();
    const state = updatePhaseState(createEmptyGameState('standard'), phase);

    // Asking for commanders here is out of turn; the message names the phase found.
    expect(() => getMoveCommandersPhaseState(state)).toThrow(
      'Expected moveCommanders phase, got playCards',
    );
  });
});
