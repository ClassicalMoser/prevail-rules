import { ISSUE_COMMANDS_PHASE } from '@game';
import { createIssueCommandsPhaseState } from './issueCommandsPhaseState';
import { createEmptyGameState } from '@factories';

describe('createIssueCommandsPhaseState function', () => {
  it('given context, returns issue commands phase with no units left to act', () => {
    expect.hasAssertions();
    const gameState = createEmptyGameState('standard');
    const state = createIssueCommandsPhaseState(gameState);
    expect(state.phase).toBe(ISSUE_COMMANDS_PHASE);
    expect(state.step).toBe('firstPlayerResolveCommands');
    expect(state.remainingUnitsFirstPlayer).toHaveLength(0);
    expect(state.currentCommandResolutionState).toBe('pending');
  });
});
