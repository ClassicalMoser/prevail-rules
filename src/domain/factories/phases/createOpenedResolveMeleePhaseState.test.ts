import { createOpenedResolveMeleePhaseState } from './createOpenedResolveMeleePhaseState';

/** Phase 4 as it opens. */
describe('createOpenedResolveMeleePhaseState function', () => {
  it('opens with every engaged space still to fight and no melee chosen', () => {
    expect(createOpenedResolveMeleePhaseState(['E-5', 'F-7'])).toStrictEqual({
      currentMeleeResolutionState: 'pending',
      phase: 'resolveMelee',
      remainingEngagements: ['E-5', 'F-7'],
      step: 'resolveMelee',
    });
  });
});
