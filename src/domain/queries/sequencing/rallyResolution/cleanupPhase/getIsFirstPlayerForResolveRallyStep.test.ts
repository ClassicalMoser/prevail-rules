import { createEmptyGameState } from '@factories';
import { createCleanupPhaseState } from '@testing';
import { updatePhaseState } from '@transforms';

import { getIsFirstPlayerForResolveRallyStep } from './getIsFirstPlayerForResolveRallyStep';

/**
 * True on the first player's resolve-rally step, false on the second player's.
 */
describe('getIsFirstPlayerForResolveRallyStep function', () => {
  it('returns true on the first player resolve step', () => {
    const phase = createCleanupPhaseState({ step: 'firstPlayerResolveRally' });
    const state = updatePhaseState(createEmptyGameState('standard'), phase);

    expect(getIsFirstPlayerForResolveRallyStep(state)).toBe(true);
  });

  it('returns false on the second player resolve step', () => {
    const phase = createCleanupPhaseState({
      step: 'secondPlayerResolveRally',
    });
    const state = updatePhaseState(createEmptyGameState('standard'), phase);

    expect(getIsFirstPlayerForResolveRallyStep(state)).toBe(false);
  });

  it('throws when cleanup is discarding played cards', () => {
    const phase = createCleanupPhaseState({ step: 'discardPlayedCards' });
    const state = updatePhaseState(createEmptyGameState('standard'), phase);

    expect(() => getIsFirstPlayerForResolveRallyStep(state)).toThrow(
      'Cleanup phase is not on a resolveRally step: discardPlayedCards',
    );
  });
});
