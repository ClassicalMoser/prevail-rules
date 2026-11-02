import { createEmptyGameState } from '@factories';
import {
  createMoveCommandersPhaseState,
  createPlayCardsPhaseState,
} from '@testing';
import { updatePhaseState } from '@transforms';

import { getMoveCommandersPhaseState } from './getMoveCommandersPhaseState';

describe('getMoveCommandersPhaseState function', () => {
  it('returns the move-commanders slice', () => {
    // The step is the second commander, so this is not the factory's first step.
    const phase = createMoveCommandersPhaseState({
      step: 'moveSecondCommander',
    });
    const state = updatePhaseState(createEmptyGameState('standard'), phase);

    expect(getMoveCommandersPhaseState(state)).toBe(phase);
  });

  it('throws when the phase is play cards', () => {
    const phase = createPlayCardsPhaseState();
    const state = updatePhaseState(createEmptyGameState('standard'), phase);

    expect(() => getMoveCommandersPhaseState(state)).toThrow(
      'Expected moveCommanders phase, got playCards',
    );
  });
});
