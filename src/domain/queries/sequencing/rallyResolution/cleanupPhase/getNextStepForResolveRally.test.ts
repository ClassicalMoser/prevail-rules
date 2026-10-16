import { createEmptyGameState } from '@factories';
import { createCleanupPhaseState } from '@testing';
import { updatePhaseState } from '@transforms';

import { getNextStepForResolveRally } from './getNextStepForResolveRally';

/**
 * The cleanup step that follows a resolve-rally step.
 */
describe('getNextStepForResolveRally function', () => {
  it('returns the second player choose step after the first resolve', () => {
    const phase = createCleanupPhaseState({ step: 'firstPlayerResolveRally' });
    const state = updatePhaseState(createEmptyGameState('standard'), phase);

    expect(getNextStepForResolveRally(state)).toBe('secondPlayerChooseRally');
  });

  it('returns complete after the second resolve', () => {
    const phase = createCleanupPhaseState({ step: 'secondPlayerResolveRally' });
    const state = updatePhaseState(createEmptyGameState('standard'), phase);

    expect(getNextStepForResolveRally(state)).toBe('complete');
  });

  it('throws when cleanup is discarding played cards', () => {
    const phase = createCleanupPhaseState({ step: 'discardPlayedCards' });
    const state = updatePhaseState(createEmptyGameState('standard'), phase);

    expect(() => getNextStepForResolveRally(state)).toThrow(
      'Cleanup phase is not on a resolveRally step',
    );
  });
});
