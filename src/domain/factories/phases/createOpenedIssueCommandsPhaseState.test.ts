import { createOpenedIssueCommandsPhaseState } from './createOpenedIssueCommandsPhaseState';

/** Phase 3 as it opens. */
describe('createOpenedIssueCommandsPhaseState function', () => {
  it('opens on the first player issuing, with no unit ordered and nothing under way', () => {
    expect(createOpenedIssueCommandsPhaseState()).toStrictEqual({
      currentCommandResolutionState: 'pending',
      phase: 'issueCommands',
      remainingUnitsFirstPlayer: [],
      remainingUnitsSecondPlayer: [],
      step: 'firstPlayerIssueCommands',
    });
  });
});
