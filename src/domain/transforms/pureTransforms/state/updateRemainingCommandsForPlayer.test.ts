import type { IssueCommandsPhaseState } from '@game';
import { ISSUE_COMMANDS_PHASE } from '@game';

import { createTestCard } from '@testing';
import { describe, expect, it } from 'vitest';
import { updateRemainingCommandsForPlayer } from './updateRemainingCommandsForPlayer';

/**
 * updateRemainingCommandsForPlayer: Updates the remaining commands for a specific player in the issue commands phase state.
 */
describe('updateRemainingCommandsForPlayer', () => {
  it('given update remainingCommandsFirstPlayer when player is initiative player', () => {
    const phaseState: IssueCommandsPhaseState = {
      phase: ISSUE_COMMANDS_PHASE,
      step: 'firstPlayerIssueCommands' as const,
      remainingCommandsFirstPlayer: new Set(),
      remainingUnitsFirstPlayer: new Set(),
      remainingCommandsSecondPlayer: new Set(),
      remainingUnitsSecondPlayer: new Set(),
      currentCommandResolutionState: undefined,
    };

    const command = createTestCard().command;
    const newCommands = new Set([command]);

    const newPhaseState = updateRemainingCommandsForPlayer(
      phaseState,
      'black',
      'black', // initiative player
      newCommands,
    );

    expect(newPhaseState.remainingCommandsFirstPlayer).toEqual(newCommands);
    expect(newPhaseState.remainingCommandsSecondPlayer).not.toEqual(
      newCommands,
    );
  });

  it('given update remainingCommandsSecondPlayer when player is not initiative player', () => {
    const phaseState: IssueCommandsPhaseState = {
      phase: ISSUE_COMMANDS_PHASE,
      step: 'firstPlayerIssueCommands' as const,
      remainingCommandsFirstPlayer: new Set(),
      remainingUnitsFirstPlayer: new Set(),
      remainingCommandsSecondPlayer: new Set(),
      remainingUnitsSecondPlayer: new Set(),
      currentCommandResolutionState: undefined,
    };

    const command = createTestCard().command;
    const newCommands = new Set([command]);

    const newPhaseState = updateRemainingCommandsForPlayer(
      phaseState,
      'white',
      'black', // initiative player
      newCommands,
    );

    expect(newPhaseState.remainingCommandsSecondPlayer).toEqual(newCommands);
    expect(newPhaseState.remainingCommandsFirstPlayer).not.toEqual(newCommands);
  });

  it('given not mutate the original phase state', () => {
    const phaseState: IssueCommandsPhaseState = {
      phase: ISSUE_COMMANDS_PHASE,
      step: 'firstPlayerIssueCommands' as const,
      remainingCommandsFirstPlayer: new Set(),
      remainingUnitsFirstPlayer: new Set(),
      remainingCommandsSecondPlayer: new Set(),
      remainingUnitsSecondPlayer: new Set(),
      currentCommandResolutionState: undefined,
    };

    const command = createTestCard().command;
    const newCommands = new Set([command]);

    updateRemainingCommandsForPlayer(phaseState, 'black', 'black', newCommands);

    expect(phaseState.remainingCommandsFirstPlayer.size).toBe(0);
  });
});
