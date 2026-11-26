import { ISSUE_COMMANDS_PHASE } from '@game';
import { createEmptyGameState } from '@factories';
import { createTestUnit } from '@testing/unitHelpers';

import { createIssueCommandsPhaseState } from './issueCommandsPhaseState';

/** Phase 3 on the first player carrying out its orders, before the second issues any (§4.3). */
describe('createIssueCommandsPhaseState function', () => {
  it('opens on the first player’s orders, nobody waiting and no order under way', () => {
    const phase = createIssueCommandsPhaseState(
      createEmptyGameState('standard'),
    );

    expect(phase).toStrictEqual({
      currentCommandResolutionState: 'pending',
      phase: ISSUE_COMMANDS_PHASE,
      remainingUnitsFirstPlayer: [],
      remainingUnitsSecondPlayer: [],
      step: 'firstPlayerResolveCommands',
    });
  });

  it('carries the units a spec says are still to act', () => {
    // Black's unit has an order and has not yet moved.
    const waiting = createTestUnit('black');

    const phase = createIssueCommandsPhaseState(
      createEmptyGameState('standard'),
      {
        remainingUnitsFirstPlayer: [waiting],
      },
    );

    expect(phase.remainingUnitsFirstPlayer).toStrictEqual([waiting]);
  });
});
