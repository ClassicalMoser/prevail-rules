import type { CompleteMoveCommandersPhaseEvent } from '@events';
import { createEmptyGameState } from '@factories';
import { getCurrentPhaseState } from '@queries';
import {
  createIssueCommandsPhaseState,
  createMoveCommandersPhaseState,
} from '@testing';
import { updatePhaseState } from '@transforms/pureTransforms';

import { applyCompleteMoveCommandersPhaseEvent } from './applyCompleteMoveCommandersPhaseEvent';

/** The effect that ends Move Commanders; it carries nothing. */
const event: CompleteMoveCommandersPhaseEvent = {
  effectType: 'completeMoveCommandersPhase',
  eventType: 'gameEffect',
};

/**
 * Once both commanders have moved, Phase 3 opens with the first player
 * issuing all their orders (§4.3). Each player's orders are the command on
 * their card in play, read when they issue.
 */
describe('applyCompleteMoveCommandersPhaseEvent function', () => {
  it('opens Phase 3 on the first player issuing, with nothing yet ordered', () => {
    // Both commanders have moved (§4.2.1).
    const moved = updatePhaseState(
      createEmptyGameState('standard'),
      createMoveCommandersPhaseState({ step: 'complete' }),
    );

    const next = applyCompleteMoveCommandersPhaseEvent(event, moved);

    // The first player issues first; no unit is ordered or under way.
    expect(getCurrentPhaseState(next)).toStrictEqual({
      currentCommandResolutionState: 'pending',
      phase: 'issueCommands',
      remainingUnitsFirstPlayer: [],
      remainingUnitsSecondPlayer: [],
      step: 'firstPlayerIssueCommands',
    });

    // No query reads the round's record of finished phases, so the field is
    // read as written: Phase 2, as it ended.
    expect(next.currentRoundState.completedPhases).toStrictEqual([
      { phase: 'moveCommanders', step: 'complete' },
    ]);
  });

  it('throws when the game is not moving commanders', () => {
    // Orders are already being issued.
    const empty = createEmptyGameState('standard');
    const issuing = updatePhaseState(
      empty,
      createIssueCommandsPhaseState({
        step: 'firstPlayerIssueCommands',
      }),
    );

    // Phase 2 ends only from Phase 2.
    expect(() => applyCompleteMoveCommandersPhaseEvent(event, issuing)).toThrow(
      'Expected moveCommanders phase, got issueCommands',
    );
  });
});
