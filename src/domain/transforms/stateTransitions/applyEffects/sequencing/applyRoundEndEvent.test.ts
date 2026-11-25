import type { RoundEndEvent } from '@events';
import type { AuthoritativeGameState } from '@game';
import { createEmptyGameState } from '@factories';
import { getCurrentPhaseState } from '@queries';
import {
  createCleanupPhaseState,
  createPlayCardsPhaseState,
  createTestUnit,
} from '@testing';
import {
  updateCurrentInitiative,
  updateRoundState,
} from '@transforms/pureTransforms';

import { applyRoundEndEvent } from './applyRoundEndEvent';

/** The effect that ends a round; it carries nothing. */
const event: RoundEndEvent = {
  effectType: 'roundEnd',
  eventType: 'gameEffect',
};

// A unit White ordered during round 3.
const orderedUnit = createTestUnit('white');

/**
 * Round 3 at the end of Cleanup, Black holding the initiative, with a unit
 * ordered and card play recorded among the finished phases.
 */
function endOfRoundThree(): AuthoritativeGameState {
  const blackFirst = updateCurrentInitiative(
    createEmptyGameState('standard'),
    'black',
  );
  const ending = updateRoundState(blackFirst, {
    commandedUnits: [orderedUnit],
    completedPhases: [createPlayCardsPhaseState({ step: 'complete' })],
    currentPhaseState: createCleanupPhaseState({ step: 'complete' }),
    roundNumber: 3,
  });
  return ending;
}

/**
 * A round ends after Cleanup and the next begins at Phase 1 (§4.5.4). Nothing
 * is remembered between rounds but what is on the table (§1.5).
 */
describe('applyRoundEndEvent function', () => {
  it('begins the next round with both players choosing a card', () => {
    const next = applyRoundEndEvent(event, endOfRoundThree());

    // Round 4, at its first step (§4.1.1).
    expect(next.currentRoundState.roundNumber).toBe(4);
    expect(getCurrentPhaseState(next)).toStrictEqual({
      phase: 'playCards',
      step: 'chooseCards',
    });
  });

  it('carries no orders into the new round, but keeps the initiative', () => {
    const next = applyRoundEndEvent(event, endOfRoundThree());

    // A unit may be ordered again: once a round (§4.3.6).
    expect(next.currentRoundState.commandedUnits).toStrictEqual([]);
    // No phase of the new round is finished yet.
    expect(next.currentRoundState.completedPhases).toStrictEqual([]);
    // Whose initiative it is stays on the table (§1.5, §4.1.4).
    expect(next.currentInitiative).toBe('black');
  });

  it('ends setup, round 0, into round 1 the same way', () => {
    // Setup is over; it is round 0, and holds no phase.
    const setup = createEmptyGameState('standard');

    const next = applyRoundEndEvent(event, setup);

    // The first round of the battle begins with card play.
    expect(next.currentRoundState.roundNumber).toBe(1);
    expect(getCurrentPhaseState(next)).toStrictEqual({
      phase: 'playCards',
      step: 'chooseCards',
    });
  });
});
