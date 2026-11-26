import { RESOLVE_MELEE_PHASE } from '@game';
import { createEmptyGameState } from '@factories';

import { createResolveMeleePhaseState } from './resolveMeleePhaseState';

/** Phase 4 with one melee under way and no other engagement waiting (§4.4.2). */
describe('createResolveMeleePhaseState function', () => {
  it('fights one melee on E-5, with nothing waiting after it', () => {
    const phase = createResolveMeleePhaseState(
      createEmptyGameState('standard'),
    );

    expect(phase.phase).toBe(RESOLVE_MELEE_PHASE);
    expect(phase.step).toBe('resolveMelee');
    expect(phase.currentMeleeResolutionState).toMatchObject({
      location: 'E-5',
      substepType: 'meleeResolution',
    });
    expect(phase.remainingEngagements).toStrictEqual([]);
  });
});
