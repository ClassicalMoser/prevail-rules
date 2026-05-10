import type { IssueCommandsPhaseStateForBoard } from '@game';
import { ISSUE_COMMANDS_PHASE } from '@game';

import { createTestCard } from '@testing';

import { updateRemainingPlayerCommands } from './updateRemainingPlayerCommands';
import type { StandardBoard } from '@entities';

/**
 * UpdateRemainingCommandsForPlayer: Updates the remaining commands for a specific player in the issue commands phase state.
 */
describe('updateRemainingCommandsForPlayer', () => {
  it('given update remainingCommandsFirstPlayer when player is initiative player', () => {
    const phaseState: IssueCommandsPhaseStateForBoard<StandardBoard> = {
      boardType: 'standard',
      currentCommandResolutionState: undefined,
      phase: ISSUE_COMMANDS_PHASE,
      remainingCommandsFirstPlayer: new Set(),
      remainingCommandsSecondPlayer: new Set(),
      remainingUnitsFirstPlayer: new Set(),
      remainingUnitsSecondPlayer: new Set(),
      step: 'firstPlayerIssueCommands' as const,
    };

    const { command } = createTestCard();
    const newCommands = new Set([command]);

    const newPhaseState = updateRemainingPlayerCommands(
      phaseState,
      'black',
      'black', // Initiative player
      newCommands,
    );

    expect(newPhaseState.remainingCommandsFirstPlayer).toStrictEqual(
      newCommands,
    );
    expect(newPhaseState.remainingCommandsSecondPlayer).not.toStrictEqual(
      newCommands,
    );
  });

  it('given update remainingCommandsSecondPlayer when player is not initiative player', () => {
    const phaseState: IssueCommandsPhaseStateForBoard<StandardBoard> = {
      boardType: 'standard',
      currentCommandResolutionState: undefined,
      phase: ISSUE_COMMANDS_PHASE,
      remainingCommandsFirstPlayer: new Set(),
      remainingCommandsSecondPlayer: new Set(),
      remainingUnitsFirstPlayer: new Set(),
      remainingUnitsSecondPlayer: new Set(),
      step: 'firstPlayerIssueCommands' as const,
    };

    const { command } = createTestCard();
    const newCommands = new Set([command]);

    const newPhaseState = updateRemainingPlayerCommands(
      phaseState,
      'white',
      'black', // Initiative player
      newCommands,
    );

    expect(newPhaseState.remainingCommandsSecondPlayer).toStrictEqual(
      newCommands,
    );
    expect(newPhaseState.remainingCommandsFirstPlayer).not.toStrictEqual(
      newCommands,
    );
  });

  it('given not mutate the original phase state', () => {
    const phaseState: IssueCommandsPhaseStateForBoard<StandardBoard> = {
      boardType: 'standard',
      currentCommandResolutionState: undefined,
      phase: ISSUE_COMMANDS_PHASE,
      remainingCommandsFirstPlayer: new Set(),
      remainingCommandsSecondPlayer: new Set(),
      remainingUnitsFirstPlayer: new Set(),
      remainingUnitsSecondPlayer: new Set(),
      step: 'firstPlayerIssueCommands' as const,
    };

    const { command } = createTestCard();
    const newCommands = new Set([command]);

    updateRemainingPlayerCommands(phaseState, 'black', 'black', newCommands);

    expect(phaseState.remainingCommandsFirstPlayer.size).toBe(0);
  });
});
