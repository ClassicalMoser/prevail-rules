import { tempCommandCards } from '@sampleValues';
import type { IssueCommandEvent } from '@events';
import type { GameState } from '@game';
import { ISSUE_COMMANDS_PHASE } from '@game';

import { getIssueCommandsPhaseState, isSameUnitInstance } from '@queries';
import {
  createBoardWithFacingRow,
  createTestCommand,
  createTestUnit,
  updateCardState,
} from '@testing';

import { updateBoardState, updatePhaseState } from '@transforms/pureTransforms';
import { throwIfNone } from '@utils';

import { applyIssueCommandEvent } from './applyIssueCommandEvent';

import { createEmptyGameState } from '@factories';
import { updateCurrentInitiative } from '@transforms/pureTransforms/state/updateCurrentInitiative';
/**
 * Issue-commands: spending a command type removes it from the side’s remaining set and adds
 * the chosen unit instances to the round’s `commandedUnits` (for later resolution ordering).
 */
describe('applyIssueCommandEvent function', () => {
  /** FirstPlayerIssueCommands with one command left per side from two inPlay cards. */
  function createGameStateWithCommands(
    currentInitiative: 'black' | 'white' = 'black',
  ): GameState {
    const state = updateCurrentInitiative(
      createEmptyGameState('standard'),
      currentInitiative,
    );
    const stateWithCards = updateCardState(state, {
      ...state.cardState,
      black: {
        ...state.cardState.black,
        inPlay: tempCommandCards[0],
      },
      white: {
        ...state.cardState.white,
        inPlay: tempCommandCards[1],
      },
    });

    const blackCommand = tempCommandCards[0].command;
    const whiteCommand = tempCommandCards[1].command;

    const stateWithPhase = updatePhaseState(stateWithCards, {
      currentCommandResolutionState: 'pending',
      phase: ISSUE_COMMANDS_PHASE,
      remainingCommandsFirstPlayer: [blackCommand],
      remainingCommandsSecondPlayer: [whiteCommand],
      remainingUnitsFirstPlayer: [],
      remainingUnitsSecondPlayer: [],
      step: 'firstPlayerIssueCommands',
    });

    return stateWithPhase;
  }

  describe('command spend and commandedUnits', () => {
    it('given black issues their remaining command with one unit, command drops from first-player set and unit commanded', () => {
      const state = createGameStateWithCommands();
      const unit = createTestUnit('black', { attack: 3 });
      const { command } = tempCommandCards[0];

      const event: IssueCommandEvent = {
        choiceType: 'issueCommand',
        command,
        eventType: 'playerChoice',
        player: 'black',
        selection: { selectionType: 'units', units: [unit] },
      };

      const newState = applyIssueCommandEvent(event, state);

      const phaseState = throwIfNone(
        newState.currentRoundState.currentPhaseState,
        'phase',
      );
      if (phaseState.phase !== 'issueCommands') {
        throw new Error('Expected issueCommands phase');
      }

      expect(phaseState.remainingCommandsFirstPlayer).not.toContain(command);
      // Check unit presence using value equality, not reference equality
      const unitInCommandedUnits = [
        ...newState.currentRoundState.commandedUnits,
      ].some((u) => isSameUnitInstance(u, unit));
      expect(unitInCommandedUnits).toBe(true);
    });

    it('exhausting first-player commands advances to firstPlayerResolveCommands and seeds remaining units', () => {
      const state = createGameStateWithCommands();
      const unit = createTestUnit('black', { attack: 3 });
      const { command } = tempCommandCards[0];

      const newState = applyIssueCommandEvent(
        {
          choiceType: 'issueCommand',
          command,
          eventType: 'playerChoice',
          player: 'black',
          selection: { selectionType: 'units', units: [unit] },
        },
        state,
      );
      const phaseState = getIssueCommandsPhaseState(newState);

      expect(phaseState).toMatchObject({
        remainingCommandsFirstPlayer: [],
        step: 'firstPlayerResolveCommands',
      });
      expect(phaseState.remainingUnitsFirstPlayer).toStrictEqual([unit]);
    });

    it('exhausting second-player commands advances to secondPlayerResolveCommands and seeds remaining units', () => {
      const base = createGameStateWithCommands();
      const state = updatePhaseState(base, {
        ...getIssueCommandsPhaseState(base),
        remainingCommandsFirstPlayer: [],
        step: 'secondPlayerIssueCommands',
      });
      const unit = createTestUnit('white', { attack: 3 });
      const { command } = tempCommandCards[1];

      const newState = applyIssueCommandEvent(
        {
          choiceType: 'issueCommand',
          command,
          eventType: 'playerChoice',
          player: 'white',
          selection: { selectionType: 'units', units: [unit] },
        },
        state,
      );
      const phaseState = getIssueCommandsPhaseState(newState);

      expect(phaseState).toMatchObject({
        remainingCommandsSecondPlayer: [],
        step: 'secondPlayerResolveCommands',
      });
      expect(phaseState.remainingUnitsSecondPlayer).toStrictEqual([unit]);
    });

    it('keeps firstPlayerIssueCommands when more commands remain', () => {
      const base = createGameStateWithCommands();
      const first = tempCommandCards[0].command;
      const second = { ...first, number: 2 };
      const state = updatePhaseState(base, {
        ...getIssueCommandsPhaseState(base),
        remainingCommandsFirstPlayer: [first, second],
      });
      const unit = createTestUnit('black', { attack: 3 });

      const newState = applyIssueCommandEvent(
        {
          choiceType: 'issueCommand',
          command: first,
          eventType: 'playerChoice',
          player: 'black',
          selection: { selectionType: 'units', units: [unit] },
        },
        state,
      );
      const phaseState = getIssueCommandsPhaseState(newState);

      expect(phaseState).toMatchObject({
        remainingCommandsFirstPlayer: [second],
        remainingUnitsFirstPlayer: [],
        step: 'firstPlayerIssueCommands',
      });
    });

    it('given white issues second-player command, remainingCommandsSecondPlayer loses that command', () => {
      const state = createGameStateWithCommands();
      const unit = createTestUnit('white', { attack: 3 });
      const { command } = tempCommandCards[1];

      const event: IssueCommandEvent = {
        choiceType: 'issueCommand',
        command,
        eventType: 'playerChoice',
        player: 'white',
        selection: { selectionType: 'units', units: [unit] },
      };

      const newState = applyIssueCommandEvent(event, state);

      const phaseState = throwIfNone(
        newState.currentRoundState.currentPhaseState,
        'phase',
      );
      if (phaseState.phase !== 'issueCommands') {
        throw new Error('Expected issueCommands phase');
      }

      expect(phaseState.remainingCommandsSecondPlayer).not.toContain(command);
      // Check unit presence using value equality, not reference equality
      const unitInCommandedUnits = [
        ...newState.currentRoundState.commandedUnits,
      ].some((u) => isSameUnitInstance(u, unit));
      expect(unitInCommandedUnits).toBe(true);
    });

    it('given black issues one command for two units, both appear in commandedUnits size 2', () => {
      const state = createGameStateWithCommands();
      const unit1 = createTestUnit('black', { attack: 3 });
      const unit2 = createTestUnit('black', { attack: 3, instanceNumber: 2 });
      const { command } = tempCommandCards[0];

      const event: IssueCommandEvent = {
        choiceType: 'issueCommand',
        command,
        eventType: 'playerChoice',
        player: 'black',
        selection: { selectionType: 'units', units: [unit1, unit2] },
      };

      const newState = applyIssueCommandEvent(event, state);

      // Check unit presence using value equality, not reference equality
      const unit1InCommandedUnits = [
        ...newState.currentRoundState.commandedUnits,
      ].some((u) => isSameUnitInstance(u, unit1));
      const unit2InCommandedUnits = [
        ...newState.currentRoundState.commandedUnits,
      ].some((u) => isSameUnitInstance(u, unit2));
      expect(unit1InCommandedUnits).toBe(true);
      expect(unit2InCommandedUnits).toBe(true);
      expect(newState.currentRoundState.commandedUnits).toHaveLength(2);
    });
  });

  describe('structural update', () => {
    it('given phase commandedUnits and remaining set sizes before apply, input state unchanged after apply', () => {
      const state = createGameStateWithCommands();
      const unit = createTestUnit('black', { attack: 3 });
      const { command } = tempCommandCards[0];
      const phaseState = getIssueCommandsPhaseState(state);
      const originalRemainingCommandsSize =
        phaseState.remainingCommandsFirstPlayer.length;
      const originalCommandedUnitsSize =
        state.currentRoundState.commandedUnits.length;

      const event: IssueCommandEvent = {
        choiceType: 'issueCommand',
        command,
        eventType: 'playerChoice',
        player: 'black',
        selection: { selectionType: 'units', units: [unit] },
      };

      applyIssueCommandEvent(event, state);

      // Original state should be unchanged
      const phaseStateAfter = getIssueCommandsPhaseState(state);
      expect(phaseStateAfter.remainingCommandsFirstPlayer).toHaveLength(
        originalRemainingCommandsSize,
      );
      expect(state.currentRoundState.commandedUnits).toHaveLength(
        originalCommandedUnitsSize,
      );
    });
  });

  it('gives a line order to every unit between its two ends', () => {
    // Black's rank of four, E-1 to E-4, facing north, and a line order.
    const lineCommand = createTestCommand({
      number: 1,
      restrictions: {
        inspirationRangeRestriction: -1,
        restrictionType: 'none',
      },
      size: 'lines',
    });
    const { board, unitAt } = createBoardWithFacingRow({
      coordinates: ['E-1', 'E-2', 'E-3', 'E-4'],
    });
    const base = updateBoardState(createGameStateWithCommands(), board);
    const state = updatePhaseState(base, {
      ...getIssueCommandsPhaseState(base),
      remainingCommandsFirstPlayer: [lineCommand],
    });

    // Black names the line by its ends, E-3 then E-1.
    const event: IssueCommandEvent = {
      choiceType: 'issueCommand',
      command: lineCommand,
      eventType: 'playerChoice',
      player: 'black',
      selection: {
        ends: [unitAt('E-3').unit, unitAt('E-1').unit],
        selectionType: 'line',
      },
    };
    const issued = applyIssueCommandEvent(event, state);

    // The three units from E-1 to E-3 are commanded; E-4 is not.
    expect(issued.currentRoundState.commandedUnits).toStrictEqual([
      unitAt('E-1').unit,
      unitAt('E-2').unit,
      unitAt('E-3').unit,
    ]);
  });
});
