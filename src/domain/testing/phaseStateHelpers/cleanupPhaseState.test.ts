import { createCleanupPhaseState } from './cleanupPhaseState';

describe('createCleanupPhaseState function', () => {
  it('given context, returns cleanup phase with default step', () => {
    expect.hasAssertions();
    const state = createCleanupPhaseState();
    expect(state.phase).toBe('cleanup');
    expect(state.step).toBe('cardsLeavePlay');
    expect(state.firstPlayerRallyResolutionState).toBe('pending');
  });
});
