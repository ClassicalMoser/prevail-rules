import { generateCompleteResolveMeleePhaseEvent } from './generateCompleteResolveMeleePhaseEvent';

/**
 * Resolve Melee complete: every engagement has been fought, and Cleanup
 * follows. A fight neither side won stays on the board, so the effect carries
 * nothing.
 */
describe('generateCompleteResolveMeleePhaseEvent function', () => {
  it('ends Resolve Melee with an effect that carries nothing', () => {
    expect(generateCompleteResolveMeleePhaseEvent()).toStrictEqual({
      effectType: 'completeResolveMeleePhase',
      eventType: 'gameEffect',
    });
  });
});
