import { createEmptyGameState } from '@factories';
import { getCurrentPhaseState } from '@queries';
import {
  createCleanupPhaseState,
  createResolveMeleePhaseState,
} from '@testing';
import { updatePhaseState } from '@transforms/pureTransforms';

import { applyCompleteResolveMeleePhaseEvent } from './applyCompleteResolveMeleePhaseEvent';

/**
 * Once every engagement has been fought (§4.4.2), Phase 4 ends and Cleanup
 * opens with this round's cards leaving play (§4.5.1).
 */
describe('applyCompleteResolveMeleePhaseEvent function', () => {
  it('opens Cleanup with the cards to leave play, neither player yet asked to rally', () => {
    // Every fight is over: none left, and none under way.
    const empty = createEmptyGameState('standard');
    const fought = updatePhaseState(
      empty,
      createResolveMeleePhaseState(empty, {
        currentMeleeResolutionState: 'pending',
        remainingEngagements: [],
      }),
    );

    const next = applyCompleteResolveMeleePhaseEvent(fought);

    // Cleanup's first step, and both rallies still to choose.
    expect(getCurrentPhaseState(next)).toStrictEqual({
      firstPlayerRallyResolutionState: 'pending',
      phase: 'cleanup',
      secondPlayerRallyResolutionState: 'pending',
      step: 'cardsLeavePlay',
    });
  });

  it("records Phase 4 among the round's finished phases, marked complete", () => {
    // Every fight is over.
    const empty = createEmptyGameState('standard');
    const fought = updatePhaseState(
      empty,
      createResolveMeleePhaseState(empty, {
        currentMeleeResolutionState: 'pending',
        remainingEngagements: [],
      }),
    );

    const next = applyCompleteResolveMeleePhaseEvent(fought);

    // No query reads the round's record of finished phases, so the field is
    // read as written. Phase 4 has one working step, so this effect is what
    // marks it complete.
    expect(next.currentRoundState.completedPhases).toStrictEqual([
      {
        currentMeleeResolutionState: 'pending',
        phase: 'resolveMelee',
        remainingEngagements: [],
        step: 'complete',
      },
    ]);
  });

  it('throws when the game is not fighting', () => {
    // Cleanup has already begun.
    const cleaningUp = updatePhaseState(
      createEmptyGameState('standard'),
      createCleanupPhaseState(),
    );

    // Phase 4 ends only from Phase 4.
    expect(() => applyCompleteResolveMeleePhaseEvent(cleaningUp)).toThrow(
      'Expected resolveMelee phase, got cleanup',
    );
  });
});
