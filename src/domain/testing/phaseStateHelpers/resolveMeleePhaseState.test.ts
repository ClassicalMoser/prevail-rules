import { RESOLVE_MELEE_PHASE } from '@game';
import { createResolveMeleePhaseState } from './resolveMeleePhaseState';
import { createEmptyGameState } from '@factories';

describe('createResolveMeleePhaseState function', () => {
  it('given context, returns resolve melee phase with melee resolution state', () => {
    expect.hasAssertions();
    const gameState = createEmptyGameState('standard');
    const state = createResolveMeleePhaseState(gameState);
    expect(state.phase).toBe(RESOLVE_MELEE_PHASE);
    expect(state.step).toBe('resolveMelee');
    expect(state.currentMeleeResolutionState).toBeDefined();
    expect(state.remainingEngagements).toHaveLength(0);
  });
});
