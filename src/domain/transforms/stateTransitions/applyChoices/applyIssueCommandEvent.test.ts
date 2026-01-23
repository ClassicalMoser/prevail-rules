import type { GameState, StandardBoard } from '@entities';
import type { IssueCommandEvent } from '@events';
import { ISSUE_COMMANDS_PHASE } from '@entities';
import { getIssueCommandsPhaseState } from '@queries';
import { commandCards } from '@sampleValues';
import { createEmptyGameState, createTestUnit } from '@testing';
import { updateCardState, updatePhaseState } from '@transforms/pureTransforms';
import { describe, expect, it } from 'vitest';
import { applyIssueCommandEvent } from './applyIssueCommandEvent';

describe('applyIssueCommandEvent', () => {
  /**
   * Helper to create a game state in the issueCommands phase with commands available
   */
  function createGameStateWithCommands(
    currentInitiative: 'black' | 'white' = 'black',
  ): GameState<StandardBoard> {
    const state = createEmptyGameState({ currentInitiative });
    const stateWithCards = updateCardState(state, (current) => ({
      ...current,
      black: {
        ...current.black,
        inPlay: commandCards[0],
      },
      white: {
        ...current.white,
        inPlay: commandCards[1],
      },
    }));

    const blackCommand = commandCards[0].command;
    const whiteCommand = commandCards[1].command;

    const stateWithPhase = updatePhaseState(stateWithCards, {
      phase: ISSUE_COMMANDS_PHASE,
      step: 'firstPlayerIssueCommands',
      remainingCommandsFirstPlayer: new Set([blackCommand]),
      remainingUnitsFirstPlayer: new Set(),
      remainingCommandsSecondPlayer: new Set([whiteCommand]),
      remainingUnitsSecondPlayer: new Set(),
      currentCommandResolutionState: undefined,
    });

    return stateWithPhase;
  }

  describe('basic functionality', () => {
    it('should remove command from remaining commands and add units to commandedUnits', () => {
      const state = createGameStateWithCommands();
      const unit = createTestUnit('black', { attack: 3 });
      const command = commandCards[0].command;

      const event: IssueCommandEvent<StandardBoard> = {
        eventType: 'playerChoice',
        choiceType: 'issueCommand',
        player: 'black',
        command,
        units: new Set([unit]),
      };

      const newState = applyIssueCommandEvent(event, state);

      const phaseState = newState.currentRoundState.currentPhaseState;
      if (!phaseState || phaseState.phase !== 'issueCommands') {
        throw new Error('Expected issueCommands phase');
      }

      expect(phaseState.remainingCommandsFirstPlayer.has(command)).toBe(false);
      expect(newState.currentRoundState.commandedUnits.has(unit)).toBe(true);
    });

    it('should work for second player', () => {
      const state = createGameStateWithCommands();
      const unit = createTestUnit('white', { attack: 3 });
      const command = commandCards[1].command;

      const event: IssueCommandEvent<StandardBoard> = {
        eventType: 'playerChoice',
        choiceType: 'issueCommand',
        player: 'white',
        command,
        units: new Set([unit]),
      };

      const newState = applyIssueCommandEvent(event, state);

      const phaseState = newState.currentRoundState.currentPhaseState;
      if (!phaseState || phaseState.phase !== 'issueCommands') {
        throw new Error('Expected issueCommands phase');
      }

      expect(phaseState.remainingCommandsSecondPlayer.has(command)).toBe(false);
      expect(newState.currentRoundState.commandedUnits.has(unit)).toBe(true);
    });

    it('should add multiple units to commandedUnits', () => {
      const state = createGameStateWithCommands();
      const unit1 = createTestUnit('black', { attack: 3 });
      const unit2 = createTestUnit('black', { attack: 3, instanceNumber: 2 });
      const command = commandCards[0].command;

      const event: IssueCommandEvent<StandardBoard> = {
        eventType: 'playerChoice',
        choiceType: 'issueCommand',
        player: 'black',
        command,
        units: new Set([unit1, unit2]),
      };

      const newState = applyIssueCommandEvent(event, state);

      expect(newState.currentRoundState.commandedUnits.has(unit1)).toBe(true);
      expect(newState.currentRoundState.commandedUnits.has(unit2)).toBe(true);
      expect(newState.currentRoundState.commandedUnits.size).toBe(2);
    });
  });

  describe('immutability', () => {
    it('should not mutate the original state', () => {
      const state = createGameStateWithCommands();
      const unit = createTestUnit('black', { attack: 3 });
      const command = commandCards[0].command;
      const phaseState = getIssueCommandsPhaseState(state);
      const originalRemainingCommandsSize =
        phaseState.remainingCommandsFirstPlayer.size;
      const originalCommandedUnitsSize =
        state.currentRoundState.commandedUnits.size;

      const event: IssueCommandEvent<StandardBoard> = {
        eventType: 'playerChoice',
        choiceType: 'issueCommand',
        player: 'black',
        command,
        units: new Set([unit]),
      };

      applyIssueCommandEvent(event, state);

      // Original state should be unchanged
      const phaseStateAfter = getIssueCommandsPhaseState(state);
      expect(phaseStateAfter.remainingCommandsFirstPlayer.size).toBe(
        originalRemainingCommandsSize,
      );
      expect(state.currentRoundState.commandedUnits.size).toBe(
        originalCommandedUnitsSize,
      );
    });
  });

  describe('error cases', () => {
    it('should throw if command not found in remaining commands', () => {
      const state = createGameStateWithCommands();
      const unit = createTestUnit('black', { attack: 3 });
      // Create a command that's different from the one in remaining commands
      const wrongCommand = {
        size: 'units' as const,
        type: 'rangedAttack' as const, // Different type
        number: 1,
        restrictions: {
          inspirationRangeRestriction: 1,
          traitRestrictions: [],
          unitRestrictions: [],
        },
        modifiers: [],
      };

      const event: IssueCommandEvent<StandardBoard> = {
        eventType: 'playerChoice',
        choiceType: 'issueCommand',
        player: 'black',
        command: wrongCommand,
        units: new Set([unit]),
      };

      expect(() => applyIssueCommandEvent(event, state)).toThrow(
        'Command not found in remaining commands',
      );
    });
  });
});
