import type { Coordinate } from '@ruleValues';
import type { CompleteIssueCommandsPhaseEvent } from '@events';
import type { AuthoritativeGameState } from '@game';
import { createEmptyGameState } from '@factories';
import { getCurrentPhaseState } from '@queries';
import {
  createGameStateWithEngagedUnits,
  createIssueCommandsPhaseState,
  createTestUnit,
} from '@testing';
import { updatePhaseState } from '@transforms/pureTransforms';

import { applyCompleteIssueCommandsPhaseEvent } from './applyCompleteIssueCommandsPhaseEvent';

/** The effect that ends Phase 3, carrying the fights Phase 4 owes. */
function issueCommandsCompleteEvent(
  remainingEngagements: Coordinate[],
): CompleteIssueCommandsPhaseEvent {
  const event: CompleteIssueCommandsPhaseEvent = {
    effectType: 'completeIssueCommandsPhase',
    eventType: 'gameEffect',
    remainingEngagements,
  };
  return event;
}

/** Both players' orders carried out, a Black and a White unit engaged at E-5. */
function ordersCarriedOut(): AuthoritativeGameState {
  // A move this phase ended in the enemy's space (§6.1.1).
  const engaged = createGameStateWithEngagedUnits(
    createTestUnit('black'),
    createTestUnit('white'),
    'E-5',
  );

  // Phase 3 on its last step.
  const done = updatePhaseState(
    engaged,
    createIssueCommandsPhaseState(engaged, { step: 'complete' }),
  );
  return done;
}

/**
 * Once both players' orders are carried out, Phase 4 opens, and every engaged
 * space fights in it (§4.4.1). The procedure lists those spaces; the first
 * player chooses the order they are fought in (§4.4.2).
 */
describe('applyCompleteIssueCommandsPhaseEvent function', () => {
  it('opens Phase 4 with every engaged space the procedure listed, none yet chosen', () => {
    const next = applyCompleteIssueCommandsPhaseEvent(
      issueCommandsCompleteEvent(['E-5']),
      ordersCarriedOut(),
    );

    // The fight at E-5 is owed, and the first player has not chosen one.
    expect(getCurrentPhaseState(next)).toStrictEqual({
      currentMeleeResolutionState: 'pending',
      phase: 'resolveMelee',
      remainingEngagements: ['E-5'],
      step: 'resolveMelee',
    });
  });

  it("records Phase 3 among the round's finished phases", () => {
    const next = applyCompleteIssueCommandsPhaseEvent(
      issueCommandsCompleteEvent(['E-5']),
      ordersCarriedOut(),
    );

    // No query reads the round's record of finished phases, so the field
    // is read as written: Phase 3, as it ended.
    expect(next.currentRoundState.completedPhases).toStrictEqual([
      {
        currentCommandResolutionState: 'pending',
        phase: 'issueCommands',
        remainingUnitsFirstPlayer: [],
        remainingUnitsSecondPlayer: [],
        step: 'complete',
      },
    ]);
  });

  it('takes the fights from the event, and does not look at the board itself', () => {
    // The board still shows E-5 engaged, but the event lists no fight.
    const next = applyCompleteIssueCommandsPhaseEvent(
      issueCommandsCompleteEvent([]),
      ordersCarriedOut(),
    );

    // What the procedure found is what Phase 4 owes; the apply finds
    // nothing for itself.
    expect(getCurrentPhaseState(next)).toMatchObject({
      remainingEngagements: [],
    });
  });

  it('throws before the round has a phase', () => {
    // Round 0 is setup, with no phase to end.
    const setup = createEmptyGameState('standard');

    expect(() =>
      applyCompleteIssueCommandsPhaseEvent(
        issueCommandsCompleteEvent([]),
        setup,
      ),
    ).toThrow('No current phase state found');
  });
});
